"use client";

import { AppLayout } from "@/components/app-layout";
import { Bell, Search } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n";

export default function Home() {
  const { t } = useLanguage();

  return (
    <AppLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-gray-500 text-sm">{t("bonjour")} Liana</p>
            <h1 className="text-2xl font-bold">Vous avez <span className="text-green-500">4 {t("tasks_today")}</span></h1>
          </div>
          <Link href="/profile" className="relative">
            <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border-2 border-primary/20">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Liana" alt="Avatar" />
            </div>
            <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 border-2 border-white rounded-full animate-pulse"></div>
          </Link>
        </div>

        {/* Progression Section (New) */}
        <div className="mb-8">
           <h2 className="text-lg font-semibold mb-4">{t("votre_progression")}</h2>
           <div className="space-y-4 bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-medium">
                  <span>Mathématiques</span>
                  <span>75%</span>
                </div>
                <Progress value={75} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-medium">
                  <span>Physique</span>
                  <span>60%</span>
                </div>
                <Progress value={60} className="h-2" />
              </div>
           </div>
        </div>

        {/* Courses Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">{t("cours_en_cours")}</h2>
            <button className="text-primary text-xs font-medium italic">GSI Insight — “Where data meets your future.”</button>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            <CourseCard
              title="Mathématiques"
              icon="📐"
              color="bg-pink-500"
            />
            <CourseCard
              title="Chimie"
              icon="🧪"
              color="bg-orange-400"
            />
            <CourseCard
              title="Physique"
              icon="⚛️"
              color="bg-blue-500"
            />
          </div>
        </div>

        {/* Schedule Section */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">{t("votre_emploi_du_temps")}</h2>
          </div>

          <div className="space-y-4">
            <ScheduleItem
              time="09:30 - 10:20"
              title="Physique"
              subtitle="Chapitre 3: Force"
              instructor="Alex Jesus"
              location="Google Meet"
              color="bg-indigo-500"
            />
             <ScheduleItem
              time="11:00 - 11:50"
              title="Géographie"
              subtitle="Chapitre 12: Profil du sol"
              instructor="Jenifer Clark"
              location="Zoom"
              color="bg-cyan-500"
            />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function CourseCard({ title, icon, color }: { title: string, icon: string, color: string }) {
  return (
    <div className={`${color} min-w-[140px] p-4 rounded-3xl text-white shadow-lg`}>
      <div className="bg-white/20 w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-4">
        {icon}
      </div>
      <h3 className="font-semibold">{title}</h3>
    </div>
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
