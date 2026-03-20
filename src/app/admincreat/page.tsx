"use client";

import { useState } from "react";
import { Sparkles, ShieldCheck, Camera, CheckCircle2, AlertCircle } from "lucide-react";
import { GSIStore, User } from "@/lib/store";
import { toast } from "sonner";
import { CAMPUSES, CAMPUS_FILIERES, NIVEAUX } from "@/lib/constants";

export default function AdminCreatPage() {
  const [unlocked, setUnlocked] = useState(false);
  const [adminCode, setAdminCode] = useState("");
  const [loading, setLoading] = useState(false);

  // Registration Form State
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    campus: CAMPUSES[0],
    filiere: CAMPUS_FILIERES[CAMPUSES[0]][0],
    niveau: NIVEAUX[0],
    matricule: "",
    contact: "",
    photo: ""
  });
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    // Compare with the code from GSIStore
    if (adminCode === GSIStore.getAdminCode()) {
      setUnlocked(true);
      toast.success("Accès Administrateur Déverrouillé");
    } else {
      toast.error("Code administrateur incorrect");
    }
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Création du compte étudiant...");
    try {
      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: 'student',
        campus: formData.campus,
        filiere: formData.filiere,
        niveau: formData.niveau,
        matricule: formData.matricule,
        contact: formData.contact,
        photo: formData.photo
      };

      // We use GSIStore.addUser instead of GSIStore.register to avoid auto-login
      const result = await GSIStore.addUser(newUser);
      if (result) {
        toast.success(`Compte créé pour ${formData.fullName} !`, { id: toastId });
        // Reset form for next student
        setFormData({
          fullName: "",
          email: "",
          password: "",
          confirmPassword: "",
          campus: CAMPUSES[0],
          filiere: CAMPUS_FILIERES[CAMPUSES[0]][0],
          niveau: NIVEAUX[0],
          matricule: "",
          contact: "",
          photo: ""
        });
        setPhotoPreview(null);
      } else {
        toast.error("Erreur lors de la création du compte.", { id: toastId });
      }
    } catch (error: any) {
      toast.error("Erreur: " + error.message, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  if (!unlocked) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-8">
        <div className="w-full max-w-sm bg-white rounded-[40px] p-10 shadow-2xl border border-gray-100 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-indigo-600 rounded-[30%] flex items-center justify-center text-white mb-8 shadow-xl rotate-12">
            <ShieldCheck size={40} />
          </div>
          <h1 className="text-2xl font-black text-gray-900 mb-2 uppercase tracking-tight">GSI Admin</h1>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-10">Création de comptes élèves</p>

          <form onSubmit={handleUnlock} className="w-full space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Code d'accès GSI</label>
              <input
                type="password"
                value={adminCode}
                onChange={(e) => setAdminCode(e.target.value)}
                className="w-full bg-gray-50 p-4 rounded-2xl text-center font-bold tracking-widest outline-none border-2 border-transparent focus:border-indigo-600 transition-all"
                placeholder="••••••••"
                required
                autoFocus
              />
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-indigo-100 active:scale-95 transition-all"
            >
              Déverrouiller
            </button>
          </form>

          <div className="mt-10 p-4 bg-orange-50 rounded-2xl flex items-center gap-3 border border-orange-100">
             <AlertCircle className="text-orange-500 shrink-0" size={20} />
             <p className="text-[10px] text-orange-600 font-bold text-left leading-relaxed">Cette interface est réservée à l'administration pour l'enregistrement manuel des étudiants GSI.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto bg-gray-50 p-8">
      <div className="mb-10 flex items-center justify-between">
        <div>
           <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight leading-none">Administration</h1>
           <p className="text-indigo-600 text-[10px] font-black uppercase tracking-widest mt-1">Nouveau Compte Étudiant</p>
        </div>
        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
           <ShieldCheck size={24} />
        </div>
      </div>

      <form onSubmit={handleCreateStudent} className="space-y-6 pb-20">
        <div className="flex justify-center mb-10">
          <div className="relative group">
            <div className="w-28 h-28 bg-white rounded-[32px] flex items-center justify-center border-2 border-dashed border-gray-200 overflow-hidden shadow-sm group-hover:border-indigo-400 transition-colors">
              {photoPreview ? (
                <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center text-gray-400">
                   <Camera size={32} />
                   <span className="text-[8px] font-black uppercase mt-1">Photo Profil</span>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.onchange = async (e: any) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (re) => setPhotoPreview(re.target?.result as string);
                    reader.readAsDataURL(file);

                    const tid = toast.loading("Optimisation de l'image...");
                    const url = await GSIStore.uploadFile(file, `profiles/${file.name}`);
                    setFormData({...formData, photo: url});
                    toast.success("Image prête", { id: tid });
                  }
                };
                input.click();
              }}
              className="absolute -bottom-2 -right-2 bg-indigo-600 text-white p-3 rounded-2xl shadow-xl active:scale-90 transition-transform"
            >
              <Sparkles size={16} />
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm space-y-4">
          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase text-gray-400 ml-1">Nom Complet de l'étudiant</label>
            <input
              type="text"
              required
              className="w-full bg-gray-50 border-none rounded-2xl p-4 outline-none focus:ring-2 ring-indigo-500/20 font-bold text-sm"
              placeholder="Ex: Jean Dupont"
              value={formData.fullName}
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase text-gray-400 ml-1">Adresse Email Institutionnelle</label>
            <input
              type="email"
              required
              className="w-full bg-gray-50 border-none rounded-2xl p-4 outline-none focus:ring-2 ring-indigo-500/20 font-bold text-sm"
              placeholder="prenom.nom@student.gsi.com"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase text-gray-400 ml-1">N° Matricule</label>
              <input
                type="text"
                required
                className="w-full bg-gray-50 border-none rounded-2xl p-4 outline-none focus:ring-2 ring-indigo-500/20 font-bold text-sm"
                placeholder="Ex: 123456"
                value={formData.matricule}
                onChange={(e) => setFormData({...formData, matricule: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase text-gray-400 ml-1">Contact Tél</label>
              <input
                type="tel"
                required
                className="w-full bg-gray-50 border-none rounded-2xl p-4 outline-none focus:ring-2 ring-indigo-500/20 font-bold text-sm"
                placeholder="034 XX XXX XX"
                value={formData.contact}
                onChange={(e) => setFormData({...formData, contact: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase text-gray-400 ml-1">Mot de passe</label>
              <input
                type="password"
                required
                minLength={8}
                className="w-full bg-gray-50 border-none rounded-2xl p-4 outline-none focus:ring-2 ring-indigo-500/20 font-bold text-sm"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase text-gray-400 ml-1">Confirmation</label>
              <input
                type="password"
                required
                className="w-full bg-gray-50 border-none rounded-2xl p-4 outline-none focus:ring-2 ring-indigo-500/20 font-bold text-sm"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm space-y-4">
          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase text-gray-400 ml-1">Affectation Campus</label>
            <select
              className="w-full bg-gray-50 border-none rounded-2xl p-4 outline-none focus:ring-2 ring-indigo-500/20 font-bold text-sm appearance-none"
              value={formData.campus}
              onChange={(e) => {
                const newCampus = e.target.value;
                setFormData({
                  ...formData,
                  campus: newCampus,
                  filiere: CAMPUS_FILIERES[newCampus][0]
                });
              }}
            >
              {CAMPUSES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase text-gray-400 ml-1">Filière d'Étude</label>
            <select
              className="w-full bg-gray-50 border-none rounded-2xl p-4 outline-none focus:ring-2 ring-indigo-500/20 font-bold text-sm appearance-none"
              value={formData.filiere}
              onChange={(e) => setFormData({...formData, filiere: e.target.value})}
            >
              {CAMPUS_FILIERES[formData.campus].map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase text-gray-400 ml-1">Niveau Actuel</label>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {NIVEAUX.map(n => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setFormData({...formData, niveau: n})}
                  className={`px-6 py-3 rounded-xl font-bold transition-all text-xs ${
                    formData.niveau === n
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100"
                    : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-5 rounded-3xl font-black uppercase tracking-widest shadow-xl shadow-indigo-100 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {loading ? (
             <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
             <CheckCircle2 size={20} />
          )}
          {loading ? "Création..." : "Enregistrer l'Étudiant"}
        </button>

        <button
          type="button"
          onClick={() => setUnlocked(false)}
          className="w-full py-4 bg-gray-100 text-gray-500 rounded-2xl font-bold text-xs hover:bg-gray-200 transition-colors"
        >
          Déconnexion Administration
        </button>
      </form>
    </div>
  );
}
