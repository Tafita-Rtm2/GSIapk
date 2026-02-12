"use client";

import { AppLayout } from "@/components/app-layout";
import { useLanguage } from "@/lib/i18n";
import { Search, Filter, Download, Star, FileText, Bookmark, Clock, ArrowRight, Video, Image as ImageIcon, FileCode, X, PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

export default function LibraryPage() {
  const { t } = useLanguage();
  const [filter, setFilter] = useState("all");
  const [previewItem, setPreviewItem] = useState<any>(null);

  const books = [
    { id: 1, title: "Algèbre Moderne", author: "Pr. Bernard", type: "PDF", size: "4.2 MB", favorite: true },
    { id: 2, title: "Rapport de Stage", author: "GSI Internationale", type: "DOCX", size: "1.5 MB", favorite: false },
    { id: 3, title: "Introduction au Cloud", author: "Dr. Kamga", type: "VIDEO", size: "45 MB", favorite: true },
    { id: 4, title: "Schéma Réseau", author: "Lab GSI", type: "IMAGE", size: "2.8 MB", favorite: false },
    { id: 5, title: "Base de Données SQL", author: "Lab GSI", type: "PDF", size: "8.5 MB", favorite: false },
  ];

  return (
    <AppLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">{t("biblio")}</h1>
          <button className="bg-gray-100 p-2 rounded-xl text-gray-500">
            <Filter size={20} />
          </button>
        </div>

        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Rechercher un livre, un auteur..."
            className="w-full bg-gray-100 rounded-2xl py-3 pl-12 pr-4 outline-none text-sm focus:ring-2 ring-primary/20 transition-all"
          />
        </div>

        {/* Categories */}
        <div className="flex gap-4 overflow-x-auto pb-4 mb-6 scrollbar-hide">
          <CategoryBadge label="Tous" active={filter === "all"} onClick={() => setFilter("all")} />
          <CategoryBadge label="Favoris" icon={Star} active={filter === "fav"} onClick={() => setFilter("fav")} />
          <CategoryBadge label="Récents" icon={Clock} active={filter === "recent"} onClick={() => setFilter("recent")} />
          <CategoryBadge label="Cours" active={filter === "cours"} onClick={() => setFilter("cours")} />
        </div>

        {/* Featured Section */}
        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[40px] p-8 text-white mb-8 relative overflow-hidden shadow-xl">
           <div className="absolute right-[-20px] bottom-[-20px] w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
           <div className="relative z-10">
              <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-4 inline-block">Suggestion IA</span>
              <h2 className="text-xl font-bold mb-2">Guide de Réussite GSI</h2>
              <p className="text-xs opacity-80 mb-6 leading-relaxed">Basé sur vos cours récents de Mathématiques et Physique, nous vous recommandons ce support spécial.</p>
              <button className="bg-white text-indigo-600 px-6 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2">
                Lire maintenant
                <ArrowRight size={14} />
              </button>
           </div>
        </div>

        {/* Book List */}
        <h3 className="text-lg font-bold mb-4">Mes documents</h3>
        <div className="space-y-4 mb-20">
          {books.map((book) => (
            <div
              key={book.id}
              onClick={() => setPreviewItem(book)}
              className="bg-white p-4 rounded-3xl border border-gray-100 flex items-center gap-4 hover:border-primary/20 transition-all group cursor-pointer"
            >
              <div className="w-12 h-16 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100 group-hover:bg-primary/5 transition-colors">
                {book.type === "PDF" && <FileText className="text-red-500 opacity-60" size={24} />}
                {book.type === "DOCX" && <FileCode className="text-blue-500 opacity-60" size={24} />}
                {book.type === "VIDEO" && <Video className="text-purple-500 opacity-60" size={24} />}
                {book.type === "IMAGE" && <ImageIcon className="text-green-500 opacity-60" size={24} />}
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-800 text-sm">{book.title}</h4>
                <p className="text-[10px] text-gray-400 font-medium">{book.author} • {book.type} • {book.size}</p>
              </div>
              <div className="flex gap-2">
                <button className={cn(
                  "p-2 rounded-xl transition-colors",
                  book.favorite ? "text-accent bg-accent/10" : "text-gray-300 bg-gray-50"
                )}>
                  <Star size={16} fill={book.favorite ? "currentColor" : "none"} />
                </button>
                <button className="p-2 bg-gray-50 text-primary rounded-xl hover:bg-primary/10 transition-colors">
                  <Download size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Preview Modal */}
      {previewItem && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6 backdrop-blur-md">
          <div className="bg-white rounded-[40px] w-full max-w-sm overflow-hidden flex flex-col relative animate-in zoom-in duration-300">
            <button
              onClick={() => setPreviewItem(null)}
              className="absolute top-4 right-4 p-2 bg-gray-100/50 backdrop-blur rounded-full text-gray-800 z-10"
            >
              <X size={20} />
            </button>

            <div className="p-8">
              <div className="flex flex-col items-center text-center">
                 <div className="w-20 h-20 rounded-3xl bg-gray-50 flex items-center justify-center mb-6 shadow-inner">
                    {previewItem.type === "PDF" && <FileText className="text-red-500" size={40} />}
                    {previewItem.type === "DOCX" && <FileCode className="text-blue-500" size={40} />}
                    {previewItem.type === "VIDEO" && <PlayCircle className="text-purple-500" size={40} />}
                    {previewItem.type === "IMAGE" && <ImageIcon className="text-green-500" size={40} />}
                 </div>
                 <h3 className="text-xl font-bold text-gray-800 mb-2">{previewItem.title}</h3>
                 <p className="text-sm text-gray-500 mb-8">{previewItem.author} • {previewItem.size}</p>

                 {previewItem.type === "VIDEO" && (
                   <div className="w-full aspect-video bg-black rounded-2xl flex items-center justify-center mb-8 relative">
                      <video
                        className="w-full h-full rounded-2xl"
                        poster="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60"
                      />
                      <PlayCircle className="absolute text-white opacity-80" size={48} />
                   </div>
                 )}

                 {previewItem.type === "IMAGE" && (
                   <div className="w-full aspect-square bg-gray-100 rounded-2xl mb-8 overflow-hidden">
                      <img
                        src="https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=800&auto=format&fit=crop&q=60"
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                   </div>
                 )}

                 {previewItem.type === "DOCX" && (
                   <div className="w-full p-6 bg-blue-50 rounded-2xl mb-8 text-left border border-blue-100">
                      <div className="w-8 h-1 bg-blue-200 rounded-full mb-4"></div>
                      <div className="w-full h-2 bg-blue-100 rounded-full mb-2"></div>
                      <div className="w-full h-2 bg-blue-100 rounded-full mb-2"></div>
                      <div className="w-2/3 h-2 bg-blue-100 rounded-full"></div>
                   </div>
                 )}

                 <div className="flex gap-4 w-full">
                    <button className="flex-1 py-4 bg-gray-100 rounded-2xl font-bold text-gray-700 flex items-center justify-center gap-2">
                       <Star size={18} />
                       {t("favoris")}
                    </button>
                    <button className="flex-1 py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
                       <Download size={18} />
                       Download
                    </button>
                 </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

function CategoryBadge({ label, icon: Icon, active, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-6 py-3 rounded-2xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all",
        active ? "bg-primary text-white shadow-lg shadow-primary/20 scale-105" : "bg-white text-gray-500 border border-gray-100"
      )}
    >
      {Icon && <Icon size={14} />}
      {label}
    </button>
  );
}
