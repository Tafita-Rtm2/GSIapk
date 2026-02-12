"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, User, GraduationCap, Building2, Phone, Camera, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  // Registration states
  const [formData, setFormData] = useState({
    name: "",
    matricule: "",
    filiere: "",
    niveau: "",
    campus: "",
    contact: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, we'd save to DB. For MVP, we'll just redirect.
    if (mode === "register") {
        localStorage.setItem("user_profile", JSON.stringify(formData));
    }
    router.push("/");
  };

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto bg-white p-8 overflow-y-auto pb-20">
      <div className="flex flex-col items-center mb-10 pt-10">
        <div className="w-16 h-16 bg-primary rounded-[30%] flex items-center justify-center text-white mb-4 shadow-lg rotate-12 transition-transform hover:rotate-0">
          <Sparkles size={32} />
        </div>
        <h1 className="text-3xl font-black text-primary mb-1">GSI Insight</h1>
        <p className="text-gray-400 font-medium text-center text-xs tracking-widest uppercase">“Where data meets your future.”</p>
      </div>

      <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800">
            {mode === "login" ? "Bon retour !" : "Créer un compte"}
          </h2>
          <p className="text-gray-500 text-sm">
            {mode === "login" ? "Connectez-vous pour accéder à votre espace." : "Inscrivez-vous pour rejoindre GSI Internationale."}
          </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === "register" && (
            <>
                <div className="flex justify-center mb-6">
                    <div className="relative w-24 h-24 bg-gray-50 rounded-full border-2 border-dashed border-gray-200 flex items-center justify-center group overflow-hidden">
                        <Camera className="text-gray-300 group-hover:text-primary transition-colors" />
                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" />
                        <div className="absolute bottom-0 right-0 bg-primary p-1.5 rounded-full text-white shadow-md">
                            <PlusIcon size={12} />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <InputGroup label="Nom Complet" icon={<User size={16}/>}>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="input-field"
                            placeholder="Jean Dupont"
                            required
                        />
                    </InputGroup>
                    <InputGroup label="Matricule" icon={<GraduationCap size={16}/>}>
                        <input
                            type="text"
                            value={formData.matricule}
                            onChange={(e) => setFormData({...formData, matricule: e.target.value})}
                            className="input-field"
                            placeholder="GSI-2025-001"
                            required
                        />
                    </InputGroup>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <InputGroup label="Filière" icon={<Building2 size={16}/>}>
                         <select
                            value={formData.filiere}
                            onChange={(e) => setFormData({...formData, filiere: e.target.value})}
                            className="input-field appearance-none"
                            required
                         >
                            <option value="">Sélectionner</option>
                            <option value="Informatique">Informatique</option>
                            <option value="Gestion">Gestion</option>
                            <option value="Droit">Droit</option>
                         </select>
                    </InputGroup>
                    <InputGroup label="Niveau" icon={<Building2 size={16}/>}>
                         <select
                            value={formData.niveau}
                            onChange={(e) => setFormData({...formData, niveau: e.target.value})}
                            className="input-field appearance-none"
                            required
                         >
                            <option value="">Sélectionner</option>
                            <option value="L1">Licence 1</option>
                            <option value="L2">Licence 2</option>
                            <option value="L3">Licence 3</option>
                            <option value="M1">Master 1</option>
                            <option value="M2">Master 2</option>
                         </select>
                    </InputGroup>
                </div>

                <InputGroup label="Campus" icon={<Building2 size={16}/>}>
                     <select
                        value={formData.campus}
                        onChange={(e) => setFormData({...formData, campus: e.target.value})}
                        className="input-field appearance-none"
                        required
                     >
                        <option value="">Sélectionner votre campus</option>
                        <option value="Antananarivo">Antananarivo</option>
                        <option value="Antsirabe">Antsirabe</option>
                        <option value="Toamasina">Toamasina</option>
                     </select>
                </InputGroup>

                <InputGroup label="Numéro de contact" icon={<Phone size={16}/>}>
                    <input
                        type="tel"
                        value={formData.contact}
                        onChange={(e) => setFormData({...formData, contact: e.target.value})}
                        className="input-field"
                        placeholder="+261 34 00 000 00"
                        required
                    />
                </InputGroup>
            </>
        )}

        <InputGroup label="Adresse Email" icon={<User size={16}/>}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field"
            placeholder="nom@student.gsi.mg"
            required
          />
        </InputGroup>

        <InputGroup label="Mot de passe" icon={<GraduationCap size={16}/>}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field"
            placeholder="••••••••"
            required
          />
        </InputGroup>

        <button
          type="submit"
          className="w-full bg-primary text-white py-5 rounded-[24px] font-bold shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all mt-6"
        >
          {mode === "login" ? "Se connecter" : "S'inscrire maintenant"}
        </button>
      </form>

      <div className="mt-8 text-center">
        <button
            onClick={() => setMode(mode === "login" ? "register" : "login")}
            className="text-gray-500 text-sm"
        >
          {mode === "login" ? (
              <>Vous n'avez pas de compte ? <span className="text-primary font-bold">Inscrivez-vous</span></>
          ) : (
              <span className="flex items-center justify-center gap-2">
                  <ArrowLeft size={16} />
                  Déjà un compte ? <span className="text-primary font-bold">Se connecter</span>
              </span>
          )}
        </button>
      </div>

      <style jsx global>{`
        .input-field {
            width: 100%;
            background-color: #f9fafb;
            border-radius: 18px;
            padding: 16px;
            padding-left: 48px;
            font-size: 14px;
            outline: none;
            transition: all 0.2s;
            border: 2px solid transparent;
        }
        .input-field:focus {
            background-color: white;
            border-color: #3F51B5;
            box-shadow: 0 4px 12px rgba(63, 81, 181, 0.05);
        }
      `}</style>
    </div>
  );
}

function InputGroup({ label, icon, children }: { label: string, icon: React.ReactNode, children: React.ReactNode }) {
    return (
        <div className="space-y-1.5 relative">
            <label className="block text-[10px] font-black text-gray-400 uppercase ml-4 tracking-widest">{label}</label>
            <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    {icon}
                </div>
                {children}
            </div>
        </div>
    )
}

function PlusIcon({ size }: { size: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14" />
        </svg>
    )
}
