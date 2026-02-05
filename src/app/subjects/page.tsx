import { AppLayout } from "@/components/app-layout";
import { Search, Filter, BookOpen, Video, FileText, CheckCircle } from "lucide-react";

export default function SubjectsPage() {
  const subjects = [
    { id: 1, name: "Mathématiques", icon: "📐", progress: 75, instructor: "Prof. Smith" },
    { id: 2, name: "Physique", icon: "⚛️", progress: 60, instructor: "Prof. Alex" },
    { id: 3, name: "Chimie", icon: "🧪", progress: 45, instructor: "Prof. Jane" },
    { id: 4, name: "Géographie", icon: "🌍", progress: 90, instructor: "Prof. Clark" },
  ];

  return (
    <AppLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Mes Matières</h1>

        <div className="flex gap-2 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Rechercher..."
              className="w-full bg-gray-100 rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 ring-primary/20"
            />
          </div>
          <button className="bg-gray-100 p-3 rounded-xl">
            <Filter size={20} className="text-gray-600" />
          </button>
        </div>

        <div className="space-y-4">
          {subjects.map((subject) => (
            <SubjectCard key={subject.id} subject={subject} />
          ))}
        </div>
      </div>
    </AppLayout>
  );
}

function SubjectCard({ subject }: { subject: any }) {
  return (
    <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-2xl">
            {subject.icon}
          </div>
          <div>
            <h3 className="font-bold text-lg">{subject.name}</h3>
            <p className="text-xs text-gray-500">{subject.instructor}</p>
          </div>
        </div>
        <div className="text-primary font-bold">{subject.progress}%</div>
      </div>

      <div className="w-full bg-gray-100 h-2 rounded-full mb-6">
        <div
          className="bg-primary h-full rounded-full transition-all duration-1000"
          style={{ width: `${subject.progress}%` }}
        ></div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <SubjectAction icon={BookOpen} label="Syllabus" />
        <SubjectAction icon={FileText} label="Supports" />
        <SubjectAction icon={CheckCircle} label="Notes" />
      </div>
    </div>
  );
}

function SubjectAction({ icon: Icon, label }: { icon: any, label: string }) {
  return (
    <button className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-gray-50 transition-colors">
      <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-600">
        <Icon size={16} />
      </div>
      <span className="text-[10px] font-medium text-gray-500">{label}</span>
    </button>
  );
}
