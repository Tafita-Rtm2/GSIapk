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
  CheckCircle
} from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { useRouter } from "next/navigation";
import { GSIStore, User, Lesson, Assignment, Grade } from "@/lib/store";

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

  useEffect(() => {
    const init = async () => {
      const user = GSIStore.getCurrentUser();
      if (!user || user.role !== 'professor') {
        router.push("/login");
        return;
      }
      const allUsers = await GSIStore.getUsers();
      setStudents(allUsers.filter(u => u.role === 'student'));
      setLessons(await GSIStore.getLessons());
      setAssignments(await GSIStore.getAssignments());
    };
    init();
  }, [router]);

  const [selectedFilieres, setSelectedFilieres] = useState<string[]>([]);
  const [selectedCampuses, setSelectedCampuses] = useState<string[]>([]);

  const handlePublishLesson = async (e: any) => {
    e.preventDefault();
    if (selectedFilieres.length === 0 || selectedCampuses.length === 0) {
      alert("Veuillez sélectionner au moins une filière et un campus.");
      return;
    }
    const lesson: Lesson = {
      id: Math.random().toString(36).substr(2, 9),
      title: e.target.title.value,
      description: e.target.description.value,
      subject: e.target.subject.value,
      niveau: e.target.niveau.value,
      filiere: selectedFilieres,
      campus: selectedCampuses,
      date: new Date().toISOString(),
      files: []
    };
    await GSIStore.addLesson(lesson);
    setLessons(await GSIStore.getLessons());
    alert("Leçon publiée !");
    setSelectedFilieres([]);
    setSelectedCampuses([]);
    setActiveTab("dashboard");
  };

  const handlePublishAssignment = async (e: any) => {
    e.preventDefault();
    if (selectedFilieres.length === 0 || selectedCampuses.length === 0) {
      alert("Veuillez sélectionner au moins une filière et un campus.");
      return;
    }
    const assignment: Assignment = {
      id: Math.random().toString(36).substr(2, 9),
      title: e.target.title.value,
      description: e.target.description.value,
      subject: e.target.subject.value,
      niveau: e.target.niveau.value,
      filiere: selectedFilieres,
      campus: selectedCampuses,
      deadline: e.target.deadline.value,
      timeLimit: "23:59",
      maxScore: 20
    };
    await GSIStore.addAssignment(assignment);
    setAssignments(await GSIStore.getAssignments());
    alert("Devoir publié !");
    setActiveTab("dashboard");
  };

  const menuItems = [
    { id: "schedule", icon: Calendar, label: t("modifier_edt"), color: "bg-blue-500" },
    { id: "lessons", icon: BookOpen, label: t("publier_lecon"), color: "bg-emerald-500" },
    { id: "assignments", icon: FileText, label: t("publier_devoir"), color: "bg-orange-500" },
    { id: "grades", icon: BarChart3, label: t("gestion_notes"), color: "bg-pink-500" },
    { id: "students", icon: Users, label: t("suivi_etudiants"), color: "bg-indigo-500" },
  ];

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white p-6 rounded-b-[40px] shadow-sm mb-6 border-b border-violet-100">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-violet-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <GraduationCap size={28} />
            </div>
            <div>
              <h1 className="text-xl font-bold">Prof Portal</h1>
              <p className="text-xs text-gray-500 font-medium italic">GSI Internationale — Expert</p>
            </div>
          </div>
          <button
            onClick={() => {
              GSIStore.setCurrentUser(null);
              router.push("/login");
            }}
            className="p-3 bg-gray-100 rounded-xl text-gray-400 hover:text-red-500 transition-colors"
          >
            <LogOut size={20} />
          </button>
        </div>

        <div className="bg-violet-50 p-4 rounded-3xl flex items-center gap-4 mb-4">
           <div className="flex-1">
              <h3 className="text-violet-900 font-bold text-sm">Bienvenue, Professeur</h3>
              <p className="text-violet-600 text-[10px] font-medium">Vous avez {students.length} étudiants à suivre.</p>
           </div>
           <button onClick={() => setActiveTab("lessons")} className="bg-violet-600 text-white p-2 rounded-xl shadow-md">
              <Plus size={16} />
           </button>
        </div>
      </div>

      <div className="px-6 space-y-8 flex-1 pb-10">
        {activeTab === "dashboard" && (
          <>
            <div>
              <h2 className="text-lg font-bold mb-4">Outils Pédagogiques</h2>
              <div className="grid grid-cols-2 gap-4">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className="bg-white p-5 rounded-[32px] shadow-sm border border-gray-100 flex flex-col items-center text-center gap-3 hover:shadow-md transition-all active:scale-95"
                  >
                    <div className={`${item.color} w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-${item.color.split('-')[1]}-500/20`}>
                      <item.icon size={24} />
                    </div>
                    <span className="text-sm font-bold text-gray-700 leading-tight">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-bold mb-4">Dernières Publications</h2>
              <div className="space-y-3">
                {lessons.slice(0, 2).map((l, i) => (
                   <div key={i} className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center gap-4 shadow-sm">
                      <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                        <BookOpen size={18} />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold">{l.title}</h4>
                        <p className="text-[10px] text-gray-400">Publié pour {l.niveau} • {new Date(l.date).toLocaleDateString()}</p>
                      </div>
                      <ChevronRight size={16} className="text-gray-300" />
                   </div>
                ))}
                {assignments.slice(0, 2).map((a, i) => (
                   <div key={i} className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center gap-4 shadow-sm">
                      <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center">
                        <FileText size={18} />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold">{a.title}</h4>
                        <p className="text-[10px] text-gray-400">Deadline: {a.deadline}</p>
                      </div>
                      <ChevronRight size={16} className="text-gray-300" />
                   </div>
                ))}
                {lessons.length === 0 && assignments.length === 0 && <p className="text-center text-gray-400 py-10">Aucune publication.</p>}
              </div>
            </div>
          </>
        )}

        {(activeTab === "lessons" || activeTab === "assignments") && (
           <div className="space-y-6">
            <button onClick={() => setActiveTab("dashboard")} className="flex items-center gap-2 text-gray-500 font-bold mb-2">
              <ChevronRight className="rotate-180" size={20} /> Retour
            </button>
            <h2 className="text-2xl font-black">{menuItems.find(i => i.id === activeTab)?.label}</h2>
            <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm space-y-4">
              <form onSubmit={activeTab === 'lessons' ? handlePublishLesson : handlePublishAssignment} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold mb-2">Matière</label>
                  <input name="subject" required type="text" className="w-full bg-gray-50 border-none rounded-xl p-3 outline-none" placeholder="Ex: Mathématiques" />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">{t("titre")}</label>
                  <input name="title" required type="text" className="w-full bg-gray-50 border-none rounded-xl p-3 outline-none" placeholder="Ex: Algèbre Linéaire" />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">{t("description")}</label>
                  <textarea name="description" required className="w-full bg-gray-50 border-none rounded-xl p-3 outline-none min-h-[100px]" placeholder="Description du contenu..."></textarea>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-bold mb-2">{t("niveau")}</label>
                    <select name="niveau" className="w-full bg-gray-50 border-none rounded-xl p-3 outline-none">
                      {NIVEAUX.map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2">{t("filiere")} (Multi-sélection)</label>
                    <div className="grid grid-cols-2 gap-2 bg-gray-50 p-4 rounded-xl max-h-40 overflow-y-auto">
                      {FILIERES.map(f => (
                        <label key={f} className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedFilieres.includes(f)}
                            onChange={(e) => {
                              if(e.target.checked) setSelectedFilieres([...selectedFilieres, f]);
                              else setSelectedFilieres(selectedFilieres.filter(x => x !== f));
                            }}
                            className="rounded text-violet-600"
                          />
                          {f}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2">Campus (Multi-sélection)</label>
                    <div className="grid grid-cols-2 gap-2 bg-gray-50 p-4 rounded-xl">
                      {CAMPUSES.map(c => (
                        <label key={c} className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedCampuses.includes(c)}
                            onChange={(e) => {
                              if(e.target.checked) setSelectedCampuses([...selectedCampuses, c]);
                              else setSelectedCampuses(selectedCampuses.filter(x => x !== c));
                            }}
                            className="rounded text-violet-600"
                          />
                          {c}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                {activeTab === "assignments" && (
                  <div>
                    <label className="block text-sm font-bold mb-2">{t("date_limite")}</label>
                    <input name="deadline" required type="date" className="w-full bg-gray-50 border-none rounded-xl p-3 outline-none" />
                  </div>
                )}
                <button
                  type="submit"
                  className={`w-full text-white py-4 rounded-xl font-bold shadow-lg active:scale-95 transition-transform ${activeTab === 'lessons' ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-orange-500 shadow-orange-500/20'}`}>
                  {activeTab === 'lessons' ? t("publier_lecon") : t("publier_devoir")}
                </button>
              </form>
            </div>
          </div>
        )}

        {activeTab === "grades" && (
          <div className="space-y-4">
             <button onClick={() => setActiveTab("dashboard")} className="flex items-center gap-2 text-gray-500 font-bold mb-2">
              <ChevronRight className="rotate-180" size={20} /> Retour
            </button>
            <h2 className="text-2xl font-black mb-4">{t("gestion_notes")}</h2>
            <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
               <div className="mb-4">
                  <label className="block text-sm font-bold mb-2">Matière</label>
                  <input id="grade-subject" type="text" className="w-full bg-gray-50 border-none rounded-xl p-3 outline-none" placeholder="Ex: Informatique" />
               </div>
               <table className="w-full text-left text-sm mb-6">
                  <thead>
                    <tr className="text-gray-400 font-bold">
                      <th className="pb-4">Étudiant</th>
                      <th className="pb-4 text-center">Note / 20</th>
                    </tr>
                  </thead>
                  <tbody className="font-medium">
                    {students.map((s, i) => (
                      <tr key={i} className="border-t border-gray-50">
                        <td className="py-4 text-xs font-bold">{s.fullName}</td>
                        <td className="py-4 text-center">
                          <input
                            id={`grade-${s.id}`}
                            type="number"
                            className="w-14 bg-gray-50 border-none rounded-lg p-2 text-center font-bold text-indigo-600"
                            placeholder="-"
                            max="20"
                            min="0"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
               </table>
               <button
                onClick={async () => {
                  const subject = (document.getElementById('grade-subject') as HTMLInputElement).value;
                  if(!subject) return alert("Veuillez saisir une matière");

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
                  alert("Notes enregistrées !");
                  setActiveTab("dashboard");
                }}
                className="w-full bg-pink-500 text-white py-4 rounded-xl font-bold shadow-lg shadow-pink-500/20 active:scale-95 transition-transform flex items-center justify-center gap-2">
                  <Save size={20} /> Enregistrer les notes
               </button>
            </div>
          </div>
        )}

        {activeTab === "students" && (
           <div className="space-y-4">
             <button onClick={() => setActiveTab("dashboard")} className="flex items-center gap-2 text-gray-500 font-bold mb-2">
              <ChevronRight className="rotate-180" size={20} /> Retour
            </button>
            <h2 className="text-2xl font-black mb-4">Suivi des Étudiants</h2>
            <div className="space-y-3">
              {students.map((s, i) => (
                <div key={i} className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center gap-4 shadow-sm">
                   <div className="w-12 h-12 bg-indigo-50 rounded-full overflow-hidden flex items-center justify-center">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${s.fullName}`} alt={s.fullName} />
                   </div>
                   <div className="flex-1">
                      <h4 className="font-bold text-sm">{s.fullName}</h4>
                      <p className="text-[10px] text-gray-500 font-medium">{s.filiere} • {s.niveau} • {s.campus}</p>
                   </div>
                   <button
                    onClick={() => alert(`Contacter ${s.fullName} via messagerie GSI.`)}
                    className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                      <Users size={18} />
                   </button>
                </div>
              ))}
              {students.length === 0 && <p className="text-center text-gray-400 py-10">Aucun étudiant dans votre liste.</p>}
            </div>
          </div>
        )}

        {activeTab === "schedule" && (
           <div className="space-y-4">
             <button onClick={() => setActiveTab("dashboard")} className="flex items-center gap-2 text-gray-500 font-bold mb-2">
              <ChevronRight className="rotate-180" size={20} /> Retour
            </button>
            <h2 className="text-2xl font-black mb-4">{t("modifier_edt")}</h2>
            <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm text-center">
               <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-[30%] flex items-center justify-center mx-auto mb-6 border-2 border-dashed border-blue-200">
                  <Upload size={32} />
               </div>
               <h3 className="font-bold mb-2">Charger un nouvel emploi du temps</h3>
               <p className="text-xs text-gray-400 mb-8 max-w-[200px] mx-auto">Format supportés: PDF, Excel, JPG. Taille max 10MB.</p>

               <div className="grid grid-cols-2 gap-3 mb-6">
                  <select className="bg-gray-50 border-none rounded-xl p-3 text-xs font-bold outline-none">
                     {CAMPUSES.map(c => <option key={c}>{c}</option>)}
                  </select>
                  <select className="bg-gray-50 border-none rounded-xl p-3 text-xs font-bold outline-none">
                     {NIVEAUX.map(n => <option key={n}>{n}</option>)}
                  </select>
               </div>

               <button
                onClick={() => alert("Fichier envoyé pour traitement. L'emploi du temps sera mis à jour après validation administrative.")}
                className="w-full bg-blue-500 text-white py-4 rounded-xl font-bold shadow-lg shadow-blue-500/20 active:scale-95 transition-transform flex items-center justify-center gap-2">
                  <CheckCircle size={20} /> Soumettre pour validation
               </button>
            </div>
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => setActiveTab("lessons")}
        className="fixed bottom-6 right-6 w-14 h-14 bg-violet-600 text-white rounded-full shadow-xl shadow-violet-600/40 flex items-center justify-center hover:scale-110 active:scale-90 transition-all z-50"
      >
        <Plus size={28} />
      </button>
    </div>
  );
}
