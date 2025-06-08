
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getAnalytics, type Analytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyABoRY5kFqIDSkMv37TeJ5I7r0EBUzr8zU",
  authDomain: "lexia-v1.firebaseapp.com",
  databaseURL: "https://lexia-v1-default-rtdb.firebaseio.com",
  projectId: "lexia-v1",
  storageBucket: "lexia-v1.firebasestorage.app",
  messagingSenderId: "1074238001164",
  appId: "1:1074238001164:web:1def07eca272fb966dde29",
  measurementId: "G-55RL568ELY"
};

let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);

let analytics: Analytics | undefined;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { app, auth, db, analytics };
