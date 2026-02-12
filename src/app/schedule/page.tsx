"use client";

import { AppLayout } from "@/components/app-layout";
import { useLanguage } from "@/lib/i18n";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus, X } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { LocalNotifications } from "@capacitor/local-notifications";

export default function SchedulePage() {
  const { t } = useLanguage();
  const [view, setView] = useState<"week" | "month">("week");
  const [showAddModal, setShowAddModal] = useState(false);
  const [customItems, setCustomItems] = useState<any[]>([]);
  const [newItem, setNewItem] = useState({ title: "", time: "", duration: "60" });

  const days = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
  const currentDay = 2; // Mercredi

  useEffect(() => {
    const saved = localStorage.getItem("custom_schedule");
    if (saved) {
      setCustomItems(JSON.parse(saved));
    }
  }, []);

  const handleAddItem = async () => {
    if (!newItem.title || !newItem.time) return;

    const items = [...customItems, { ...newItem, id: Date.now() }];
    setCustomItems(items);
    localStorage.setItem("custom_schedule", JSON.stringify(items));

    // Schedule Notification
    try {
      const [hours, minutes] = newItem.time.split(":").map(Number);
      const scheduleDate = new Date();
      scheduleDate.setHours(hours, minutes, 0, 0);

      // Only schedule if it's in the future
      if (scheduleDate > new Date()) {
        await LocalNotifications.schedule({
          notifications: [
            {
              title: t("rappel_cours"),
              body: `${newItem.title} - ${t("cours_commence")}`,
              id: Math.floor(Math.random() * 10000),
              schedule: { at: scheduleDate },
              sound: 'beep.wav', // Basic sound attempt
            }
          ]
        });
      }
    } catch (e) {
      console.error("Failed to schedule notification", e);
    }

    setNewItem({ title: "", time: "", duration: "60" });
    setShowAddModal(false);
  };

  return (
    <AppLayout>
      <div className="p-6 relative">
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

        {/* Days Row */}
        <div className="flex justify-between mb-8">
          {days.map((day, i) => (
            <div key={day} className="flex flex-col items-center">
              <span className="text-[10px] text-gray-400 font-bold mb-2 uppercase">{day}</span>
              <div className={cn(
                "w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm transition-all",
                i === currentDay ? "bg-primary text-white shadow-lg scale-110" : "bg-white text-gray-700 border border-gray-100"
              )}>
                {12 + i}
              </div>
              {i === 2 && <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2"></div>}
            </div>
          ))}
        </div>

        {/* Schedule Items */}
        <div className="space-y-6 mb-20">
          <ScheduleCard
            time="08:00"
            duration="90 min"
            title="Algèbre Linéaire"
            room="Salle 102"
            instructor="Dr. Kamga"
            color="border-l-pink-500"
          />
          <ScheduleCard
            time="10:00"
            duration="120 min"
            title="Physique Quantique"
            room="Amphi B"
            instructor="Pr. Tagne"
            color="border-l-indigo-500"
            isCurrent
          />

          {customItems.map((item) => (
             <ScheduleCard
                key={item.id}
                time={item.time}
                duration={`${item.duration} min`}
                title={item.title}
                room="Personnel"
                instructor="Moi"
                color="border-l-accent"
              />
          ))}

          <ScheduleCard
            time="14:00"
            duration="90 min"
            title="Anglais Technique"
            room="Labo Langues"
            instructor="Mrs. Smith"
            color="border-l-orange-400"
          />

          <button
            onClick={() => setShowAddModal(true)}
            className="w-full py-4 border-2 border-dashed border-gray-200 rounded-[24px] text-gray-400 flex items-center justify-center gap-2 hover:border-primary/20 hover:text-primary transition-all"
          >
            <Plus size={20} />
            <span className="font-bold text-sm">{t("ajouter_programme")}</span>
          </button>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6 backdrop-blur-sm">
          <div className="bg-white rounded-[40px] w-full max-w-xs p-8 flex flex-col relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full text-gray-500"
            >
              <X size={20} />
            </button>
            <h3 className="text-xl font-bold mb-6">{t("ajouter_programme")}</h3>

            <div className="space-y-4 mb-8">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-2">{t("titre")}</label>
                <input
                  type="text"
                  value={newItem.title}
                  onChange={(e) => setNewItem({...newItem, title: e.target.value})}
                  className="w-full bg-gray-50 rounded-2xl p-4 text-sm outline-none border border-transparent focus:border-primary/20"
                  placeholder="Ex: Révision Math"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase ml-2">{t("heure")}</label>
                  <input
                    type="time"
                    value={newItem.time}
                    onChange={(e) => setNewItem({...newItem, time: e.target.value})}
                    className="w-full bg-gray-50 rounded-2xl p-4 text-sm outline-none border border-transparent focus:border-primary/20"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase ml-2">{t("duree")}</label>
                  <input
                    type="number"
                    value={newItem.duration}
                    onChange={(e) => setNewItem({...newItem, duration: e.target.value})}
                    className="w-full bg-gray-50 rounded-2xl p-4 text-sm outline-none border border-transparent focus:border-primary/20"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleAddItem}
              className="w-full bg-primary text-white py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 active:scale-95 transition-transform"
            >
              {t("enregistrer")}
            </button>
          </div>
        </div>
      )}
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
