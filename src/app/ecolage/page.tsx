"use client";

import { AppLayout } from "@/components/app-layout";
import { ChevronLeft, Receipt, Calendar, CreditCard, CheckCircle2, Download, ExternalLink, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { GSIStore, User, Ecolage } from "@/lib/store";
import Link from "next/link";

export default function EcolagePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [ecolages, setEcolages] = useState<Ecolage[]>([]);
  const [selectedReceipt, setSelectedReceipt] = useState<Ecolage | null>(null);

  useEffect(() => {
    const currentUser = GSIStore.getCurrentUser();
    if (!currentUser) {
      router.push("/login");
      return;
    }
    setUser(currentUser);

    return GSIStore.subscribeEcolages(currentUser.id, (data) => {
      setEcolages(data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    });
  }, [router]);

  if (!user) return null;

  return (
    <AppLayout>
      <div className="p-6 pb-24 max-w-md mx-auto min-h-screen bg-gray-50">
        <div className="flex items-center gap-4 mb-8">
           <Link href="/profile" className="p-2 bg-white shadow-sm rounded-full text-gray-500 active:scale-90 transition-transform">
              <ChevronLeft size={20} />
           </Link>
           <div>
              <h1 className="text-2xl font-black text-gray-800 tracking-tight">Mes Écolages</h1>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Historique des paiements</p>
           </div>
        </div>

        {/* Total Summary Card */}
        <div className="bg-indigo-600 rounded-[32px] p-6 text-white mb-8 shadow-xl shadow-indigo-100 relative overflow-hidden">
           <div className="relative z-10">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-1">Situation actuelle</p>
              <h2 className="text-3xl font-black mb-4">À jour</h2>
              <div className="flex justify-between items-center bg-white/10 rounded-2xl p-4 backdrop-blur-sm border border-white/10">
                 <div>
                    <p className="text-[9px] font-bold opacity-60 uppercase">Dernier paiement</p>
                    <p className="text-sm font-black">{ecolages[0]?.month || "Aucun"} • {ecolages[0]?.amount || "0 Ar"}</p>
                 </div>
                 <CheckCircle2 size={24} className="text-emerald-400" />
              </div>
           </div>
           <div className="absolute right-[-20px] top-[-20px] w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
        </div>

        <section>
          <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4 px-2">Liste des reçus</h3>
          
          <div className="space-y-3">
            {ecolages.map((eco) => (
              <button
                key={eco.id}
                onClick={() => setSelectedReceipt(eco)}
                className="w-full bg-white p-5 rounded-[28px] border border-gray-100 flex justify-between items-center shadow-sm active:scale-[0.97] transition-all group"
              >
                <div className="flex items-center gap-4 text-left">
                  <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-indigo-500 group-hover:bg-indigo-50 transition-colors">
                    <Receipt size={24} />
                  </div>
                  <div>
                    <h4 className="font-black text-sm text-gray-800 uppercase tracking-tight">{eco.month}</h4>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">{new Date(eco.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                </div>
                <div className="text-right">
                   <p className="font-black text-sm text-gray-900">{eco.amount}</p>
                   <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-full mt-1 inline-block">Payé</p>
                </div>
              </button>
            ))}

            {ecolages.length === 0 && (
              <div className="py-20 flex flex-col items-center text-center">
                 <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-300 mb-4">
                    <Receipt size={24} />
                 </div>
                 <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest italic leading-relaxed max-w-[200px]">
                    Aucun historique de paiement disponible pour le moment.
                 </p>
              </div>
            )}
          </div>
        </section>

        {/* Receipt Detail Modal */}
        {selectedReceipt && (
          <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-300">
             <div className="bg-white rounded-[40px] w-full max-w-sm overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-300">
                <div className="p-8 bg-indigo-600 text-white relative">
                   <button
                     onClick={() => setSelectedReceipt(null)}
                     className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-2xl text-white transition-colors"
                   >
                     <X size={20} />
                   </button>
                   
                   <div className="flex flex-col items-center text-center mt-4">
                      <div className="w-16 h-16 bg-white/20 rounded-[22px] flex items-center justify-center mb-4 backdrop-blur-md border border-white/20 shadow-lg">
                         <Receipt size={32} />
                      </div>
                      <h3 className="text-xl font-black uppercase tracking-tighter">Reçu de Paiement</h3>
                      <p className="text-[10px] font-bold opacity-60 uppercase tracking-[0.2em]">{selectedReceipt.reference}</p>
                   </div>
                </div>

                <div className="p-8">
                   <div className="space-y-6">
                      <div className="flex justify-between items-center pb-4 border-dashed border-b border-gray-100">
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
                               <Calendar size={14} />
                            </div>
                            <span className="text-[10px] font-black text-gray-400 uppercase">Période</span>
                         </div>
                         <span className="font-black text-sm text-gray-800 uppercase">{selectedReceipt.month}</span>
                      </div>

                      <div className="flex justify-between items-center pb-4 border-dashed border-b border-gray-100">
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
                               <CreditCard size={14} />
                            </div>
                            <span className="text-[10px] font-black text-gray-400 uppercase">Montant Versé</span>
                         </div>
                         <span className="font-black text-lg text-indigo-600">{selectedReceipt.amount}</span>
                      </div>

                      <div className="flex justify-between items-center pb-4 border-dashed border-b border-gray-100">
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
                               <CheckCircle2 size={14} />
                            </div>
                            <span className="text-[10px] font-black text-gray-400 uppercase">Statut</span>
                         </div>
                         <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                            Validé & Enregistré
                         </span>
                      </div>

                      <div className="bg-gray-50 rounded-2xl p-5 mt-4">
                         <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-3">Informations Étudiant</p>
                         <div className="flex items-center gap-3 mb-2">
                            <div className="w-6 h-6 rounded-lg bg-white border border-gray-200 overflow-hidden">
                               <img src={GSIStore.getAbsoluteUrl(user.photo) || `https://api.dicebear.com/7.x/initials/svg?seed=${user.fullName}`} className="w-full h-full object-cover" />
                            </div>
                            <p className="text-[11px] font-black text-gray-700 uppercase">{user.fullName}</p>
                         </div>
                         <p className="text-[9px] font-bold text-gray-400 uppercase leading-none">{user.filiere} — {user.niveau}</p>
                      </div>
                   </div>

                   <button className="w-full mt-8 py-5 bg-gray-900 text-white rounded-[24px] text-[10px] font-black uppercase tracking-widest shadow-xl shadow-gray-200 active:scale-95 transition-all flex items-center justify-center gap-3">
                      <Download size={16} />
                      Télécharger le reçu PDF
                   </button>
                   
                   <p className="mt-6 text-center text-[8px] text-gray-300 font-bold uppercase tracking-widest leading-loose">
                      Ce document est un reçu électronique officiel généré par le Groupe GSI. Toute modification est interdite.
                   </p>
                </div>
                <div className="h-2 bg-indigo-600 w-full"></div>
             </div>
          </div>
        )}

        <div className="mt-12 bg-indigo-50 border border-indigo-100 p-6 rounded-[32px] flex items-start gap-4">
           <div className="p-2.5 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-200">
              <Receipt size={20} />
           </div>
           <div>
              <h4 className="font-black text-indigo-900 text-xs uppercase tracking-tight mb-1">Besoin d'aide ?</h4>
              <p className="text-[10px] text-indigo-600 font-medium leading-relaxed mb-3">
                 Pour toute erreur constatée sur vos paiements, veuillez contacter le bureau scolarité muni de votre reçu physique.
              </p>
              <button className="text-[9px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2 hover:underline">
                 Contacter le support <ExternalLink size={10} />
              </button>
           </div>
        </div>
      </div>
    </AppLayout>
  );
}
