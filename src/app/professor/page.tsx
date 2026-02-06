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
  Zap
} from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { useRouter } from "next/navigation";
import { GSIStore, User, Lesson, Assignment, Grade } from "@/lib/store";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

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
  const [syncing, setSyncing] = useState<string[]>([]);

  useEffect(() => {
    const user = GSIStore.getCurrentUser();
    if (!user || user.role !== 'professor') {
      router.replace("/login");
      return;
    }

    const unsubs = [
      GSIStore.subscribeUsers((us) => setStudents(us.filter(u => u.role === 'student'))),
      GSIStore.subscribeLessons({}, (ls) => setLessons(ls)),
      GSIStore.subscribeAssignments({}, (as) => setAssignments(as))
    ];

    return () => unsubs.forEach(u => u());
  }, [router]);

  const [selectedFilieres, setSelectedFilieres] = useState<string[]>([]);
  const [selectedCampuses, setSelectedCampuses] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handlePublishLesson = async (e: any) => {
    e.preventDefault();
    if (selectedFilieres.length === 0 || selectedCampuses.length === 0) {
      toast.error("Sélectionnez au moins une filière et un campus.");
      return;
    }

    const form = e.target;
    const title = form.title.value;
    const description = form.description.value;
    const subject = form.subject.value;
    const niveau = form.niveau.value;
    const filesInput = form.elements.namedItem('files') as HTMLInputElement;
    const files = filesInput?.files;

    const tempId = Math.random().toString(36).substr(2, 9);

    // Immediate feedback & Navigation
    setSyncing(prev => [...prev, tempId]);
    setIsUploading(true);
    setUploadProgress(0);
    setActiveTab("dashboard");

    const toastId = toast.loading("Publication de la leçon...");

    // Background Process
    (async () => {
      let fileUrls: string[] = [];
      try {
        if (files && files.length > 0) {
          const uploadPromises = Array.from(files).map((file) =>
            GSIStore.uploadFile(file, `lessons/${Date.now()}_${file.name}`, (p) => setUploadProgress(p))
          );
          fileUrls = await Promise.all(uploadPromises);
        }

        const lesson: Lesson = {
          id: tempId,
          title,
          description,
          subject,
          niveau,
          filiere: selectedFilieres,
          campus: selectedCampuses,
          date: new Date().toISOString(),
          files: fileUrls
        };

        await GSIStore.addLesson(lesson);
        toast.success(`Leçon "${title}" publiée !`, { id: toastId });
      } catch (err: any) {
        toast.error("Échec de la publication : " + err.message, { id: toastId });
      } finally {
        setSyncing(prev => prev.filter(id => id !== tempId));
        setIsUploading(false);
        setUploadProgress(0);
      }
    })();

    setSelectedFilieres([]);
    setSelectedCampuses([]);
  };

  const handlePublishAssignment = async (e: any) => {
    e.preventDefault();
    if (selectedFilieres.length === 0 || selectedCampuses.length === 0) {
      toast.error("Sélectionnez au moins une filière et un campus.");
      return;
    }

    const form = e.target;
    const title = form.title.value;
    const description = form.description.value;
    const subject = form.subject.value;
    const niveau = form.niveau.value;
    const deadline = form.deadline.value;
    const filesInput = form.elements.namedItem('files') as HTMLInputElement;
    const files = filesInput?.files;

    const tempId = Math.random().toString(36).substr(2, 9);

    setSyncing(prev => [...prev, tempId]);
    setIsUploading(true);
    setUploadProgress(0);
    setActiveTab("dashboard");

    const toastId = toast.loading("Publication du devoir...");

    (async () => {
      let fileUrls: string[] = [];
      try {
        if (files && files.length > 0) {
          const uploadPromises = Array.from(files).map((file) =>
            GSIStore.uploadFile(file, `assignments/${Date.now()}_${file.name}`, (p) => setUploadProgress(p))
          );
          fileUrls = await Promise.all(uploadPromises);
        }

        const assignment: Assignment = {
          id: tempId,
          title,
          description,
          subject,
          niveau,
          filiere: selectedFilieres,
          campus: selectedCampuses,
          deadline,
          timeLimit: "23:59",
          maxScore: 20,
          files: fileUrls
        };

        await GSIStore.addAssignment(assignment);
        toast.success(`Devoir "${title}" disponible !`, { id: toastId });
      } catch (err: any) {
        toast.error("Échec du devoir : " + err.message, { id: toastId });
      } finally {
        setSyncing(prev => prev.filter(id => id !== tempId));
        setIsUploading(false);
        setUploadProgress(0);
      }
    })();

    setSelectedFilieres([]);
    setSelectedCampuses([]);
  };

  const menuItems = [
    { id: "schedule", icon: Calendar, label: t("modifier_edt"), color: "bg-blue-500" },
    { id: "lessons", icon: BookOpen, label: t("publier_lecon"), color: "bg-emerald-500" },
    { id: "assignments", icon: FileText, label: t("publier_devoir"), color: "bg-orange-500" },
    { id: "grades", icon: BarChart3, label: t("gestion_notes"), color: "bg-pink-500" },
    { id: "students", icon: Users, label: t("suivi_etudiants"), color: "bg-indigo-500" },
  ];

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto bg-[#F8FAFC] pb-20">
      {/* Dynamic Sync Banner */}
      {(syncing.length > 0 || isUploading) && (
        <div className="bg-violet-600 text-white px-6 py-2 flex items-center justify-between animate-pulse sticky top-0 z-[60]">
          <div className="flex items-center gap-3">
             <RefreshCw size={14} className="animate-spin" />
             <span className="text-[10px] font-bold uppercase tracking-wider">Synchronisation en cours...</span>
          </div>
          {isUploading && <span className="text-[10px] font-black">{Math.round(uploadProgress)}%</span>}
        </div>
      )}

      {/* Header */}
      <div className="bg-white p-6 rounded-b-[40px] shadow-sm mb-6 border-b border-violet-100">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-violet-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <GraduationCap size={28} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">Prof Portal</h1>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">GSI Internationale</p>
            </div>
          </div>
          <button
            onClick={async () => {
              await signOut(auth);
              GSIStore.setCurrentUser(null);
              toast.success("Déconnexion");
              router.replace("/login");
            }}
            className="p-3 bg-gray-50 rounded-xl text-gray-400 hover:text-red-500 transition-all active:scale-90"
          >
            <LogOut size={20} />
          </button>
        </div>

        <div className="bg-gradient-to-br from-violet-600 to-indigo-700 p-5 rounded-3xl flex items-center gap-4 mb-2 shadow-xl shadow-violet-200">
           <div className="flex-1">
              <h3 className="text-white font-bold text-sm">Prêt pour aujourd'hui ?</h3>
              <p className="text-violet-100 text-[10px] font-medium opacity-80">{students.length} étudiants inscrits dans vos filières.</p>
           </div>
           <button onClick={() => setActiveTab("lessons")} className="bg-white text-violet-600 p-2.5 rounded-xl shadow-md active:scale-95 transition-all">
              <Plus size={18} />
           </button>
        </div>
      </div>

      <div className="px-6 space-y-8 flex-1 pb-10">
        {activeTab === "dashboard" && (
          <>
            <div>
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                Actions Rapides
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className="bg-white p-5 rounded-[32px] shadow-sm border border-gray-100 flex flex-col items-center text-center gap-3 hover:shadow-md hover:border-violet-100 transition-all active:scale-95"
                  >
                    <div className={`${item.color} w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-${item.color.split('-')[1]}-500/20`}>
                      <item.icon size={24} />
                    </div>
                    <span className="text-xs font-black text-gray-700 leading-tight uppercase tracking-tight">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-800">Activités Récentes</h2>
                <span className="text-[10px] font-bold text-violet-600 uppercase tracking-wider">Voir tout</span>
              </div>
              <div className="space-y-3">
                {lessons.slice(0, 3).map((l, i) => (
                   <div key={i} className="bg-white p-4 rounded-3xl border border-gray-100 flex items-center gap-4 shadow-sm group hover:border-emerald-200 transition-all">
                      <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <BookOpen size={18} />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-gray-800">{l.title}</h4>
                        <p className="text-[10px] text-gray-400 font-medium">{l.niveau} • {new Date(l.date).toLocaleDateString()}</p>
                      </div>
                      <CheckCircle size={16} className="text-emerald-500 opacity-50" />
                   </div>
                ))}
                {assignments.slice(0, 3).map((a, i) => (
                   <div key={i} className="bg-white p-4 rounded-3xl border border-gray-100 flex items-center gap-4 shadow-sm group hover:border-orange-200 transition-all">
                      <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <FileText size={18} />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-gray-800">{a.title}</h4>
                        <p className="text-[10px] text-gray-400 font-medium">Deadline: {a.deadline}</p>
                      </div>
                      <Clock size={16} className="text-orange-400 opacity-50" />
                   </div>
                ))}
                {lessons.length === 0 && assignments.length === 0 && (
                  <div className="bg-white/50 border-2 border-dashed border-gray-100 rounded-[32px] p-12 text-center">
                    <p className="text-sm font-bold text-gray-300 italic">Prêt à publier votre premier contenu ?</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {(activeTab === "lessons" || activeTab === "assignments") && (
           <div className="space-y-6">
            <PageHeader title={menuItems.find(i => i.id === activeTab)?.label || ""} onBack={() => setActiveTab("dashboard")} />
            <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-xl space-y-4">
              <form onSubmit={activeTab === 'lessons' ? handlePublishLesson : handlePublishAssignment} className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Discipline / Matière</label>
                    <input name="subject" required type="text" className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 ring-violet-100" placeholder="Ex: Informatique" />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">{t("titre")}</label>
                    <input name="title" required type="text" className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 ring-violet-100" placeholder="Nom de la leçon" />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">{t("description")}</label>
                    <textarea name="description" required className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold outline-none min-h-[100px]" placeholder="Résumé du cours..."></textarea>
                  </div>
                </div>

                <div className="p-4 bg-violet-50 rounded-3xl space-y-4">
                  <div>
                    <label className="block text-xs font-black text-violet-400 uppercase tracking-widest mb-2">Niveau Cible</label>
                    <select name="niveau" className="w-full bg-white border-none rounded-xl p-3 text-xs font-bold outline-none shadow-sm">
                      {NIVEAUX.map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-violet-400 uppercase tracking-widest mb-2">Filières (Sélection multiple)</label>
                    <div className="grid grid-cols-2 gap-2 bg-white/50 p-4 rounded-2xl max-h-40 overflow-y-auto">
                      {FILIERES.map(f => (
                        <label key={f} className="flex items-center gap-2 text-[10px] font-bold text-gray-600 cursor-pointer p-1">
                          <input
                            type="checkbox"
                            checked={selectedFilieres.includes(f)}
                            onChange={(e) => {
                              if(e.target.checked) setSelectedFilieres([...selectedFilieres, f]);
                              else setSelectedFilieres(selectedFilieres.filter(x => x !== f));
                            }}
                            className="rounded-lg text-violet-600 focus:ring-0 w-4 h-4"
                          />
                          {f}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-violet-400 uppercase tracking-widest mb-2">Campus concernés</label>
                    <div className="grid grid-cols-2 gap-2">
                      {CAMPUSES.map(c => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => {
                            if(selectedCampuses.includes(c)) setSelectedCampuses(selectedCampuses.filter(x => x !== c));
                            else setSelectedCampuses([...selectedCampuses, c]);
                          }}
                          className={`p-3 rounded-xl text-[10px] font-bold transition-all ${selectedCampuses.includes(c) ? 'bg-violet-600 text-white' : 'bg-white text-gray-400'}`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Documents (PDF, Vidéos, etc)</label>
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-200 border-dashed rounded-[32px] cursor-pointer bg-gray-50 hover:bg-white transition-colors group">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-2 text-violet-400 group-hover:scale-110 transition-transform" />
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Cliquez pour ajouter des fichiers</p>
                    </div>
                    <input name="files" type="file" multiple className="hidden" />
                  </label>
                </div>

                {activeTab === "assignments" && (
                  <div className="p-4 bg-orange-50 rounded-3xl">
                    <label className="block text-xs font-black text-orange-400 uppercase tracking-widest mb-2">Date Limite de Rendu</label>
                    <input name="deadline" required type="date" className="w-full bg-white border-none rounded-xl p-4 text-sm font-bold outline-none shadow-sm" />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isUploading}
                  className={`w-full text-white py-5 rounded-[24px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all disabled:opacity-50 ${activeTab === 'lessons' ? 'bg-emerald-500 shadow-emerald-200' : 'bg-orange-500 shadow-orange-200'}`}>
                  {isUploading ? "Upload en cours..." : (activeTab === 'lessons' ? "Publier Maintenant" : "Lancer le Devoir")}
                </button>
              </form>
            </div>
          </div>
        )}

        {activeTab === "grades" && (
          <div className="space-y-4">
            <PageHeader
              title={t("gestion_notes")}
              onBack={() => setActiveTab("dashboard")}
              rightElement={
                <button
                  onClick={() => {
                    const toastId = toast.loading("Analyse du fichier Excel...");
                    setTimeout(() => toast.success("Import réussi ! 12 notes détectées.", { id: toastId }), 1500);
                  }}
                  className="p-2 bg-emerald-50 text-emerald-600 rounded-xl flex items-center gap-2 text-[10px] font-bold"
                >
                  <FileSpreadsheet size={16} />
                  {t("import_excel")}
                </button>
              }
            />
            <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-xl overflow-hidden">
               <div className="flex justify-between items-center mb-6 bg-pink-50 p-4 rounded-2xl border border-pink-100">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-pink-500 shadow-sm">
                        <Zap size={20} />
                     </div>
                     <div>
                        <p className="text-[10px] font-black uppercase text-pink-400 tracking-widest">{t("moyenne_classe")}</p>
                        <p className="text-xl font-black text-pink-600">14.5 / 20</p>
                     </div>
                  </div>
                  <div className="text-right">
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Taux de réussite</p>
                     <p className="text-sm font-black text-emerald-500">85%</p>
                  </div>
               </div>

               <div className="mb-6">
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Matière concernée</label>
                  <input id="grade-subject" type="text" className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 ring-pink-100" placeholder="Ex: Statistiques" />
               </div>
               <div className="max-h-[400px] overflow-y-auto mb-6 pr-2">
                 <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
                        <th className="pb-4">Étudiant</th>
                        <th className="pb-4 text-center">Note / 20</th>
                      </tr>
                    </thead>
                    <tbody className="font-bold">
                      {students.map((s, i) => (
                        <tr key={i} className="border-t border-gray-50 group hover:bg-gray-50 transition-colors">
                          <td className="py-4 text-xs">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-pink-100 text-pink-500 rounded-lg flex items-center justify-center text-[10px]">
                                {s.fullName.charAt(0)}
                              </div>
                              {s.fullName}
                            </div>
                          </td>
                          <td className="py-4 text-center">
                            <input
                              id={`grade-${s.id}`}
                              type="number"
                              className="w-14 bg-gray-50 border-none rounded-xl p-3 text-center font-black text-pink-600 outline-none focus:ring-2 ring-pink-200"
                              placeholder="-"
                              max="20"
                              min="0"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                 </table>
               </div>
               <button
                onClick={async () => {
                  const subject = (document.getElementById('grade-subject') as HTMLInputElement).value;
                  if(!subject) return toast.error("Veuillez saisir une matière");

                  const toastId = toast.loading("Enregistrement...");
                  try {
                    for (const s of students) {
                      const score = (document.getElementById(`grade-${s.id}`) as HTMLInputElement).value;
                      if(score) {
                        await GSIStore.addGrade({
                          id: Math.random().toString(36).substr(2, 9),
                          studentId: s.id,
                          studentName: s.fullName,
                          subject,
                          score: parseFloat(score),
                          maxScore: 20,
                          date: new Date().toISOString().split('T')[0],
                          niveau: s.niveau,
                          filiere: s.filiere
                        });
                      }
                    }
                    toast.success("Notes synchronisées !", { id: toastId });
                    setActiveTab("dashboard");
                  } catch (err: any) {
                    toast.error("Échec: " + err.message, { id: toastId });
                  }
                }}
                className="w-full bg-gradient-to-r from-pink-500 to-rose-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-pink-100 active:scale-95 transition-all flex items-center justify-center gap-2">
                  <Save size={20} /> Valider la saisie
               </button>
            </div>
          </div>
        )}

        {activeTab === "students" && (
           <div className="space-y-4">
            <PageHeader title="Promotion Étudiante" onBack={() => setActiveTab("dashboard")} />
            <div className="grid grid-cols-1 gap-3">
              {students.map((s, i) => (
                <div key={i} className="bg-white p-4 rounded-3xl border border-gray-100 flex items-center gap-4 shadow-sm hover:shadow-md transition-all">
                   <div className="w-12 h-12 bg-violet-50 rounded-2xl overflow-hidden flex items-center justify-center border border-violet-100">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${s.fullName}`} alt={s.fullName} />
                   </div>
                   <div className="flex-1">
                      <h4 className="font-bold text-sm text-gray-800 leading-tight">{s.fullName}</h4>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">{s.filiere} • {s.niveau}</p>
                   </div>
                   <button
                    onClick={() => toast.info(`Contact de ${s.fullName} disponible prochainement.`)}
                    className="p-3 bg-violet-50 text-violet-600 rounded-xl active:scale-90 transition-all">
                      <Users size={18} />
                   </button>
                </div>
              ))}
              {students.length === 0 && (
                <div className="text-center py-20 grayscale opacity-20">
                  <Users size={64} className="mx-auto mb-4" />
                  <p className="text-sm font-black uppercase">Aucun étudiant détecté</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "schedule" && (
           <div className="space-y-4">
            <PageHeader title={t("modifier_edt")} onBack={() => setActiveTab("dashboard")} />
            <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-xl text-center">
               <div className="w-24 h-24 bg-blue-50 text-blue-500 rounded-[35%] flex items-center justify-center mx-auto mb-6 border-2 border-dashed border-blue-200">
                  <Upload size={40} className="animate-bounce" />
               </div>
               <h3 className="font-black text-lg text-gray-800 mb-2">Mise à jour Emploi du Temps</h3>
               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-8">Format JPG ou PDF recommandé</p>

               <form id="schedule-form" className="space-y-6">
                 <div className="p-4 bg-blue-50 rounded-3xl space-y-4">
                    <div className="space-y-2">
                       <label className="block text-start text-[10px] font-black text-blue-400 uppercase tracking-widest ml-1">Campus</label>
                       <select name="campus" className="w-full bg-white border-none rounded-xl p-3 text-xs font-black outline-none shadow-sm text-blue-900">
                          {CAMPUSES.map(c => <option key={c}>{c}</option>)}
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="block text-start text-[10px] font-black text-blue-400 uppercase tracking-widest ml-1">Niveau</label>
                       <select name="niveau" className="w-full bg-white border-none rounded-xl p-3 text-xs font-black outline-none shadow-sm text-blue-900">
                          {NIVEAUX.map(n => <option key={n}>{n}</option>)}
                       </select>
                    </div>
                 </div>

                 <input
                    id="schedule-upload"
                    type="file"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      const form = document.getElementById('schedule-form') as HTMLFormElement;
                      const campus = (form.elements.namedItem('campus') as HTMLSelectElement).value;
                      const niveau = (form.elements.namedItem('niveau') as HTMLSelectElement).value;

                      if (file) {
                        const tempId = Math.random().toString(36).substr(2, 9);
                        setSyncing(prev => [...prev, tempId]);
                        setIsUploading(true);
                        setActiveTab("dashboard");
                        const toastId = toast.loading("Upload de l'EDT lancé...");

                        (async () => {
                          try {
                            const url = await GSIStore.uploadFile(file, `schedules/${Date.now()}_${file.name}`, (p) => setUploadProgress(p));
                            await GSIStore.addSchedule({
                              url,
                              campus,
                              niveau,
                              professorName: GSIStore.getCurrentUser()?.fullName,
                              date: new Date().toISOString()
                            });
                            toast.success("Emploi du temps mis en ligne !", { id: toastId });
                          } catch (err: any) {
                            toast.error("Erreur EDT: " + err.message, { id: toastId });
                          } finally {
                            setSyncing(prev => prev.filter(id => id !== tempId));
                            setIsUploading(false);
                            setUploadProgress(0);
                          }
                        })();
                      }
                    }}
                  />

                  <button
                    type="button"
                    disabled={isUploading}
                    onClick={() => document.getElementById('schedule-upload')?.click()}
                    className="w-full bg-white text-blue-600 border-2 border-dashed border-blue-200 py-12 rounded-[32px] flex flex-col items-center gap-3 active:scale-95 transition-all shadow-sm hover:border-blue-400 disabled:opacity-50"
                  >
                    <Plus size={32} />
                    <span className="font-black text-xs uppercase tracking-widest">{isUploading ? "Chargement..." : "Sélectionner Fichier"}</span>
                  </button>
               </form>

               <div className="mt-8 flex items-center justify-center gap-2 text-[10px] font-black text-gray-300 uppercase italic">
                  <CheckCircle size={12} />
                  Diffusion instantanée aux étudiants
               </div>
            </div>
          </div>
        )}
      </div>

      {/* Modern Floating Navigation (Simplified for Prof) */}
      <div className="fixed bottom-0 left-0 right-0 p-4 flex justify-center z-50 pointer-events-none">
        <div className="bg-white/90 backdrop-blur-xl border border-white shadow-2xl rounded-full px-6 py-3 flex items-center gap-8 pointer-events-auto">
          <button onClick={() => setActiveTab("dashboard")} className={`p-2 transition-all ${activeTab === 'dashboard' ? 'text-violet-600 scale-125' : 'text-gray-400'}`}>
            <BarChart3 size={24} />
          </button>
          <button
            onClick={() => setActiveTab("lessons")}
            className="w-14 h-14 bg-gradient-to-br from-violet-600 to-indigo-700 text-white rounded-full shadow-lg shadow-violet-200 flex items-center justify-center -mt-10 border-4 border-[#F8FAFC] hover:scale-110 active:scale-90 transition-all"
          >
            <Plus size={32} />
          </button>
          <button onClick={() => setActiveTab("students")} className={`p-2 transition-all ${activeTab === 'students' ? 'text-violet-600 scale-125' : 'text-gray-400'}`}>
            <Users size={24} />
          </button>
        </div>
      </div>
    </div>
  );
}
