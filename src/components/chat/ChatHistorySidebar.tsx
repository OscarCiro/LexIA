
"use client";

import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, onSnapshot, Timestamp, limit, getDocs } from 'firebase/firestore';
import type { Conversation } from '@/types';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PlusCircle, MessageSquare, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatHistorySidebarProps {
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onCreateNewChat: () => Promise<string | null>;
  isCreatingNewChat: boolean;
}

const ChatHistorySidebar: FC<ChatHistorySidebarProps> = ({ activeConversationId, onSelectConversation, onCreateNewChat, isCreatingNewChat }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  useEffect(() => {
    if (!user) {
      setConversations([]);
      setIsLoadingHistory(false);
      return;
    }
    setIsLoadingHistory(true);
    const convCol = collection(db, 'conversations');
    const q = query(
      convCol,
      where('userId', '==', user.uid),
      orderBy('lastUpdatedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedConversations: Conversation[] = [];
      snapshot.forEach((doc) => {
        fetchedConversations.push({ id: doc.id, ...doc.data() } as Conversation);
      });
      setConversations(fetchedConversations);
      setIsLoadingHistory(false);
    }, (error) => {
      console.error("Error fetching conversations:", error);
      setIsLoadingHistory(false);
      // Consider showing a toast message for the error
    });

    return () => unsubscribe();
  }, [user]);

  const handleCreateNew = async () => {
    await onCreateNewChat();
  };

  return (
    <div className="w-72 bg-card/50 dark:bg-card border-r border-border flex flex-col h-full">
      <div className="p-3 border-b border-border">
        <Button onClick={handleCreateNew} className="w-full" disabled={isCreatingNewChat}>
          {isCreatingNewChat ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <PlusCircle className="mr-2 h-5 w-5" />
          )}
          Nueva Consulta
        </Button>
      </div>
      <ScrollArea className="flex-1">
        {isLoadingHistory && (
          <div className="p-4 text-sm text-muted-foreground flex items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            Cargando historial...
          </div>
        )}
        {!isLoadingHistory && conversations.length === 0 && (
          <p className="p-4 text-sm text-center text-muted-foreground">No hay consultas anteriores.</p>
        )}
        {!isLoadingHistory && conversations.length > 0 && (
          <nav className="p-2 space-y-1">
            {conversations.map((conv) => (
              <Button
                key={conv.id}
                variant="ghost"
                className={cn(
                  "w-full justify-start text-left h-auto py-2.5 px-3",
                  conv.id === activeConversationId ? "bg-accent text-accent-foreground hover:bg-accent/90" : "hover:bg-muted/50"
                )}
                onClick={() => onSelectConversation(conv.id)}
                title={conv.title || new Date(conv.createdAt instanceof Timestamp ? conv.createdAt.toDate() : conv.createdAt).toLocaleString()}
              >
                <MessageSquare className="mr-2.5 h-4 w-4 flex-shrink-0" />
                <span className="truncate text-sm">{conv.title || "Consulta"}</span>
              </Button>
            ))}
          </nav>
        )}
      </ScrollArea>
      {/* Future: User profile or settings link at the bottom */}
    </div>
  );
};

export default ChatHistorySidebar;
