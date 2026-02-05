import { AppLayout } from "@/components/app-layout";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SchedulePage() {
  const days = [
    { day: "Lun", date: "14" },
    { day: "Mar", date: "15" },
    { day: "Mer", date: "16" },
    { day: "Jeu", date: "17", active: true },
    { day: "Ven", date: "18" },
    { day: "Sam", date: "19" },
    { day: "Dim", date: "20" },
  ];

  return (
    <AppLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-gray-500 text-sm">16 Septembre</p>
            <h1 className="text-3xl font-bold">Aujourd'hui</h1>
          </div>
          <button className="bg-primary/10 text-primary px-4 py-2 rounded-xl flex items-center gap-2 font-semibold">
            <Plus size={20} />
            <span>Tâche</span>
          </button>
        </div>

        {/* Toggle Semaine / Mois */}
        <div className="flex bg-gray-100 p-1 rounded-2xl mb-8">
          <button className="flex-1 py-2 text-sm font-bold bg-white rounded-xl shadow-sm">Semaine</button>
          <button className="flex-1 py-2 text-sm font-bold text-gray-500">Mois</button>
        </div>

        {/* Date Selector */}
        <div className="flex justify-between mb-8">
          {days.map((d) => (
            <div key={d.date} className="flex flex-col items-center">
              <span className="text-xs text-gray-400 mb-2">{d.day}</span>
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center font-bold transition-colors",
                d.active ? "bg-primary text-white" : "text-gray-600"
              )}>
                {d.date}
              </div>
              {d.active && <div className="w-1 h-1 bg-primary rounded-full mt-1"></div>}
            </div>
          ))}
        </div>

        {/* Timeline */}
        <div className="space-y-8 relative">
           <div className="absolute left-[45px] top-0 bottom-0 w-[2px] bg-gray-100"></div>

           <TimelineItem
            time="9:30"
            endTime="10:20"
            title="Physique"
            subtitle="Chapitre 3: Force"
            instructor="Alex Jesus"
            location="Google Meet"
            color="bg-indigo-500"
            active
           />

           <TimelineItem
            time="11:00"
            endTime="11:50"
            title="Géographie"
            subtitle="Chapitre 12: Profil du sol"
            instructor="Jenifer Clark"
            location="Zoom"
            color="bg-cyan-500"
           />

           <TimelineItem
            time="12:20"
            endTime="13:00"
            title="Devoir"
            subtitle="Modèle régional mondial"
            instructor="Alexa Tenorio"
            location="Google Docs"
            color="bg-emerald-500"
           />
        </div>
      </div>
    </AppLayout>
  );
}

function TimelineItem({ time, endTime, title, subtitle, instructor, location, color, active }: { time: string, endTime: string, title: string, subtitle: string, instructor: string, location: string, color: string, active?: boolean }) {
  return (
    <div className="flex gap-6 items-start">
      <div className="w-12 pt-1">
        <span className="text-sm font-bold text-gray-800">{time}</span>
        <div className="text-[10px] text-gray-400">{endTime}</div>
      </div>

      <div className="relative flex-1">
        {/* Dot on timeline */}
        <div className={cn(
          "absolute left-[-21px] top-2 w-4 h-4 rounded-full border-4 border-white z-10",
          active ? "bg-primary ring-4 ring-primary/20" : "bg-gray-200"
        )}></div>

        <div className={`${color} p-5 rounded-3xl text-white shadow-md relative overflow-hidden`}>
          <div className="flex justify-between items-start mb-1">
            <h3 className="text-lg font-bold">{title}</h3>
            <button className="opacity-80">•••</button>
          </div>
          <p className="text-xs opacity-80 mb-4">{subtitle}</p>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-white/30 overflow-hidden text-[8px] flex items-center justify-center">
                 <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${instructor}`} alt={instructor} />
              </div>
              <span className="text-[10px]">{instructor}</span>
            </div>
            <div className="flex items-center gap-1">
               <div className="w-1.5 h-1.5 rounded-full bg-white opacity-80"></div>
              <span className="text-[10px]">{location}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
