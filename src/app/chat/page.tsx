"use client";

import { AppLayout } from "@/components/app-layout";
import { useState } from "react";
import { Send, User, Sparkles, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function ChatPage() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Bonjour Liana ! Je suis Insight, votre assistant académique GSI. Comment puis-je vous aider aujourd'hui ?" },
  ]);
  const [input, setInput] = useState("");

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");

    // Simple mock response for MVP (Client-side to work in APK)
    let responseText = "Je suis Insight, votre assistant académique GSI. ";

    if (input.toLowerCase().includes("cours")) {
      responseText += "Votre prochain cours est la Physique à 09h30 en salle 102.";
    } else if (input.toLowerCase().includes("devoir") || input.toLowerCase().includes("tâche")) {
      responseText += "Vous avez un devoir de Géographie à rendre pour demain.";
    } else if (input.toLowerCase().includes("examen")) {
      responseText += "Les examens de mi-semestre commencent le 15 Octobre.";
    } else {
      responseText += "Comment puis-je vous aider davantage dans votre parcours à GSI Internationale ?";
    }

    setTimeout(() => {
      setMessages([...newMessages, { role: "assistant", content: responseText }]);
    }, 500);
  };

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-white shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-primary p-6 text-white flex items-center gap-4">
        <Link href="/">
          <ChevronLeft size={24} />
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
            <Sparkles size={20} />
          </div>
          <div>
            <h1 className="font-bold">Ask Insight</h1>
            <p className="text-[10px] opacity-80">En ligne • Assistant IA</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50">
        {messages.map((m, i) => (
          <div key={i} className={cn(
            "flex flex-col",
            m.role === "user" ? "items-end" : "items-start"
          )}>
            <div className={cn(
              "max-w-[80%] p-4 rounded-3xl text-sm shadow-sm",
              m.role === "user"
                ? "bg-primary text-white rounded-tr-none"
                : "bg-white text-gray-800 rounded-tl-none border border-gray-100"
            )}>
              {m.content}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-gray-100 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Posez votre question..."
          className="flex-1 bg-gray-100 rounded-2xl px-4 py-3 outline-none text-sm"
        />
        <button
          onClick={handleSend}
          className="bg-primary text-white p-3 rounded-2xl hover:scale-105 transition-transform"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
}
