"use client";

import { AppLayout } from "@/components/app-layout";
import { Award, TrendingUp, BookOpen, ChevronRight, AlertCircle, FileText } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { GSIStore, User, Grade } from "@/lib/store";
import { PageHeader } from "@/components/page-header";

export default function PerformancePage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [grades, setGrades] = useState<Grade[]>([]);

  useEffect(() => {
    const init = async () => {
      const currentUser = GSIStore.getCurrentUser();
      if (!currentUser) {
        router.push("/login");
        return;
      }
      setUser(currentUser);
      const allGrades = await GSIStore.getGrades();
      setGrades(allGrades.filter(g => g.studentId === currentUser.id));
    };
    init();
  }, [router]);

  if (!user) return null;

  const average = grades.length > 0
    ? (grades.reduce((acc, g) => acc + g.score, 0) / grades.length).toFixed(2)
    : "N/A";

  return (
    <AppLayout>
      <div className="p-6 pb-24">
        <PageHeader
          title="Ma Performance"
          rightElement={
            <div className="bg-primary/10 p-2 rounded-xl text-primary">
              <Award size={24} />
            </div>
          }
        />

        {/* Global Score Card */}
        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-6 rounded-[32px] text-white shadow-xl shadow-indigo-200 mb-8 relative overflow-hidden">
           <div className="absolute right-[-20px] top-[-20px] w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
           <p className="text-white/70 text-sm font-bold uppercase tracking-widest mb-2">Moyenne Générale</p>
           <div className="flex items-end gap-3 mb-6">
              <span className="text-5xl font-black">{average}</span>
              <span className="text-xl font-bold opacity-60 mb-1">/ 20</span>
           </div>

           <div className="flex items-center gap-2 bg-white/20 p-3 rounded-2xl w-fit">
              <TrendingUp size={16} />
              <span className="text-xs font-bold">+1.2 pts vs semestre précédent</span>
           </div>
        </div>

        {/* Charts Section Mockup */}
        <div className="mb-8">
           <h2 className="text-lg font-bold mb-4">Évolution des notes</h2>
           <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 h-40 flex items-end justify-between gap-2 px-8">
              {[40, 70, 55, 90, 65, 85].map((h, i) => (
                 <div key={i} className="w-4 bg-primary/20 rounded-full relative group">
                    <div className="absolute bottom-0 w-full bg-primary rounded-full transition-all group-hover:bg-accent" style={{ height: `${h}%` }}></div>
                 </div>
              ))}
           </div>
        </div>

        {/* Grades List */}
        <div className="mb-8">
           <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Détails par matière</h2>
              <button className="text-primary text-xs font-bold">Trier par date</button>
           </div>

           <div className="space-y-3">
              {grades.map((g, i) => (
                 <div key={i} className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center gap-4 shadow-sm active:scale-[0.98] transition-all">
                    <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                       <FileText size={20} />
                    </div>
                    <div className="flex-1">
                       <h4 className="font-bold text-sm">{g.subject}</h4>
                       <p className="text-[10px] text-gray-400">{g.date}</p>
                    </div>
                    <div className="text-right">
                       <p className="text-sm font-black text-gray-800">{g.score} <span className="text-[10px] text-gray-400">/ {g.maxScore}</span></p>
                       <span className="text-[10px] font-bold text-emerald-500">Validé</span>
                    </div>
                 </div>
              ))}
              {grades.length === 0 && (
                <div className="bg-gray-50 p-10 rounded-[32px] text-center border-2 border-dashed border-gray-200">
                   <AlertCircle size={32} className="text-gray-300 mx-auto mb-3" />
                   <p className="text-sm text-gray-400 font-medium">Aucune note n'a encore été publiée.</p>
                </div>
              )}
           </div>
        </div>

        {/* Alerts Section */}
        <div className="bg-orange-50 p-6 rounded-[32px] border border-orange-100 flex items-start gap-4">
           <div className="bg-orange-100 p-2 rounded-xl text-orange-600">
              <AlertCircle size={20} />
           </div>
           <div>
              <h4 className="text-orange-900 font-bold text-sm">Conseil GSI Insight</h4>
              <p className="text-orange-700 text-xs mt-1 leading-relaxed">
                 Votre performance en <b>{user.filiere}</b> est excellente ! Pensez à consulter les supports complémentaires en bibliothèque pour maintenir ce niveau.
              </p>
           </div>
        </div>
      </div>
    </AppLayout>
  );
}
