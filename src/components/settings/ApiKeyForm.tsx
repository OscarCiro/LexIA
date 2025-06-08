"use client";

import React, { useState, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const apiKeySchema = z.object({
  apiKey: z.string().min(10, { message: "La clave API parece demasiado corta." }), // Basic validation
});

type ApiKeyFormData = z.infer<typeof apiKeySchema>;

export default function ApiKeyForm() {
  const { apiKey: currentApiKey, setApiKey: setContextApiKey } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<ApiKeyFormData>({
    resolver: zodResolver(apiKeySchema),
  });

  useEffect(() => {
    if (currentApiKey) {
      setValue('apiKey', currentApiKey);
    }
  }, [currentApiKey, setValue]);

  const handleFormSubmit: SubmitHandler<ApiKeyFormData> = async (data) => {
    setIsLoading(true);
    try {
      setContextApiKey(data.apiKey);
      toast({
        title: "Clave API Guardada",
        description: "Tu clave API de Gemini ha sido guardada localmente.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar la clave API.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-lg shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-headline">Configuración de Clave API</CardTitle>
        <CardDescription>
          Ingresa tu clave API de Google AI Studio (Gemini) para usar LexIA. La clave se guardará de forma segura en tu navegador.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Importante</AlertTitle>
          <AlertDescription>
            Tu clave API se almacena <strong>únicamente en tu navegador</strong> (localStorage) y no se envía a nuestros servidores para su almacenamiento. Se utiliza directamente para realizar llamadas a la API de Gemini desde tu sesión.
          </AlertDescription>
        </Alert>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="apiKey">Clave API de Gemini</Label>
            <div className="relative">
              <Input
                id="apiKey"
                type={showApiKey ? "text" : "password"}
                placeholder="Pega tu clave API aquí"
                {...register('apiKey')}
                disabled={isLoading}
                className={errors.apiKey ? 'border-destructive pr-10' : 'pr-10'}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 px-0"
                onClick={() => setShowApiKey(!showApiKey)}
                aria-label={showApiKey ? "Ocultar clave API" : "Mostrar clave API"}
              >
                {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {errors.apiKey && <p className="text-sm text-destructive mt-1">{errors.apiKey.message}</p>}
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Guardando...' : 'Guardar Clave API'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
