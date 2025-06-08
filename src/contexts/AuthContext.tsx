"use client";

import type { ReactNode, FC } from 'react';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import type { UserProfile } from '@/types';

interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  apiKey: string | null;
  setApiKey: (key: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiKey, setStoredApiKey] = useState<string | null>(null);

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

    const storedKey = localStorage.getItem('geminiApiKey');
    if (storedKey) {
      setStoredApiKey(storedKey);
    }
    
    return () => unsubscribe();
  }, []);

  const setApiKey = (key: string | null) => {
    if (key) {
      localStorage.setItem('geminiApiKey', key);
      setStoredApiKey(key);
    } else {
      localStorage.removeItem('geminiApiKey');
      setStoredApiKey(null);
    }
  };
  

  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading, apiKey, setApiKey }}>
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
