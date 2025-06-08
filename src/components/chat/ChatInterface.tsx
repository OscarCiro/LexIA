"use client";

import type { FormEvent} from 'react';
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import type { Message } from '@/types';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp, Timestamp } from 'firebase/firestore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SendHorizonal, Loader2 } from 'lucide-react';
import MessageBubble from './MessageBubble';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';

export default function ChatInterface() {
  const { user, apiKey } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const currentConversationId = user ? `conv_${user.uid}` : null; // Simple conversation ID strategy

  useEffect(() => {
    if (!user || !currentConversationId) {
      setMessages([]);
      return;
    }

    const messagesCol = collection(db, 'messages');
    const q = query(
      messagesCol,
      where('userId', '==', user.uid),
      where('conversationId', '==', currentConversationId),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedMessages: Message[] = [];
      querySnapshot.forEach((doc) => {
        fetchedMessages.push({ id: doc.id, ...doc.data() } as Message);
      });
      setMessages(fetchedMessages);
    }, (error) => {
      console.error("Error fetching messages:", error);
      toast({ title: "Error", description: "No se pudieron cargar los mensajes.", variant: "destructive" });
    });

    return () => unsubscribe();
  }, [user, currentConversationId, toast]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages]);

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user || !apiKey || !currentConversationId) return;

    setIsLoading(true);
    const userInput = input;
    setInput('');

    const userMessage: Omit<Message, 'id' | 'timestamp'> & { timestamp: any } = {
      text: userInput,
      role: 'user',
      userId: user.uid,
      conversationId: currentConversationId,
      timestamp: serverTimestamp(),
    };

    try {
      await addDoc(collection(db, 'messages'), userMessage);
      // Message will appear via Firestore listener

      const response = await fetch('/api/lexia-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userInput, apiKey }),
      });

      if (!response.ok || !response.body) {
        const errorData = await response.json().catch(() => ({ message: "Error desconocido del servidor." }));
        throw new Error(errorData.message || `Error: ${response.statusText}`);
      }
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantResponseText = '';
      
      // Create a temporary assistant message ID for streaming display
      const tempAssistantMessageId = `temp_${Date.now()}`;
      setMessages(prev => [...prev, {
        id: tempAssistantMessageId,
        text: '',
        role: 'assistant',
        userId: user.uid,
        conversationId: currentConversationId,
        timestamp: new Timestamp(Math.floor(Date.now()/1000),0) // Approximate client timestamp
      }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        assistantResponseText += decoder.decode(value, { stream: true });
        setMessages(prev => prev.map(msg => 
          msg.id === tempAssistantMessageId ? { ...msg, text: assistantResponseText } : msg
        ));
      }
       assistantResponseText += decoder.decode(undefined, { stream: false }); // Final flush

      // Remove temporary message and add final one to Firestore
      setMessages(prev => prev.filter(msg => msg.id !== tempAssistantMessageId));

      const assistantMessage: Omit<Message, 'id' | 'timestamp'> & { timestamp: any } = {
        text: assistantResponseText,
        role: 'assistant',
        userId: user.uid,
        conversationId: currentConversationId,
        timestamp: serverTimestamp(),
      };
      await addDoc(collection(db, 'messages'), assistantMessage);

    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        title: "Error de IA",
        description: error.message || "No se pudo obtener respuesta del asistente.",
        variant: "destructive",
      });
       // Optionally add an error message to chat
       const errorMessage: Omit<Message, 'id' | 'timestamp'> & { timestamp: any } = {
        text: "Lo siento, no pude procesar tu solicitud en este momento.",
        role: 'assistant',
        userId: user.uid,
        conversationId: currentConversationId,
        timestamp: serverTimestamp(),
      };
      await addDoc(collection(db, 'messages'), errorMessage);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-background"> {/* Adjust height for navbar */}
      <Card className="flex-1 flex flex-col m-4 shadow-lg rounded-lg overflow-hidden">
        <CardHeader className="p-4 border-b">
          <h2 className="text-xl font-headline text-primary">Chat con LexIA</h2>
        </CardHeader>
        <ScrollArea className="flex-1 p-4 space-y-4" ref={scrollAreaRef}>
            {messages.map((msg) => (
                <MessageBubble 
                    key={msg.id} 
                    message={msg} 
                    userDisplayName={user?.displayName}
                    userPhotoURL={user?.photoURL}
                />
            ))}
            {isLoading && messages[messages.length -1]?.role === 'user' && ( // Show loader only if last message was user and expecting AI response
                 <MessageBubble 
                    message={{
                        id: 'loading',
                        text: '',
                        role: 'assistant',
                        userId: user!.uid,
                        conversationId: currentConversationId!,
                        timestamp: new Date(),
                    }}
                >
                  <div className="flex items-center p-2">
                    <Loader2 className="h-5 w-5 animate-spin text-primary mr-2" />
                    <span className="text-sm text-muted-foreground">LexIA está pensando...</span>
                  </div>
                </MessageBubble>
            )}
        </ScrollArea>
        <CardFooter className="p-4 border-t">
          <form onSubmit={handleSendMessage} className="flex w-full items-center space-x-3">
            <Input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe tu consulta legal aquí..."
              className="flex-1 text-base"
              disabled={isLoading || !user || !apiKey}
              aria-label="Entrada de mensaje"
            />
            <Button type="submit" disabled={isLoading || !input.trim() || !user || !apiKey} size="icon" className="bg-accent hover:bg-accent/90">
              <SendHorizonal className="h-5 w-5" />
              <span className="sr-only">Enviar</span>
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}
