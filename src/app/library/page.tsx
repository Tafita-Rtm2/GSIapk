import { AppLayout } from "@/components/app-layout";
import { Search, Download, Star, Filter, Video, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LibraryPage() {
  const categories = ["Tout", "PDFs", "Vidéos", "Examens", "Livres"];
  const documents = [
    { title: "Mathématiques Avancées Vol 1", type: "PDF", size: "12 MB", subject: "Math", fav: true },
    { title: "Introduction à la Physique Quantique", type: "Video", size: "150 MB", subject: "Physique", fav: false },
    { title: "Manuel de Chimie Organique", type: "PDF", size: "4.5 MB", subject: "Chimie", fav: true },
    { title: "Géographie Mondiale 2024", type: "PDF", size: "22 MB", subject: "Géo", fav: false },
  ];

  return (
    <AppLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Bibliothèque</h1>

        <div className="flex gap-2 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Rechercher des documents..."
              className="w-full bg-gray-100 rounded-xl py-3 pl-10 pr-4 outline-none"
            />
          </div>
          <button className="bg-gray-100 p-3 rounded-xl">
            <Filter size={20} className="text-gray-600" />
          </button>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-4 mb-4 scrollbar-hide">
          {categories.map((cat, i) => (
            <button
              key={cat}
              className={cn(
                "px-6 py-2 rounded-full whitespace-nowrap text-sm font-medium",
                i === 0 ? "bg-primary text-white" : "bg-gray-100 text-gray-600"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {documents.map((doc, i) => (
            <div key={i} className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100">
              <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
                {doc.type === "PDF" ? <FileText size={24} /> : <Video size={24} />}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm truncate">{doc.title}</h3>
                <p className="text-[10px] text-gray-500">{doc.subject} • {doc.size}</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="text-gray-300">
                  <Star size={20} className={doc.fav ? "fill-yellow-400 text-yellow-400" : ""} />
                </button>
                <button className="text-primary bg-primary/10 p-2 rounded-lg">
                  <Download size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
