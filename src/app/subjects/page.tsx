"use client";

import { AppLayout } from "@/components/app-layout";
import { useLanguage } from "@/lib/i18n";
import { Search, BookOpen, FileText, Video, Award, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/page-header";
import { useState, useEffect, memo } from "react";
import { GSIStore, Lesson, Assignment } from "@/lib/store";

export default function SubjectsPage() {
  const { t } = useLanguage();
  const [subjects, setSubjects] = useState<any[]>([]);

  useEffect(() => {
    const user = GSIStore.getCurrentUser();

    const cached = GSIStore.getCache<any[]>("subjects_list");
    if (cached) setSubjects(cached);

    const unsub = GSIStore.subscribeLessons({ niveau: user?.niveau }, (lessons) => {
      const studentLessons = lessons.filter(l =>
        !user || (l.filiere.includes(user.filiere) || l.filiere.length === 0)
      );

      const subjectNames = Array.from(new Set(studentLessons.map(l => l.subject)));
      const mappedSubjects = subjectNames.map((name, i) => {
        const count = studentLessons.filter(l => l.subject === name).length;
        const colors = ["bg-pink-500", "bg-indigo-500", "bg-orange-400", "bg-blue-500", "bg-cyan-500"];
        const icons = ["📐", "⚛️", "🧪", "💻", "🌍", "📖", "📊"];
        return {
          id: i,
          title: name,
          progress: Math.floor(Math.random() * 40) + 60,
          icon: icons[i % icons.length],
          color: colors[i % colors.length],
          items: count
        };
      });
      setSubjects(mappedSubjects);
      GSIStore.setCache("subjects_list", mappedSubjects);
    });

    return () => unsub();
  }, []);

  return (
    <AppLayout>
      <div className="p-6">
        <PageHeader title={t("matieres")} />

        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Rechercher une matière..."
            className="w-full bg-gray-100 rounded-2xl py-3 pl-12 pr-4 outline-none text-sm focus:ring-2 ring-primary/20 transition-all"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 mb-8">
          {subjects.map((s) => (
            <SubjectCard key={s.id} {...s} />
          ))}
        </div>

        {/* Categories / Types */}
        <h3 className="text-lg font-bold mb-4">Ressources par type</h3>
        <div className="grid grid-cols-2 gap-4">
          <ResourceCategory icon={BookOpen} label="Syllabus" color="text-blue-500" bg="bg-blue-50" />
          <ResourceCategory icon={FileText} label="Supports" color="text-green-500" bg="bg-green-50" />
          <ResourceCategory icon={Video} label="Vidéos" color="text-red-500" bg="bg-red-50" />
          <ResourceCategory icon={Award} label="Devoirs" color="text-purple-500" bg="bg-purple-50" />
        </div>
      </div>
    </AppLayout>
  );
}

const SubjectCard = memo(({ title, progress, icon, color, items }: any) => {
  return (
    <div className="bg-white p-4 rounded-[28px] shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-all cursor-pointer">
      <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-2xl text-white shadow-inner", color)}>
        {icon}
      </div>
      <div className="flex-1">
        <h4 className="font-bold text-gray-800 text-sm mb-1">{title}</h4>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className={cn("h-full rounded-full transition-all duration-1000", color)} style={{ width: `${progress}%` }}></div>
          </div>
          <span className="text-[10px] font-bold text-gray-400">{progress}%</span>
        </div>
        <p className="text-[10px] text-gray-500 mt-1 font-medium">{items} documents disponibles</p>
      </div>
      <ChevronRight size={20} className="text-gray-300" />
    </div>
  );
});

const ResourceCategory = memo(({ icon: Icon, label, color, bg }: any) => {
  return (
    <div className={cn("p-6 rounded-[32px] flex flex-col items-center gap-2 cursor-pointer transition-transform hover:scale-105", bg)}>
      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center bg-white shadow-sm mb-1", color)}>
        <Icon size={24} />
      </div>
      <span className="text-xs font-bold text-gray-700">{label}</span>
    </div>
  );
});
