"use client";

import { AppLayout } from "@/components/app-layout";
import { useLanguage } from "@/lib/i18n";
import { BarChart3, TrendingUp, Award, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

export default function PerformancePage() {
  const { t } = useLanguage();

  const grades = [
    { subject: "Mathématiques", grade: 14.5, average: 12.0, trend: "up" },
    { subject: "Physique", grade: 16.0, average: 11.5, trend: "up" },
    { subject: "Informatique", grade: 18.0, average: 14.0, trend: "up" },
    { subject: "Gestion", grade: 12.5, average: 13.0, trend: "down" },
    { subject: "Anglais", grade: 15.0, average: 13.5, trend: "up" },
  ];

  return (
    <AppLayout>
      <div className="p-6 pb-24">
        <h1 className="text-2xl font-bold mb-6">Ma Performance</h1>

        {/* Global Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
           <div className="bg-primary p-5 rounded-[32px] text-white shadow-lg shadow-primary/20">
              <p className="text-[10px] font-bold opacity-80 uppercase tracking-wider mb-1">Moyenne Générale</p>
              <h2 className="text-3xl font-black">15.2</h2>
              <div className="flex items-center gap-1 mt-2">
                 <TrendingUp size={14} />
                 <span className="text-[10px] font-bold">+1.2 ce semestre</span>
              </div>
           </div>
           <div className="bg-accent p-5 rounded-[32px] text-white shadow-lg shadow-accent/20">
              <p className="text-[10px] font-bold opacity-80 uppercase tracking-wider mb-1">Rang Global</p>
              <h2 className="text-3xl font-black">4ème</h2>
              <div className="flex items-center gap-1 mt-2">
                 <Award size={14} />
                 <span className="text-[10px] font-bold">Top 5%</span>
              </div>
           </div>
        </div>

        {/* Subjects Breakdown */}
        <h3 className="text-lg font-bold mb-4">Notes par Matière</h3>
        <div className="space-y-4">
           {grades.map((g, i) => (
             <div key={i} className="bg-white p-5 rounded-[32px] border border-gray-100 shadow-sm flex items-center gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center",
                  g.trend === 'up' ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                )}>
                   {g.trend === 'up' ? <TrendingUp size={24} /> : <TrendingUp className="rotate-180" size={24} />}
                </div>
                <div className="flex-1">
                   <h4 className="font-bold text-sm text-gray-800">{g.subject}</h4>
                   <p className="text-[10px] text-gray-400 font-medium">Moyenne classe: {g.average}</p>
                </div>
                <div className="text-right">
                   <p className="text-xl font-black text-gray-800">{g.grade}</p>
                   <p className="text-[10px] font-bold text-gray-400">/ 20</p>
                </div>
             </div>
           ))}
        </div>

        {/* Recommendation Box */}
        <div className="mt-8 bg-indigo-50 p-6 rounded-[32px] border border-indigo-100">
           <div className="flex items-center gap-2 mb-2 text-indigo-700">
              <BookOpen size={20} />
              <h4 className="font-bold">Insight Recommendation</h4>
           </div>
           <p className="text-xs text-indigo-600 leading-relaxed">
             Votre note en <b>Gestion</b> est en légère baisse. Nous vous suggérons de consulter le chapitre "Comptabilité Analytique" dans la bibliothèque.
           </p>
        </div>
      </div>
    </AppLayout>
  );
}
