
"use client";

import ChatInterface from '@/components/chat/ChatInterface';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function ChatPage() {
  const { user, getActiveApiKey, loading: authLoading, selectedProvider, apiKeysProcessed } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait for both Firebase auth and API key processing to complete
    if (!authLoading && apiKeysProcessed) {
      if (!user) {
        router.push('/auth/login');
      } else {
        const activeKey = getActiveApiKey();
        if (!activeKey) {
          router.push('/settings');
        }
      }
    }
  }, [user, getActiveApiKey, authLoading, apiKeysProcessed, router, selectedProvider]);

  // Determine if we are in a state where ChatInterface should not be rendered yet
  const showLoadingScreen = authLoading || !apiKeysProcessed || 
                           (!authLoading && apiKeysProcessed && !user) || 
                           (!authLoading && apiKeysProcessed && user && !getActiveApiKey());

  if (showLoadingScreen) {
    let subMessage = "Verificando autenticación y configuración...";
    if (!authLoading && apiKeysProcessed) { // Only show specific messages if data processing is done
        if (!user) {
          subMessage = "Redirigiendo a inicio de sesión...";
        } else if (user && !getActiveApiKey()) {
          subMessage = `Redirigiendo a configuración para ${selectedProvider === 'gemini' ? 'Gemini' : 'OpenAI'} API key...`;
        }
    } else if (authLoading) {
        subMessage = "Verificando autenticación...";
    } else if (!apiKeysProcessed) {
        subMessage = "Procesando configuración de API...";
    }


    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] bg-background p-4 text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground font-medium">Cargando LexIA...</p>
        {subMessage && <p className="text-sm text-muted-foreground">{subMessage}</p>}
      </div>
    );
  }

  // If not loading and all conditions met, render ChatInterface
  return <ChatInterface />;
}
