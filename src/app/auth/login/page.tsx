"use client";

import AuthForm from '@/components/auth/AuthForm';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (data: { email: string; password: string }) => {
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      toast({
        title: "Inicio de sesión exitoso",
        description: "Bienvenido de nuevo a LexIA.",
      });
      router.push('/'); // Redirect to home/dashboard after login
    } catch (error: any) {
      // Error is handled by AuthForm, but rethrow to satisfy promise type
      let friendlyMessage = "Error al iniciar sesión. Verifica tus credenciales.";
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        friendlyMessage = "Correo electrónico o contraseña incorrectos.";
      }
      console.error("Login error code:", error.code);
      throw new Error(friendlyMessage);
    }
  };

  return <AuthForm mode="login" onSubmit={handleLogin} />;
}
