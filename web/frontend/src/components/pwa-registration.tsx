"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";

export function PWARegistration() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then((registration) => {
          console.log('SW registered: ', registration);
        }).catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
      });
      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setShowInstallBtn(true);
      });

      window.addEventListener('appinstalled', () => {
        setDeferredPrompt(null);
        setShowInstallBtn(false);
        toast.success("GSI Insight installé avec succès !");
      });
    }
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowInstallBtn(false);
    }
  };

  if (!showInstallBtn) return null;

  return (
    <div className="fixed bottom-24 left-6 right-6 z-[60] animate-in slide-in-from-bottom duration-500">
      <div className="bg-white p-5 rounded-[32px] border border-indigo-100 shadow-2xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <Download size={20} />
          </div>
          <div>
            <h4 className="text-[11px] font-black uppercase text-gray-800">Installer GSI Insight</h4>
            <p className="text-[9px] font-bold text-gray-400 uppercase">Accès rapide sur votre écran d'accueil</p>
          </div>
        </div>
        <button
          onClick={handleInstallClick}
          className="bg-gray-900 text-white px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-md"
        >
          Installer
        </button>
      </div>
    </div>
  );
}
