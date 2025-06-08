
"use client";

import ChatInterface from '@/components/chat/ChatInterface';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function ChatPage() {
  const { user, getActiveApiKey, loading: authLoading, selectedProvider } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/auth/login');
      } else {
        const activeKey = getActiveApiKey();
        if (!activeKey) {
          router.push('/settings');
        }
      }
    }
  }, [user, getActiveApiKey, authLoading, router, selectedProvider]);

  if (authLoading || !user || !getActiveApiKey()) {
    let subMessage = "";
    if (!authLoading && !user) {
      subMessage = "Redirigiendo a inicio de sesión...";
    } else if (!authLoading && user && !getActiveApiKey()) {
      subMessage = `Redirigiendo a configuración para ${selectedProvider === 'gemini' ? 'Gemini' : 'OpenAI'} API key...`;
    }

    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] bg-background p-4 text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground font-medium">Cargando LexIA...</p>
        {subMessage && <p className="text-sm text-muted-foreground">{subMessage}</p>}
      </div>
    );
  }

  return <ChatInterface />;
}
