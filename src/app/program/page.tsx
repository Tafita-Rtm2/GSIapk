"use client";

import { AppLayout } from "@/components/app-layout";
import { useState, useEffect } from "react";
import { Clock, Plus, Trash2, Bell, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";

interface ProgramItem {
  id: string;
  title: string;
  time: string;
  days: string[];
}

export default function ProgramPage() {
  const [items, setItems] = useState<ProgramItem[]>([]);
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('gsi_study_program');
    if (saved) setItems(JSON.parse(saved));
  }, []);

  const save = (newItems: ProgramItem[]) => {
    setItems(newItems);
    localStorage.setItem('gsi_study_program', JSON.stringify(newItems));
  };

  const addItem = (e: any) => {
    e.preventDefault();
    const newItem: ProgramItem = {
      id: Math.random().toString(36).substr(2, 9),
      title: e.target.title.value,
      time: e.target.time.value,
      days: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven']
    };
    save([...items, newItem]);
    setShowAdd(false);
    toast.success("Session ajoutée au programme !");
  };

  const deleteItem = (id: string) => {
    save(items.filter(i => i.id !== id));
    toast.info("Session supprimée.");
  };

  return (
    <AppLayout>
      <div className="p-6 pb-24">
        <PageHeader title="Mon Programme" onBack={() => router.push("/")} />

        <div className="bg-indigo-600 rounded-[32px] p-6 text-white mb-8 shadow-lg relative overflow-hidden">
           <div className="relative z-10">
              <h2 className="font-bold text-lg mb-2">Planification Intelligente</h2>
              <p className="text-xs opacity-80 mb-4">L'IA de GSI Insight vous alertera automatiquement pour vos sessions d'étude.</p>
              <button
                onClick={() => setShowAdd(true)}
                className="bg-white text-indigo-600 px-6 py-2 rounded-xl text-xs font-bold active:scale-95 transition-transform"
              >
                + Ajouter une session
              </button>
           </div>
           <Bell className="absolute right-[-10px] top-[-10px] w-24 h-24 opacity-10 rotate-12" />
        </div>

        <div className="space-y-4">
           {items.map(item => (
              <div key={item.id} className="bg-white p-5 rounded-3xl border border-gray-100 flex justify-between items-center shadow-sm">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                       <Clock size={24} />
                    </div>
                    <div>
                       <h4 className="font-bold text-gray-800">{item.title}</h4>
                       <p className="text-xs text-gray-400 font-medium">{item.time} • {item.days.join(', ')}</p>
                    </div>
                 </div>
                 <button onClick={() => deleteItem(item.id)} className="text-rose-400 p-2">
                    <Trash2 size={20} />
                 </button>
              </div>
           ))}
           {items.length === 0 && (
              <div className="text-center py-20 text-gray-400">
                 <Clock size={40} className="mx-auto mb-4 opacity-20" />
                 <p className="text-sm font-medium">Aucune session programmée.</p>
              </div>
           )}
        </div>
      </div>

      {showAdd && (
         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <div className="bg-white w-full max-w-xs rounded-[32px] p-8 animate-in zoom-in-95">
               <h3 className="text-xl font-bold mb-6">Nouvelle Session</h3>
               <form onSubmit={addItem} className="space-y-4">
                  <input name="title" required className="w-full bg-gray-50 border-none rounded-xl p-4 text-sm outline-none" placeholder="Titre (ex: Révision Maths)" />
                  <input name="time" type="time" required className="w-full bg-gray-50 border-none rounded-xl p-4 text-sm outline-none" />
                  <div className="flex gap-2 pt-4">
                     <button type="button" onClick={() => setShowAdd(false)} className="flex-1 py-4 text-gray-400 font-bold">Annuler</button>
                     <button type="submit" className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg">Ajouter</button>
                  </div>
               </form>
            </div>
         </div>
      )}
    </AppLayout>
  );
}
