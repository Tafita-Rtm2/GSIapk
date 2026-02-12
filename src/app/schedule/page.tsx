"use client";

import { AppLayout } from "@/components/app-layout";
import { useLanguage } from "@/lib/i18n";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus, X, Bell } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { LocalNotifications } from "@capacitor/local-notifications";
import { toast } from "sonner";

export default function SchedulePage() {
  const { t } = useLanguage();
  const [view, setView] = useState<"week" | "month">("week");
  const [showAddModal, setShowAddModal] = useState(false);
  const [customItems, setCustomItems] = useState<any[]>([]);
  const [newItem, setNewItem] = useState({ title: "", time: "", date: "", duration: "60" });

  const days = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
  const currentDay = 2; // Mercredi

  useEffect(() => {
    const saved = localStorage.getItem("custom_schedule");
    if (saved) {
      setCustomItems(JSON.parse(saved));
    }

    // Request permissions for notifications
    LocalNotifications.requestPermissions();
  }, []);

  const handleAddItem = async () => {
    if (!newItem.title || !newItem.time || !newItem.date) {
        toast.error("Veuillez remplir tous les champs");
        return;
    }

    const item = { ...newItem, id: Date.now() };
    const items = [...customItems, item];
    setCustomItems(items);
    localStorage.setItem("custom_schedule", JSON.stringify(items));

    // Schedule Notification
    try {
      const [hours, minutes] = newItem.time.split(":").map(Number);
      const [year, month, day] = newItem.date.split("-").map(Number);
      const scheduleDate = new Date(year, month - 1, day, hours, minutes, 0, 0);

      if (scheduleDate > new Date()) {
        await LocalNotifications.schedule({
          notifications: [
            {
              title: "Rappel GSI Insight",
              body: `C'est l'heure de : ${newItem.title}`,
              id: item.id % 100000,
              schedule: { at: scheduleDate },
              sound: 'beep.wav',
              actionTypeId: 'OPEN_APP',
              extra: {
                task: newItem.title
              }
            }
          ]
        });
        toast.success("Rappel programmé avec succès !");
      } else {
        toast.warning("L'heure est déjà passée, pas de notification programmée.");
      }
    } catch (e) {
      console.error("Failed to schedule notification", e);
      toast.error("Erreur lors de la programmation de la notification");
    }

    setNewItem({ title: "", time: "", date: "", duration: "60" });
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
        <div className="space-y-6 mb-24">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Matières officielles</h3>

          <ScheduleCard
            time="08:00"
            duration="90 min"
            title="Algèbre Linéaire"
            room="Salle 102"
            instructor="Dr. Kamga"
            color="border-l-pink-500"
            filiere="Tronc Commun"
          />
          <ScheduleCard
            time="10:00"
            duration="120 min"
            title="Intelligence Artificielle"
            room="Amphi B"
            instructor="Dr. Razafy"
            color="border-l-indigo-500"
            filiere="Informatique"
            isCurrent
          />

          {customItems.length > 0 && (
            <>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1 pt-4">Mes programmes</h3>
              {customItems.map((item) => (
                 <ScheduleCard
                    key={item.id}
                    time={item.time}
                    duration={`${item.duration} min`}
                    title={item.title}
                    room="Rappel programmé"
                    instructor="Moi"
                    color="border-l-accent"
                    filiere="Personnel"
                    isCustom
                  />
              ))}
            </>
          )}

          <button
            onClick={() => setShowAddModal(true)}
            className="w-full py-5 border-2 border-dashed border-gray-200 rounded-[32px] text-gray-400 flex flex-col items-center justify-center gap-1 hover:border-primary/20 hover:text-primary transition-all group"
          >
            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-all">
                <Plus size={20} />
            </div>
            <span className="font-bold text-xs">Ajouter un programme personnel</span>
            <span className="text-[10px] opacity-60">Notification automatique au téléphone</span>
          </button>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-6 backdrop-blur-md">
          <div className="bg-white rounded-[40px] w-full max-w-sm p-8 flex flex-col relative animate-in fade-in zoom-in duration-300 shadow-2xl">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-6 right-6 p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 transition-colors"
            >
              <X size={20} />
            </button>
            <div className="w-16 h-16 bg-primary/10 rounded-3xl flex items-center justify-center text-primary mb-6">
                <Bell size={32} />
            </div>
            <h3 className="text-2xl font-bold mb-2">Nouveau programme</h3>
            <p className="text-gray-500 text-xs mb-8">Ajoutez une heure et une date pour recevoir une notification automatique.</p>

            <div className="space-y-5 mb-10">
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-gray-400 uppercase ml-4">Matière ou Activité</label>
                <input
                  type="text"
                  value={newItem.title}
                  onChange={(e) => setNewItem({...newItem, title: e.target.value})}
                  className="w-full bg-gray-100 rounded-[20px] p-4 text-sm outline-none border-2 border-transparent focus:border-primary/20 focus:bg-white transition-all"
                  placeholder="Ex: Révision Mathématiques"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-gray-400 uppercase ml-4">Date</label>
                <input
                  type="date"
                  value={newItem.date}
                  onChange={(e) => setNewItem({...newItem, date: e.target.value})}
                  className="w-full bg-gray-100 rounded-[20px] p-4 text-sm outline-none border-2 border-transparent focus:border-primary/20 focus:bg-white transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-gray-400 uppercase ml-4">Heure</label>
                  <input
                    type="time"
                    value={newItem.time}
                    onChange={(e) => setNewItem({...newItem, time: e.target.value})}
                    className="w-full bg-gray-100 rounded-[20px] p-4 text-sm outline-none border-2 border-transparent focus:border-primary/20 focus:bg-white transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-gray-400 uppercase ml-4">Durée (min)</label>
                  <input
                    type="number"
                    value={newItem.duration}
                    onChange={(e) => setNewItem({...newItem, duration: e.target.value})}
                    className="w-full bg-gray-100 rounded-[20px] p-4 text-sm outline-none border-2 border-transparent focus:border-primary/20 focus:bg-white transition-all"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleAddItem}
              className="w-full bg-primary text-white py-5 rounded-[24px] font-bold shadow-xl shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Plus size={20} />
              Enregistrer le programme
            </button>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

function ScheduleCard({ time, duration, title, room, instructor, color, filiere, isCurrent, isCustom }: any) {
  return (
    <div className={cn(
      "flex gap-4 group",
      isCurrent ? "opacity-100" : "opacity-80"
    )}>
      <div className="flex flex-col items-center py-1 min-w-[50px]">
        <span className="text-sm font-bold text-gray-700">{time}</span>
        <span className="text-[10px] text-gray-400">{duration}</span>
      </div>
      <div className={cn(
        "flex-1 bg-white p-5 rounded-[28px] border-l-4 shadow-sm hover:shadow-md transition-all relative overflow-hidden",
        color,
        isCurrent && "ring-2 ring-primary ring-offset-2",
        isCustom && "bg-accent/5 border-l-accent"
      )}>
        <div className="flex justify-between items-start mb-1">
            <span className="text-[9px] font-black uppercase tracking-wider text-gray-400">{filiere}</span>
            {isCurrent && (
                <div className="bg-green-500 text-white text-[8px] font-bold px-2 py-1 rounded-full animate-pulse">
                    EN COURS
                </div>
            )}
            {isCustom && (
                <Bell size={12} className="text-accent animate-bounce" />
            )}
        </div>
        <h4 className="font-bold text-gray-800 mb-2">{title}</h4>
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
