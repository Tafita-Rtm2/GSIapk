import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBaDtbTyIdVDFd48gqOUX9xslguDR-otQs",
  authDomain: "gsi-madagg.firebaseapp.com",
  databaseURL: "https://gsi-madagg-default-rtdb.firebaseio.com/",
  projectId: "gsi-madagg",
  storageBucket: "gsi-madagg.firebasestorage.app",
  messagingSenderId: "320735531348",
  appId: "1:320735531348:web:1cf742f79479f42b3838c1",
  measurementId: "G-5PGCJEN5JT"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const rtdb = getDatabase(app);

if (typeof window !== "undefined") {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn("Firestore persistence failed: Multiple tabs open.");
    } else if (err.code === 'unimplemented') {
      console.warn("Firestore persistence not supported by this browser.");
    }
  });
}

export const storage = getStorage(app);
export default app;
