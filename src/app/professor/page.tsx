"use client";

import { useState } from "react";
import {
  GraduationCap,
  Calendar,
  BookOpen,
  FileText,
  BarChart3,
  Users,
  Search,
  LogOut,
  ChevronRight,
  Plus,
  Upload
} from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { useRouter } from "next/navigation";

export default function ProfessorPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("dashboard");

  const menuItems = [
    { id: "schedule", icon: Calendar, label: t("modifier_edt"), color: "bg-blue-500" },
    { id: "lessons", icon: BookOpen, label: t("publier_lecon"), color: "bg-emerald-500" },
    { id: "assignments", icon: FileText, label: t("publier_devoir"), color: "bg-orange-500" },
    { id: "grades", icon: BarChart3, label: t("gestion_notes"), color: "bg-pink-500" },
    { id: "students", icon: Users, label: t("suivi_etudiants"), color: "bg-indigo-500" },
    { id: "reports", icon: FileText, label: t("stats_rapports"), color: "bg-purple-500" },
  ];

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white p-6 rounded-b-[40px] shadow-sm mb-6 border-b border-violet-100">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-violet-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <GraduationCap size={28} />
            </div>
            <div>
              <h1 className="text-xl font-bold">Prof Portal</h1>
              <p className="text-xs text-gray-500 font-medium italic">GSI Internationale — Expert</p>
            </div>
          </div>
          <button
            onClick={() => router.push("/login")}
            className="p-3 bg-gray-100 rounded-xl text-gray-400 hover:text-red-500 transition-colors"
          >
            <LogOut size={20} />
          </button>
        </div>

        <div className="bg-violet-50 p-4 rounded-3xl flex items-center gap-4 mb-4">
           <div className="flex-1">
              <h3 className="text-violet-900 font-bold text-sm">Bienvenue, Professeur</h3>
              <p className="text-violet-600 text-[10px] font-medium">Vous avez 2 devoirs à corriger aujourd'hui.</p>
           </div>
           <button className="bg-violet-600 text-white p-2 rounded-xl shadow-md">
              <Plus size={16} />
           </button>
        </div>
      </div>

      <div className="px-6 space-y-8 flex-1">
        {activeTab === "dashboard" && (
          <>
            {/* Menu Grid */}
            <div>
              <h2 className="text-lg font-bold mb-4">Outils Pédagogiques</h2>
              <div className="grid grid-cols-2 gap-4">
                {menuItems.map((item) => (
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

            {/* Action Quick Access */}
            <div>
              <h2 className="text-lg font-bold mb-4">Dernières Publications</h2>
              <div className="space-y-3">
                <div className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center gap-4">
                  <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                      <Upload size={18} />
                  </div>
                  <div className="flex-1">
                      <h4 className="text-sm font-bold">Leçon: Algorithmique</h4>
                      <p className="text-[10px] text-gray-400">Publié pour L1 Informatique • Hier</p>
                  </div>
                  <ChevronRight size={16} className="text-gray-300" />
                </div>
                <div className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center gap-4">
                  <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center">
                      <FileText size={18} />
                  </div>
                  <div className="flex-1">
                      <h4 className="text-sm font-bold">Devoir: Marketing Digital</h4>
                      <p className="text-[10px] text-gray-400">Deadline: 12 Fév 2025 • En cours</p>
                  </div>
                  <ChevronRight size={16} className="text-gray-300" />
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab !== "dashboard" && (
          <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm min-h-[400px] flex flex-col items-center justify-center text-center relative">
             <button
              onClick={() => setActiveTab("dashboard")}
              className="absolute left-6 top-6 bg-gray-100 p-2 rounded-full text-gray-400"
             >
                <ChevronRight className="rotate-180" size={20} />
             </button>
             <div className={`w-20 h-20 rounded-[30%] flex items-center justify-center text-white mb-6 shadow-xl ${menuItems.find(i => i.id === activeTab)?.color}`}>
                {(() => {
                  const Icon = menuItems.find(i => i.id === activeTab)?.icon || GraduationCap;
                  return <Icon size={40} />;
                })()}
             </div>
             <h2 className="text-2xl font-black mb-2">{menuItems.find(i => i.id === activeTab)?.label}</h2>
             <p className="text-gray-500 max-w-[200px]">Cette section est en cours de déploiement pour votre campus.</p>
             <button
              onClick={() => setActiveTab("dashboard")}
              className="mt-8 bg-gray-100 text-gray-600 px-6 py-3 rounded-2xl font-bold"
             >
                Retour aux outils
             </button>
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <button className="fixed bottom-6 right-6 w-14 h-14 bg-violet-600 text-white rounded-full shadow-xl shadow-violet-600/40 flex items-center justify-center hover:scale-110 active:scale-90 transition-all z-50">
        <Plus size={28} />
      </button>
    </div>
  );
}
