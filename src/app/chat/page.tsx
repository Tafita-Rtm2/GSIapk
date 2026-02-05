"use client";

import { useState, useEffect } from "react";
import { Send, Sparkles, ChevronLeft, X } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { GSIStore, User } from "@/lib/store";

export default function ChatPage() {
  const [user, setUser] = useState<User | null>(null);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Bonjour ! Je suis Insight, votre assistant académique GSI. Comment puis-je vous aider aujourd'hui ?" },
  ]);
  const [input, setInput] = useState("");

  useEffect(() => {
    const currentUser = GSIStore.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setMessages([
        { role: "assistant", content: `Bonjour ${currentUser.fullName.split(' ')[0]} ! Je suis Insight, votre assistant académique GSI. Comment puis-je vous aider aujourd'hui ?` },
      ]);
    }
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    const userQuery = input.toLowerCase();
    setInput("");

    // AI Logic (Client-side for offline usage)
    let responseText = "";

    if (userQuery.includes("bonjour") || userQuery.includes("salut")) {
      responseText = `Bonjour ${user?.fullName.split(' ')[0]} ! Ravie de vous voir. Que voulez-vous savoir sur votre parcours à GSI ?`;
    } else if (userQuery.includes("prochain") && userQuery.includes("cours")) {
      responseText = "Votre prochain cours est prévu aujourd'hui à 14h00. Vous pouvez consulter votre emploi du temps complet dans l'onglet 'Planning'.";
    } else if (userQuery.includes("cours") || userQuery.includes("leçon") || userQuery.includes("matière")) {
      const lessons = GSIStore.getLessons().filter(l => l.niveau === user?.niveau);
      if (lessons.length > 0) {
        responseText = `Vous avez ${lessons.length} leçons disponibles. La plus récente est "${lessons[0].title}" en ${lessons[0].subject}.`;
      } else {
        responseText = `Aucun support de cours n'est encore publié pour votre niveau (${user?.niveau}).`;
      }
    } else if (userQuery.includes("devoir") || userQuery.includes("tâche") || userQuery.includes("rendre")) {
      const assignments = GSIStore.getAssignments().filter(a => a.niveau === user?.niveau);
      if (assignments.length > 0) {
        responseText = `Vous avez ${assignments.length} devoirs à rendre. Le plus urgent est "${assignments[0].title}" pour le ${assignments[0].deadline}.`;
      } else {
        responseText = "Bonne nouvelle ! Aucun devoir n'est en attente pour le moment.";
      }
    } else if (userQuery.includes("note") || userQuery.includes("moyenne") || userQuery.includes("performance")) {
      const grades = GSIStore.getGrades().filter(g => g.studentId === user?.id);
      if (grades.length > 0) {
        const avg = (grades.reduce((acc, g) => acc + g.score, 0) / grades.length).toFixed(2);
        responseText = `Votre moyenne actuelle est de ${avg}/20. Votre meilleure note est ${Math.max(...grades.map(g => g.score))}/20.`;
      } else {
        responseText = "Aucune note n'a encore été enregistrée dans votre dossier.";
      }
    } else if (userQuery.includes("paiement") || userQuery.includes("argent") || userQuery.includes("frais")) {
      responseText = "D'après mes dossiers, vos frais d'inscription sont à jour. Pour le prochain écolage, rendez-vous dans 'Services' > 'Paiements'.";
    } else if (userQuery.includes("campus") || userQuery.includes("où")) {
      responseText = `Vous êtes au ${user?.campus}. GSI Internationale dispose de 4 campus : Antananarivo, Antsirabe, Bypass et Tamatave.`;
    } else if (userQuery.includes("document") || userQuery.includes("attestation") || userQuery.includes("certificat")) {
      responseText = "Vous pouvez demander une attestation de scolarité ou un relevé de notes directement depuis votre Profil > Services > Documents.";
    } else {
      responseText = "Je suis Insight, l'IA de GSI. Je peux vous renseigner sur vos cours, devoirs, notes, paiements et documents administratifs. Posez-moi une question précise !";
    }

    setTimeout(() => {
      setMessages([...newMessages, { role: "assistant", content: responseText }]);
    }, 600);
  };

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-white shadow-xl overflow-hidden relative">
      {/* Header */}
      <div className="bg-primary p-6 text-white flex items-center gap-4 shadow-lg z-10">
        <Link href="/" className="hover:scale-110 transition-transform">
          <ChevronLeft size={24} />
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md">
            <Sparkles size={20} />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">Ask Insight</h1>
            <p className="text-[10px] opacity-80 font-medium">En ligne • Assistant IA GSI</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50">
        {messages.map((m, i) => (
          <div key={i} className={cn(
            "flex flex-col animate-in fade-in slide-in-from-bottom-2",
            m.role === "user" ? "items-end" : "items-start"
          )}>
            <div className={cn(
              "max-w-[85%] p-4 rounded-[24px] text-sm font-medium shadow-sm",
              m.role === "user"
                ? "bg-primary text-white rounded-tr-none shadow-primary/20"
                : "bg-white text-gray-800 rounded-tl-none border border-gray-100"
            )}>
              {m.content}
            </div>
            <span className="text-[8px] text-gray-300 mt-1 px-2 uppercase font-black">
              {m.role === 'user' ? 'Vous' : 'Insight'}
            </span>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-gray-100 flex gap-2 items-center">
        <div className="flex-1 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Posez votre question..."
            className="w-full bg-gray-100 rounded-2xl px-5 py-4 outline-none text-sm font-medium focus:ring-2 ring-primary/20 transition-all"
          />
          {input && (
             <button onClick={() => setInput("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
               <X size={16} />
             </button>
          )}
        </div>
        <button
          onClick={handleSend}
          disabled={!input.trim()}
          className="bg-primary text-white p-4 rounded-2xl shadow-lg shadow-primary/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
}
