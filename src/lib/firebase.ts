import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Firebase is now strictly used for Authentication and Password Recovery.
// All academic data and files are stored on https://groupegsi.mg/rtmggmg/api
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBaDtbTyIdVDFd48gqOUX9xslguDR-otQs",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "gsi-madagg.firebaseapp.com",
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

export default app;
