
"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { Scale, LogOut, UserCircle, SettingsIcon, Brain, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AiProvider } from '@/types';
import { useToast } from '@/hooks/use-toast';

export default function Navbar() {
  const {
    user,
    loading,
    selectedProvider,
    setSelectedProvider,
    geminiApiKey,
    setGeminiApiKey,
    openaiApiKey,
    setOpenaiApiKey,
    getActiveApiKey
  } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [isApiDialogOpen, setIsApiDialogOpen] = useState(false);
  const [providerForApiKey, setProviderForApiKey] = useState<AiProvider | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState('');

  const handleProviderChange = (value: string) => {
    const newProvider = value as AiProvider;
    setSelectedProvider(newProvider); // Update context immediately

    // Check if key for the newProvider is missing
    let keyIsMissing = false;
    if (newProvider === 'gemini' && !geminiApiKey) {
      keyIsMissing = true;
    } else if (newProvider === 'chatgpt' && !openaiApiKey) {
      keyIsMissing = true;
    }

    if (keyIsMissing) {
      setProviderForApiKey(newProvider);
      setApiKeyInput(''); // Clear previous input
      setIsApiDialogOpen(true);
    }
  };

  const handleSaveApiKey = () => {
    if (!providerForApiKey || !apiKeyInput.trim()) {
      toast({
        title: "Error",
        description: "API Key cannot be empty.",
        variant: "destructive",
      });
      return;
    }
    if (providerForApiKey === 'gemini') {
      setGeminiApiKey(apiKeyInput);
    } else if (providerForApiKey === 'chatgpt') {
      setOpenaiApiKey(apiKeyInput);
    }
    toast({
      title: "API Key Saved",
      description: `API Key for ${providerForApiKey === 'gemini' ? 'Gemini' : 'ChatGPT'} has been updated.`,
    });
    setIsApiDialogOpen(false);
    setApiKeyInput('');
    setProviderForApiKey(null);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/auth/login');
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      toast({
        title: "Error",
        description: "No se pudo cerrar sesión.",
        variant: "destructive",
      });
    }
  };

  const renderProviderDisplay = (provider: AiProvider) => {
    if (provider === 'gemini') {
      return <span className="flex items-center gap-2"><Brain className="h-4 w-4" /> Gemini</span>;
    }
    if (provider === 'chatgpt') {
      return <span className="flex items-center gap-2"><Sparkles className="h-4 w-4" /> ChatGPT</span>;
    }
    return "Select LLM";
  };


  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-card shadow-md border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity">
            <Scale className="h-8 w-8" />
            <h1 className="text-2xl font-headline font-semibold">LexIA</h1>
          </Link>
          
          <div className="flex items-center gap-3 sm:gap-4"> {/* Adjusted gap */}
            {!loading && user && (
              <>
                <Link href="/chat" passHref>
                  <Button variant="ghost" className="hidden sm:inline-flex">Chat</Button>
                </Link>
                <div className="flex items-center gap-1 sm:gap-2">
                  <Select onValueChange={handleProviderChange} value={selectedProvider}>
                    <SelectTrigger className="w-[130px] sm:w-[150px] h-9 text-xs sm:text-sm px-2 sm:px-3">
                      <SelectValue placeholder="Select LLM">
                        {renderProviderDisplay(selectedProvider)}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gemini">
                        <span className="flex items-center gap-2"><Brain className="h-4 w-4" /> Gemini</span>
                      </SelectItem>
                      <SelectItem value="chatgpt">
                        <span className="flex items-center gap-2"><Sparkles className="h-4 w-4" /> ChatGPT</span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <Link href="/settings" passHref>
                    <Button variant="ghost" size="icon" aria-label="Configuración">
                      <SettingsIcon className="h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              </>
            )}
            {loading ? (
              <div className="h-8 w-20 bg-muted rounded animate-pulse"></div>
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user.photoURL || undefined} alt={user.displayName || user.email || "Usuario"} />
                      <AvatarFallback>
                        {user.displayName ? user.displayName.charAt(0).toUpperCase() : (user.email ? user.email.charAt(0).toUpperCase() : <UserCircle className="h-5 w-5" />)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.displayName || "Usuario"}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                   <DropdownMenuItem onClick={() => router.push('/chat')}>
                    <MessageSquare className="mr-2 h-4 w-4" /> 
                    <span>Chat</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/settings')}>
                    <SettingsIcon className="mr-2 h-4 w-4" />
                    <span>Configuración API</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Cerrar Sesión</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link href="/auth/login" passHref>
                  <Button variant="ghost">Iniciar Sesión</Button>
                </Link>
                <Link href="/auth/register" passHref>
                  <Button variant="default">Registrarse</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <Dialog open={isApiDialogOpen} onOpenChange={(open) => {
        setIsApiDialogOpen(open);
        if (!open) {
          setProviderForApiKey(null); // Reset if dialog is closed
          setApiKeyInput('');
        }
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              Configurar Clave API para {providerForApiKey === 'gemini' ? 'Gemini' : 'ChatGPT'}
            </DialogTitle>
            <DialogDescription>
              {providerForApiKey === 'gemini' 
                ? "Pega tu clave API de Gemini aquí. Puedes obtenerla de Google AI Studio."
                : "Pega tu clave API de OpenAI (ChatGPT) aquí. Puedes obtenerla de la plataforma de OpenAI."
              }
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="apiKey" className="text-right col-span-1">
                Clave API
              </Label>
              <Input
                id="apiKey"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                className="col-span-3"
                placeholder={`Tu clave API de ${providerForApiKey === 'gemini' ? 'Gemini' : 'OpenAI'}`}
                type="password"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsApiDialogOpen(false);
              setProviderForApiKey(null);
              setApiKeyInput('');
            }}>Cancelar</Button>
            <Button type="submit" onClick={handleSaveApiKey}>Guardar Clave</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Helper icon, if not already imported
const MessageSquare = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);
