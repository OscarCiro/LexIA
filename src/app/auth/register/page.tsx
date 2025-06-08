"use client";

import AuthForm from '@/components/auth/AuthForm';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();

  const handleRegister = async (data: { email: string; password: string }) => {
    try {
      await createUserWithEmailAndPassword(auth, data.email, data.password);
      toast({
        title: "Registro exitoso",
        description: "Tu cuenta ha sido creada. Bienvenido a LexIA.",
      });
      router.push('/'); // Redirect to home/dashboard after registration
    } catch (error: any) {
      let friendlyMessage = "Error al registrarse. Inténtalo de nuevo.";
      if (error.code === 'auth/email-already-in-use') {
        friendlyMessage = "Este correo electrónico ya está en uso.";
      }
      console.error("Register error code:", error.code);
      throw new Error(friendlyMessage);
    }
  };

  return <AuthForm mode="register" onSubmit={handleRegister} />;
}
