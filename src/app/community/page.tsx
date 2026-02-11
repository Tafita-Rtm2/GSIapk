"use client";

import { AppLayout } from "@/components/app-layout";
import { useLanguage } from "@/lib/i18n";
import { Send, Users, Sparkles, MessageSquare, Clock } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { GSIStore, ChatMessage, User } from "@/lib/store";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/page-header";

export default function CommunityPage() {
  const { t } = useLanguage();
  const [user, setUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const u = GSIStore.getCurrentUser();
    setUser(u);

    const unsub = GSIStore.subscribeMessages((ms) => {
      setMessages(ms);
      setTimeout(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }, 100);
    });

    return () => unsub();
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const text = input.trim();
    setInput("");
    await GSIStore.sendMessage(text);
  };

  if (!user) return null;

  return (
    <AppLayout>
      <div className="flex flex-col h-full bg-[#F8FAFC]">
        <div className="p-6 bg-white border-b border-gray-100 flex items-center justify-between">
           <div>
              <h1 className="text-xl font-black text-gray-900 uppercase tracking-tight">Communauté</h1>
              <p className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest">{user.filiere} • {user.niveau}</p>
           </div>
           <div className="bg-indigo-50 px-3 py-1 rounded-full flex items-center gap-2">
              <Users size={12} className="text-indigo-600" />
              <span className="text-[10px] font-black text-indigo-600">En ligne</span>
           </div>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
           {messages.map((m, i) => (
             <div key={i} className={cn(
               "flex flex-col animate-in fade-in slide-in-from-bottom-2",
               m.senderId === user.id ? "items-end" : "items-start"
             )}>
                <div className="flex items-center gap-2 mb-1 px-1">
                   {m.senderId !== user.id && (
                      <span className="text-[9px] font-black text-gray-400 uppercase">{m.senderName}</span>
                   )}
                   <span className="text-[7px] text-gray-300 font-bold">{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className={cn(
                  "max-w-[80%] p-4 rounded-[24px] text-sm font-medium shadow-sm",
                  m.senderId === user.id
                    ? "bg-indigo-600 text-white rounded-tr-none shadow-indigo-100"
                    : "bg-white text-gray-800 rounded-tl-none border border-gray-100"
                )}>
                   {m.text}
                </div>
             </div>
           ))}
           {messages.length === 0 && (
             <div className="flex flex-col items-center justify-center h-full opacity-20">
                <MessageSquare size={48} className="mb-4" />
                <p className="text-xs font-black uppercase">Aucun message</p>
             </div>
           )}
        </div>

        <div className="p-4 bg-white border-t border-gray-100 flex gap-2">
           <form onSubmit={handleSend} className="flex-1 flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Discutez avec votre promo..."
                className="flex-1 bg-gray-50 rounded-2xl px-5 py-4 text-sm font-medium outline-none focus:ring-2 ring-indigo-500/10 transition-all"
              />
              <button type="submit" disabled={!input.trim()} className="bg-indigo-600 text-white p-4 rounded-2xl shadow-lg shadow-indigo-100 active:scale-95 transition-all disabled:opacity-50">
                 <Send size={20} />
              </button>
           </form>
        </div>
      </div>
    </AppLayout>
  );
}
