"use client";

import type { ReactNode, FC } from 'react';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import type { UserProfile, AiProvider } from '@/types';

interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  geminiApiKey: string | null;
  setGeminiApiKey: (key: string | null) => void;
  openaiApiKey: string | null;
  setOpenaiApiKey: (key: string | null) => void;
  selectedProvider: AiProvider;
  setSelectedProvider: (provider: AiProvider) => void;
  getActiveApiKey: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [geminiApiKey, setStoredGeminiApiKey] = useState<string | null>(null);
  const [openaiApiKey, setStoredOpenaiApiKey] = useState<string | null>(null);
  const [selectedProvider, setStoredSelectedProvider] = useState<AiProvider>('gemini');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        setFirebaseUser(fbUser);
        setUser({
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.displayName,
          photoURL: fbUser.photoURL,
        });
      } else {
        setFirebaseUser(null);
        setUser(null);
      }
      setLoading(false);
    });

    const storedGeminiKey = localStorage.getItem('geminiApiKey');
    if (storedGeminiKey) {
      setStoredGeminiApiKey(storedGeminiKey);
    }
    const storedOpenaiKey = localStorage.getItem('openaiApiKey');
    if (storedOpenaiKey) {
      setStoredOpenaiApiKey(storedOpenaiKey);
    }
    const storedProvider = localStorage.getItem('selectedAiProvider') as AiProvider | null;
    if (storedProvider) {
      setStoredSelectedProvider(storedProvider);
    }
    
    return () => unsubscribe();
  }, []);

  const setGeminiApiKey = (key: string | null) => {
    if (key) {
      localStorage.setItem('geminiApiKey', key);
      setStoredGeminiApiKey(key);
    } else {
      localStorage.removeItem('geminiApiKey');
      setStoredGeminiApiKey(null);
    }
  };

  const setOpenaiApiKey = (key: string | null) => {
    if (key) {
      localStorage.setItem('openaiApiKey', key);
      setStoredOpenaiApiKey(key);
    } else {
      localStorage.removeItem('openaiApiKey');
      setStoredOpenaiApiKey(null);
    }
  };

  const setSelectedProvider = (provider: AiProvider) => {
    localStorage.setItem('selectedAiProvider', provider);
    setStoredSelectedProvider(provider);
  };

  const getActiveApiKey = () => {
    if (selectedProvider === 'gemini') return geminiApiKey;
    if (selectedProvider === 'chatgpt') return openaiApiKey;
    return null;
  };
  

  return (
    <AuthContext.Provider value={{ 
      user, 
      firebaseUser, 
      loading, 
      geminiApiKey, 
      setGeminiApiKey,
      openaiApiKey,
      setOpenaiApiKey,
      selectedProvider,
      setSelectedProvider,
      getActiveApiKey
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
