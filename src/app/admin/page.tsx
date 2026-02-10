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
  FileText,
  Mail,
  X,
  Wifi,
  WifiOff,
  CheckCircle2,
  TrendingUp
} from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { useRouter } from "next/navigation";
import { GSIStore, User, Payment, Lesson, Assignment } from "@/lib/store";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { cn } from "@/lib/utils";

const CAMPUSES = ["Antananarivo", "Antsirabe", "Bypass", "Tamatave"];

export default function AdminPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showConvocationModal, setShowConvocationModal] = useState(false);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCampus, setFilterCampus] = useState("");
  const [syncStatus, setSyncStatus] = useState<'syncing' | 'ready' | 'offline'>('syncing');

  useEffect(() => {
    const user = GSIStore.getCurrentUser();
    if (!user || user.role !== 'admin') {
      router.push("/login");
      return;
    }

    const unsubs = [
      GSIStore.subscribeUsers((us) => { setUsers(us); setSyncStatus('ready'); }),
      GSIStore.subscribePayments((ps) => setPayments(ps)),
      GSIStore.subscribeLessons({}, (ls) => setLessons(ls)),
      GSIStore.subscribeAssignments({}, (as) => setAssignments(as)),
      GSIStore.subscribeAnnouncements(() => {})
    ];

    const handleOffline = () => setSyncStatus('offline');
    const handleOnline = () => setSyncStatus('syncing');
    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      unsubs.forEach(u => u());
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, [router]);

  const handleDeleteUser = async (id: string) => {
    if (confirm("Supprimer cet utilisateur ?")) {
      await GSIStore.deleteUser(id);
      toast.success("Demande de suppression envoyée.");
    }
  };

  const handleSendAnnouncement = async (e: any) => {
    e.preventDefault();
    const title = e.target.title.value;
    const message = e.target.message.value;
    GSIStore.addAnnouncement({
      id: Math.random().toString(36).substr(2, 9),
      title,
      message,
      date: new Date().toISOString(),
      author: "Administration"
    });
    toast.success("Annonce diffusée !");
    e.target.reset();
    setActiveTab("dashboard");
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

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto bg-gray-50 pb-20">
      {/* Sync Status Banner */}
      <div className={cn(
        "px-6 py-2 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest transition-all",
        syncStatus === 'ready' ? "bg-emerald-500 text-white" :
        syncStatus === 'offline' ? "bg-orange-500 text-white" : "bg-indigo-600 text-white animate-pulse"
      )}>
        <div className="flex items-center gap-2">
           {syncStatus === 'ready' ? <CheckCircle2 size={12} /> :
            syncStatus === 'offline' ? <WifiOff size={12} /> : <RefreshCcw size={12} className="animate-spin" />}
           <span>{syncStatus === 'ready' ? "GSI Cloud : Connecté" : syncStatus === 'offline' ? "Mode Hors-ligne" : "Synchronisation..."}</span>
        </div>
      </div>

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
          </div>
          <button
            onClick={async () => {
              await signOut(auth);
              GSIStore.setCurrentUser(null);
              toast.success("Déconnexion");
              router.push("/login");
            }}
            className="p-3 bg-gray-50 rounded-xl text-gray-400 hover:text-red-500 transition-colors active:scale-90"
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
            <div className="grid grid-cols-2 gap-4">
              <StatCard label="Étudiants" value={users.filter(u => u.role === 'student').length.toString()} change="+12%" color="text-blue-600" />
              <StatCard label="Recettes" value="45.2M Ar" change="+5%" color="text-emerald-600" />
            </div>

            <div>
              <h2 className="text-lg font-bold mb-4">{t("tous")}</h2>
              <div className="grid grid-cols-2 gap-4">
                {menuItems.filter(i => i.id !== 'dashboard').map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className="bg-white p-5 rounded-[32px] shadow-sm border border-gray-100 flex flex-col items-center text-center gap-3 hover:shadow-md transition-all active:scale-95"
                  >
                    <div className={`${item.color} w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg`}>
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
            <PageHeader title={t("gestion_paiements")} onBack={() => setActiveTab("dashboard")} />
            <div className="space-y-3">
              {payments.map((p, i) => (
                <div key={i} className="bg-white p-4 rounded-2xl border border-gray-100 flex justify-between items-center shadow-sm">
                  <div>
                    <h4 className="font-bold text-sm">{p.studentName}</h4>
                    <p className="text-[10px] text-gray-500">{p.filiere} • {p.niveau}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm text-indigo-600">{p.amount}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${p.status === 'paid' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>{p.status.toUpperCase()}</span>
                  </div>
                </div>
              ))}
              {payments.length === 0 && <p className="text-center text-gray-400 py-10 italic text-xs">Aucun paiement en cache.</p>}
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div className="space-y-4">
            <PageHeader title={t("gestion_utilisateurs")} onBack={() => setActiveTab("dashboard")} />
            <div className="space-y-3">
              {filteredUsers.map((u, i) => (
                <div key={i} className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center gap-4 shadow-sm">
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center overflow-hidden font-bold">
                    {u.fullName.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-sm">{u.fullName}</h4>
                    <p className="text-[10px] text-gray-500">{u.role.toUpperCase()} • {u.filiere}</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => { setSelectedUser(u); setShowConvocationModal(true); }} className="text-orange-500 p-2 hover:bg-orange-50 rounded-xl"><Mail size={16} /></button>
                    <button onClick={() => handleDeleteUser(u.id)} className="text-red-500 p-2 hover:bg-red-50 rounded-xl"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "communication" && (
          <div className="space-y-6">
            <PageHeader title={t("communication")} onBack={() => setActiveTab("dashboard")} />
            <form onSubmit={handleSendAnnouncement} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm space-y-4">
                <input name="title" required className="w-full bg-gray-50 rounded-xl p-3 outline-none" placeholder="Titre" />
                <textarea name="message" required className="w-full bg-gray-50 rounded-xl p-3 outline-none min-h-[100px]" placeholder="Message"></textarea>
                <button type="submit" className="w-full bg-orange-500 text-white py-4 rounded-xl font-bold">Diffuser</button>
            </form>
          </div>
        )}

        {activeTab === "academic" && (
          <div className="space-y-4">
            <PageHeader title="Gestion Académique" onBack={() => setActiveTab("dashboard")} />
            <div className="grid grid-cols-1 gap-4">
               <div className="bg-white p-5 rounded-3xl border border-gray-100">
                  <h3 className="font-bold mb-4 flex items-center gap-2"><BookOpen size={18} className="text-emerald-500" /> Leçons ({lessons.length})</h3>
                  <div className="space-y-2">
                    {lessons.slice(0, 5).map((l, i) => (
                      <div key={i} className="text-xs p-2 bg-gray-50 rounded-lg flex justify-between">{l.title} <span>{l.niveau}</span></div>
                    ))}
                  </div>
               </div>
               <div className="bg-white p-5 rounded-3xl border border-gray-100">
                  <h3 className="font-bold mb-4 flex items-center gap-2"><FileText size={18} className="text-orange-500" /> Devoirs ({assignments.length})</h3>
                  <div className="space-y-2">
                    {assignments.slice(0, 5).map((a, i) => (
                      <div key={i} className="text-xs p-2 bg-gray-50 rounded-lg flex justify-between">{a.title} <span>{a.deadline}</span></div>
                    ))}
                  </div>
               </div>
            </div>
          </div>
        )}

        {activeTab === "stats" && (
           <div className="space-y-4">
            <PageHeader title="Stats & Rapports" onBack={() => setActiveTab("dashboard")} />
            <div className="bg-indigo-600 p-8 rounded-[40px] text-white shadow-xl relative overflow-hidden">
               <TrendingUp className="absolute right-[-10px] top-[-10px] w-32 h-32 opacity-10" />
               <p className="text-xs font-bold uppercase opacity-60 mb-1">Croissance Annuelle</p>
               <h2 className="text-3xl font-black mb-4">+24.5%</h2>
               <div className="flex gap-2">
                  <button onClick={() => toast.success("Export PDF lancé pour tous les campus")} className="px-4 py-2 bg-white/20 rounded-xl text-[10px] font-bold active:scale-95 transition-all">PDF REPORT</button>
                  <button onClick={() => toast.success("Export Excel lancé (Global GSI)")} className="px-4 py-2 bg-white/20 rounded-xl text-[10px] font-bold active:scale-95 transition-all">EXCEL DATA</button>
               </div>
            </div>

            <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
               <h3 className="font-bold text-sm mb-4">Rapports Financiers par Campus</h3>
               <div className="space-y-2">
                  {CAMPUSES.map(c => (
                    <div key={c} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                       <span className="text-xs font-bold">{c}</span>
                       <button onClick={() => toast.success(`Rapport financier ${c} généré.`)} className="text-[10px] font-black text-indigo-600 uppercase">Générer</button>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        )}
      </div>

      {/* Convocation Modal */}
      {showConvocationModal && selectedUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-sm rounded-[32px] p-8 shadow-2xl relative">
            <button onClick={() => setShowConvocationModal(false)} className="absolute right-6 top-6 text-gray-400"><X size={20} /></button>
            <h2 className="text-xl font-black mb-2">{t("convocation")}</h2>
            <p className="text-xs text-gray-500 mb-6 font-medium">Convoquer <span className="text-indigo-600 font-bold">{selectedUser.fullName}</span>.</p>
            <form onSubmit={async (e: any) => {
              e.preventDefault();
              GSIStore.addAnnouncement({
                id: Math.random().toString(36).substr(2, 9),
                title: `CONVOCATION OFFICIELLE`,
                message: `Vous êtes convoqué(e) le ${e.target.date.value} pour : ${e.target.motive.value}.`,
                date: new Date().toISOString(),
                author: "Direction GSI",
                type: 'convocation',
                targetUserId: selectedUser.id
              });
              toast.success("Convocation envoyée");
              setShowConvocationModal(false);
            }} className="space-y-4">
              <textarea name="motive" required className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold outline-none min-h-[100px]" placeholder="Motif..."></textarea>
              <input name="date" required type="datetime-local" className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold outline-none" />
              <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest active:scale-95">Envoyer</button>
            </form>
          </div>
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => router.push("/register")}
        className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-xl flex items-center justify-center active:scale-90 transition-all z-50"
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
      <p className="text-[10px] font-bold text-emerald-500 mt-1">{change}</p>
    </div>
  );
});
