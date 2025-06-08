"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/chat');
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] bg-background p-4 text-center">
      <Loader2 className="h-16 w-16 animate-spin text-primary mb-6" />
      <h1 className="text-3xl font-headline text-foreground mb-2">Redirigiendo a LexIA Chat</h1>
      <p className="text-lg text-muted-foreground">Un momento por favor...</p>
    </div>
  );
}
