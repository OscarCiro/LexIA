"use client";

import React, { useState, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff, Info, Brain, Sparkles } from 'lucide-react'; // Sparkles for ChatGPT, Brain for Gemini
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { AiProvider } from '@/types';

const apiKeySchema = z.object({
  geminiApiKey: z.string().optional(),
  openaiApiKey: z.string().optional(),
});

type ApiKeyFormData = z.infer<typeof apiKeySchema>;

export default function ApiKeyForm() {
  const { 
    geminiApiKey: currentGeminiApiKey, 
    setGeminiApiKey: setContextGeminiApiKey,
    openaiApiKey: currentOpenaiApiKey,
    setOpenaiApiKey: setContextOpenaiApiKey,
    selectedProvider,
    setSelectedProvider
  } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showGeminiApiKey, setShowGeminiApiKey] = useState(false);
  const [showOpenaiApiKey, setShowOpenaiApiKey] = useState(false);
  
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ApiKeyFormData>({
    resolver: zodResolver(apiKeySchema),
    defaultValues: {
      geminiApiKey: currentGeminiApiKey || "",
      openaiApiKey: currentOpenaiApiKey || "",
    }
  });

  const internalSelectedProvider = watch('selectedProviderInternal', selectedProvider) as AiProvider;

  useEffect(() => {
    if (currentGeminiApiKey) {
      setValue('geminiApiKey', currentGeminiApiKey);
    }
    if (currentOpenaiApiKey) {
      setValue('openaiApiKey', currentOpenaiApiKey);
    }
  }, [currentGeminiApiKey, currentOpenaiApiKey, setValue]);

  const handleFormSubmit: SubmitHandler<ApiKeyFormData> = async (data) => {
    setIsLoading(true);
    let saved = false;
    try {
      if (internalSelectedProvider === 'gemini' && data.geminiApiKey) {
        if (data.geminiApiKey.length < 10) {
           toast({ title: "Error", description: "La clave API de Gemini parece demasiado corta.", variant: "destructive" });
           setIsLoading(false);
           return;
        }
        setContextGeminiApiKey(data.geminiApiKey);
        saved = true;
      } else if (internalSelectedProvider === 'chatgpt' && data.openaiApiKey) {
         if (data.openaiApiKey.length < 10) {
           toast({ title: "Error", description: "La clave API de OpenAI parece demasiado corta.", variant: "destructive" });
           setIsLoading(false);
           return;
        }
        setContextOpenaiApiKey(data.openaiApiKey);
        saved = true;
      }
      
      setSelectedProvider(internalSelectedProvider);

      if (saved) {
        toast({
          title: "Configuración Guardada",
          description: `Tu clave API para ${internalSelectedProvider === 'gemini' ? 'Gemini' : 'ChatGPT'} y la preferencia de proveedor han sido guardadas.`,
        });
      } else {
         toast({
          title: "Preferencia Guardada",
          description: `Has seleccionado ${internalSelectedProvider === 'gemini' ? 'Gemini' : 'ChatGPT'} como proveedor. Ingresa la clave API correspondiente si aún no lo has hecho.`,
        });
      }

    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Need to register this field even if it's not directly in the schema, to track its value
  useEffect(() => {
    register('selectedProviderInternal');
    setValue('selectedProviderInternal', selectedProvider);
  }, [register, setValue, selectedProvider]);

  return (
    <Card className="w-full max-w-lg shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-headline">Configuración de IA y Claves API</CardTitle>
        <CardDescription>
          Elige tu proveedor de IA preferido e ingresa la clave API correspondiente. Las claves se guardan localmente en tu navegador.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <div>
            <Label className="text-base font-medium mb-2 block">Proveedor de IA</Label>
            <RadioGroup
              value={internalSelectedProvider}
              onValueChange={(value: AiProvider) => {
                setValue('selectedProviderInternal', value, { shouldValidate: true });
                setSelectedProvider(value); // Update context immediately for UI reactivity if desired, or wait for submit
              }}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="gemini" id="gemini" />
                <Label htmlFor="gemini" className="flex items-center gap-2 cursor-pointer">
                  <Brain className="h-5 w-5 text-blue-600" /> Gemini (Google)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="chatgpt" id="chatgpt" />
                <Label htmlFor="chatgpt" className="flex items-center gap-2 cursor-pointer">
                  <Sparkles className="h-5 w-5 text-green-500" /> ChatGPT (OpenAI)
                </Label>
              </div>
            </RadioGroup>
          </div>

          {internalSelectedProvider === 'gemini' && (
            <div className="space-y-2">
              <Label htmlFor="geminiApiKey">Clave API de Gemini</Label>
              <div className="relative">
                <Input
                  id="geminiApiKey"
                  type={showGeminiApiKey ? "text" : "password"}
                  placeholder="Pega tu clave API de Gemini aquí"
                  {...register('geminiApiKey')}
                  disabled={isLoading}
                  className={errors.geminiApiKey ? 'border-destructive pr-10' : 'pr-10'}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 px-0"
                  onClick={() => setShowGeminiApiKey(!showGeminiApiKey)}
                  aria-label={showGeminiApiKey ? "Ocultar clave API" : "Mostrar clave API"}
                >
                  {showGeminiApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {errors.geminiApiKey && <p className="text-sm text-destructive mt-1">{errors.geminiApiKey.message}</p>}
              <Alert variant="default" className="mt-2">
                <Info className="h-4 w-4" />
                <AlertTitle>Obtén tu clave de Gemini</AlertTitle>
                <AlertDescription>
                  Puedes obtener tu clave API de Gemini desde <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline font-medium hover:text-primary">Google AI Studio</a>.
                </AlertDescription>
              </Alert>
            </div>
          )}

          {internalSelectedProvider === 'chatgpt' && (
            <div className="space-y-2">
              <Label htmlFor="openaiApiKey">Clave API de OpenAI (ChatGPT)</Label>
              <div className="relative">
                <Input
                  id="openaiApiKey"
                  type={showOpenaiApiKey ? "text" : "password"}
                  placeholder="Pega tu clave API de OpenAI aquí (ej. sk-...)"
                  {...register('openaiApiKey')}
                  disabled={isLoading}
                  className={errors.openaiApiKey ? 'border-destructive pr-10' : 'pr-10'}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 px-0"
                  onClick={() => setShowOpenaiApiKey(!showOpenaiApiKey)}
                  aria-label={showOpenaiApiKey ? "Ocultar clave API" : "Mostrar clave API"}
                >
                  {showOpenaiApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {errors.openaiApiKey && <p className="text-sm text-destructive mt-1">{errors.openaiApiKey.message}</p>}
               <Alert variant="default" className="mt-2">
                <Info className="h-4 w-4" />
                <AlertTitle>Obtén tu clave de OpenAI</AlertTitle>
                <AlertDescription>
                  Puedes obtener tu clave API de OpenAI desde la <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="underline font-medium hover:text-primary">plataforma de OpenAI</a>.
                </AlertDescription>
              </Alert>
            </div>
          )}
          
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Importante sobre las Claves API</AlertTitle>
            <AlertDescription>
              Tus claves API se almacenan <strong>únicamente en tu navegador</strong> (localStorage) y no se envían a nuestros servidores para su almacenamiento. Se utilizan directamente para realizar llamadas a las APIs correspondientes desde tu sesión.
            </AlertDescription>
          </Alert>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Guardando...' : 'Guardar Configuración'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
