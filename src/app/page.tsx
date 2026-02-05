"use client";

import { AppLayout } from "@/components/app-layout";
import { Bell, Search, Sparkles } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { GSIStore, User } from "@/lib/store";

export default function Home() {
  const { t } = useLanguage();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const currentUser = GSIStore.getCurrentUser();
    if (!currentUser) {
      router.push("/login");
    } else if (currentUser.role === 'admin') {
      router.push("/admin");
    } else if (currentUser.role === 'professor') {
      router.push("/professor");
    } else {
      setUser(currentUser);
    }
  }, [router]);

  if (!user) return null;

  const firstName = user?.fullName.split(' ')[0] || "Étudiant";

  const notifications = [
    { title: "Nouveau cours", message: "Le support d'Algorithmique est disponible.", time: "10 min" },
    { title: "Rappel Devoir", message: "Devoir de Gestion à rendre demain !", time: "1h" },
    { title: "Note publiée", message: "Votre note de Mathématiques est en ligne.", time: "2h" },
  ];

  return (
    <AppLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 relative">
          <div>
            <p className="text-gray-500 text-sm">{t("bonjour")} {firstName}</p>
            <h1 className="text-2xl font-bold">Vous avez <span className="text-green-500">4 {t("tasks_today")}</span></h1>
          </div>
          <div className="flex items-center gap-3">
             <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 bg-gray-100 rounded-full text-gray-500">
                <Bell size={20} />
                <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 border border-white rounded-full"></div>
             </button>
             <Link href="/profile" className="relative">
                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border-2 border-primary/20">
                  <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Liana" alt="Avatar" />
                </div>
             </Link>
          </div>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute top-16 right-0 w-72 bg-white rounded-3xl shadow-2xl z-50 border border-gray-100 p-4 animate-in fade-in slide-in-from-top-2">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-sm">Notifications</h3>
                <button onClick={() => setShowNotifications(false)} className="text-[10px] text-primary font-bold">Marquer tout lu</button>
              </div>
              <div className="space-y-3">
                {notifications.map((n, i) => (
                  <div key={i} className="flex gap-3 pb-3 border-b border-gray-50 last:border-0">
                    <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center text-primary flex-shrink-0">
                      <Bell size={14} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold">{n.title}</h4>
                      <p className="text-[10px] text-gray-500">{n.message}</p>
                      <span className="text-[8px] text-gray-400">{n.time} ago</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Ask Insight Call to Action */}
        <Link href="/chat" className="block mb-8 bg-gradient-to-r from-primary to-accent p-5 rounded-[32px] text-white shadow-lg shadow-primary/20 relative overflow-hidden group">
           <div className="absolute right-[-10px] top-[-10px] w-24 h-24 bg-white/10 rounded-full group-hover:scale-110 transition-transform"></div>
           <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                 <div className="p-2 bg-white/20 rounded-xl">
                    <Sparkles size={20} className="text-white" />
                 </div>
                 <h3 className="font-bold text-lg">{t("ask_insight")}</h3>
              </div>
              <p className="text-sm text-white/80 italic font-medium">“Where data meets your future.”</p>
           </div>
        </Link>

        {/* Courses Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">{t("cours_en_cours")}</h2>
            <Link href="/performance" className="text-primary text-xs font-bold hover:underline">Voir mes notes</Link>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide px-1">
            <CourseCard
              title="Mathématiques"
              icon="📐"
              color="bg-rose-500"
              count="12"
            />
            <CourseCard
              title="Gestion"
              icon="📊"
              color="bg-amber-500"
              count="8"
            />
            <CourseCard
              title="Marketing"
              icon="🎯"
              color="bg-indigo-500"
              count="5"
            />
          </div>
        </div>

        {/* Tasks Section (from Prototype) */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">Mes Tâches</h2>
            <button className="text-primary text-xs font-bold hover:underline">Voir tout</button>
          </div>
          <div className="space-y-4">
            <TaskCard
              title="Lire le poème & répondre aux questions"
              subject="Littérature Anglaise"
              date="28 Mai 2025"
              progress={40}
              status="En cours"
              statusColor="bg-amber-100 text-amber-600"
            />
            <TaskCard
              title="Créer une bande dessinée"
              subject="Sciences Sociales"
              date="30 Mai 2025"
              status="À faire"
              statusColor="bg-indigo-100 text-indigo-600"
            />
          </div>
        </div>

        {/* Schedule Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">{t("votre_emploi_du_temps")}</h2>
            <Link href="/schedule" className="text-primary text-xs font-bold hover:underline">Ouvrir</Link>
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

function CourseCard({ title, icon, color, count }: { title: string, icon: string, color: string, count: string }) {
  return (
    <div className={`${color} min-w-[140px] p-5 rounded-[32px] text-white shadow-lg shadow-${color.split('-')[1]}-500/20 relative overflow-hidden group hover:scale-[1.02] transition-transform`}>
      <div className="absolute right-[-10px] top-[-10px] w-16 h-16 bg-white/10 rounded-full"></div>
      <div className="bg-white/20 w-10 h-10 rounded-2xl flex items-center justify-center text-xl mb-4">
        {icon}
      </div>
      <h3 className="font-bold text-base leading-tight mb-1">{title}</h3>
      <p className="text-[10px] opacity-80 font-bold uppercase tracking-wider">{count} supports</p>
    </div>
  );
}

function TaskCard({ title, subject, date, progress, status, statusColor }: any) {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="bg-white p-5 rounded-[32px] shadow-sm border border-gray-100 group hover:shadow-md transition-all">
      <div className="flex justify-between items-start mb-3">
        <span className={cn("text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider", statusColor)}>
          {status}
        </span>
        <button className="text-gray-300">•••</button>
      </div>
      <h4 className="font-bold text-gray-800 mb-1 leading-tight">{title}</h4>
      <p className="text-xs text-gray-500 mb-4">{subject}</p>

      <div className="flex items-center justify-between mb-2">
         <span className="text-[10px] font-bold text-gray-400">📅 {date}</span>
         <span className="text-[10px] font-bold text-gray-400">💬 12 commentaires</span>
      </div>

      {progress !== undefined && !submitted && (
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
             <div className="h-full bg-green-500 rounded-full" style={{ width: `${progress}%` }}></div>
          </div>
          <span className="text-[10px] font-bold text-green-600">{progress}%</span>
        </div>
      )}

      {submitted ? (
        <div className="bg-green-50 p-3 rounded-2xl flex items-center gap-2 text-green-700 font-bold text-xs">
           <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center">✓</div>
           Devoir envoyé avec succès !
        </div>
      ) : (
        <button
          onClick={() => {
            const ok = confirm("Voulez-vous soumettre ce devoir ?");
            if(ok) setSubmitted(true);
          }}
          className="w-full py-3 bg-gray-50 text-primary rounded-2xl text-xs font-bold hover:bg-primary hover:text-white transition-all">
          Soumettre le travail
        </button>
      )}
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
