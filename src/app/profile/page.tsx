"use client";

import { AppLayout } from "@/components/app-layout";
import { Settings, ChevronRight, CreditCard, FileCheck, Award, LogOut, QrCode, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

export default function ProfilePage() {
  const [showQr, setShowQr] = useState(false);

  return (
    <AppLayout>
      <div className="bg-primary pt-12 pb-24 px-6 rounded-b-[40px] relative">
        <div className="flex justify-between items-start mb-8">
          <h1 className="text-2xl font-bold text-white">Mon profil</h1>
          <div className="flex gap-2">
            <button className="bg-white/20 p-2 rounded-lg text-white">
              <Settings size={20} />
            </button>
            <button
              onClick={() => setShowQr(true)}
              className="bg-white/20 p-2 rounded-lg text-white"
            >
              <QrCode size={20} />
            </button>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden mb-4 shadow-lg">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Liana" alt="Profile" />
          </div>
          <h2 className="text-2xl font-bold text-white">Liana G. Internationale</h2>
          <p className="text-white/70 text-sm">Informatique • Niveau 3</p>
        </div>
      </div>

      <div className="px-6 -mt-16">
        <div className="bg-white rounded-[32px] p-6 shadow-xl mb-6 grid grid-cols-2 gap-4">
          <div className="flex flex-col items-center p-4 bg-gray-50 rounded-2xl">
            <Award className="text-primary mb-2" size={24} />
            <span className="text-xs font-bold">Réussites</span>
          </div>
          <div className="flex flex-col items-center p-4 bg-gray-50 rounded-2xl">
            <FileCheck className="text-accent mb-2" size={24} />
            <span className="text-xs font-bold">Demandes</span>
          </div>
        </div>

        <div className="space-y-2 mb-8">
          <h3 className="text-lg font-bold px-2 mb-4">Paramètres du compte</h3>
          <ProfileLink icon={CreditCard} label="Paiements & Reçus" color="text-blue-500" />
          <ProfileLink icon={FileCheck} label="Documents Administratifs" color="text-green-500" />
          <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-3xl p-6 text-white mb-4 mt-4 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-bold text-lg">Career Insight</h4>
              <Award size={24} />
            </div>
            <p className="text-xs opacity-90 mb-4">Nouvelles opportunités de stage disponibles chez les partenaires GSI !</p>
            <button className="bg-white text-primary px-4 py-2 rounded-xl text-xs font-bold">
              Voir les opportunités
            </button>
          </div>
          <ProfileLink icon={Settings} label="Préférences" color="text-gray-500" />
        </div>

        <button className="w-full flex items-center justify-center gap-2 py-4 text-red-500 font-bold bg-red-50 p-4 rounded-2xl mb-8">
          <LogOut size={20} />
          <span>Déconnexion</span>
        </button>
      </div>

      {/* QR Code Modal */}
      {showQr && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6 backdrop-blur-sm">
          <div className="bg-white rounded-[40px] w-full max-w-xs p-8 flex flex-col items-center relative">
            <button
              onClick={() => setShowQr(false)}
              className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full text-gray-500"
            >
              <X size={20} />
            </button>
            <h3 className="text-xl font-bold mb-2">Carte Étudiant</h3>
            <p className="text-gray-500 text-sm mb-8">Liana G. Internationale</p>
            <div className="bg-gray-50 p-6 rounded-[32px] border-4 border-primary/10 mb-8">
              <QrCode size={180} className="text-primary" />
            </div>
            <p className="text-center text-xs text-gray-400">Scannez ce code à l'entrée du campus ou pour les services de la bibliothèque.</p>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

function ProfileLink({ icon: Icon, label, color }: { icon: any, label: string, color: string }) {
  return (
    <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors rounded-2xl border border-transparent hover:border-gray-100">
      <div className="flex items-center gap-4">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center bg-gray-100", color)}>
          <Icon size={20} />
        </div>
        <span className="font-semibold text-gray-700">{label}</span>
      </div>
      <ChevronRight size={20} className="text-gray-400" />
    </button>
  );
}
