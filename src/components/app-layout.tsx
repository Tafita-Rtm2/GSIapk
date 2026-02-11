"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calendar, BookOpen, Library, User, MessageCircle, Users, X, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n";
import { useState, useEffect } from "react";
import { GSIStore, User as GSIUser } from "@/lib/store";
import { toast } from "sonner";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { t } = useLanguage();
  const pathname = usePathname();
  const [user, setUser] = useState<GSIUser | null>(null);

  const [viewerData, setViewerData] = useState<{ url: string, type: string } | null>(null);

  useEffect(() => {
    setUser(GSIStore.getCurrentUser());
    const handleOpen = (e: any) => setViewerData(e.detail);
    window.addEventListener('gsi-open-viewer', handleOpen);
    return () => window.removeEventListener('gsi-open-viewer', handleOpen);
  }, []);

  const navItems = [
    { icon: Home, label: t("accueil"), href: "/" },
    { icon: Calendar, label: t("planning"), href: "/schedule" },
    { icon: BookOpen, label: t("matieres"), href: "/subjects" },
    { icon: Library, label: t("biblio"), href: "/library" },
    { icon: Users, label: t("community"), href: "/community" },
    { icon: User, label: t("profil"), href: "/profile" },
  ];

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-background shadow-xl overflow-hidden relative">
      <main className="flex-1 overflow-y-auto pb-20">
        {children}
      </main>

      <nav className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 flex justify-between items-center z-10">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center p-2 rounded-lg transition-all active:scale-90",
                isActive ? "text-primary scale-110" : "text-gray-500"
              )}
            >
              <item.icon size={24} />
              <span className="text-[10px] mt-1 font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Floating Action Button for Ask Insight */}
      {!pathname.includes('chat') && (
        <Link
          href="/chat"
          className="absolute bottom-24 right-4 bg-accent text-white p-4 rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all z-20"
        >
          <MessageCircle size={24} />
        </Link>
      )}

      {/* In-App Global Viewer */}
      {viewerData && (
        <div className="fixed inset-0 bg-black z-[100] flex flex-col animate-in slide-in-from-bottom duration-300">
           <div className="p-4 bg-gray-900 text-white flex justify-between items-center safe-top">
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <Maximize2 size={16} />
                 </div>
                 <span className="text-[10px] font-black uppercase tracking-widest">Lecteur GSI Insight</span>
              </div>
              <button onClick={() => setViewerData(null)} className="p-3 bg-white/10 rounded-xl active:scale-90 transition-all">
                 <X size={20} />
              </button>
           </div>
           <div className="flex-1 bg-white relative overflow-hidden">
              {viewerData.type === 'pdf' ? (
                 <iframe
                   src={`${viewerData.url}#toolbar=0&navpanes=0&scrollbar=0`}
                   className="w-full h-full border-none"
                   title="GSI Reader"
                 />
              ) : (
                 <video
                   src={viewerData.url}
                   controls
                   autoPlay
                   className="w-full h-full bg-black object-contain"
                 />
              )}
           </div>
           <div className="p-4 bg-gray-900 text-center">
              <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">© Groupe GSI — Confidentialité Totale</p>
           </div>
        </div>
      )}
    </div>
  );
}
