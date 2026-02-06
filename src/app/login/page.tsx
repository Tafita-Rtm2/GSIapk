"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ShieldCheck, GraduationCap, Languages, X } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import Link from "next/link";
import { GSIStore } from "@/lib/store";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showProfModal, setShowProfModal] = useState(false);
  const [adminCode, setAdminCode] = useState("");
  const [profPass, setProfPass] = useState("");
  const { t, language, setLanguage } = useLanguage();
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userData = await GSIStore.getUser(userCredential.user.uid);

      if (userData) {
        GSIStore.setCurrentUser(userData);
        router.push("/");
      } else {
        alert("Profil non trouvé dans la base de données.");
      }
    } catch (error: any) {
      alert("Erreur de connexion: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (adminCode === "Nina GSI") {
      GSIStore.setCurrentUser({
        id: 'admin-id',
        fullName: 'Nina GSI',
        email: 'admin@gsi.mg',
        role: 'admin',
        campus: 'Antananarivo',
        filiere: 'Administration',
        niveau: 'N/A'
      });
      router.push("/admin");
    } else {
      alert("Code incorrect");
    }
  };

  const handleProfLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (profPass === "prof-gsi-mg") {
      const profUser: any = {
        id: 'prof-id',
        fullName: 'Professeur GSI',
        email: 'prof@gsi.mg',
        role: 'professor',
        campus: 'Antananarivo',
        filiere: 'Multiple',
        niveau: 'Multiple'
      };
      GSIStore.setCurrentUser(profUser);
      router.push("/professor");
    } else {
      alert("Mot de passe incorrect");
    }
  };

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto bg-white p-8 relative">
      {/* Top Controls */}
      <div className="flex justify-end items-center gap-4 mb-8">
        <button
          onClick={() => setLanguage(language === "fr" ? "en" : "fr")}
          className="p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200 transition-colors flex items-center gap-1 text-xs font-bold"
        >
          <Languages size={16} />
          {language.toUpperCase()}
        </button>
        <button
          onClick={() => setShowAdminModal(true)}
          className="p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200 transition-colors"
          title={t("admin_portal")}
        >
          <ShieldCheck size={20} />
        </button>
        <button
          onClick={() => setShowProfModal(true)}
          className="p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200 transition-colors"
          title={t("prof_portal")}
        >
          <GraduationCap size={20} />
        </button>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        <div className="flex flex-col items-center mb-12">
          <div className="w-20 h-20 bg-primary rounded-[30%] flex items-center justify-center text-white mb-6 shadow-xl rotate-12">
            <Sparkles size={40} />
          </div>
          <h1 className="text-4xl font-black text-primary mb-2">GSI Insight</h1>
          <p className="text-gray-500 font-medium text-center italic">“Where data meets your future.”</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">{t("email")}</label>
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
            <label className="block text-sm font-bold text-gray-700 mb-2">{t("password")}</label>
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
            {t("se_connecter")}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            {t("no_account")}{" "}
            <Link href="/register" className="text-primary font-bold hover:underline">
              {t("creer_compte")}
            </Link>
          </p>
        </div>
      </div>

      {/* Admin Modal */}
      {showAdminModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xs rounded-3xl p-6 shadow-2xl relative">
            <button onClick={() => setShowAdminModal(false)} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4">
                <ShieldCheck size={24} />
              </div>
              <h2 className="text-xl font-bold">{t("admin_portal")}</h2>
              <p className="text-gray-500 text-xs mt-1">{t("enter_code")}</p>
            </div>
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <input
                type="password"
                value={adminCode}
                onChange={(e) => setAdminCode(e.target.value)}
                className="w-full bg-gray-100 border-none rounded-xl p-3 outline-none focus:ring-2 ring-indigo-500/20 text-center font-bold tracking-widest"
                placeholder="••••••••"
                autoFocus
              />
              <button className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold shadow-md">
                {t("valider")}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Professor Modal */}
      {showProfModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xs rounded-3xl p-6 shadow-2xl relative">
            <button onClick={() => setShowProfModal(false)} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-12 h-12 bg-violet-100 text-violet-600 rounded-full flex items-center justify-center mb-4">
                <GraduationCap size={24} />
              </div>
              <h2 className="text-xl font-bold">{t("prof_portal")}</h2>
              <p className="text-gray-500 text-xs mt-1">{t("enter_code")}</p>
            </div>
            <form onSubmit={handleProfLogin} className="space-y-4">
              <input
                type="password"
                value={profPass}
                onChange={(e) => setProfPass(e.target.value)}
                className="w-full bg-gray-100 border-none rounded-xl p-3 outline-none focus:ring-2 ring-violet-500/20 text-center font-bold tracking-widest"
                placeholder="••••••••"
                autoFocus
              />
              <button className="w-full bg-violet-600 text-white py-3 rounded-xl font-bold shadow-md">
                {t("valider")}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
