"use client";

import { AppLayout } from "@/components/app-layout";
import { CreditCard, FileText, Clock, CheckCircle, AlertCircle, ChevronRight, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ServicesPage() {
  const requests = [
    { id: "REQ-001", type: "Attestation de scolarité", status: "Validé", date: "12 Sept 2024", color: "text-green-500", bg: "bg-green-100" },
    { id: "REQ-002", type: "Relevé de notes (S2)", status: "En cours", date: "15 Sept 2024", color: "text-orange-500", bg: "bg-orange-100" },
  ];

  const payments = [
    { title: "Frais d'inscription", amount: "150.000 FCFA", status: "Payé", date: "01 Sept 2024" },
    { title: "Scolarité - Échéance 1", amount: "300.000 FCFA", status: "Payé", date: "05 Sept 2024" },
    { title: "Scolarité - Échéance 2", amount: "300.000 FCFA", status: "En attente", date: "01 Oct 2024" },
  ];

  return (
    <AppLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Services Admin</h1>

        <section className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">Demandes de documents</h2>
            <button className="bg-primary text-white p-2 rounded-xl">
              <Plus size={20} />
            </button>
          </div>
          <div className="space-y-3">
            {requests.map((req) => (
              <div key={req.id} className="bg-white p-4 rounded-2xl border border-gray-100 flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">{req.type}</h3>
                    <p className="text-[10px] text-gray-400">{req.id} • {req.date}</p>
                  </div>
                </div>
                <div className={cn("px-3 py-1 rounded-full text-[10px] font-bold", req.bg, req.color)}>
                  {req.status}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold mb-4">Paiements & Reçus</h2>
          <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm">
            {payments.map((p, i) => (
              <div key={i} className={cn(
                "p-4 flex justify-between items-center",
                i !== payments.length - 1 && "border-bottom border-gray-50"
              )}>
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    p.status === "Payé" ? "bg-green-50 text-green-500" : "bg-red-50 text-red-500"
                  )}>
                    <CreditCard size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">{p.title}</h4>
                    <p className="text-[10px] text-gray-400">{p.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm">{p.amount}</p>
                  <p className={cn(
                    "text-[10px] font-bold",
                    p.status === "Payé" ? "text-green-500" : "text-red-500"
                  )}>{p.status}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 flex gap-4">
          <AlertCircle className="text-blue-500 shrink-0" size={24} />
          <div>
            <h4 className="font-bold text-sm text-blue-900 mb-1">Besoin d'aide ?</h4>
            <p className="text-xs text-blue-800 opacity-80 mb-3">Pour toute erreur sur vos paiements ou documents, veuillez contacter le service scolarité.</p>
            <button className="text-blue-600 text-xs font-bold underline">Contacter le support</button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
