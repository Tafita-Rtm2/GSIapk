"use client";

import { AppLayout } from "@/components/app-layout";
import { Bell, Search, Sparkles, BookOpen, FileText, Calendar as CalendarIcon, X, Info, Download, Clock, Wifi, WifiOff, CheckCircle2, RefreshCcw } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useState, useEffect, memo } from "react";
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
  const [syncStatus, setSyncStatus] = useState<'syncing' | 'offline' | 'ready'>('syncing');

  useEffect(() => {
    const currentUser = GSIStore.getCurrentUser();
    if (!currentUser) {
      router.replace("/login");
      return;
    }

    if (currentUser.role === 'admin') {
      router.replace("/admin");
      return;
    } else if (currentUser.role === 'professor') {
      router.replace("/professor");
      return;
    }

    setUser(currentUser);

    // Sync detection logic
    const handleOnline = () => setSyncStatus('syncing');
    const handleOffline = () => setSyncStatus('offline');
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const unsubs = [
      GSIStore.subscribeLessons({ niveau: currentUser.niveau }, (all) => {
        const filtered = all.filter(l =>
          (l.campus.includes(currentUser.campus) || l.campus.length === 0) &&
          (l.filiere.includes(currentUser.filiere) || l.filiere.length === 0)
        );
        setLessons(filtered);
        setSyncStatus('ready');
      }),
      GSIStore.subscribeAssignments({ niveau: currentUser.niveau }, (all) => {
        const filtered = all.filter(a =>
          (a.campus.includes(currentUser.campus) || a.campus.length === 0) &&
          (a.filiere.includes(currentUser.filiere) || a.filiere.length === 0)
        );
        setAssignments(filtered);
      }),
      GSIStore.subscribeAnnouncements((anns) => setAnnouncements(anns))
    ];

    return () => {
      unsubs.forEach(u => u());
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [router]);

  if (!user) return null;

  const firstName = user.fullName.split(' ')[0];

  return (
    <AppLayout>
      <div className="p-6 pb-24 max-w-md mx-auto bg-[#F8FAFC] min-h-screen">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 relative pt-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
               <p className="text-gray-400 text-xs font-black uppercase tracking-widest">{t("bonjour")} {firstName}</p>
               {syncStatus === 'syncing' && <RefreshCcw size={10} className="text-primary animate-spin" />}
               {syncStatus === 'ready' && <CheckCircle2 size={10} className="text-emerald-500" />}
               {syncStatus === 'offline' && <WifiOff size={10} className="text-orange-400" />}
            </div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight leading-tight">
               Prêt pour <span className="text-primary">{t("success_today")}</span> ?
            </h1>
          </div>
          <div className="flex items-center gap-3">
             <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-3 bg-white shadow-sm border border-gray-100 rounded-2xl text-gray-400 active:scale-95 transition-all">
                <Bell size={20} />
                {announcements.length > 0 && (
                  <div className="absolute top-3 right-3 w-2 h-2 bg-rose-500 border-2 border-white rounded-full"></div>
                )}
             </button>
             <Link href="/profile" className="relative active:scale-95 transition-all">
                <div className="w-11 h-11 rounded-2xl bg-indigo-50 overflow-hidden border-2 border-white shadow-md">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.fullName}`} alt="Avatar" />
                </div>
             </Link>
          </div>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute top-20 right-0 w-80 bg-white/95 backdrop-blur-xl rounded-[32px] shadow-2xl z-50 border border-white p-6 animate-in zoom-in-95">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-black text-xs uppercase tracking-widest text-gray-400">Annonces Officielles</h3>
                <button onClick={() => setShowNotifications(false)} className="text-gray-400">
                  <X size={16} />
                </button>
              </div>
              <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
                {announcements.map((n, i) => (
                  <div key={i} className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                        <Bell size={14} />
                      </div>
                      <h4 className="text-[11px] font-black uppercase tracking-tight line-clamp-1">{n.title}</h4>
                    </div>
                    <p className="text-[10px] text-gray-500 font-medium leading-relaxed">{n.message}</p>
                    <div className="mt-2 flex justify-end">
                       <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">{new Date(n.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
                {announcements.length === 0 && (
                  <div className="text-center py-10 grayscale opacity-30">
                     <Bell size={32} className="mx-auto mb-2" />
                     <p className="text-[10px] font-bold uppercase">Aucune nouvelle annonce</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sync Status Floating Pill */}
        <div className="flex justify-center mb-6">
           <div className={cn(
             "px-4 py-2 rounded-full border shadow-sm flex items-center gap-2 transition-all duration-500 scale-90",
             syncStatus === 'ready' ? "bg-emerald-50 border-emerald-100 text-emerald-600" :
             syncStatus === 'offline' ? "bg-orange-50 border-orange-100 text-orange-600" :
             "bg-violet-50 border-violet-100 text-violet-600 animate-pulse"
           )}>
              {syncStatus === 'ready' ? <CheckCircle2 size={12} /> :
               syncStatus === 'offline' ? <WifiOff size={12} /> : <RefreshCcw size={12} className="animate-spin" />}
              <span className="text-[9px] font-black uppercase tracking-widest">
                {syncStatus === 'ready' ? "Système synchronisé 100%" :
                 syncStatus === 'offline' ? "Mode Hors-ligne activé" : "Synchronisation GSI Insight..."}
              </span>
           </div>
        </div>

        {/* AI Action Card */}
        <Link href="/chat" className="block mb-8 group">
           <div className="bg-gradient-to-r from-violet-600 via-indigo-700 to-indigo-900 p-6 rounded-[40px] text-white shadow-2xl shadow-violet-200 relative overflow-hidden active:scale-[0.97] transition-all">
              <div className="relative z-10">
                 <div className="flex items-center gap-2 mb-3">
                    <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                       <Sparkles size={18} className="text-violet-200" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-200">GSI Core AI</span>
                 </div>
                 <h2 className="text-xl font-black mb-1 leading-tight tracking-tight">Besoin d'aide, {firstName} ?</h2>
                 <p className="text-[11px] text-violet-200/80 font-medium max-w-[200px] mb-4">Posez vos questions sur vos cours, devoirs ou emploi du temps.</p>
                 <div className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest backdrop-blur-sm transition-all border border-white/10">
                    Lancer Ask Insight
                 </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute right-[-20px] bottom-[-20px] w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
              <div className="absolute top-[20%] right-[10%] opacity-20 group-hover:rotate-45 transition-transform duration-1000">
                 <Sparkles size={120} />
              </div>
           </div>
        </Link>

        {/* Courses Horizontal Scroll */}
        <div className="mb-10">
          <div className="flex justify-between items-end mb-5 px-1">
            <div>
               <h2 className="text-lg font-black text-gray-900 leading-none mb-1 uppercase tracking-tighter">Cours du jour</h2>
               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Support de cours & documents</p>
            </div>
            <button
              onClick={() => setShowInfo(true)}
              className="p-2 bg-white rounded-xl shadow-sm border border-gray-100 text-gray-400 active:scale-90 transition-all">
               <Info size={16} />
            </button>
          </div>

          <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide snap-x">
            {lessons.map((l, i) => (
               <div key={i} className="snap-center">
                 <CourseCard
                  title={l.title}
                  subject={l.subject}
                  files={l.files}
                  icon={<BookOpen size={20} />}
                  color={i % 2 === 0 ? "bg-white" : "bg-white"}
                  isPrimary={i === 0}
                 />
               </div>
            ))}
            {lessons.length === 0 && (
               <div className="bg-white/50 border-2 border-dashed border-gray-200 p-8 rounded-[32px] min-w-[240px] flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-200 mb-3">
                    <BookOpen size={24} />
                  </div>
                  <p className="text-[10px] font-black uppercase text-gray-300">Aucun cours publié</p>
               </div>
            )}
          </div>
        </div>

        {/* Deadlines Section */}
        <div className="mb-10">
          <div className="flex justify-between items-center mb-5 px-1">
            <h2 className="text-lg font-black text-gray-900 uppercase tracking-tighter">Prochaines Deadlines</h2>
            <Link href="/program" className="text-primary text-[10px] font-black uppercase tracking-widest hover:underline">Voir tout</Link>
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
              <div className="bg-white p-12 rounded-[40px] border border-dashed border-gray-100 text-center grayscale opacity-40">
                  <FileText size={32} className="mx-auto mb-3" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Libre comme l'air</p>
              </div>
            )}
          </div>
        </div>

        {/* GSI Info Modal */}
        {showInfo && (
          <div className="fixed inset-0 bg-gray-900/80 z-[100] flex items-center justify-center p-6 backdrop-blur-md animate-in fade-in">
            <div className="bg-white rounded-[40px] w-full max-w-sm p-10 flex flex-col relative animate-in zoom-in-95 duration-300">
              <button
                onClick={() => setShowInfo(false)}
                className="absolute top-6 right-6 p-2 bg-gray-50 rounded-xl text-gray-400 active:scale-90 transition-all"
              >
                <X size={20} />
              </button>
              <div className="flex flex-col items-center mb-8">
                 <div className="w-20 h-20 bg-primary rounded-[30%] flex items-center justify-center text-white mb-6 shadow-2xl shadow-primary/30 rotate-12 scale-110">
                    <Sparkles size={40} />
                 </div>
                 <h2 className="text-3xl font-black text-gray-900 tracking-tight">GSI Insight</h2>
                 <p className="text-primary text-[10px] font-black uppercase tracking-[0.3em] mt-2 italic opacity-60">Success is data driven</p>
              </div>
              <div className="space-y-5 text-gray-500 text-xs font-medium leading-relaxed text-center italic">
                <p>“Where data meets your future.”</p>
                <div className="w-10 h-1 bg-primary/20 mx-auto rounded-full"></div>
                <p>
                  Centralisation totale des emplois du temps, supports pédagogiques, notes et actualités en temps réel.
                </p>
                <p className="font-black text-gray-900 not-italic uppercase tracking-widest pt-4">
                  GSI Internationale
                </p>
              </div>
              <button
                onClick={() => setShowInfo(false)}
                className="mt-10 w-full py-4 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all">
                Fermer
              </button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

const CourseCard = memo(({ title, subject, icon, color, files, isPrimary }: any) => {
  return (
    <div className={cn(
      "min-w-[220px] p-6 rounded-[32px] shadow-sm border relative overflow-hidden group active:scale-[0.98] transition-all",
      isPrimary ? "bg-white border-violet-100 shadow-violet-100/50" : "bg-white border-gray-100"
    )}>
      <div className="flex justify-between items-start mb-6">
        <div className={cn(
          "w-12 h-12 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110",
          isPrimary ? "bg-violet-600 text-white shadow-lg shadow-violet-200" : "bg-gray-50 text-gray-400"
        )}>
          {icon}
        </div>
        {files && files.length > 0 && (
          <a href={files[0]} target="_blank" rel="noopener noreferrer" className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-primary hover:text-white transition-all shadow-sm">
            <Download size={16} />
          </a>
        )}
      </div>
      <h3 className="font-black text-sm text-gray-800 leading-tight mb-2 line-clamp-2 uppercase tracking-tight">{title}</h3>
      <div className="flex items-center gap-2">
         <div className="w-4 h-[2px] bg-primary rounded-full"></div>
         <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.1em]">{subject}</p>
      </div>

      {/* Decorative dots */}
      <div className="absolute right-3 bottom-3 flex gap-1">
         <div className="w-1 h-1 rounded-full bg-gray-100"></div>
         <div className="w-1 h-1 rounded-full bg-gray-200"></div>
         <div className="w-1 h-1 rounded-full bg-gray-300"></div>
      </div>
    </div>
  );
});

const TaskCard = memo(({ title, subject, date, id, files }: any) => {
  const [submitted, setSubmitted] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  return (
    <div className="bg-white p-6 rounded-[40px] shadow-sm border border-gray-100 group hover:border-primary/20 transition-all duration-300">
      <div className="flex justify-between items-center mb-4">
        <div className={cn(
          "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest",
          submitted ? "bg-emerald-50 text-emerald-600" : "bg-orange-50 text-orange-600"
        )}>
          {submitted ? "Mission Accomplie" : "Devoir en attente"}
        </div>
        <div className="flex gap-1">
           {[1,2,3].map(i => <div key={i} className="w-1 h-1 rounded-full bg-gray-100"></div>)}
        </div>
      </div>

      <h4 className="text-md font-black text-gray-800 mb-1 leading-tight uppercase tracking-tight">{title}</h4>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6">{subject}</p>

      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-3xl mb-6">
         <div className="flex items-center gap-2">
            <CalendarIcon size={14} className="text-gray-300" />
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{date}</span>
         </div>
         {files && files.length > 0 && (
           <a href={files[0]} target="_blank" rel="noopener noreferrer" className="bg-white px-3 py-1.5 rounded-xl border border-gray-100 shadow-xs flex items-center gap-2 hover:bg-primary hover:text-white transition-all group/dl">
             <Download size={12} className="text-primary group-hover/dl:text-white" />
             <span className="text-[8px] font-black uppercase tracking-widest">Support</span>
           </a>
         )}
      </div>

      {submitted ? (
        <div className="bg-emerald-600 p-4 rounded-2xl flex items-center justify-center gap-3 text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-emerald-100 animate-in zoom-in-95">
           <CheckCircle2 size={16} />
           Soumission Validée
        </div>
      ) : (
        <button
          onClick={async () => {
            const user = GSIStore.getCurrentUser();
            if(user) {
              setIsSyncing(true);
              const toastId = toast.loading("Publication de votre travail...");
              try {
                // Background Sync Simulation
                setTimeout(async () => {
                  await GSIStore.addSubmission({
                    id: Math.random().toString(36).substr(2, 9),
                    assignmentId: id,
                    studentId: user.id,
                    studentName: user.fullName,
                    date: new Date().toISOString(),
                    file: "devoir_gsi.pdf"
                  });
                  setSubmitted(true);
                  setIsSyncing(false);
                  toast.success("Bravo ! Devoir soumis.", { id: toastId });
                }, 800);
              } catch (e) {
                toast.error("Échec de connexion.", { id: toastId });
                setIsSyncing(false);
              }
            }
          }}
          disabled={isSyncing}
          className="w-full py-5 bg-gray-900 text-white rounded-[24px] text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-primary active:scale-[0.97] transition-all disabled:opacity-50">
          {isSyncing ? "Envoi GSI Cloud..." : "Déposer mon travail"}
        </button>
      )}
    </div>
  );
});
