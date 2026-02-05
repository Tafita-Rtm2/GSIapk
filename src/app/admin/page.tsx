"use client";

import { useState } from "react";
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
  Plus
} from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("dashboard");

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
            onClick={() => router.push("/login")}
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
            className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 ring-indigo-500/20"
          />
        </div>
      </div>

      <div className="px-6 space-y-8 flex-1">
        {activeTab === "dashboard" && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <StatCard label="Étudiants" value="1,284" change="+12%" color="text-blue-600" />
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

            {/* Recent Activity */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">Activités Récentes</h2>
                <button className="text-indigo-600 text-xs font-bold">Voir tout</button>
              </div>
              <div className="space-y-3 pb-8">
                <ActivityItem
                  title="Paiement reçu"
                  desc="Rakoto Jean - L1 Informatique"
                  time="2 min ago"
                  icon={CreditCard}
                  color="bg-emerald-100 text-emerald-600"
                />
                <ActivityItem
                  title="Nouvel étudiant"
                  desc="Andria Marie - M1 Gestion"
                  time="15 min ago"
                  icon={Users}
                  color="bg-blue-100 text-blue-600"
                />
                <ActivityItem
                  title="Convocation envoyée"
                  desc="Rabe Eric - L2 Droit"
                  time="1h ago"
                  icon={Megaphone}
                  color="bg-orange-100 text-orange-600"
                />
              </div>
            </div>
          </>
        )}

        {activeTab === "payments" && (
          <div className="space-y-4">
            <button onClick={() => setActiveTab("dashboard")} className="flex items-center gap-2 text-gray-500 font-bold mb-2">
              <ChevronRight className="rotate-180" size={20} /> Retour
            </button>
            <h2 className="text-2xl font-black mb-4">{t("gestion_paiements")}</h2>
            <div className="space-y-3">
              {[
                { name: "Rakoto Jean", level: "L1 Info", amount: "800.000 Ar", status: "Paid", date: "10/02/2025" },
                { name: "Andria Marie", level: "M1 Gest", amount: "1.200.000 Ar", status: "Pending", date: "05/02/2025" },
                { name: "Rabe Eric", level: "L2 Droit", amount: "500.000 Ar", status: "Overdue", date: "25/01/2025" },
              ].map((p, i) => (
                <div key={i} className="bg-white p-4 rounded-2xl border border-gray-100 flex justify-between items-center">
                  <div>
                    <h4 className="font-bold">{p.name}</h4>
                    <p className="text-xs text-gray-500">{p.level} • {p.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm">{p.amount}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      p.status === 'Paid' ? 'bg-emerald-100 text-emerald-600' :
                      p.status === 'Pending' ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'
                    }`}>{p.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div className="space-y-4">
             <button onClick={() => setActiveTab("dashboard")} className="flex items-center gap-2 text-gray-500 font-bold mb-2">
              <ChevronRight className="rotate-180" size={20} /> Retour
            </button>
            <h2 className="text-2xl font-black mb-4">{t("gestion_utilisateurs")}</h2>
            <div className="space-y-3">
              {[
                { name: "Liana Rakoto", role: "Étudiant", campus: "Antananarivo" },
                { name: "Dr. Solofo", role: "Professeur", campus: "Antsirabe" },
                { name: "Nina GSI", role: "Admin", campus: "Antananarivo" },
              ].map((u, i) => (
                <div key={i} className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                    <Users size={20} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-sm">{u.name}</h4>
                    <p className="text-[10px] text-gray-500">{u.role} • {u.campus}</p>
                  </div>
                  <button className="text-red-500 p-2 hover:bg-red-50 rounded-xl">
                    <Plus className="rotate-45" size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "communication" && (
          <div className="space-y-6">
            <button onClick={() => setActiveTab("dashboard")} className="flex items-center gap-2 text-gray-500 font-bold mb-2">
              <ChevronRight className="rotate-180" size={20} /> Retour
            </button>
            <h2 className="text-2xl font-black">{t("communication")}</h2>
            <div className="bg-white p-6 rounded-[32px] border border-gray-100 space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2">Titre de l'annonce</label>
                <input type="text" className="w-full bg-gray-50 border-none rounded-xl p-3 outline-none" placeholder="Ex: Report des examens" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Message</label>
                <textarea className="w-full bg-gray-50 border-none rounded-xl p-3 outline-none min-h-[100px]" placeholder="Saisissez votre message ici..."></textarea>
              </div>
              <button
                onClick={() => alert("Annonce diffusée avec succès !")}
                className="w-full bg-orange-500 text-white py-4 rounded-xl font-bold shadow-lg shadow-orange-500/20 active:scale-95 transition-transform"
              >
                Diffuser l'annonce
              </button>
            </div>
          </div>
        )}

        {(!["dashboard", "payments", "users", "communication"].includes(activeTab)) && (
          <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm min-h-[400px] flex flex-col items-center justify-center text-center relative">
             <button
              onClick={() => setActiveTab("dashboard")}
              className="absolute left-6 top-6 bg-gray-100 p-2 rounded-full text-gray-400"
             >
                <ChevronRight className="rotate-180" size={20} />
             </button>
             <div className={`w-20 h-20 rounded-[30%] flex items-center justify-center text-white mb-6 shadow-xl ${menuItems.find(i => i.id === activeTab)?.color}`}>
                {(() => {
                  const Icon = menuItems.find(i => i.id === activeTab)?.icon || ShieldCheck;
                  return <Icon size={40} />;
                })()}
             </div>
             <h2 className="text-2xl font-black mb-2">{menuItems.find(i => i.id === activeTab)?.label}</h2>
             <p className="text-gray-500 max-w-[200px]">Cette section est en cours de synchronisation avec la base de données GSI.</p>
             <button
              onClick={() => setActiveTab("dashboard")}
              className="mt-8 bg-gray-100 text-gray-600 px-6 py-3 rounded-2xl font-bold"
             >
                Retour au dashboard
             </button>
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <button className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-xl shadow-indigo-600/40 flex items-center justify-center hover:scale-110 active:scale-90 transition-all z-50">
        <Plus size={28} />
      </button>
    </div>
  );
}

function StatCard({ label, value, change, color }: { label: string, value: string, change: string, color: string }) {
  return (
    <div className="bg-white p-5 rounded-[32px] shadow-sm border border-gray-100">
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-xl font-black ${color}`}>{value}</p>
      <p className="text-[10px] font-bold text-emerald-500 mt-1">{change} <span className="text-gray-400">vs last month</span></p>
    </div>
  );
}

function ActivityItem({ title, desc, time, icon: Icon, color }: { title: string, desc: string, time: string, icon: any, color: string }) {
  return (
    <div className="bg-white p-4 rounded-2xl flex items-center gap-4 border border-gray-100 shadow-sm">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={18} />
      </div>
      <div className="flex-1">
        <h4 className="text-sm font-bold text-gray-800">{title}</h4>
        <p className="text-xs text-gray-500 truncate">{desc}</p>
      </div>
      <div className="text-right">
        <p className="text-[10px] font-bold text-gray-400">{time}</p>
        <ChevronRight size={14} className="text-gray-300 ml-auto mt-1" />
      </div>
    </div>
  );
}
