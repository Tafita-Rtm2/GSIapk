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
    // Initial check for cached user (Admin/Prof bypass)
    const cached = GSIStore.getCurrentUser();
    if (cached) {
      setUser(cached);
      setLoading(false);
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Only fetch if not already in store or if we want to refresh
        const userData = await GSIStore.getUser(firebaseUser.uid);
        if (userData) {
          GSIStore.setCurrentUser(userData);
          setUser(userData);
        }
      } else if (!GSIStore.getCurrentUser()) {
        // Only clear if no bypass user is set
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
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
