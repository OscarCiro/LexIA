"use client";

import ChatInterface from '@/components/chat/ChatInterface';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function ChatPage() {
  const { user, apiKey, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/auth/login');
      } else if (!apiKey) {
        router.push('/settings');
      }
    }
  }, [user, apiKey, loading, router]);

  if (loading || !user || !apiKey) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] bg-background p-4 text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground font-medium">Cargando LexIA...</p>
        {!loading && !user && <p className="text-sm text-muted-foreground">Redirigiendo a inicio de sesión...</p>}
        {!loading && user && !apiKey && <p className="text-sm text-muted-foreground">Redirigiendo a configuración de API...</p>}
      </div>
    );
  }

  return <ChatInterface />;
}
