"use client";

import { AppLayout } from "@/components/app-layout";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n";
import { useState, useEffect } from "react";

export default function Home() {
  const { t } = useLanguage();
  const [nextCourse, setNextCourse] = useState<any>(null);
  const [userName, setUserName] = useState("Liana");

  useEffect(() => {
    const profile = localStorage.getItem("user_profile");
    if (profile) {
        setUserName(JSON.parse(profile).name || "Liana");
    }

    const saved = localStorage.getItem("custom_schedule");
    if (saved) {
      const items = JSON.parse(saved);
      if (items.length > 0) {
        // Simple logic to find the next course based on time
        setNextCourse(items[0]);
      }
    }
  }, []);

  return (
    <AppLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-gray-500 text-sm">{t("bonjour")} {userName}</p>
            <h1 className="text-2xl font-bold">“Votre journée en un coup d’œil”</h1>
          </div>
          <Link href="/profile" className="relative">
            <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border-2 border-primary/20">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Liana" alt="Avatar" />
            </div>
            <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 border-2 border-white rounded-full animate-pulse"></div>
          </Link>
        </div>

        {/* Alertes Section */}
        <div className="mb-8">
           <h2 className="text-lg font-semibold mb-4">Alertes : devoirs, annonces</h2>
           <div className="grid grid-cols-2 gap-4">
              <div className="bg-red-50 p-4 rounded-2xl border border-red-100">
                <p className="text-red-600 font-bold text-lg">2</p>
                <p className="text-xs text-red-500 font-medium italic">Devoirs à rendre</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                <p className="text-blue-600 font-bold text-lg">3</p>
                <p className="text-xs text-blue-500 font-medium italic">Nouvelles annonces</p>
              </div>
           </div>
        </div>

        {/* Prochain cours Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Prochain cours</h2>
            <button className="text-primary text-xs font-medium italic">GSI Insight — SUCCESS</button>
          </div>
          <div className="space-y-4">
            {nextCourse ? (
               <ScheduleItem
                time={nextCourse.time}
                title={nextCourse.title}
                subtitle={`${nextCourse.date} • Personnel`}
                instructor="Moi"
                location="Rappel"
                color="bg-accent"
              />
            ) : (
              <ScheduleItem
                time="08:30 - 11:45"
                title="Intelligence Artificielle"
                subtitle="Salle B10 • Dr. Razafy"
                instructor="Dr. Razafy"
                location="Salle B10"
                color="bg-indigo-600"
              />
            )}
          </div>
        </div>

        {/* Progression Section */}
        <div className="mb-8">
           <h2 className="text-lg font-semibold mb-4">Progression par matière</h2>
           <div className="space-y-4 bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
              <div className="space-y-3">
                <div className="flex justify-between text-xs font-medium">
                  <span>Informatique de gestion</span>
                  <span>85%</span>
                </div>
                <Progress value={85} className="h-2 bg-gray-100" />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-xs font-medium">
                  <span>Anglais Technique</span>
                  <span>45%</span>
                </div>
                <Progress value={45} className="h-2 bg-gray-100" />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-xs font-medium">
                  <span>Marketing Digital</span>
                  <span>70%</span>
                </div>
                <Progress value={70} className="h-2 bg-gray-100" />
              </div>
           </div>
        </div>

        {/* Mission Statement */}
        <div className="text-center p-6 bg-primary/5 rounded-3xl border border-dashed border-primary/20">
            <p className="text-primary font-medium italic text-sm">GSI Insight — “Where data meets your future.”</p>
        </div>
      </div>
    </AppLayout>
  );
}

function ScheduleItem({ time, title, subtitle, instructor, location, color }: { time: string, title: string, subtitle: string, instructor: string, location: string, color: string }) {
  return (
    <div className={`${color} p-5 rounded-3xl text-white shadow-md relative overflow-hidden`}>
      <div className="absolute right-[-20px] top-[-20px] w-24 h-24 bg-white/10 rounded-full"></div>
      <div className="flex justify-between items-start mb-2">
        <span className="text-sm opacity-90">{time}</span>
        <button className="opacity-80">•••</button>
      </div>
      <h3 className="text-xl font-bold mb-1">{title}</h3>
      <p className="text-sm opacity-80 mb-4">{subtitle}</p>

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-white/30 overflow-hidden">
             <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${instructor}`} alt={instructor} />
          </div>
          <span className="text-xs">{instructor}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-green-400"></div>
          <span className="text-xs">{location}</span>
        </div>
      </div>
    </div>
  );
}
