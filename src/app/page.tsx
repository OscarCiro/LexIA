"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const { user, apiKey, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/auth/login');
      } else if (!apiKey) {
        router.replace('/settings');
      } else {
        router.replace('/chat');
      }
    }
  }, [user, apiKey, loading, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 text-center">
      <Loader2 className="h-16 w-16 animate-spin text-primary mb-6" />
      <h1 className="text-3xl font-headline text-foreground mb-2">Bienvenido a LexIA</h1>
      <p className="text-lg text-muted-foreground">Cargando tu asistente legal personalizado...</p>
    </div>
  );
}
