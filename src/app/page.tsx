"use client";

import { AppLayout } from "@/components/app-layout";
import { Bell, Search, Sparkles, BookOpen, FileText, Calendar as CalendarIcon, X, Info, Download, Clock, Wifi, WifiOff, CheckCircle2, RefreshCcw, AlertCircle } from "lucide-react";
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
      GSIStore.subscribeAnnouncements((anns) => {
        // Filter for global or targeted to this user
        setAnnouncements(anns.filter(a => !a.targetUserId || a.targetUserId === currentUser.id));
      })
    ];

    const handleOffline = () => setSyncStatus('offline');
    const handleOnline = () => setSyncStatus('syncing');
    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      unsubs.forEach(u => u());
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, [router]);

  if (!user) return null;

  const firstName = user.fullName.split(' ')[0];
  const convocations = announcements.filter(a => a.type === 'convocation');

  return (
    <AppLayout>
      <div className="p-6 pb-24 max-w-md mx-auto bg-[#F8FAFC] min-h-screen">
        {/* Sync Indicator */}
        <div className="flex justify-center mb-4">
           <div className={cn(
             "px-4 py-1.5 rounded-full flex items-center gap-2 text-[10px] font-bold uppercase transition-all",
             syncStatus === 'ready' ? "bg-emerald-100 text-emerald-600" :
             syncStatus === 'offline' ? "bg-orange-100 text-orange-600" : "bg-indigo-100 text-indigo-600 animate-pulse"
           )}>
              {syncStatus === 'ready' ? <CheckCircle2 size={12} /> :
               syncStatus === 'offline' ? <WifiOff size={12} /> : <RefreshCcw size={12} className="animate-spin" />}
              {syncStatus === 'ready' ? "Cloud Connecté" : syncStatus === 'offline' ? "Mode Local" : "Sync GSI Cloud..."}
           </div>
        </div>

        {/* Convocations Alert */}
        {convocations.length > 0 && (
          <div className="mb-6 bg-rose-50 border-2 border-rose-100 p-5 rounded-[32px] animate-in slide-in-from-top duration-500">
             <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-rose-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-rose-200">
                   <AlertCircle size={20} />
                </div>
                <h3 className="text-rose-600 font-black text-xs uppercase tracking-widest">Convocation Administrative</h3>
             </div>
             <p className="text-[11px] text-rose-500 font-bold leading-relaxed mb-4">{convocations[0].message}</p>
             <button onClick={() => toast.success("Confirmation envoyée à l'administration.")} className="w-full py-3 bg-rose-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md active:scale-95 transition-all">Confirmer Réception</button>
          </div>
        )}

        {/* Header */}
        <div className="flex justify-between items-center mb-6 pt-4">
          <div>
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Bonjour {firstName}</p>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight leading-tight">
               Prêt pour <span className="text-primary">{t("success_today")}</span> ?
            </h1>
          </div>
          <div className="flex items-center gap-3">
             <button onClick={() => setShowNotifications(!showNotifications)} className="relative p-3 bg-white shadow-sm border border-gray-100 rounded-2xl text-gray-400">
                <Bell size={20} />
                {announcements.length > 0 && <div className="absolute top-3 right-3 w-2 h-2 bg-rose-500 border-2 border-white rounded-full"></div>}
             </button>
             <Link href="/profile" className="w-11 h-11 rounded-2xl bg-indigo-50 overflow-hidden border-2 border-white shadow-md">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.fullName}`} alt="Avatar" />
             </Link>
          </div>
        </div>

        {/* AI Card */}
        <Link href="/chat" className="block mb-8 group active:scale-[0.98] transition-all">
           <div className="bg-gradient-to-r from-violet-600 to-indigo-800 p-6 rounded-[40px] text-white shadow-2xl relative overflow-hidden">
              <div className="relative z-10">
                 <div className="flex items-center gap-2 mb-2">
                    <Sparkles size={18} className="text-violet-200" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-violet-200">Ask Insight AI</span>
                 </div>
                 <h2 className="text-xl font-black mb-1 leading-tight">Des questions ?</h2>
                 <p className="text-[11px] text-violet-200/80 font-medium mb-4">Emplois du temps, devoirs, notes...</p>
                 <div className="inline-flex bg-white/10 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/10">Lancer Assistant</div>
              </div>
              <div className="absolute right-[-20px] bottom-[-20px] w-32 h-32 bg-white/5 rounded-full blur-3xl"></div>
           </div>
        </Link>

        {/* Lessons */}
        <div className="mb-10">
          <div className="flex justify-between items-end mb-5">
            <h2 className="text-lg font-black text-gray-900 uppercase tracking-tighter">Cours du jour</h2>
            <Link href="/library" className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline">Voir tout</Link>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {lessons.map((l, i) => (
              <div
                key={i}
                onClick={() => l.files?.[0] && window.open(l.files[0], '_blank')}
                className="min-w-[200px] p-5 bg-white rounded-[32px] border border-gray-100 shadow-sm active:scale-95 transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                  <BookOpen size={20} />
                </div>
                <h3 className="font-black text-xs text-gray-800 mb-1 line-clamp-1 uppercase">{l.title}</h3>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{l.subject}</p>
              </div>
            ))}
            {lessons.length === 0 && <p className="text-gray-300 text-[10px] font-black uppercase py-10 px-4 border-2 border-dashed border-gray-100 rounded-[32px] text-center w-full">Aucun contenu pédagogique</p>}
          </div>
        </div>

        {/* Deadlines */}
        <div className="mb-10">
          <h2 className="text-lg font-black text-gray-900 uppercase tracking-tighter mb-5">Devoirs à rendre</h2>
          <div className="space-y-4">
            {assignments.map((a, i) => (
               <div key={i} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm relative overflow-hidden">
                  <div className="flex justify-between items-center mb-4">
                    <span className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">En attente</span>
                    <div className="flex items-center gap-1 text-[9px] font-black text-gray-300 uppercase">
                       <Clock size={10} />
                       {a.deadline}
                    </div>
                  </div>
                  <h4 className="font-black text-sm uppercase tracking-tight mb-1">{a.title}</h4>
                  <p className="text-[10px] font-bold text-gray-400 mb-6">{a.subject}</p>
                  <button
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.onchange = (e: any) => {
                        const file = e.target.files[0];
                        if (file) {
                          toast.promise(GSIStore.addSubmission({
                            id: Math.random().toString(36).substr(2, 9),
                            assignmentId: a.id,
                            studentId: user.id,
                            studentName: user.fullName,
                            date: new Date().toISOString(),
                            file: "File Uploaded (Simulated)"
                          }), {
                            loading: 'Envoi du devoir...',
                            success: 'Devoir envoyé avec succès !',
                            error: 'Erreur lors de l\'envoi'
                          });
                        }
                      };
                      input.click();
                    }}
                    className="w-full py-4 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-colors shadow-lg active:scale-95"
                  >
                    Déposer mon travail
                  </button>
               </div>
            ))}
            {assignments.length === 0 && <div className="p-10 border-2 border-dashed border-gray-100 rounded-[32px] text-center"><p className="text-[10px] font-black text-gray-300 uppercase">Aucune deadline</p></div>}
          </div>
        </div>

        {/* Notifications Modal */}
        {showNotifications && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6 backdrop-blur-sm animate-in fade-in">
             <div className="bg-white rounded-[40px] w-full max-w-sm p-8 animate-in zoom-in-95">
                <div className="flex justify-between items-center mb-6">
                   <h3 className="font-black text-xs uppercase tracking-widest">Centre de Notifications</h3>
                   <button onClick={() => setShowNotifications(false)}><X size={20} /></button>
                </div>
                <div className="space-y-4 max-h-[400px] overflow-y-auto">
                   {announcements.map((a, i) => (
                     <div key={i} className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <h4 className="text-[10px] font-black uppercase mb-1">{a.title}</h4>
                        <p className="text-[11px] text-gray-500 font-medium">{a.message}</p>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
