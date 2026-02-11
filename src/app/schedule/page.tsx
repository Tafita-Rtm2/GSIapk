"use client";

import { AppLayout } from "@/components/app-layout";
import { useLanguage } from "@/lib/i18n";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Download, FileText, Clock, MapPin, User as UserIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { GSIStore, StructuredSchedule, ScheduleSlot } from "@/lib/store";
import { PageHeader } from "@/components/page-header";
import { toast } from "sonner";

export default function SchedulePage() {
  const { t } = useLanguage();
  const [selectedDay, setSelectedDay] = useState("Lundi");
  const [schedule, setSchedule] = useState<StructuredSchedule | null>(null);

  const days = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

  useEffect(() => {
    const user = GSIStore.getCurrentUser();
    if (!user) return;

    const unsub = GSIStore.subscribeLatestSchedule(user.campus, user.niveau, (s) => {
      setSchedule(s);
    });

    return () => unsub();
  }, []);

  const dailySlots = schedule?.slots?.filter(s => s.day === selectedDay) || [];

  return (
    <AppLayout>
      <div className="p-6 pb-24 bg-[#F8FAFC] min-h-full">
        <PageHeader title={t("planning")} />

        {/* Days Selector */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
           {days.map((day) => (
             <button
               key={day}
               onClick={() => setSelectedDay(day)}
               className={cn(
                 "px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap",
                 selectedDay === day
                   ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100 scale-105"
                   : "bg-white text-gray-400 border border-gray-100"
               )}
             >
               {day}
             </button>
           ))}
        </div>

        {/* Schedule Grid */}
        <div className="space-y-4">
           {dailySlots.sort((a,b) => a.startTime.localeCompare(b.startTime)).map((slot, i) => (
             <div key={i} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex gap-6 relative overflow-hidden group hover:shadow-md transition-all">
                <div className="flex flex-col items-center justify-center border-r border-gray-100 pr-6 min-w-[80px]">
                   <span className="text-sm font-black text-gray-900">{slot.startTime}</span>
                   <div className="w-0.5 h-4 bg-gray-100 my-1"></div>
                   <span className="text-[10px] font-bold text-gray-400">{slot.endTime}</span>
                </div>

                <div className="flex-1 py-1">
                   <h3 className="font-black text-sm text-gray-900 uppercase tracking-tight mb-3">{slot.subject}</h3>
                   <div className="flex flex-wrap gap-4">
                      <div className="flex items-center gap-1.5">
                         <MapPin size={12} className="text-indigo-400" />
                         <span className="text-[10px] font-bold text-gray-500">{slot.room}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                         <UserIcon size={12} className="text-indigo-400" />
                         <span className="text-[10px] font-bold text-gray-500">{slot.instructor}</span>
                      </div>
                   </div>
                </div>

                <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-indigo-600 opacity-20 group-hover:opacity-100 transition-opacity"></div>
             </div>
           ))}

           {dailySlots.length === 0 && (
             <div className="flex flex-col items-center justify-center py-20 opacity-20">
                <CalendarIcon size={64} className="mb-4" />
                <p className="font-black uppercase text-xs tracking-widest">Aucun cours prévu</p>
             </div>
           )}
        </div>

        {schedule && (
           <p className="text-center text-[8px] font-black text-gray-300 uppercase tracking-[0.2em] mt-10">
              Dernière mise à jour : {new Date(schedule.lastUpdated).toLocaleString()}
           </p>
        )}
      </div>
    </AppLayout>
  );
}
