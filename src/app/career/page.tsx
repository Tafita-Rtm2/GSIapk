"use client";

import { AppLayout } from "@/components/app-layout";
import { Award, Briefcase, TrendingUp, ChevronRight, Star } from "lucide-react";

export default function CareerPage() {
  const opportunities = [
    {
      title: "Stagiaire Développeur Web",
      company: "GSI Internationale",
      type: "Stage",
      duration: "3 mois",
      location: "Abidjan / Hybride",
      match: 95
    },
    {
      title: "Assistant Support IT",
      company: "Orange CI (Partenaire)",
      type: "Stage",
      duration: "6 mois",
      location: "Abidjan",
      match: 88
    },
    {
      title: "Analyste de Données Junior",
      company: "MTN (Partenaire)",
      type: "Alternance",
      duration: "12 mois",
      location: "Plateau",
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
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-primary/10 p-3 rounded-2xl text-primary">
            <TrendingUp size={24} />
          </div>
          <h1 className="text-3xl font-bold">Career Insight</h1>
        </div>

        <section className="mb-8">
          <h2 className="text-lg font-bold mb-4 flex justify-between items-center">
            <span>Opportunités pour vous</span>
            <span className="text-xs text-primary font-medium">Voir tout</span>
          </h2>
          <div className="space-y-4">
            {opportunities.map((op, i) => (
              <div key={i} className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-start mb-2">
                  <div className="bg-gray-100 px-3 py-1 rounded-full text-[10px] font-bold text-gray-500">
                    {op.type} • {op.duration}
                  </div>
                  <div className="text-emerald-500 text-xs font-bold flex items-center gap-1">
                    <Star size={12} className="fill-emerald-500" />
                    {op.match}% Match
                  </div>
                </div>
                <h3 className="font-bold text-lg mb-1">{op.title}</h3>
                <p className="text-sm text-gray-500 mb-4">{op.company} • {op.location}</p>
                <button className="w-full bg-gray-50 hover:bg-primary hover:text-white py-3 rounded-2xl text-sm font-bold transition-all text-primary">
                  Postuler maintenant
                </button>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-4">Vos compétences développées</h2>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-6">
            {skills.map((skill, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{skill.name}</span>
                  <span className="text-gray-500">{skill.level}%</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div
                    className={`${skill.color} h-full rounded-full`}
                    style={{ width: `${skill.level}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 bg-gradient-to-br from-indigo-600 to-purple-700 p-6 rounded-3xl text-white">
            <div className="flex items-center gap-3 mb-4">
              <Award size={32} />
              <h3 className="font-bold">Prochaine étape</h3>
            </div>
            <p className="text-sm opacity-90 mb-4">Complétez votre cours de "Base de données" pour débloquer 5 nouvelles opportunités de stage !</p>
            <button className="w-full bg-white text-indigo-700 py-3 rounded-2xl text-sm font-bold">
              Continuer l'apprentissage
            </button>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
