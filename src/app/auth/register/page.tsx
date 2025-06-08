
"use client";

import AuthForm from '@/components/auth/AuthForm';
import { createUserWithEmailAndPassword, sendEmailVerification, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();

  const handleRegister = async (data: { email: string; password: string }) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      if (userCredential.user) {
        await sendEmailVerification(userCredential.user);
        await signOut(auth); // Sign out the user immediately
        toast({
          title: "Registro Exitoso",
          description: "Se ha enviado un correo de verificación a tu email. Por favor, verifica tu cuenta para poder iniciar sesión.",
          duration: 7000, // Give more time to read
        });
        router.push('/auth/login'); // Redirect to login page
      } else {
        // This case should ideally not happen if createUserWithEmailAndPassword succeeded
        throw new Error("No se pudo obtener la información del usuario después del registro.");
      }
    } catch (error: any) {
      let friendlyMessage = "Error al registrarse. Inténtalo de nuevo.";
      if (error.code === 'auth/email-already-in-use') {
        friendlyMessage = "Este correo electrónico ya está en uso.";
      } else if (error.code === 'auth/weak-password') {
        friendlyMessage = "La contraseña es demasiado débil.";
      }
      console.error("Register error code:", error.code, error.message);
      throw new Error(friendlyMessage);
    }
  };

  return <AuthForm mode="register" onSubmit={handleRegister} />;
}
