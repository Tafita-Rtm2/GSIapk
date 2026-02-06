"use client";

import { useState, useEffect, memo } from "react";
import {
  ShieldCheck,
  CreditCard,
  Users,
  Megaphone,
  GraduationCap,
  BarChart3,
  Search,
  LogOut,
  ChevronRight,
  Plus,
  Trash2,
  Edit2,
  RefreshCcw,
  BookOpen,
  FileText
} from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { useRouter } from "next/navigation";
import { GSIStore, User, Payment, Lesson, Assignment } from "@/lib/store";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

const CAMPUSES = ["Antananarivo", "Antsirabe", "Bypass", "Tamatave"];

export default function AdminPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [users, setUsers] = useState<User[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCampus, setFilterCampus] = useState("");

  useEffect(() => {
    const user = GSIStore.getCurrentUser();
    if (!user || user.role !== 'admin') {
      router.push("/login");
      return;
    }

    // Cache
    setUsers(GSIStore.getCache<User[]>("admin_users") || []);
    setPayments(GSIStore.getCache<Payment[]>("admin_payments") || []);
    setLessons(GSIStore.getCache<Lesson[]>("admin_lessons") || []);
    setAssignments(GSIStore.getCache<Assignment[]>("admin_assignments") || []);

    const unsubs = [
      GSIStore.subscribeUsers((us) => { setUsers(us); GSIStore.setCache("admin_users", us); }),
      GSIStore.subscribePayments((ps) => { setPayments(ps); GSIStore.setCache("admin_payments", ps); }),
      GSIStore.subscribeLessons({}, (ls) => { setLessons(ls); GSIStore.setCache("admin_lessons", ls); }),
      GSIStore.subscribeAssignments({}, (as) => { setAssignments(as); GSIStore.setCache("admin_assignments", as); }),
      GSIStore.subscribeAnnouncements(() => {}) // Trigger RTDB listener
    ];

    return () => unsubs.forEach(u => u());
  }, [router]);

  const handleDeleteUser = async (id: string) => {
    if (confirm("Supprimer cet utilisateur ?")) {
      const toastId = toast.loading("Suppression...");
      try {
        await GSIStore.deleteUser(id);
        // fetchData removed, but subscriptions will handle UI update
        toast.success("Utilisateur supprimé", { id: toastId });
      } catch (err: any) {
        toast.error("Erreur: " + err.message, { id: toastId });
      }
    }
  };

  const handleSendAnnouncement = async (e: any) => {
    e.preventDefault();
    const title = e.target.title.value;
    const message = e.target.message.value;
    const toastId = toast.loading("Diffusion...");
    try {
      await GSIStore.addAnnouncement({
        id: Math.random().toString(36).substr(2, 9),
        title,
        message,
        date: new Date().toISOString(),
        author: "Administration"
      });
      toast.success("Annonce diffusée !", { id: toastId });
      e.target.reset();
      setActiveTab("dashboard");
    } catch (err: any) {
      toast.error("Erreur: " + err.message, { id: toastId });
    }
  };

  const filteredUsers = users.filter(u =>
    (u.fullName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.email || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const menuItems = [
    { id: "dashboard", icon: ShieldCheck, label: t("dashboard"), color: "bg-indigo-500" },
    { id: "payments", icon: CreditCard, label: t("gestion_paiements"), color: "bg-emerald-500" },
    { id: "users", icon: Users, label: t("gestion_utilisateurs"), color: "bg-blue-500" },
    { id: "communication", icon: Megaphone, label: t("communication"), color: "bg-orange-500" },
    { id: "academic", icon: GraduationCap, label: t("gestion_academique"), color: "bg-purple-500" },
    { id: "stats", icon: BarChart3, label: t("stats_rapports"), color: "bg-pink-500" },
  ];

  const handleExport = (type: string) => {
    alert(`Génération du rapport financier en format ${type}...\nCampus: ${filterCampus || 'Tous'}\nLe fichier sera téléchargé sous peu.`);
  };

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white p-6 rounded-b-[40px] shadow-sm mb-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <ShieldCheck size={28} />
            </div>
            <div>
              <h1 className="text-xl font-bold">Admin Portal</h1>
              <p className="text-xs text-gray-500 font-medium italic">Nina GSI — Principal</p>
            </div>
            <button
              onClick={async () => {
                setUsers(await GSIStore.getUsers());
                setPayments(await GSIStore.getPayments());
              }}
              className="ml-auto p-2 text-indigo-600 hover:rotate-180 transition-transform duration-500"
            >
              <RefreshCcw size={20} />
            </button>
          </div>
          <button
            onClick={async () => {
              await signOut(auth);
              GSIStore.setCurrentUser(null);
              toast.success("Déconnexion");
              router.push("/login");
            }}
            className="p-3 bg-gray-100 rounded-xl text-gray-400 hover:text-red-500 transition-colors"
          >
            <LogOut size={20} />
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder={t("rechercher") + "..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 ring-indigo-500/20"
          />
        </div>
      </div>

      <div className="px-6 space-y-8 flex-1 pb-10">
        {activeTab === "dashboard" && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <StatCard label="Étudiants" value={users.filter(u => u.role === 'student').length.toString()} change="+12%" color="text-blue-600" />
              <StatCard label="Recettes" value="45.2M Ar" change="+5%" color="text-emerald-600" />
            </div>

            {/* Menu Grid */}
            <div>
              <h2 className="text-lg font-bold mb-4">{t("tous")}</h2>
              <div className="grid grid-cols-2 gap-4">
                {menuItems.filter(i => i.id !== 'dashboard').map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className="bg-white p-5 rounded-[32px] shadow-sm border border-gray-100 flex flex-col items-center text-center gap-3 hover:shadow-md transition-all active:scale-95"
                  >
                    <div className={`${item.color} w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-${item.color.split('-')[1]}-500/20`}>
                      <item.icon size={24} />
                    </div>
                    <span className="text-sm font-bold text-gray-700 leading-tight">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === "payments" && (
          <div className="space-y-4">
            <PageHeader
              title={t("gestion_paiements")}
              onBack={() => setActiveTab("dashboard")}
              rightElement={
                <div className="flex gap-2">
                  <button onClick={() => handleExport('PDF')} className="p-2 bg-red-50 text-red-600 rounded-lg text-[10px] font-bold">PDF</button>
                  <button onClick={() => handleExport('Excel')} className="p-2 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-bold">EXCEL</button>
                </div>
              }
            />

            <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
              {["", "Antananarivo", "Antsirabe", "Bypass", "Tamatave"].map(c => (
                <button
                  key={c}
                  onClick={() => setFilterCampus(c)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-bold whitespace-nowrap ${filterCampus === c ? 'bg-indigo-600 text-white' : 'bg-white text-gray-400'}`}
                >
                  {c || "TOUS LES CAMPUS"}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {payments.filter(p => !filterCampus || p.campus.includes(filterCampus)).map((p, i) => (
                <div key={i} className="bg-white p-4 rounded-2xl border border-gray-100 flex justify-between items-center shadow-sm">
                  <div>
                    <h4 className="font-bold text-sm">{p.studentName}</h4>
                    <p className="text-[10px] text-gray-500">{p.filiere} • {p.niveau} • {p.campus}</p>
                    <p className="text-[10px] text-gray-400 mt-1">{p.description} • {p.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm text-indigo-600">{p.amount}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      p.status === 'paid' ? 'bg-emerald-100 text-emerald-600' :
                      p.status === 'pending' ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'
                    }`}>{p.status.toUpperCase()}</span>
                  </div>
                </div>
              ))}
              {payments.length === 0 && <p className="text-center text-gray-400 py-10">Aucun paiement enregistré.</p>}
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div className="space-y-4">
            <PageHeader title={t("gestion_utilisateurs")} onBack={() => setActiveTab("dashboard")} />
            <div className="space-y-3">
              {filteredUsers.map((u, i) => (
                <div key={i} className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center gap-4 shadow-sm">
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center overflow-hidden">
                    {u.photo ? <img src={u.photo} alt={u.fullName} className="w-full h-full object-cover" /> : <Users size={20} />}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-sm">{u.fullName}</h4>
                    <p className="text-[10px] text-gray-500 font-medium">{u.role.toUpperCase()} • {u.filiere} • {u.campus}</p>
                    <p className="text-[9px] text-gray-400">{u.email}</p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={async () => {
                        const newName = prompt("Nouveau nom :", u.fullName);
                        if(newName) {
                          await GSIStore.updateUser({...u, fullName: newName});
                          setUsers(await GSIStore.getUsers());
                        }
                      }}
                      className="text-blue-500 p-2 hover:bg-blue-50 rounded-xl"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(u.id)}
                      className="text-red-500 p-2 hover:bg-red-50 rounded-xl"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
              {filteredUsers.length === 0 && <p className="text-center text-gray-400 py-10">Aucun utilisateur trouvé.</p>}
            </div>
          </div>
        )}

        {activeTab === "communication" && (
          <div className="space-y-6">
            <PageHeader title={t("communication")} onBack={() => setActiveTab("dashboard")} />
            <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm space-y-4">
              <form onSubmit={handleSendAnnouncement} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold mb-2">Titre de l'annonce</label>
                  <input name="title" required type="text" className="w-full bg-gray-50 border-none rounded-xl p-3 outline-none" placeholder="Ex: Report des examens" />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">Message</label>
                  <textarea name="message" required className="w-full bg-gray-50 border-none rounded-xl p-3 outline-none min-h-[100px]" placeholder="Saisissez votre message ici..."></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full bg-orange-500 text-white py-4 rounded-xl font-bold shadow-lg shadow-orange-500/20 active:scale-95 transition-transform"
                >
                  Diffuser l'annonce
                </button>
              </form>
            </div>
          </div>
        )}

        {activeTab === "academic" && (
          <div className="space-y-4">
            <PageHeader title={t("gestion_academique")} onBack={() => setActiveTab("dashboard")} />
            <div className="space-y-6">
               <div className="bg-white p-5 rounded-3xl border border-gray-100">
                  <h3 className="font-bold mb-4 flex items-center gap-2"><BookOpen size={18} className="text-emerald-500" /> Leçons publiées</h3>
                  <div className="space-y-2">
                    {lessons.slice(0, 5).map((l, i) => (
                      <div key={i} className="flex justify-between items-center text-xs p-2 bg-gray-50 rounded-lg">
                        <span className="font-medium truncate max-w-[150px]">{l.title}</span>
                        <span className="text-[10px] text-gray-400 font-bold">{l.subject} • {l.niveau}</span>
                      </div>
                    ))}
                    {lessons.length === 0 && <p className="text-center text-gray-400 py-4 text-xs">Aucune leçon.</p>}
                  </div>
               </div>
               <div className="bg-white p-5 rounded-3xl border border-gray-100">
                  <h3 className="font-bold mb-4 flex items-center gap-2"><FileText size={18} className="text-orange-500" /> Devoirs en cours</h3>
                  <div className="space-y-2">
                    {assignments.slice(0, 5).map((a, i) => (
                      <div key={i} className="flex justify-between items-center text-xs p-2 bg-gray-50 rounded-lg">
                        <span className="font-medium truncate max-w-[150px]">{a.title}</span>
                        <span className="text-[10px] text-red-400 font-bold">{a.deadline}</span>
                      </div>
                    ))}
                    {assignments.length === 0 && <p className="text-center text-gray-400 py-4 text-xs">Aucun devoir.</p>}
                  </div>
               </div>
            </div>
          </div>
        )}

        {activeTab === "stats" && (
           <div className="space-y-4">
            <PageHeader title={t("stats_rapports")} onBack={() => setActiveTab("dashboard")} />
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-indigo-600 p-6 rounded-[32px] text-white flex flex-col items-center shadow-lg">
                 <Users size={32} className="mb-2 opacity-50" />
                 <span className="text-2xl font-black">{users.length}</span>
                 <span className="text-[10px] font-bold uppercase opacity-80 text-center">Utilisateurs Totaux</span>
              </div>
              <div className="bg-emerald-600 p-6 rounded-[32px] text-white flex flex-col items-center shadow-lg">
                 <CreditCard size={32} className="mb-2 opacity-50" />
                 <span className="text-2xl font-black">{payments.length}</span>
                 <span className="text-[10px] font-bold uppercase opacity-80 text-center">Transactions</span>
              </div>
            </div>
            <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
               <h3 className="font-bold mb-4">Répartition par Campus</h3>
               <div className="space-y-4">
                  {CAMPUSES.map(c => {
                    const count = users.filter(u => u.campus === c).length;
                    const percent = users.length > 0 ? (count / users.length) * 100 : 0;
                    return (
                      <div key={c}>
                        <div className="flex justify-between text-xs font-bold mb-1">
                           <span>{c}</span>
                           <span>{count} ({Math.round(percent)}%)</span>
                        </div>
                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                           <div className="bg-indigo-500 h-full" style={{ width: `${percent}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
               </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => {
          if (activeTab === "users") router.push("/register");
          else alert("Fonctionnalité d'ajout rapide bientôt disponible.");
        }}
        className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-xl shadow-indigo-600/40 flex items-center justify-center hover:scale-110 active:scale-90 transition-all z-50"
      >
        <Plus size={28} />
      </button>
    </div>
  );
}

const StatCard = memo(({ label, value, change, color }: { label: string, value: string, change: string, color: string }) => {
  return (
    <div className="bg-white p-5 rounded-[32px] shadow-sm border border-gray-100">
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-xl font-black ${color}`}>{value}</p>
      <p className="text-[10px] font-bold text-emerald-500 mt-1">{change} <span className="text-gray-400">vs last month</span></p>
    </div>
  );
});
