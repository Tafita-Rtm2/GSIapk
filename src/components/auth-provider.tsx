"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { useRouter, usePathname } from "next/navigation";
import { auth } from "@/lib/firebase";
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
  // Synchronous initialization for zero-latency start
  const initialCachedUser = typeof window !== 'undefined' ? GSIStore.getCurrentUser() : null;
  const [user, setUser] = useState<User | null>(initialCachedUser);
  const [loading, setLoading] = useState(!initialCachedUser);

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Auth Listener for Firebase (Background sync)
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Background update of user data
        const userData = await GSIStore.getUser(firebaseUser.uid);
        if (userData) {
          GSIStore.setCurrentUser(userData);
        }
      } else {
        const current = GSIStore.getCurrentUser();
        if (current && current.id !== 'admin-id' && current.id !== 'prof-id') {
           setUser(null);
        }
      }
      setLoading(false);
    });

    // Store Listener (handles role-based manual login and sync updates)
    const unsubscribeStore = GSIStore.subscribe((newUser) => {
      setUser(newUser);
      setLoading(false);
    });

    // Final safety to avoid stuck loading, but extremely short for fluid feel
    const timer = setTimeout(() => setLoading(false), 200);

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
      if (user.role === 'admin') router.replace("/admin");
      else if (user.role === 'professor') router.replace("/professor");
      else router.replace("/");
    } else if (!user && !isPublicPath) {
      router.replace("/login");
    }
  }, [user, loading, pathname, router]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-[100]">
        <div className="w-16 h-16 bg-primary rounded-[30%] flex items-center justify-center text-white mb-4 animate-pulse rotate-12">
          <Sparkles size={32} />
        </div>
        <h1 className="text-xl font-black text-primary">GSI Insight</h1>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
