"use client";

import { useState } from "react";
import { Camera, ShieldCheck } from "lucide-react";
import { GSIStore, User } from "@/lib/store";
import { toast } from "sonner";
import { CAMPUSES, CAMPUS_FILIERES, NIVEAUX } from "@/lib/constants";

export default function AdminCreatPage() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [adminAuth, setAdminAuth] = useState({ user: "", pass: "" });

  const [formData, setFormData] = useState({
    fullName: "", email: "", password: "",
    campus: CAMPUSES[0], filiere: CAMPUS_FILIERES[CAMPUSES[0]][0], niveau: NIVEAUX[0],
    matricule: "", contact: "", photo: ""
  });

  const [loading, setLoading] = useState(false);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Use the credentials to set the Authorization header for future calls
    localStorage.setItem('gsi_admin_auth', btoa(`${adminAuth.user}:${adminAuth.pass}`));
    setIsAuthorized(true);
    toast.success("Vérification en cours lors de la création...");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await GSIStore.addUser({ ...formData, id: Math.random().toString(36).substr(2, 9), role: 'student' } as User);
      if (res && !res.error) {
        toast.success("Compte étudiant créé avec succès !");
        setFormData({ ...formData, fullName: "", email: "", password: "", matricule: "", contact: "", photo: "" });
      } else {
        toast.error("Erreur: Accès refusé ou données invalides.");
      }
    } catch (error) { toast.error("Échec de la connexion au serveur."); }
    finally { setLoading(false); }
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 font-sans">
        <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md">
          <div className="flex flex-col items-center mb-8">
            <ShieldCheck size={48} className="text-indigo-600 mb-4" />
            <h1 className="text-2xl font-bold">GSI - Portail Création</h1>
          </div>
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <input type="text" className="w-full bg-gray-50 border rounded-xl p-4 outline-none" placeholder="Nom Administrateur" value={adminAuth.user} onChange={(e) => setAdminAuth({...adminAuth, user: e.target.value})} required />
            <input type="password" className="w-full bg-gray-50 border rounded-xl p-4 outline-none" placeholder="Mot de passe" value={adminAuth.pass} onChange={(e) => setAdminAuth({...adminAuth, pass: e.target.value})} required />
            <button className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition-colors">Entrer</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 p-6 font-sans">
      <header className="flex justify-between items-center mb-8 max-w-2xl mx-auto w-full">
        <h1 className="text-xl font-bold">Nouveau Compte Étudiant</h1>
        <button onClick={() => { setIsAuthorized(false); localStorage.removeItem('gsi_admin_auth'); }} className="text-red-500 font-bold">Déconnexion</button>
      </header>
      <main className="max-w-2xl mx-auto w-full bg-white rounded-3xl p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" placeholder="Nom Complet" className="border p-4 rounded-xl outline-none focus:ring-2 ring-primary/20" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} required />
                <input type="email" placeholder="Email GSI" className="border p-4 rounded-xl outline-none focus:ring-2 ring-primary/20" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
                <input type="text" placeholder="Matricule" className="border p-4 rounded-xl outline-none focus:ring-2 ring-primary/20" value={formData.matricule} onChange={e => setFormData({...formData, matricule: e.target.value})} required />
                <input type="tel" placeholder="Contact" className="border p-4 rounded-xl outline-none focus:ring-2 ring-primary/20" value={formData.contact} onChange={e => setFormData({...formData, contact: e.target.value})} required />
                <input type="text" placeholder="Mot de passe par défaut" className="border p-4 rounded-xl outline-none focus:ring-2 ring-primary/20" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required />
                <select className="border p-4 rounded-xl outline-none" value={formData.campus} onChange={e => setFormData({...formData, campus: e.target.value, filiere: CAMPUS_FILIERES[e.target.value][0]})}>
                    {CAMPUSES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select className="border p-4 rounded-xl outline-none" value={formData.filiere} onChange={e => setFormData({...formData, filiere: e.target.value})}>
                    {CAMPUS_FILIERES[formData.campus].map(f => <option key={f} value={f}>{f}</option>)}
                </select>
                <select className="border p-4 rounded-xl outline-none" value={formData.niveau} onChange={e => setFormData({...formData, niveau: e.target.value})}>
                    {NIVEAUX.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
            </div>
            <button type="submit" disabled={loading} className="w-full bg-primary text-white py-5 rounded-2xl font-bold shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50">
                {loading ? "Création en cours..." : "Créer le profil élève"}
            </button>
        </form>
      </main>
    </div>
  );
}
