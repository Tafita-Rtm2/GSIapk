"use client";

import { AppLayout } from "@/components/app-layout";
import { useLanguage } from "@/lib/i18n";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Download, FileText } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { GSIStore } from "@/lib/store";

export default function SchedulePage() {
  const { t } = useLanguage();
  const [view, setView] = useState<"week" | "month">("week");
  const [selectedDay, setSelectedDay] = useState(2);
  const [latestSchedule, setLatestSchedule] = useState<any>(null);

  useEffect(() => {
    const init = async () => {
      const user = GSIStore.getCurrentUser();
      if (user) {
        const schedule = await GSIStore.getLatestSchedule(user.campus, user.niveau);
        setLatestSchedule(schedule);
      }
    };
    init();
  }, []);

  const days = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

  const scheduleData: any = {
    0: [
      { time: "08:00", duration: "120 min", title: "Mathématiques", room: "Salle 101", instructor: "Dr. Rakoto", color: "border-l-blue-500" },
      { time: "10:30", duration: "90 min", title: "Gestion", room: "Salle 204", instructor: "Mme. Perle", color: "border-l-emerald-500" }
    ],
    1: [
      { time: "09:00", duration: "180 min", title: "Informatique", room: "Labo 1", instructor: "M. Jean", color: "border-l-purple-500" }
    ],
    2: [
      { time: "08:00", duration: "90 min", title: "Algèbre Linéaire", room: "Salle 102", instructor: "Dr. Kamga", color: "border-l-pink-500" },
      { time: "10:00", duration: "120 min", title: "Physique Quantique", room: "Amphi B", instructor: "Pr. Tagne", color: "border-l-indigo-500", isCurrent: true },
      { time: "14:00", duration: "90 min", title: "Anglais Technique", room: "Labo Langues", instructor: "Mrs. Smith", color: "border-l-orange-400" }
    ],
    3: [
      { time: "08:30", duration: "90 min", title: "Marketing Digital", room: "Salle 302", instructor: "M. Solo", color: "border-l-amber-500" }
    ],
    4: [
      { time: "10:00", duration: "120 min", title: "Comptabilité", room: "Salle 105", instructor: "Mme. Rova", color: "border-l-teal-500" }
    ],
    5: [
      { time: "08:00", duration: "240 min", title: "Projet Fin d'Études", room: "Bibliothèque", instructor: "Equipe GSI", color: "border-l-rose-500" }
    ]
  };

  return (
    <AppLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">{t("planning")}</h1>
          <div className="bg-gray-100 p-1 rounded-xl flex">
            <button
              onClick={() => setView("week")}
              className={cn(
                "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                view === "week" ? "bg-white shadow-sm text-primary" : "text-gray-500"
              )}
            >
              Semaine
            </button>
            <button
              onClick={() => setView("month")}
              className={cn(
                "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                view === "month" ? "bg-white shadow-sm text-primary" : "text-gray-500"
              )}
            >
              Mois
            </button>
          </div>
        </div>

        {/* Date Selector */}
        <div className="flex justify-between items-center mb-8 bg-primary/5 p-4 rounded-3xl border border-primary/10">
          <button className="p-2 bg-white rounded-full shadow-sm">
            <ChevronLeft size={20} className="text-primary" />
          </button>
          <div className="text-center">
            <p className="text-sm font-bold">12 - 17 Octobre 2025</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Semestre 1 • Semaine 4</p>
          </div>
          <button className="p-2 bg-white rounded-full shadow-sm">
            <ChevronRight size={20} className="text-primary" />
          </button>
        </div>

        {/* Latest Uploaded Schedule */}
        {latestSchedule && (
          <div className="mb-8 bg-emerald-50 p-6 rounded-[32px] border border-emerald-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-emerald-100 p-3 rounded-2xl text-emerald-600">
                <FileText size={24} />
              </div>
              <div>
                <h4 className="font-bold text-emerald-900 text-sm">Nouvel emploi du temps</h4>
                <p className="text-[10px] text-emerald-600 font-medium">Mis à jour le {new Date(latestSchedule.date).toLocaleDateString()}</p>
              </div>
            </div>
            <a
              href={latestSchedule.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-emerald-600 p-3 rounded-2xl shadow-sm hover:scale-110 transition-transform active:scale-95"
            >
              <Download size={20} />
            </a>
          </div>
        )}

        {/* Days Row */}
        <div className="flex justify-between mb-8">
          {days.map((day, i) => (
            <button key={day} onClick={() => setSelectedDay(i)} className="flex flex-col items-center">
              <span className="text-[10px] text-gray-400 font-bold mb-2 uppercase">{day}</span>
              <div className={cn(
                "w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm transition-all",
                i === selectedDay ? "bg-primary text-white shadow-lg scale-110" : "bg-white text-gray-700 border border-gray-100"
              )}>
                {12 + i}
              </div>
              {i === 2 && <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2"></div>}
            </button>
          ))}
        </div>

        {/* Schedule Items */}
        <div className="space-y-6">
          {scheduleData[selectedDay]?.map((item: any, i: number) => (
            <ScheduleCard
              key={i}
              {...item}
            />
          ))}
          {(!scheduleData[selectedDay] || scheduleData[selectedDay].length === 0) && (
            <p className="text-center text-gray-400 italic">Aucun cours prévu pour ce jour.</p>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

function ScheduleCard({ time, duration, title, room, instructor, color, isCurrent }: any) {
  return (
    <div className={cn(
      "flex gap-4 group",
      isCurrent ? "opacity-100" : "opacity-80"
    )}>
      <div className="flex flex-col items-center py-1">
        <span className="text-sm font-bold text-gray-700">{time}</span>
        <span className="text-[10px] text-gray-400">{duration}</span>
      </div>
      <div className={cn(
        "flex-1 bg-white p-5 rounded-[24px] border-l-4 shadow-sm hover:shadow-md transition-all relative overflow-hidden",
        color,
        isCurrent && "ring-2 ring-primary ring-offset-2"
      )}>
        {isCurrent && (
          <div className="absolute top-4 right-4 bg-green-500 text-white text-[8px] font-bold px-2 py-1 rounded-full animate-pulse">
            EN COURS
          </div>
        )}
        <h4 className="font-bold text-gray-800 mb-1">{title}</h4>
        <div className="flex items-center gap-4 text-[10px] text-gray-500 font-medium">
          <span className="flex items-center gap-1">
            <CalendarIcon size={12} className="text-gray-400" />
            {room}
          </span>
          <span className="flex items-center gap-1">
            <div className="w-4 h-4 rounded-full bg-gray-200 overflow-hidden">
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${instructor}`} alt="" />
            </div>
            {instructor}
          </span>
        </div>
      </div>
    </div>
  );
}
