"use client";

import { useState, useEffect } from "react";
import {
  GraduationCap,
  Calendar,
  BookOpen,
  FileText,
  BarChart3,
  Users,
  Search,
  LogOut,
  ChevronRight,
  Plus,
  Upload,
  Save,
  CheckCircle,
  Clock,
  RefreshCw,
  FileSpreadsheet,
  Zap,
  Wifi,
  WifiOff,
  CheckCircle2
} from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { useRouter } from "next/navigation";
import { GSIStore, User, Lesson, Assignment, Grade } from "@/lib/store";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { cn } from "@/lib/utils";

const CAMPUSES = ["Antananarivo", "Antsirabe", "Bypass", "Tamatave"];
const FILIERES = ["Informatique", "Gestion", "Commerce International", "Marketing Digital", "Comptabilité", "Finance", "Ressources Humaines", "Logistique", "Tourisme", "Communication", "Management", "Droit des Affaires", "Entrepreneuriat"];
const NIVEAUX = ["L1", "L2", "L3", "M1", "M2"];

export default function ProfessorPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [students, setStudents] = useState<User[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [syncStatus, setSyncStatus] = useState<'ready' | 'offline' | 'syncing'>('syncing');

  useEffect(() => {
    const user = GSIStore.getCurrentUser();
    if (!user || user.role !== 'professor') {
      router.replace("/login");
      return;
    }

    const unsubs = [
      GSIStore.subscribeUsers((us) => { setStudents(us.filter(u => u.role === 'student')); setSyncStatus('ready'); }),
      GSIStore.subscribeLessons({}, (ls) => setLessons(ls)),
      GSIStore.subscribeAssignments({}, (as) => setAssignments(as))
    ];

    const handleOffline = () => setSyncStatus('offline');
    const handleOnline = () => setSyncStatus('syncing');
    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      unsubs.forEach(u => u());
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, [router]);

  const [selectedFilieres, setSelectedFilieres] = useState<string[]>([]);
  const [selectedCampuses, setSelectedCampuses] = useState<string[]>([]);

  const handlePublishLesson = async (e: any) => {
    e.preventDefault();
    if (selectedFilieres.length === 0 || selectedCampuses.length === 0) {
      toast.error("Filière et campus obligatoires.");
      return;
    }

    const form = e.target;
    const filesInput = form.elements.namedItem('files') as HTMLInputElement;
    const files = filesInput?.files;
    const title = form.title.value;
    const tempId = Math.random().toString(36).substr(2, 9);

    setIsUploading(true);
    setActiveTab("dashboard");
    const toastId = toast.loading("Publication lancée...");

    (async () => {
      try {
        let fileUrls: string[] = [];
        if (files && files.length > 0) {
          fileUrls = await Promise.all(Array.from(files).map(f => GSIStore.uploadFile(f, `lessons/${tempId}_${f.name}`, setUploadProgress)));
        }

        await GSIStore.addLesson({
          id: tempId,
          title,
          description: form.description.value,
          subject: form.subject.value,
          niveau: form.niveau.value,
          filiere: selectedFilieres,
          campus: selectedCampuses,
          date: new Date().toISOString(),
          files: fileUrls
        });
        toast.success(`Leçon "${title}" prête !`, { id: toastId });
      } catch (err: any) {
        toast.error("Erreur Cloud : " + err.message, { id: toastId });
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
    })();
  };

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto bg-[#F8FAFC] pb-20">
      {/* Sync Status Banner */}
      <div className={cn(
        "px-6 py-2 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest",
        syncStatus === 'ready' ? "bg-emerald-500 text-white" :
        syncStatus === 'offline' ? "bg-orange-500 text-white" : "bg-violet-600 text-white animate-pulse"
      )}>
        <div className="flex items-center gap-2">
           {isUploading ? <RefreshCw size={12} className="animate-spin" /> : syncStatus === 'ready' ? <CheckCircle2 size={12} /> : <WifiOff size={12} />}
           <span>{isUploading ? `Envoi en cours ${Math.round(uploadProgress)}%` : syncStatus === 'ready' ? "GSI Cloud : Connecté" : "Hors-ligne"}</span>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white p-6 rounded-b-[40px] shadow-sm mb-6 border-b border-violet-100">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-violet-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <GraduationCap size={28} />
            </div>
            <div>
              <h1 className="text-xl font-bold">Prof Portal</h1>
              <p className="text-[10px] text-gray-400 font-black uppercase">GSI Internationale</p>
            </div>
          </div>
          <button
            onClick={async () => {
              await signOut(auth);
              GSIStore.setCurrentUser(null);
              toast.success("Déconnexion");
              router.replace("/login");
            }}
            className="p-3 bg-gray-50 rounded-xl text-gray-400 active:scale-90"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>

      <div className="px-6 space-y-8 flex-1 pb-10">
        {activeTab === "dashboard" && (
          <div className="grid grid-cols-2 gap-4">
            {[{id: "lessons", icon: BookOpen, label: "Publier Leçon", color: "bg-emerald-500"},
              {id: "assignments", icon: FileText, label: "Publier Devoir", color: "bg-orange-500"},
              {id: "grades", icon: BarChart3, label: "Notes", color: "bg-pink-500"},
              {id: "students", icon: Users, label: "Étudiants", color: "bg-indigo-500"}].map(item => (
              <button key={item.id} onClick={() => setActiveTab(item.id)} className="bg-white p-5 rounded-[32px] shadow-sm border border-gray-100 flex flex-col items-center gap-3 active:scale-95">
                <div className={`${item.color} w-12 h-12 rounded-2xl flex items-center justify-center text-white`}><item.icon size={24} /></div>
                <span className="text-xs font-black uppercase tracking-tight">{item.label}</span>
              </button>
            ))}
          </div>
        )}

        {(activeTab === "lessons" || activeTab === "assignments") && (
          <div className="space-y-6">
            <PageHeader title={activeTab === 'lessons' ? "Publier Leçon" : "Publier Devoir"} onBack={() => setActiveTab("dashboard")} />
            <form onSubmit={handlePublishLesson} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-xl space-y-4">
                <input name="subject" required className="w-full bg-gray-50 rounded-2xl p-4 text-sm font-bold" placeholder="Matière" />
                <input name="title" required className="w-full bg-gray-50 rounded-2xl p-4 text-sm font-bold" placeholder="Titre" />
                <textarea name="description" required className="w-full bg-gray-50 rounded-2xl p-4 text-sm font-bold min-h-[100px]" placeholder="Description"></textarea>

                <div className="grid grid-cols-2 gap-2 p-4 bg-gray-50 rounded-2xl">
                   {FILIERES.slice(0, 4).map(f => (
                     <label key={f} className="flex items-center gap-2 text-[10px] font-bold">
                       <input type="checkbox" checked={selectedFilieres.includes(f)} onChange={e => e.target.checked ? setSelectedFilieres([...selectedFilieres, f]) : setSelectedFilieres(selectedFilieres.filter(x => x !== f))} /> {f}
                     </label>
                   ))}
                </div>

                <div className="grid grid-cols-2 gap-2">
                   {CAMPUSES.map(c => (
                     <button type="button" key={c} onClick={() => selectedCampuses.includes(c) ? setSelectedCampuses(selectedCampuses.filter(x => x !== c)) : setSelectedCampuses([...selectedCampuses, c])} className={cn("p-2 rounded-xl text-[10px] font-bold transition-all", selectedCampuses.includes(c) ? "bg-violet-600 text-white" : "bg-gray-100 text-gray-400")}>{c}</button>
                   ))}
                </div>

                <input name="files" type="file" multiple className="w-full p-2 text-[10px]" />
                <select name="niveau" className="w-full p-4 bg-gray-50 rounded-2xl font-bold">
                   {NIVEAUX.map(n => <option key={n}>{n}</option>)}
                </select>

                <button type="submit" disabled={isUploading} className="w-full bg-violet-600 text-white py-5 rounded-2xl font-black uppercase shadow-lg active:scale-95">Publier</button>
            </form>
          </div>
        )}

        {activeTab === "students" && (
          <div className="space-y-4">
            <PageHeader title="Mes Étudiants" onBack={() => setActiveTab("dashboard")} />
            {students.map((s, i) => (
              <div key={i} className="bg-white p-4 rounded-3xl border border-gray-100 flex items-center gap-4">
                 <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center font-bold text-indigo-600">{s.fullName.charAt(0)}</div>
                 <div className="flex-1"><h4 className="font-bold text-sm">{s.fullName}</h4><p className="text-[10px] text-gray-400 font-bold uppercase">{s.filiere} • {s.niveau}</p></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
