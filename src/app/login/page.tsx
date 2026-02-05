"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // For MVP, just redirect
    router.push("/");
  };

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-white p-8 justify-center">
      <div className="flex flex-col items-center mb-12">
        <div className="w-20 h-20 bg-primary rounded-[30%] flex items-center justify-center text-white mb-6 shadow-xl rotate-12">
          <Sparkles size={40} />
        </div>
        <h1 className="text-4xl font-black text-primary mb-2">GSI Insight</h1>
        <p className="text-gray-500 font-medium text-center">“Where data meets your future.”</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-6">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Adresse Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-gray-50 border-none rounded-2xl p-4 outline-none focus:ring-2 ring-primary/20"
            placeholder="nom@student.gsi.com"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Mot de passe</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-gray-50 border-none rounded-2xl p-4 outline-none focus:ring-2 ring-primary/20"
            placeholder="••••••••"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-primary text-white py-5 rounded-2xl font-bold shadow-lg shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          Se connecter
        </button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-gray-500 text-sm">
          Vous n'avez pas de compte ? <span className="text-primary font-bold">Demander l'accès</span>
        </p>
      </div>
    </div>
  );
}
