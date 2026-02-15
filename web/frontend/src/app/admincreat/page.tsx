"use client";

import { useState } from "react";
import { Sparkles, Camera, Lock, UserPlus, ShieldCheck } from "lucide-react";
import { GSIStore, User } from "@/lib/store";
import { toast } from "sonner";
import { CAMPUSES, CAMPUS_FILIERES, NIVEAUX } from "@/lib/constants";
import { useRouter } from "next/navigation";

export default function AdminCreatPage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [adminAuth, setAdminAuth] = useState({ user: "", pass: "" });

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    campus: CAMPUSES[0],
    filiere: CAMPUS_FILIERES[CAMPUSES[0]][0],
    niveau: NIVEAUX[0],
    matricule: "",
    contact: "",
    photo: ""
  });

  const [loading, setLoading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const validUser = process.env.NEXT_PUBLIC_ADMIN_CREAT_USER || "GSI-MG";
    const validPass = process.env.NEXT_PUBLIC_ADMIN_CREAT_PASS || "GSI-Madagascar";

    if (adminAuth.user === validUser && adminAuth.pass === validPass) {
      setIsAuthorized(true);
      const auth = btoa(`${adminAuth.user}:${adminAuth.pass}`);
      localStorage.setItem('gsi_admin_auth', auth);
      toast.success("Accès administrateur validé");
    } else {
      toast.error("Identifiants administrateur incorrects");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

      const result = await GSIStore.addUser(newUser);
      if (result) {
        toast.success("Compte créé avec succès !", { id: toastId });
        setFormData({
            ...formData,
            fullName: "",
            email: "",
            password: "",
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

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-4">
              <ShieldCheck size={32} />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Admin - Création Étudiant</h1>
            <p className="text-gray-500 text-sm text-center mt-2">Veuillez vous authentifier pour accéder à cette fonctionnalité.</p>
          </div>
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Nom d'utilisateur</label>
              <div className="relative">
                <input
                  type="text"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 pl-12 outline-none focus:ring-2 ring-indigo-500/20"
                  placeholder="Nom Admin"
                  value={adminAuth.user}
                  onChange={(e) => setAdminAuth({...adminAuth, user: e.target.value})}
                  required
                />
                <Lock className="absolute left-4 top-4 text-gray-400" size={20} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Mot de passe</label>
              <div className="relative">
                <input
                  type="password"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 pl-12 outline-none focus:ring-2 ring-indigo-500/20"
                  placeholder="••••••••"
                  value={adminAuth.pass}
                  onChange={(e) => setAdminAuth({...adminAuth, pass: e.target.value})}
                  required
                />
                <Lock className="absolute left-4 top-4 text-gray-400" size={20} />
              </div>
            </div>
            <button className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all">
              Accéder
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="bg-white border-b p-6 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
            <UserPlus size={20} />
          </div>
          <h1 className="text-xl font-bold text-gray-800">Ajouter un Étudiant</h1>
        </div>
        <button onClick={() => {
            setIsAuthorized(false);
            localStorage.removeItem('gsi_admin_auth');
        }} className="text-sm font-bold text-red-500">Déconnexion</button>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full p-6">
        <div className="bg-white rounded-3xl shadow-sm p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex justify-center mb-8">
                <div className="relative">
                    <div className="w-32 h-32 bg-gray-100 rounded-3xl flex items-center justify-center border-2 border-dashed border-gray-300 overflow-hidden">
                    {photoPreview ? (
                        <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                        <Camera size={40} className="text-gray-400" />
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

                            const url = await GSIStore.uploadFile(file, `profiles/${file.name}`);
                            setFormData({...formData, photo: url});
                        }
                        };
                        input.click();
                    }}
                    className="absolute -bottom-2 -right-2 bg-primary text-white p-3 rounded-2xl shadow-xl active:scale-90 transition-transform"
                    >
                    <Sparkles size={18} />
                    </button>
                </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Nom Complet</label>
                        <input
                        type="text"
                        required
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 outline-none focus:ring-2 ring-primary/20"
                        placeholder="Ex: Jean Dupont"
                        value={formData.fullName}
                        onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
                        <input
                        type="email"
                        required
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 outline-none focus:ring-2 ring-primary/20"
                        placeholder="nom@student.gsi.com"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Matricule</label>
                        <input
                        type="text"
                        required
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 outline-none focus:ring-2 ring-primary/20"
                        placeholder="Ex: 123456"
                        value={formData.matricule}
                        onChange={(e) => setFormData({...formData, matricule: e.target.value})}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Contact</label>
                        <input
                        type="tel"
                        required
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 outline-none focus:ring-2 ring-primary/20"
                        placeholder="034 XX XXX XX"
                        value={formData.contact}
                        onChange={(e) => setFormData({...formData, contact: e.target.value})}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Mot de passe</label>
                        <input
                        type="text"
                        required
                        minLength={6}
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 outline-none focus:ring-2 ring-primary/20"
                        placeholder="Générer un mot de passe"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Campus</label>
                        <select
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 outline-none focus:ring-2 ring-primary/20"
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

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Filière</label>
                        <select
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 outline-none focus:ring-2 ring-primary/20"
                        value={formData.filiere}
                        onChange={(e) => setFormData({...formData, filiere: e.target.value})}
                        >
                        {CAMPUS_FILIERES[formData.campus].map(f => <option key={f} value={f}>{f}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Niveau</label>
                        <select
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 outline-none focus:ring-2 ring-primary/20"
                        value={formData.niveau}
                        onChange={(e) => setFormData({...formData, niveau: e.target.value})}
                        >
                        {NIVEAUX.map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                    </div>
                </div>

                <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white py-5 rounded-2xl font-bold shadow-lg shadow-primary/30 hover:scale-[1.01] active:scale-[0.99] transition-all mt-6 disabled:opacity-50"
                >
                {loading ? "Création en cours..." : "Créer le compte"}
                </button>
            </form>
        </div>
      </main>
    </div>
  );
}
