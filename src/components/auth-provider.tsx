"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { useRouter, usePathname } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { GSIStore, User } from "@/lib/store";
import { Sparkles } from "lucide-react";

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Initial sync - Bypass loading if user is already cached
    const initialUser = GSIStore.getCurrentUser();
    if (initialUser) {
      setUser(initialUser);
      setLoading(false);
    }

    // Auth Listener for Firebase
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // If we already have a user from cache, we update it in background
        const userData = await GSIStore.getUser(firebaseUser.uid);
        if (userData) {
          GSIStore.setCurrentUser(userData);
        }
      } else {
        // Only clear if no bypass user (Admin/Prof)
        const current = GSIStore.getCurrentUser();
        if (current && current.id !== 'admin-id' && current.id !== 'prof-id') {
           setUser(null);
        }
      }
      setLoading(false);
    });

    // Store Listener for Manual logins (Admin/Prof) and Firebase background sync
    const unsubscribeStore = GSIStore.subscribe((newUser) => {
      setUser(newUser);
      setLoading(false);
    });

    // Minimal safety timeout
    const timer = setTimeout(() => setLoading(false), 800);

    return () => {
      unsubscribeAuth();
      unsubscribeStore();
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (loading) return;

    const publicPaths = ["/login", "/register"];
    const isPublicPath = publicPaths.includes(pathname);

    if (user && isPublicPath) {
      // Redirect logged in users away from login/register
      if (user.role === 'admin') router.push("/admin");
      else if (user.role === 'professor') router.push("/professor");
      else router.push("/");
    } else if (!user && !isPublicPath) {
      // Redirect unauthenticated users to login
      router.push("/login");
    }
  }, [user, loading, pathname, router]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-[100]">
        <div className="w-20 h-20 bg-primary rounded-[30%] flex items-center justify-center text-white mb-6 animate-pulse rotate-12 shadow-xl">
          <Sparkles size={40} />
        </div>
        <h1 className="text-2xl font-black text-primary animate-bounce">GSI Insight</h1>
        <p className="text-gray-400 text-xs mt-4 font-bold tracking-widest uppercase">Initialisation sécurisée...</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
