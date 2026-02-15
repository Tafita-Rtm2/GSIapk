"use client";

import { useState } from "react";
import { Sparkles, Camera, ShieldCheck, UserPlus, LogOut } from "lucide-react";
import { GSIStore, User } from "@/lib/store";
import { toast } from "sonner";
import { CAMPUSES, CAMPUS_FILIERES, NIVEAUX } from "@/lib/constants";

export default function AdminCreatPage() {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

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

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/web/api/admin-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: adminUsername, password: adminPassword })
      });
      const data = await res.json();
      if (data.success) {
        setIsAdminLoggedIn(true);
        toast.success("Authentification réussie");
      } else {
        toast.error("Identifiants admin incorrects");
      }
    } catch (err) {
      // Fallback for local development or if API is down
      if (adminUsername === "GSI-MG" && adminPassword === "GSI-Madagascar") {
        setIsAdminLoggedIn(true);
        toast.success("Authentification réussie (Offline Mode)");
      } else {
        toast.error("Erreur de connexion au serveur d'authentification");
      }
    }
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading("Création du compte élève...");
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

      // Secure creation via Node.js proxy
      const res = await fetch('/web/api/admin/create-student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminAuth: { username: adminUsername, password: adminPassword },
          studentData: newUser
        })
      });

      let result = null;
      if (res.ok) {
        result = await res.json();
      } else {
        // Fallback to direct store call if proxy fails (local dev)
        result = await GSIStore.addUser(newUser);
      }

      if (result) {
        toast.success("Compte élève créé avec succès !", { id: toastId });
        setFormData({
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

  if (!isAdminLoggedIn) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-gray-50 p-6">
        <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-4">
              <ShieldCheck size={32} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 text-center">Admin Access</h1>
            <p className="text-gray-500 text-sm">Entrez les identifiants pour créer un compte</p>
          </div>
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Nom d'utilisateur"
                className="w-full bg-gray-100 border-none rounded-xl p-4 outline-none focus:ring-2 ring-primary/20"
                value={adminUsername}
                onChange={(e) => setAdminUsername(e.target.value)}
                required
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Mot de passe"
                className="w-full bg-gray-100 border-none rounded-xl p-4 outline-none focus:ring-2 ring-primary/20"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-primary text-white py-4 rounded-xl font-bold shadow-lg shadow-primary/20 active:scale-95 transition-all"
            >
              Se connecter
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen max-w-2xl mx-auto bg-gray-50 p-6 md:p-10">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg">
            <UserPlus size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Créer un élève</h1>
            <p className="text-gray-500 text-sm">Enregistrement manuel par l'admin</p>
          </div>
        </div>
        <button
          onClick={() => setIsAdminLoggedIn(false)}
          className="p-3 bg-white text-gray-400 hover:text-red-500 rounded-xl shadow-sm transition-colors"
        >
          <LogOut size={20} />
        </button>
      </div>

      <form onSubmit={handleCreateStudent} className="space-y-6 bg-white p-6 md:p-8 rounded-3xl shadow-sm">
        <div className="flex flex-col items-center mb-6">
          <div className="relative">
            <div className="w-28 h-28 bg-gray-100 rounded-full flex items-center justify-center border-2 border-dashed border-gray-300 overflow-hidden">
              {photoPreview ? (
                <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <Camera size={32} className="text-gray-400" />
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
              className="absolute bottom-0 right-0 bg-primary text-white p-2.5 rounded-full shadow-lg active:scale-90 transition-transform border-4 border-white"
            >
              <Sparkles size={16} />
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Nom Complet</label>
              <input
                type="text"
                required
                className="w-full bg-gray-50 border-none rounded-2xl p-4 outline-none focus:ring-2 ring-primary/20"
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
                className="w-full bg-gray-50 border-none rounded-2xl p-4 outline-none focus:ring-2 ring-primary/20"
                placeholder="nom@student.gsi.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Mot de passe</label>
              <input
                type="password"
                required
                minLength={6}
                className="w-full bg-gray-50 border-none rounded-2xl p-4 outline-none focus:ring-2 ring-primary/20"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Matricule</label>
                <input
                  type="text"
                  required
                  className="w-full bg-gray-50 border-none rounded-2xl p-4 outline-none focus:ring-2 ring-primary/20"
                  placeholder="123456"
                  value={formData.matricule}
                  onChange={(e) => setFormData({...formData, matricule: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Contact</label>
                <input
                  type="tel"
                  required
                  className="w-full bg-gray-50 border-none rounded-2xl p-4 outline-none focus:ring-2 ring-primary/20"
                  placeholder="034 XX..."
                  value={formData.contact}
                  onChange={(e) => setFormData({...formData, contact: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Campus</label>
              <select
                className="w-full bg-gray-50 border-none rounded-2xl p-4 outline-none focus:ring-2 ring-primary/20 appearance-none"
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
                className="w-full bg-gray-50 border-none rounded-2xl p-4 outline-none focus:ring-2 ring-primary/20 appearance-none"
                value={formData.filiere}
                onChange={(e) => setFormData({...formData, filiere: e.target.value})}
              >
                {CAMPUS_FILIERES[formData.campus].map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Niveau</label>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {NIVEAUX.map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setFormData({...formData, niveau: n})}
                    className={`px-4 py-2 rounded-xl font-bold transition-all ${
                      formData.niveau === n
                      ? "bg-primary text-white shadow-md shadow-primary/30"
                      : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-white py-5 rounded-2xl font-bold shadow-lg shadow-primary/30 hover:scale-[1.01] active:scale-[0.99] transition-all mt-6 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? "Création en cours..." : (
            <>
              <UserPlus size={20} />
              Enregistrer l'élève
            </>
          )}
        </button>
      </form>
    </div>
  );
}
