"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Sparkles, ChevronLeft, X, Copy, Check, Image as ImageIcon, Loader2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { GSIStore, User } from "@/lib/store";
import { PageHeader } from "@/components/page-header";
import { toast } from "sonner";
import OpenAI from "openai";
import ReactMarkdown from 'react-markdown';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  image?: string | null;
}

export default function ChatPage() {
  const [user, setUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const currentUser = GSIStore.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);

      // Load memory from local storage
      const saved = localStorage.getItem(`gsi_assistant_memory_${currentUser.id}`);
      if (saved) {
        try {
          setMessages(JSON.parse(saved));
        } catch (e) {
          console.error("Failed to load Agent Assistant memory", e);
        }
      } else {
        const campus = currentUser.campus || "Antananarivo (Analakely)";
        const filiere = currentUser.filiere || "Tourisme, Voyage & Hôtellerie";
        const firstName = currentUser.fullName.split(' ')[0] || "étudiant";

        setMessages([
          {
            role: "assistant",
            content: `Bonjour ${firstName} ! Je suis votre Agent Assistant GSI pour le campus de ${campus} (${filiere}). Je suis là pour vous accompagner personnellement dans votre réussite académique et répondre à toutes vos questions comme un véritable conseiller dévoué. Comment puis-je vous assister aujourd'hui ?`
          },
        ]);
      }
    }
  }, []);

  useEffect(() => {
    if (user && messages.length > 0) {
      localStorage.setItem(`gsi_assistant_memory_${user.id}`, JSON.stringify(messages));
    }
  }, [messages, user]);

  const handleSend = async () => {
    if ((!input.trim() && !attachedImage) || isTyping) return;

    const userMessage = input;
    const currentImage = attachedImage;

    const newMessages = [...messages, {
      role: "user" as const,
      content: userMessage,
      image: currentImage
    }];

    setMessages(newMessages);
    setInput("");
    setAttachedImage(null);
    setIsTyping(true);

    try {
      const config = GSIStore.getAIConfig();
      if (!config.apiKey) {
         throw new Error("Bureau indisponible.");
      }

      const openai = new OpenAI({ apiKey: config.apiKey, dangerouslyAllowBrowser: true });

      // Build context-aware system prompt
      const campus = user?.campus || "Antananarivo";
      const subject = user?.filiere || "Général";
      const promptKey = `${campus}_${subject}`;
      const systemPrompt = config.prompts[promptKey] || config.prompts[`${campus}_Général`] || `Tu es l'Agent Assistant GSI, un conseiller académique personnel pour le campus de ${campus}. Agis comme un humain dévoué. Ne mentionne jamais que tu es une IA ou une machine. Utilise le Markdown pour la clarté (tableaux, code, listes). Ton unique objectif est la réussite et l'accompagnement de l'étudiant.`;

      // Fetch relevant academic context
      const lessons = (await GSIStore.getLessons()).filter(l => l.niveau === user?.niveau).slice(0, 3);
      const assignments = (await GSIStore.getAssignments()).filter(a => a.niveau === user?.niveau).slice(0, 3);
      const grades = (await GSIStore.getGrades()).filter(g => g.studentId === user?.id);

      const contextText = `
        PROFIL ÉTUDIANT:
        Nom: ${user?.fullName}
        Campus: ${campus}
        Filière: ${subject}
        Niveau: ${user?.niveau}
        Moyenne: ${grades.length > 0 ? (grades.reduce((a,b)=>a+b.score,0)/grades.length).toFixed(2)+"/20" : "N/A"}
        Dernières leçons consultables: ${lessons.map(l => l.title).join(', ')}
        Devoirs en cours: ${assignments.map(a => a.title + " (Échéance: " + a.deadline + ")").join(', ')}
      `;

      const apiMessages: any[] = [
        { role: "system", content: systemPrompt + "\n\n" + contextText }
      ];

      // Add last few messages for conversation history
      messages.slice(-6).forEach(m => {
        apiMessages.push({ role: m.role, content: m.content });
      });

      // Add current user message
      if (currentImage) {
        apiMessages.push({
          role: "user",
          content: [
            { type: "text", text: userMessage || "Veuillez analyser ce document pour moi s'il vous plaît." },
            { type: "image_url", image_url: { url: currentImage } }
          ]
        });
      } else {
        apiMessages.push({ role: "user", content: userMessage });
      }

      const completion = await openai.chat.completions.create({
        model: currentImage ? "gpt-4o" : "gpt-3.5-turbo",
        messages: apiMessages,
      });

      const responseText = completion.choices[0].message.content || "Je n'ai pas de réponse immédiate, pourriez-vous reformuler votre demande ?";
      setMessages([...newMessages, { role: "assistant", content: responseText }]);

    } catch (err: any) {
      console.error("Assistant indisponible:", err);
      setMessages([...newMessages, { role: "assistant", content: "Je suis sincèrement désolé, mais mon bureau de conseil rencontre une difficulté technique pour vous répondre à l'instant. Mes collègues et moi faisons le maximum pour rétablir le service. N'hésitez pas à me relancer dans quelques minutes, je reste à votre entière disposition pour vous aider." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-white shadow-xl overflow-hidden relative">
      <PageHeader
        title="Agent Assistant"
        subtitle="Votre Conseiller GSI"
        className="p-6 bg-primary text-white mb-0"
        rightElement={
          <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md">
            <Sparkles size={20} />
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50">
        {messages.map((m, i) => (
          <div key={i} className={cn(
            "flex flex-col animate-in fade-in slide-in-from-bottom-2",
            m.role === "user" ? "items-end" : "items-start"
          )}>
            {m.image && (
              <div className="mb-2 max-w-[70%] rounded-2xl overflow-hidden shadow-md border-4 border-white">
                <img src={m.image} alt="Upload" className="w-full h-auto" />
              </div>
            )}
            <div className={cn(
              "max-w-[90%] p-4 rounded-[24px] text-sm font-medium shadow-sm relative group",
              m.role === "user"
                ? "bg-primary text-white rounded-tr-none shadow-primary/20"
                : "bg-white text-gray-800 rounded-tl-none border border-gray-100"
            )}>
              {m.role === 'assistant' ? (
                 <div className="prose prose-sm prose-indigo max-w-none">
                    <ReactMarkdown
                       components={{
                          code({ node, className, children, ...props }) {
                             const codeContent = String(children).replace(/\n$/, '');
                             return (
                                <div className="relative my-4 group/code">
                                   <div className="bg-gray-900 text-gray-100 p-4 rounded-xl font-mono text-xs overflow-x-auto">
                                      {children}
                                   </div>
                                   <button
                                      onClick={() => {
                                         navigator.clipboard.writeText(codeContent);
                                         toast.success("Copié !");
                                      }}
                                      className="absolute top-2 right-2 p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white opacity-0 group-hover/code:opacity-100 transition-opacity"
                                   >
                                      <Copy size={14} />
                                   </button>
                                </div>
                             )
                          },
                          table({ children }) {
                             return <div className="overflow-x-auto my-4"><table className="w-full border-collapse border border-gray-200 text-xs">{children}</table></div>
                          },
                          th({ children }) {
                             return <th className="border border-gray-200 p-2 bg-gray-50 font-black uppercase">{children}</th>
                          },
                          td({ children }) {
                             return <td className="border border-gray-200 p-2">{children}</td>
                          }
                       }}
                    >
                       {m.content}
                    </ReactMarkdown>
                 </div>
              ) : m.content}
            </div>
            <span className="text-[8px] text-gray-300 mt-1 px-2 uppercase font-black">
              {m.role === 'user' ? 'Vous' : 'Agent Assistant'}
            </span>
          </div>
        ))}
        {isTyping && (
          <div className="flex flex-col items-start animate-pulse">
            <div className="bg-white text-gray-400 p-4 rounded-[24px] rounded-tl-none border border-gray-100 text-xs font-bold italic">
               Le conseiller prépare sa réponse...
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-gray-100 space-y-3">
        {attachedImage && (
           <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-2xl animate-in zoom-in">
              <div className="w-12 h-12 rounded-xl overflow-hidden border border-gray-200">
                 <img src={attachedImage} className="w-full h-full object-cover" />
              </div>
              <p className="text-[10px] font-bold text-gray-400 flex-1">Document prêt</p>
              <button onClick={() => setAttachedImage(null)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-full">
                 <X size={16} />
              </button>
           </div>
        )}

        <div className="flex gap-2 items-center">
        <input
           type="file"
           ref={fileInputRef}
           onChange={handleImageUpload}
           accept="image/*"
           className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-4 bg-gray-100 text-gray-500 rounded-2xl hover:bg-gray-200 transition-all active:scale-90"
        >
          <ImageIcon size={20} />
        </button>

        <div className="flex-1 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Posez votre question au conseiller..."
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
    </div>
  );
}
