import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getDatabase } from "firebase/database";

// Use hardcoded values as primary to ensure it ALWAYS works as requested,
// but allow env override for flexibility.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBaDtbTyIdVDFd48gqOUX9xslguDR-otQs",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "gsi-madagg.firebaseapp.com",
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || "https://gsi-madagg-default-rtdb.firebaseio.com/",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "gsi-madagg",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "gsi-madagg.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "320735531348",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:320735531348:web:1cf742f79479f42b3838c1",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-5PGCJEN5JT"
};

let app;
try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
} catch (e) {
  console.error("Firebase initialization failed", e);
}

export const auth = app ? getAuth(app) : null as any;
export const googleProvider = new GoogleAuthProvider();
export const db = app ? getFirestore(app) : null as any;
export const rtdb = app ? getDatabase(app) : null as any;
export const storage = app ? getStorage(app) : null as any;

if (typeof window !== "undefined" && db) {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn("Firestore persistence failed: Multiple tabs open.");
    } else if (err.code === 'unimplemented') {
      console.warn("Firestore persistence not supported by this browser.");
    }
  });
}

export default app;
