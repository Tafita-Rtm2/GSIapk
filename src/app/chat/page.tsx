"use client";

import { AppLayout } from "@/components/app-layout";
import { useState } from "react";
import { Send, User, Sparkles, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function ChatPage() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hello Liana! I am Insight, your GSI academic assistant. How can I help you today?" },
  ]);
  const [input, setInput] = useState("");

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");

    // Call API
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });
      const data = await response.json();
      setMessages([...newMessages, { role: "assistant", content: data.text || data.error }]);
    } catch (error) {
      setMessages([...newMessages, { role: "assistant", content: "Sorry, I'm having trouble connecting right now." }]);
    }
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
            <p className="text-[10px] opacity-80">Online • AI Assistant</p>
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
          placeholder="Ask anything..."
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
