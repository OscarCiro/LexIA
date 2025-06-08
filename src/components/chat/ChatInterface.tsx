
"use client";

import type { FormEvent} from 'react';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import type { Message, Conversation } from '@/types';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp, Timestamp, doc, updateDoc, getDoc, getDocs, limit } from 'firebase/firestore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SendHorizonal, Loader2, Brain, Sparkles } from 'lucide-react'; 
import MessageBubble from './MessageBubble';
import ChatHistorySidebar from './ChatHistorySidebar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';

const LEXIA_GREETING_TEXT = "¡Hola! Soy LexIA, tu asistente jurídico especializado en Derecho español y europeo. ¿En qué puedo ayudarte hoy?";

export default function ChatInterface() {
  const { user, selectedProvider, getActiveApiKey, loading: authContextLoading, apiKeysProcessed } = useAuth(); // Renamed loading to authContextLoading
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isCreatingNewChat, setIsCreatingNewChat] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  
  const viewportRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Derive current API key and if chat should be interactable
  const currentApiKey = getActiveApiKey();
  const canInteract = !authContextLoading && apiKeysProcessed && user && currentApiKey && activeConversationId && !isLoadingMessages;

  const handleCreateNewChat = useCallback(async (): Promise<string | null> => {
    if (!user) return null;
    setIsCreatingNewChat(true);
    try {
      const newConvRef = await addDoc(collection(db, 'conversations'), {
        userId: user.uid,
        title: "Nueva Consulta",
        createdAt: serverTimestamp(),
        lastUpdatedAt: serverTimestamp(),
      });
      setActiveConversationId(newConvRef.id);
      setMessages([]); 
      return newConvRef.id;
    } catch (error) {
      console.error("Error creating new chat:", error);
      toast({ title: "Error", description: "No se pudo crear la nueva consulta.", variant: "destructive" });
      return null;
    } finally {
      setIsCreatingNewChat(false);
    }
  }, [user, toast]);

  useEffect(() => {
    // Initialize or load conversation only when user and API keys are ready
    if (user && apiKeysProcessed && !activeConversationId && !isCreatingNewChat) {
      setIsLoadingMessages(true);
      const convCol = collection(db, 'conversations');
      const q = query(
        convCol,
        where('userId', '==', user.uid),
        orderBy('lastUpdatedAt', 'desc'),
        limit(1)
      );
      getDocs(q).then(snapshot => {
        if (!snapshot.empty) {
          setActiveConversationId(snapshot.docs[0].id);
        } else {
          // Only create new chat if an API key is available
          if (getActiveApiKey()) {
            handleCreateNewChat();
          }
        }
      }).catch(error => {
        console.error("Error fetching initial conversation:", error);
        if (getActiveApiKey()) {
          handleCreateNewChat(); 
        }
      }).finally(() => {
        // setIsLoadingMessages(false); // Managed by messages loading effect
      });
    }
  }, [user, apiKeysProcessed, activeConversationId, handleCreateNewChat, isCreatingNewChat, getActiveApiKey]);


  useEffect(() => {
    if (!user || !activeConversationId || !apiKeysProcessed) {
      if (user && apiKeysProcessed && activeConversationId === null && !isCreatingNewChat && getActiveApiKey()) { 
         setMessages([{
          id: 'initial-greeting',
          text: LEXIA_GREETING_TEXT,
          role: 'assistant',
          userId: user.uid,
          conversationId: 'greeting-session', 
          timestamp: new Date(),
        }]);
      } else {
        setMessages([]);
      }
      setIsLoadingMessages(false);
      return;
    }

    setIsLoadingMessages(true);
    const messagesCol = collection(db, 'messages');
    const q = query(
      messagesCol,
      where('userId', '==', user.uid),
      where('conversationId', '==', activeConversationId),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedMessagesDb: Message[] = [];
      querySnapshot.forEach((doc) => {
        fetchedMessagesDb.push({ id: doc.id, ...doc.data() } as Message);
      });

      if (fetchedMessagesDb.length === 0 && !querySnapshot.metadata.hasPendingWrites && activeConversationId && getActiveApiKey()) {
        setMessages([{
          id: `greeting-${activeConversationId}`,
          text: LEXIA_GREETING_TEXT,
          role: 'assistant',
          userId: user.uid,
          conversationId: activeConversationId,
          timestamp: new Date(),
        }]);
      } else {
        setMessages(fetchedMessagesDb);
      }
      setIsLoadingMessages(false);
    }, (error) => {
      console.error("Error fetching messages:", error);
      toast({ title: "Error", description: "No se pudieron cargar los mensajes.", variant: "destructive" });
      setIsLoadingMessages(false);
    });

    return () => unsubscribe();
  }, [user, activeConversationId, toast, isCreatingNewChat, apiKeysProcessed, getActiveApiKey]);


  useEffect(() => {
    if (viewportRef.current) {
      viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
    }
  }, [messages, isAiThinking]);

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    // currentApiKey is already derived and used in `canInteract`
    if (!input.trim() || !user || !currentApiKey || !activeConversationId || isAiThinking || authContextLoading || !apiKeysProcessed) return;

    setIsAiThinking(true);
    const userInput = input;
    setInput('');

    const userMessageData: Omit<Message, 'id' | 'timestamp'> & { timestamp: any } = {
      text: userInput,
      role: 'user',
      userId: user.uid,
      conversationId: activeConversationId,
      timestamp: serverTimestamp(),
    };

    try {
      await addDoc(collection(db, 'messages'), userMessageData);
      
      const convRef = doc(db, 'conversations', activeConversationId);
      const convDoc = await getDoc(convRef);
      const updateData: { lastUpdatedAt: any; title?: string } = { lastUpdatedAt: serverTimestamp() };
      
      const nonGreetingMessages = messages.filter(m => m.id !== `greeting-${activeConversationId}` && m.id !== 'initial-greeting');
      if (convDoc.exists() && (convDoc.data().title === "Nueva Consulta" || nonGreetingMessages.filter(m=> m.role === 'user').length === 0)) {
         updateData.title = userInput.substring(0, 40) + (userInput.length > 40 ? "..." : "");
      }
      await updateDoc(convRef, updateData);

      const apiEndpoint = selectedProvider === 'gemini' ? '/api/lexia-chat' : '/api/lexia-chat-openai';
      
      const historyForApi = selectedProvider === 'chatgpt' 
        ? messages.filter(m => m.id !== `greeting-${activeConversationId}` && m.id !== 'initial-greeting')
                    .map(m => ({role: m.role, text: m.text}))
        : undefined;


      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userInput, apiKey: currentApiKey, history: historyForApi }),
      });

      if (!response.ok || !response.body) {
        const errorData = await response.json().catch(() => ({ message: "Error desconocido del servidor." }));
        throw new Error(errorData.message || `Error: ${response.statusText}`);
      }
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantResponseText = '';
      
      const tempAssistantMessageId = `temp_${Date.now()}`;
       setMessages(prev => {
        const filteredPrev = prev.filter(m => m.id !== `greeting-${activeConversationId}` && m.id !== 'initial-greeting');
        return [...filteredPrev, { 
          id: tempAssistantMessageId,
          text: '', 
          role: 'assistant',
          userId: user.uid,
          conversationId: activeConversationId,
          timestamp: new Timestamp(Math.floor(Date.now()/1000),0) 
        }];
      });


      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        assistantResponseText += decoder.decode(value, { stream: true });
        setMessages(prev => prev.map(msg => 
          msg.id === tempAssistantMessageId ? { ...msg, text: assistantResponseText } : msg
        ));
      }
      const remainingText = decoder.decode(undefined, { stream: false });
      if (remainingText) {
        assistantResponseText += remainingText;
         setMessages(prev => prev.map(msg => 
          msg.id === tempAssistantMessageId ? { ...msg, text: assistantResponseText } : msg
        ));
      }


      setMessages(prev => prev.filter(msg => msg.id !== tempAssistantMessageId)); 

      if (assistantResponseText.trim()) { 
        const assistantMessageData: Omit<Message, 'id' | 'timestamp'> & { timestamp: any } = {
          text: assistantResponseText,
          role: 'assistant',
          userId: user.uid,
          conversationId: activeConversationId,
          timestamp: serverTimestamp(),
        };
        await addDoc(collection(db, 'messages'), assistantMessageData);
        await updateDoc(convRef, { lastUpdatedAt: serverTimestamp() });
      }


    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        title: "Error de IA",
        description: error.message || "No se pudo obtener respuesta del asistente.",
        variant: "destructive",
      });
       const errorMessageData: Omit<Message, 'id' | 'timestamp'> & { timestamp: any } = {
        text: "Lo siento, no pude procesar tu solicitud en este momento.",
        role: 'assistant',
        userId: user.uid,
        conversationId: activeConversationId,
        timestamp: serverTimestamp(),
      };
      if (activeConversationId) { 
        await addDoc(collection(db, 'messages'), errorMessageData);
      }
    } finally {
      setIsAiThinking(false);
    }
  };
  
  const handleSelectConversation = (id: string) => {
    if (id !== activeConversationId) {
      setActiveConversationId(id);
      setMessages([]); 
      setIsLoadingMessages(true); 
    }
  };
  
  return (
    <div className="flex h-[calc(100vh-4rem)] bg-background">
      <ChatHistorySidebar
        activeConversationId={activeConversationId}
        onSelectConversation={handleSelectConversation}
        onCreateNewChat={handleCreateNewChat}
        isCreatingNewChat={isCreatingNewChat}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Card className="flex-1 flex flex-col m-0 shadow-none rounded-none border-0 border-l overflow-hidden">
          <CardHeader className="p-4 border-b flex flex-row justify-between items-center">
            <h2 className="text-xl font-headline text-primary">
              Chat con LexIA
            </h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {selectedProvider === 'gemini' ? <Brain className="h-5 w-5 text-blue-600" /> : <Sparkles className="h-5 w-5 text-green-500" />}
              <span>Usando: {selectedProvider === 'gemini' ? 'Gemini' : 'ChatGPT'}</span>
            </div>
          </CardHeader>
          <ScrollArea className="flex-1 min-h-0" viewportRef={viewportRef}>
            <div className="p-4 space-y-4">
              {isLoadingMessages && messages.length === 0 && (
                <div className="flex justify-center items-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              )}
              {!isLoadingMessages && messages.map((msg) => (
                  <MessageBubble 
                      key={msg.id} 
                      message={msg} 
                      userDisplayName={user?.displayName}
                      userPhotoURL={user?.photoURL}
                  />
              ))}
              {isAiThinking && messages[messages.length -1]?.role === 'user' && (
                   <MessageBubble 
                      message={{
                          id: 'thinking-bubble',
                          text: '', 
                          role: 'assistant',
                          userId: user!.uid, 
                          conversationId: activeConversationId!, 
                          timestamp: new Date(),
                      }}
                  >
                    <div className="flex items-center p-3">
                      <Loader2 className="h-5 w-5 animate-spin text-primary mr-2" />
                      <span className="text-sm text-muted-foreground">LexIA está pensando...</span>
                    </div>
                  </MessageBubble>
              )}
            </div>
          </ScrollArea>
          <CardFooter className="p-4 border-t bg-background">
            <form onSubmit={handleSendMessage} className="flex w-full items-center space-x-3">
              <Input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={canInteract ? "Escribe tu consulta legal aquí..." : "Configura tu clave API para chatear"}
                className="flex-1 text-base"
                disabled={!canInteract || isAiThinking}
                aria-label="Entrada de mensaje"
              />
              <Button type="submit" disabled={!canInteract || isAiThinking || !input.trim()} size="icon" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <SendHorizonal className="h-5 w-5" />
                <span className="sr-only">Enviar</span>
              </Button>
            </form>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
