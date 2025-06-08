
"use client";

import AuthForm from '@/components/auth/AuthForm';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (data: { email: string; password: string }) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
      
      if (userCredential.user) {
        if (!userCredential.user.emailVerified) {
          await signOut(auth); // Sign out if email is not verified
          throw new Error("Tu correo electrónico aún no ha sido verificado. Por favor, revisa tu bandeja de entrada (y la carpeta de spam) y haz clic en el enlace de verificación.");
        }
        // Email is verified, proceed with login
        toast({
          title: "Inicio de sesión exitoso",
          description: "Bienvenido de nuevo a LexIA.",
        });
        router.push('/chat'); // Redirect to chat (or home/dashboard)
      } else {
        // This case should ideally not happen if signInWithEmailAndPassword succeeded without error
         throw new Error("No se pudo obtener la información del usuario después del inicio de sesión.");
      }
    } catch (error: any) {
      // Check if it's the custom error we threw for unverified email
      if (error.message === "Tu correo electrónico aún no ha sido verificado. Por favor, revisa tu bandeja de entrada (y la carpeta de spam) y haz clic en el enlace de verificación.") {
        throw error; // Re-throw to be caught by AuthForm
      }

      let friendlyMessage = "Error al iniciar sesión. Verifica tus credenciales.";
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        friendlyMessage = "Correo electrónico o contraseña incorrectos.";
      } else if (error.code === 'auth/too-many-requests') {
        friendlyMessage = "Demasiados intentos de inicio de sesión. Inténtalo de nuevo más tarde.";
      }
      console.error("Login error code:", error.code, error.message);
      throw new Error(friendlyMessage);
    }
  };

  return <AuthForm mode="login" onSubmit={handleLogin} />;
}
