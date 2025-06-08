import type { User as FirebaseUser } from 'firebase/auth';
import type { Timestamp } from 'firebase/firestore';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface Message {
  id: string;
  text: string;
  role: 'user' | 'assistant';
  userId: string;
  timestamp: Timestamp | Date; // Store as Timestamp, allow Date for creation
  conversationId: string;
}

export interface AppUser extends FirebaseUser {}

export interface Conversation {
  id: string; // document ID from Firestore
  userId: string;
  title: string;
  createdAt: Timestamp | Date;
  lastUpdatedAt: Timestamp | Date;
}
