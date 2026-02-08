"use client";

import { AppLayout } from "@/components/app-layout";
import { Award, Briefcase, TrendingUp, ChevronRight, Star, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { GSIStore, User } from "@/lib/store";

export default function CareerPage() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setUser(GSIStore.getCurrentUser());
  }, []);

  const opportunities = [
    {
      title: "Stagiaire Développeur Web",
      company: "GSI Internationale",
      type: "Stage",
      duration: "3 mois",
      location: "Antananarivo / Hybride",
      match: 95
    },
    {
      title: "Assistant Support IT",
      company: "Telma (Partenaire GSI)",
      type: "Stage",
      duration: "6 mois",
      location: "Antananarivo",
      match: 88
    },
    {
      title: "Analyste de Données Junior",
      company: "Banky Foiben'i Madagasikara",
      type: "Alternance",
      duration: "12 mois",
      location: "Antananarivo",
      match: 75
    }
  ];

  const skills = [
    { name: "React / Next.js", level: 80, color: "bg-blue-500" },
    { name: "TypeScript", level: 65, color: "bg-indigo-500" },
    { name: "Gestion de projet", level: 40, color: "bg-emerald-500" },
    { name: "Analyse de données", level: 55, color: "bg-orange-500" }
  ];

  return (
    <AppLayout>
      <div className="p-6 pb-24">
        <div className="flex items-center gap-4 mb-8">
           <Link href="/" className="p-2 bg-gray-100 rounded-full text-gray-500">
              <ChevronLeft size={20} />
           </Link>
           <h1 className="text-2xl font-black text-gray-800">Career Insight</h1>
        </div>

        <section className="mb-10">
          <h2 className="text-lg font-bold text-gray-700 mb-6 flex justify-between items-center">
            <span>Opportunités GSI</span>
            <span className="text-xs text-primary font-black uppercase tracking-wider">Voir tout</span>
          </h2>
          <div className="space-y-4">
            {opportunities.map((op, i) => (
              <div key={i} className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 group hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-indigo-50 px-3 py-1.5 rounded-full text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                    {op.type} • {op.duration}
                  </div>
                  <div className="text-emerald-500 text-[10px] font-black flex items-center gap-1 uppercase tracking-widest">
                    <Star size={12} className="fill-emerald-500" />
                    {op.match}% Match
                  </div>
                </div>
                <h3 className="font-black text-lg mb-1 text-gray-800 leading-tight">{op.title}</h3>
                <p className="text-xs text-gray-500 mb-6 font-medium">{op.company} • {op.location}</p>
                <button
                  onClick={() => alert(`Votre profil GSI Insight a été envoyé à ${op.company}.`)}
                  className="w-full bg-indigo-50 text-indigo-600 py-4 rounded-2xl text-xs font-black shadow-sm active:scale-95 transition-transform uppercase tracking-widest group-hover:bg-indigo-600 group-hover:text-white group-hover:shadow-indigo-200"
                >
                  Postuler maintenant
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-lg font-bold text-gray-700 mb-6">Compétences développées</h2>
          <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 space-y-8">
            {skills.map((skill, i) => (
              <div key={i} className="space-y-3">
                <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                  <span className="text-gray-700">{skill.name}</span>
                  <span className="text-indigo-600">{skill.level}%</span>
                </div>
                <div className="w-full bg-gray-50 h-3 rounded-full overflow-hidden border border-gray-100">
                  <div
                    className={`${skill.color} h-full rounded-full shadow-lg shadow-${skill.color.split('-')[1]}-500/20`}
                    style={{ width: `${skill.level}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 p-8 rounded-[40px] text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
            <div className="absolute right-[-40px] bottom-[-40px] w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
                 <Award size={32} />
              </div>
              <h3 className="font-black text-xl leading-tight">Prochaine étape de carrière</h3>
            </div>
            <p className="text-sm opacity-90 mb-8 font-medium leading-relaxed">Complétez votre cursus en <b>{user?.filiere || 'votre spécialité'}</b> pour débloquer 5 nouvelles opportunités exclusives chez nos partenaires !</p>
            <button className="w-full bg-white text-indigo-700 py-4 rounded-2xl text-xs font-black shadow-lg shadow-black/5 active:scale-95 transition-transform uppercase tracking-widest">
              Continuer l'apprentissage
            </button>
        </div>
      </div>
    </AppLayout>
  );
}
