"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calendar, BookOpen, Library, User, MessageCircle, Users, X, Maximize2, Wifi, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n";
import { useState, useEffect } from "react";
import { GSIStore, User as GSIUser } from "@/lib/store";
import { toast } from "sonner";
import dynamic from "next/dynamic";

// Dynamic import for the viewer to avoid SSR issues with pdfjs and mammoth
const GSIViewer = dynamic(() => import("./gsi-viewer").then(mod => mod.GSIViewer), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex flex-col items-center justify-center bg-gray-50">
       <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  )
});

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { t } = useLanguage();
  const pathname = usePathname();
  const [user, setUser] = useState<GSIUser | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  const [viewerData, setViewerData] = useState<{ id: string, url: string, type: string, originalUrl?: string } | null>(null);
  const [viewerLoading, setViewerLoading] = useState(true);

  useEffect(() => {
    setUser(GSIStore.getCurrentUser());

    // Request permissions for notifications
    if (typeof window !== 'undefined' && 'Capacitor' in window) {
       import('@capacitor/local-notifications').then(ln => {
          ln.LocalNotifications.requestPermissions();
       });
    }

    // Register Service Worker for PWA (Web only)
    if (typeof window !== 'undefined' && !('Capacitor' in window)) {
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('/apk/sw.js').catch(err => console.log('SW registration failed: ', err));
        });
      }
    }

    const handleOpen = (e: any) => {
      setViewerLoading(true);
      setViewerData(e.detail);
      // Safety timeout to prevent infinite loading screen
      setTimeout(() => setViewerLoading(false), 8000);
    };
    window.addEventListener('gsi-open-viewer', handleOpen);

    const unsubSync = GSIStore.subscribeSyncStatus((s) => setIsSyncing(s));

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('gsi-open-viewer', handleOpen);
      unsubSync();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const navItems = [
    { icon: Home, label: t("accueil"), href: "/" },
    { icon: Calendar, label: t("planning"), href: "/schedule/" },
    { icon: BookOpen, label: t("matieres"), href: "/subjects/" },
    { icon: Library, label: t("biblio"), href: "/library/" },
    { icon: Users, label: t("community"), href: "/community/" },
    { icon: User, label: t("profil"), href: "/profile/" },
  ];

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden relative">
      {/* Desktop Sidebar Navigation */}
      <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-slate-200 shadow-sm z-30">
        <div className="p-8 flex items-center gap-3 border-b border-slate-50">
           <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
              <BookOpen size={20} className="text-white" />
           </div>
           <div>
              <h1 className="text-sm font-black uppercase tracking-widest text-slate-800">GSI Insight</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Platforme Web</p>
           </div>
        </div>

        <nav className="flex-1 p-6 space-y-2">
           {navItems.map((item) => {
             const isActive = pathname === item.href || (item.href !== '/' && pathname === item.href.slice(0, -1));
             return (
               <Link
                 key={item.href}
                 href={item.href}
                 className={cn(
                   "flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all group",
                   isActive
                    ? "bg-primary text-white shadow-xl shadow-primary/20"
                    : "text-slate-500 hover:bg-slate-50 hover:text-primary"
                 )}
               >
                 <item.icon size={20} className={cn(isActive ? "text-white" : "text-slate-400 group-hover:text-primary")} />
                 <span className="text-sm font-bold tracking-tight">{item.label}</span>
                 {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/40"></div>}
               </Link>
             );
           })}
        </nav>

        <div className="p-6 border-t border-slate-50">
           <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse"></div>
              <div className="flex-1">
                 <div className="h-2 w-20 bg-slate-200 rounded mb-1"></div>
                 <div className="h-1.5 w-12 bg-slate-100 rounded"></div>
              </div>
           </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col relative h-full">
        {/* Top Status Bar (Integrated) */}
        <div className="absolute top-0 left-0 right-0 h-1 z-[60] flex">
           {isSyncing && (
              <div className="h-full bg-accent animate-pulse w-full shadow-[0_0_10px_rgba(255,107,0,0.5)]"></div>
           )}
        </div>

        <div className="absolute top-4 right-4 z-[60] pointer-events-none flex items-center gap-3">
           {isSyncing && <div className="text-[10px] font-black text-accent uppercase tracking-widest hidden lg:block bg-white/80 backdrop-blur px-3 py-1 rounded-full border border-accent/20">Synchronisation...</div>}
           <div className={cn(
              "px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-tight flex items-center gap-2 transition-all duration-500 backdrop-blur-md border shadow-sm",
              !isOnline ? "bg-red-500 text-white border-red-400" :
              isSyncing ? "bg-accent text-white border-accent-400 scale-105" :
              "bg-white text-emerald-600 border-emerald-100"
           )}>
              {!isOnline ? <WifiOff size={12} /> : <Wifi size={12} className={cn(isSyncing && "animate-ping")} />}
              <span>{!isOnline ? "Mode Hors-ligne" : isSyncing ? "Connecté" : "Serveur GSI Actif"}</span>
           </div>
        </div>

        {/* Content Area with dynamic width for Desktop */}
        <main className="flex-1 overflow-y-auto pb-20 lg:pb-0 scroll-smooth">
          <div className="max-w-md lg:max-w-5xl mx-auto h-full lg:px-8">
            <div className="bg-white lg:min-h-full shadow-2xl shadow-slate-200/50 lg:border-x border-slate-100 relative">
              {children}
            </div>
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gray-100 px-4 py-3 flex justify-between items-center z-40 safe-bottom">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname === item.href.slice(0, -1));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 p-2 rounded-2xl transition-all active:scale-90",
                  isActive ? "text-primary bg-primary/5 px-4" : "text-gray-400"
                )}
              >
                <item.icon size={22} className={isActive ? "text-primary" : "text-gray-400"} />
                <span className="text-[9px] font-black uppercase tracking-widest">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Floating Action Button for Ask Insight */}
        {!pathname.includes('chat') && !pathname.includes('community') && (
          <Link
            href="/chat/"
            className="fixed bottom-24 right-4 lg:bottom-12 lg:right-12 bg-accent text-white p-5 rounded-[2rem] shadow-2xl hover:scale-110 hover:rotate-6 active:scale-95 transition-all z-20 shadow-accent/40"
          >
            <MessageCircle size={28} />
          </Link>
        )}
      </div>

      {/* In-App Global Viewer */}
      {viewerData && (
        <div className="fixed inset-0 bg-black z-[100] flex flex-col animate-in slide-in-from-bottom duration-300">
           <div className="p-4 bg-gray-900 text-white flex justify-between items-center safe-top">
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <Maximize2 size={16} />
                 </div>
                 <div>
                    <span className="text-[10px] font-black uppercase tracking-widest block">Lecteur GSI</span>
                    <span className="text-[8px] font-bold text-gray-400 uppercase">Document Sécurisé</span>
                 </div>
              </div>
              <button onClick={() => setViewerData(null)} className="p-3 bg-white/10 rounded-xl active:scale-90 transition-all">
                 <X size={20} />
              </button>
           </div>
           <div className="flex-1 bg-white relative overflow-hidden">
              <GSIViewer
                id={viewerData.id}
                url={viewerData.url}
                type={viewerData.type as any}
                onLoadComplete={() => setViewerLoading(false)}
                onError={(err) => {
                  setViewerLoading(false);
                  toast.error(err);
                }}
              />
           </div>
           <div className="p-4 bg-gray-900 flex justify-between items-center px-6">
              <button
                onClick={() => {
                   GSIStore.saveProgress(viewerData.id, { completed: true, percent: 100 });
                   toast.success("Leçon terminée ! Progression mise à jour.");
                   setViewerData(null);
                }}
                className={cn(
                  "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                  GSIStore.getProgress(viewerData.id)?.completed ? "bg-emerald-500 text-white" : "bg-white/10 text-gray-400 hover:text-white"
                )}
              >
                {GSIStore.getProgress(viewerData.id)?.completed ? "Terminé ✓" : "Terminer la leçon"}
              </button>
              <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">© Groupe GSI — Confidentialité Totale</p>
           </div>
        </div>
      )}
    </div>
  );
}
