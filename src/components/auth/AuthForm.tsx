"use client";

import type { FC } from 'react';
import React, { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

const formSchema = z.object({
  email: z.string().email({ message: "Debe ser un correo electrónico válido." }),
  password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres." }),
});

type FormData = z.infer<typeof formSchema>;

interface AuthFormProps {
  mode: 'login' | 'register';
  onSubmit: (data: FormData) => Promise<void>;
}

const AuthForm: FC<AuthFormProps> = ({ mode, onSubmit }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const handleFormSubmit: SubmitHandler<FormData> = async (data) => {
    setIsLoading(true);
    try {
      await onSubmit(data);
      // Navigation is handled by the page component after successful submission
    } catch (error: any) {
      toast({
        title: "Error de autenticación",
        description: error.message || (mode === 'login' ? "Error al iniciar sesión." : "Error al registrarse."),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-headline text-center">
            {mode === 'login' ? 'Iniciar Sesión en LexIA' : 'Crear Cuenta en LexIA'}
          </CardTitle>
          <CardDescription className="text-center">
            {mode === 'login' ? 'Accede a tu asistente legal.' : 'Regístrate para comenzar.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                {...register('email')}
                disabled={isLoading}
                className={errors.email ? 'border-destructive' : ''}
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="********"
                {...register('password')}
                disabled={isLoading}
                className={errors.password ? 'border-destructive' : ''}
              />
              {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (mode === 'login' ? 'Iniciando sesión...' : 'Registrando...') : (mode === 'login' ? 'Iniciar Sesión' : 'Registrarse')}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-2">
           <p className="text-sm text-muted-foreground">
            {mode === 'login' ? (
              <>
                ¿No tienes cuenta?{' '}
                <Link href="/auth/register" className="font-medium text-primary hover:underline">
                  Regístrate
                </Link>
              </>
            ) : (
              <>
                ¿Ya tienes cuenta?{' '}
                <Link href="/auth/login" className="font-medium text-primary hover:underline">
                  Inicia Sesión
                </Link>
              </>
            )}
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AuthForm;
