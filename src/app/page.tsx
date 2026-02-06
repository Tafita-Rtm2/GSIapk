"use client";

import { AppLayout } from "@/components/app-layout";
import { Bell, Search, Sparkles, BookOpen, FileText, Calendar as CalendarIcon, X, Info, Download, Clock } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { GSIStore, User, Lesson, Assignment, Announcement } from "@/lib/store";
import { toast } from "sonner";

export default function Home() {
  const { t } = useLanguage();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    const init = async () => {
      const currentUser = GSIStore.getCurrentUser();
      if (!currentUser) {
        router.push("/login");
        return;
      }

      if (currentUser.role === 'admin') {
        router.push("/admin");
      } else if (currentUser.role === 'professor') {
        router.push("/professor");
      } else {
        setUser(currentUser);

        // Filter content for student
        const allLessons = await GSIStore.getLessons();
        const studentLessons = allLessons.filter(l =>
          (l.campus.includes(currentUser.campus) || l.campus.length === 0) &&
          (l.filiere.includes(currentUser.filiere) || l.filiere.length === 0) &&
          (l.niveau === currentUser.niveau)
        );
        setLessons(studentLessons);

        const allAssignments = await GSIStore.getAssignments();
        const studentAssignments = allAssignments.filter(a =>
          (a.campus.includes(currentUser.campus) || a.campus.length === 0) &&
          (a.filiere.includes(currentUser.filiere) || a.filiere.length === 0) &&
          (a.niveau === currentUser.niveau)
        );
        setAssignments(studentAssignments);

        const allAnnouncements = await GSIStore.getAnnouncements();
        setAnnouncements(allAnnouncements);
      }
    };
    init();
  }, [router]);

  if (!user) return null;

  const firstName = user.fullName.split(' ')[0];

  return (
    <AppLayout>
      <div className="p-6 pb-24">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 relative">
          <div>
            <p className="text-gray-500 text-sm">{t("bonjour")} {firstName}</p>
            <h1 className="text-2xl font-bold">Vous avez <span className="text-green-500">{assignments.length} {t("tasks_today")}</span></h1>
          </div>
          <div className="flex items-center gap-3">
             <button
              onClick={() => setShowInfo(true)}
              className="p-2 bg-gray-100 rounded-full text-gray-500 active:scale-95 transition-transform">
                <Info size={20} />
             </button>
             <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 bg-gray-100 rounded-full text-gray-500 active:scale-95 transition-transform">
                <Bell size={20} />
                {announcements.length > 0 && (
                  <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 border border-white rounded-full"></div>
                )}
             </button>
             <Link href="/profile" className="relative active:scale-95 transition-transform">
                <div className="w-10 h-10 rounded-full bg-indigo-50 overflow-hidden border-2 border-primary/20">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.fullName}`} alt="Avatar" />
                </div>
             </Link>
          </div>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute top-16 right-0 w-72 bg-white rounded-3xl shadow-2xl z-50 border border-gray-100 p-4 animate-in fade-in slide-in-from-top-2">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-sm">Notifications</h3>
                <button onClick={() => setShowNotifications(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={16} />
                </button>
              </div>
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {announcements.map((n, i) => (
                  <div key={i} className="flex gap-3 pb-3 border-b border-gray-50 last:border-0">
                    <div className="w-8 h-8 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 flex-shrink-0">
                      <Bell size={14} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold">{n.title}</h4>
                      <p className="text-[10px] text-gray-500 line-clamp-2">{n.message}</p>
                      <span className="text-[8px] text-gray-400">{new Date(n.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
                {announcements.length === 0 && (
                  <p className="text-center text-gray-400 text-[10px] py-4">Aucune notification.</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* GSI Info Modal */}
        {showInfo && (
          <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-6 backdrop-blur-sm">
            <div className="bg-white rounded-[40px] w-full max-w-sm p-8 flex flex-col relative max-h-[80vh] overflow-y-auto">
              <button
                onClick={() => setShowInfo(false)}
                className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full text-gray-500"
              >
                <X size={20} />
              </button>
              <div className="flex flex-col items-center mb-6">
                 <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg rotate-6">
                    <Sparkles size={32} />
                 </div>
                 <h2 className="text-2xl font-black text-primary">GSI Insight</h2>
                 <p className="text-gray-400 text-xs font-bold italic">“Where data meets your future.”</p>
              </div>
              <div className="space-y-4 text-gray-600 text-sm leading-relaxed text-justify">
                <p>
                  <b>GSI Insight</b> est l'application intelligente de GSI Internationale conçue pour accompagner chaque étudiant tout au long de son parcours académique et professionnel.
                </p>
                <p>
                  Elle centralise en un seul espace : emplois du temps, supports pédagogiques, devoirs, notes, actualités, afin d'offrir une expérience fluide, accessible et moderne.
                </p>
                <p>
                  Grâce à l'intelligence artificielle, GSI Insight ne se contente pas d'afficher des informations : elle analyse les données de l'étudiant, anticipe ses besoins, alerte sur les échéances importantes et propose des recommandations personnalisées pour améliorer l'apprentissage et la performance.
                </p>
                <p className="font-bold text-primary italic">
                  GSI Insight : comprendre aujourd'hui, réussir demain.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions Row */}
        <div className="grid grid-cols-2 gap-4 mb-8">
           <Link href="/chat" className="bg-gradient-to-br from-primary to-accent p-6 rounded-[32px] text-white shadow-lg shadow-primary/20 relative overflow-hidden group active:scale-[0.98] transition-all">
              <div className="relative z-10">
                 <Sparkles size={24} className="mb-2" />
                 <h3 className="font-bold text-sm leading-tight">{t("ask_insight")}</h3>
              </div>
              <div className="absolute right-[-10px] top-[-10px] w-20 h-20 bg-white/10 rounded-full"></div>
           </Link>
           <Link href="/program" className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm relative overflow-hidden group active:scale-[0.98] transition-all">
              <div className="relative z-10 text-gray-800">
                 <Clock size={24} className="mb-2 text-indigo-600" />
                 <h3 className="font-bold text-sm leading-tight">Mon Programme</h3>
              </div>
              <div className="absolute right-[-10px] top-[-10px] w-20 h-20 bg-indigo-50 rounded-full"></div>
           </Link>
        </div>


        {/* Courses Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">{t("cours_en_cours")}</h2>
            <Link href="/performance" className="text-primary text-xs font-bold hover:underline">Voir mes notes</Link>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide px-1">
            {lessons.map((l, i) => (
               <CourseCard
                key={i}
                title={l.title}
                subject={l.subject}
                files={l.files}
                icon={<BookOpen size={20} />}
                color={i % 2 === 0 ? "bg-rose-500" : "bg-indigo-500"}
               />
            ))}
            {lessons.length === 0 && (
               <div className="bg-gray-100 p-8 rounded-[32px] min-w-[200px] flex flex-col items-center justify-center text-center">
                  <BookOpen size={24} className="text-gray-300 mb-2" />
                  <p className="text-xs text-gray-400">Aucune leçon publiée pour votre classe.</p>
               </div>
            )}
          </div>
        </div>

        {/* Tasks Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">Mes Devoirs</h2>
            <button className="text-primary text-xs font-bold hover:underline">Voir tout</button>
          </div>
          <div className="space-y-4">
            {assignments.map((a, i) => (
               <TaskCard
                key={i}
                title={a.title}
                subject={a.subject}
                date={a.deadline}
                id={a.id}
                files={a.files}
               />
            ))}
            {assignments.length === 0 && (
              <div className="bg-white p-8 rounded-[32px] border border-dashed border-gray-200 text-center">
                  <FileText size={24} className="text-gray-200 mx-auto mb-2" />
                  <p className="text-xs text-gray-400">Pas de devoirs à rendre pour le moment.</p>
              </div>
            )}
          </div>
        </div>

        {/* Schedule Preview */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">{t("votre_emploi_du_temps")}</h2>
            <Link href="/schedule" className="text-primary text-xs font-bold hover:underline">Ouvrir l'agenda</Link>
          </div>

          <div className="space-y-4">
            <ScheduleItem
              time="08:00 - 10:00"
              title="Cours de Spécialité"
              subtitle={user.filiere}
              instructor="Expert GSI"
              location="Campus Principal"
              color="bg-indigo-500"
            />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function CourseCard({ title, subject, icon, color, files }: any) {
  return (
    <div className={`${color} min-w-[160px] p-5 rounded-[32px] text-white shadow-lg shadow-black/10 relative overflow-hidden group hover:scale-[1.02] transition-transform`}>
      <div className="absolute right-[-10px] top-[-10px] w-16 h-16 bg-white/10 rounded-full"></div>
      <div className="flex justify-between items-start mb-4">
        <div className="bg-white/20 w-10 h-10 rounded-2xl flex items-center justify-center">
          {icon}
        </div>
        {files && files.length > 0 && (
          <a href={files[0]} target="_blank" rel="noopener noreferrer" className="bg-white/20 p-2 rounded-xl hover:bg-white/40 transition-colors">
            <Download size={14} />
          </a>
        )}
      </div>
      <h3 className="font-bold text-sm leading-tight mb-1 truncate">{title}</h3>
      <p className="text-[10px] opacity-80 font-bold uppercase tracking-wider">{subject}</p>
    </div>
  );
}

function TaskCard({ title, subject, date, id, files }: any) {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="bg-white p-5 rounded-[32px] shadow-sm border border-gray-100 group hover:shadow-md transition-all">
      <div className="flex justify-between items-start mb-3">
        <span className={cn("text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider", submitted ? "bg-green-100 text-green-600" : "bg-amber-100 text-amber-600")}>
          {submitted ? "Soumis" : "En cours"}
        </span>
        <button className="text-gray-300">•••</button>
      </div>
      <h4 className="font-bold text-gray-800 mb-1 leading-tight">{title}</h4>
      <p className="text-xs text-gray-500 mb-4">{subject}</p>

      <div className="flex items-center justify-between mb-4">
         <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
           <CalendarIcon size={12} /> {date}
         </span>
         {files && files.length > 0 && (
           <a href={files[0]} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-primary flex items-center gap-1">
             <Download size={12} /> Support
           </a>
         )}
         <span className="text-[10px] font-bold text-gray-400">GSI Insight • 100%</span>
      </div>

      {submitted ? (
        <div className="bg-green-50 p-4 rounded-2xl flex items-center gap-3 text-green-700 font-bold text-xs animate-in zoom-in-95">
           <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center flex-shrink-0">
             <CheckCircle size={16} />
           </div>
           Travail soumis avec succès !
        </div>
      ) : (
        <button
          onClick={async () => {
            if(confirm("Soumettre ce travail ?")) {
              const user = GSIStore.getCurrentUser();
              if(user) {
                const toastId = toast.loading("Soumission en cours...");
                try {
                  await GSIStore.addSubmission({
                    id: Math.random().toString(36).substr(2, 9),
                    assignmentId: id,
                    studentId: user.id,
                    studentName: user.fullName,
                    date: new Date().toISOString(),
                    file: "devoir_gsi.pdf"
                  });
                  setSubmitted(true);
                  toast.success("Devoir soumis avec succès !", { id: toastId });
                } catch (e) {
                  toast.error("Erreur de soumission.", { id: toastId });
                }
              }
            }
          }}
          className="w-full py-4 bg-indigo-50 text-indigo-600 rounded-2xl text-xs font-bold hover:bg-indigo-600 hover:text-white active:scale-[0.98] transition-all">
          Soumettre le travail
        </button>
      )}
    </div>
  );
}

function CheckCircle({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function ScheduleItem({ time, title, subtitle, instructor, location, color }: any) {
  return (
    <div className={`${color} p-5 rounded-3xl text-white shadow-md relative overflow-hidden active:scale-[0.98] transition-transform`}>
      <div className="absolute right-[-20px] top-[-20px] w-24 h-24 bg-white/10 rounded-full"></div>
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs font-bold opacity-90">{time}</span>
        <button className="opacity-80"><CalendarIcon size={16} /></button>
      </div>
      <h3 className="text-xl font-bold mb-1">{title}</h3>
      <p className="text-sm opacity-80 mb-4">{subtitle}</p>

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-white/30 overflow-hidden">
             <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${instructor}`} alt={instructor} />
          </div>
          <span className="text-[10px] font-bold">{instructor}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-green-400"></div>
          <span className="text-[10px] font-bold">{location}</span>
        </div>
      </div>
    </div>
  );
}
