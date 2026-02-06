"use client";

import { auth, db } from "./firebase";
import { doc, getDoc, setDoc, Timestamp, collection, getDocs, query, orderBy, onSnapshot, where, addDoc, deleteDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { ref, getDownloadURL, uploadBytesResumable } from "firebase/storage";
import { storage } from "./firebase";
import * as Realm from "realm-web";

// Types
export interface User {
  id: string;
  fullName: string;
  email: string;
  role: 'student' | 'professor' | 'admin';
  campus: string;
  filiere: string;
  niveau: string;
  photo?: string;
  createdAt?: any;
}

export interface Payment { id: string; studentId: string; studentName: string; amount: string; date: string; status: 'paid' | 'pending' | 'overdue'; description: string; campus: string; filiere: string; niveau: string; }
export interface Lesson { id: string; title: string; description: string; subject: string; niveau: string; filiere: string[]; campus: string[]; date: string; files: string[]; }
export interface Assignment { id: string; title: string; description: string; subject: string; niveau: string; filiere: string[]; campus: string[]; deadline: string; timeLimit: string; maxScore: number; files?: string[]; }
export interface Submission { id: string; assignmentId: string; studentId: string; studentName: string; date: string; file: string; score?: number; feedback?: string; }
export interface Grade { id: string; studentId: string; studentName: string; subject: string; score: number; maxScore: number; date: string; niveau: string; filiere: string; }
export interface Announcement { id: string; title: string; message: string; date: string; author: string; }

// --- MONGODB ATLAS CONFIGURATION ---
const MONGODB_APP_ID = process.env.NEXT_PUBLIC_MONGODB_APP_ID || "gsi-insight-data-v1";

let mongoApp: any = null;
if (typeof window !== 'undefined') {
  try {
    mongoApp = new Realm.App({ id: MONGODB_APP_ID });
  } catch (e) {
    console.warn("MongoDB Atlas disabled.");
  }
}

// --- LOCAL DATA PACK STORE ---
const MemoryStore: {
  currentUser: User | null;
  users: User[];
  lessons: Lesson[];
  assignments: Assignment[];
  submissions: Submission[];
  grades: Grade[];
  announcements: Announcement[];
  payments: Payment[];
  schedules: Record<string, any>;
} = {
  currentUser: null,
  users: [],
  lessons: [],
  assignments: [],
  submissions: [],
  grades: [],
  announcements: [],
  payments: [],
  schedules: {}
};

const storeListeners: Record<string, ((data: any) => void)[]> = {
  auth: [], users: [], lessons: [], assignments: [], submissions: [], grades: [], announcements: [], payments: [], schedules: []
};

const notifyStoreListeners = (key: string, data: any) => {
  if (storeListeners[key]) {
    storeListeners[key].forEach(callback => {
      try { callback(data); } catch(e) { console.error(`Listener error for ${key}`, e); }
    });
  }
};

// --- INITIAL LOAD FROM DISK ---
if (typeof window !== 'undefined') {
  const keys = ['currentUser', 'users', 'lessons', 'assignments', 'submissions', 'grades', 'announcements', 'payments', 'schedules'];
  keys.forEach(key => {
    try {
      const saved = localStorage.getItem(`gsi_v4_pack_${key}`);
      if (saved) MemoryStore[key as keyof typeof MemoryStore] = JSON.parse(saved);
    } catch (e) {}
  });

  // Mock initial data if completely empty to avoid "rien ne fonctionne"
  if (MemoryStore.users.length === 0) {
     console.log("GSI Store: Generating Mock Pack Data...");
     MemoryStore.users = [
       { id: 'mock-1', fullName: 'Étudiant Test', email: 'test@gsi.mg', role: 'student', campus: 'Antananarivo', filiere: 'Informatique', niveau: 'L1' },
       { id: 'mock-2', fullName: 'Professeur Test', email: 'prof@gsi.mg', role: 'professor', campus: 'Antananarivo', filiere: 'Informatique', niveau: 'L1' }
     ];
     MemoryStore.lessons = [
       { id: 'l1', title: 'Introduction GSI', description: 'Bienvenue sur GSI Insight.', subject: 'Général', niveau: 'L1', filiere: [], campus: [], date: new Date().toISOString(), files: [] }
     ];
     MemoryStore.payments = [
       { id: 'p1', studentId: 'mock-1', studentName: 'Étudiant Test', amount: '1.200.000 Ar', date: new Date().toISOString().split('T')[0], status: 'paid', description: 'Frais Inscription', campus: 'Antananarivo', filiere: 'Informatique', niveau: 'L1' }
     ];
  }
}

// --- CLOUD SYNC ---
if (typeof window !== 'undefined') {
  if (auth) {
    onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        if (db) {
          onSnapshot(doc(db, "users", firebaseUser.uid), (docSnap) => {
            if (docSnap.exists()) GSIStore.setCurrentUser(docSnap.data() as User);
          }, (err) => console.error("Firebase Sync User Error", err));
        }
      }
    });
  }

  // Background MongoDB Sync
  setTimeout(() => GSIStore.syncWithMongoDB(), 3000);
}

export const GSIStore = {
  saveToDisk(key: string, data: any) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`gsi_v4_pack_${key}`, JSON.stringify(data));
    }
  },

  subscribe: (callback: (user: User | null) => void) => {
    storeListeners.auth.push(callback);
    callback(MemoryStore.currentUser);
    return () => { storeListeners.auth = storeListeners.auth.filter(l => l !== callback); };
  },

  getCurrentUser: () => MemoryStore.currentUser,

  setCurrentUser: (user: User | null) => {
    MemoryStore.currentUser = user;
    GSIStore.saveToDisk('currentUser', user);
    notifyStoreListeners('auth', user);
  },

  async syncWithMongoDB() {
    if (!mongoApp) return;
    try {
      if (!mongoApp.currentUser) await mongoApp.logIn(Realm.Credentials.anonymous());
      const mongodb = mongoApp.currentUser.mongoClient("mongodb-atlas");
      const db_name = "gsi_insight";

      const remoteLessons = await mongodb.db(db_name).collection("lessons").find({});
      if (remoteLessons.length > 0) {
        MemoryStore.lessons = remoteLessons.map((l: any) => ({ ...l, id: l._id.toString() }));
        GSIStore.saveToDisk('lessons', MemoryStore.lessons);
        notifyStoreListeners('lessons', MemoryStore.lessons);
      }
    } catch (e) {
      console.warn("MongoDB Sync Skip.");
    }
  },

  subscribeUsers(callback: (users: User[]) => void) {
    storeListeners.users.push(callback);
    callback(MemoryStore.users);

    if (!db) return () => {};
    return onSnapshot(collection(db, "users"), (snapshot) => {
      const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
      MemoryStore.users = users.sort((a,b) => (a.fullName || "").localeCompare(b.fullName || ""));
      GSIStore.saveToDisk('users', MemoryStore.users);
      callback(MemoryStore.users);
      notifyStoreListeners('users', MemoryStore.users);
    }, (err) => {
      getDocs(collection(db, "users")).then(snap => {
         const users = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
         MemoryStore.users = users.sort((a,b) => (a.fullName || "").localeCompare(b.fullName || ""));
         callback(MemoryStore.users);
      }).catch(e => console.error("Firebase Critical Error", e));
    });
  },

  async addUser(user: User) {
    MemoryStore.users = [...MemoryStore.users, user].sort((a,b) => a.fullName.localeCompare(b.fullName));
    GSIStore.saveToDisk('users', MemoryStore.users);
    notifyStoreListeners('users', MemoryStore.users);
    if (db) await setDoc(doc(db, "users", user.id), { ...user, createdAt: Timestamp.now() });
  },

  subscribeLessons(filter: { niveau?: string }, callback: (lessons: Lesson[]) => void) {
    storeListeners.lessons.push(callback);
    const getFiltered = (ls: Lesson[]) => filter.niveau ? ls.filter(l => l.niveau === filter.niveau) : ls;
    callback(getFiltered(MemoryStore.lessons));

    if (!db) return () => {};
    return onSnapshot(query(collection(db, "lessons"), orderBy("date", "desc")), (snapshot) => {
      const lessons = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Lesson));
      MemoryStore.lessons = lessons;
      GSIStore.saveToDisk('lessons', lessons);
      callback(getFiltered(lessons));
    });
  },

  async addLesson(lesson: Lesson) {
    const newL = { ...lesson, id: Math.random().toString(36).substr(2, 9) };
    MemoryStore.lessons = [newL, ...MemoryStore.lessons];
    GSIStore.saveToDisk('lessons', MemoryStore.lessons);
    notifyStoreListeners('lessons', MemoryStore.lessons);
    if (db) await addDoc(collection(db, "lessons"), { ...lesson, createdAt: Timestamp.now() });
  },

  subscribeAssignments(filter: { niveau?: string }, callback: (assignments: Assignment[]) => void) {
    storeListeners.assignments.push(callback);
    const getFiltered = (as: Assignment[]) => filter.niveau ? as.filter(a => a.niveau === filter.niveau) : as;
    callback(getFiltered(MemoryStore.assignments));

    if (!db) return () => {};
    return onSnapshot(query(collection(db, "assignments"), orderBy("deadline", "asc")), (snapshot) => {
      const as = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Assignment));
      MemoryStore.assignments = as;
      GSIStore.saveToDisk('assignments', as);
      callback(getFiltered(as));
    });
  },

  async addAssignment(assignment: Assignment) {
    const newA = { ...assignment, id: Math.random().toString(36).substr(2, 9) };
    MemoryStore.assignments = [newA, ...MemoryStore.assignments];
    GSIStore.saveToDisk('assignments', MemoryStore.assignments);
    notifyStoreListeners('assignments', MemoryStore.assignments);
    if (db) await addDoc(collection(db, "assignments"), { ...assignment, createdAt: Timestamp.now() });
  },

  subscribeGrades(studentId: string, callback: (grades: Grade[]) => void) {
    callback(MemoryStore.grades.filter(g => g.studentId === studentId));
    if (!db) return () => {};
    return onSnapshot(query(collection(db, "grades"), where("studentId", "==", studentId)), (snapshot) => {
      const gs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Grade));
      MemoryStore.grades = [...MemoryStore.grades.filter(g => g.studentId !== studentId), ...gs];
      GSIStore.saveToDisk('grades', MemoryStore.grades);
      callback(gs);
    });
  },

  async addGrade(grade: Grade) {
    MemoryStore.grades = [grade, ...MemoryStore.grades];
    GSIStore.saveToDisk('grades', MemoryStore.grades);
    if (db) await addDoc(collection(db, "grades"), { ...grade, createdAt: Timestamp.now() });
  },

  subscribePayments(callback: (payments: Payment[]) => void) {
    callback(MemoryStore.payments);
    if (!db) return () => {};
    return onSnapshot(query(collection(db, "payments"), orderBy("date", "desc")), (snapshot) => {
      const ps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Payment));
      MemoryStore.payments = ps;
      GSIStore.saveToDisk('payments', ps);
      callback(ps);
    });
  },

  async addPayment(payment: Payment) {
    MemoryStore.payments = [payment, ...MemoryStore.payments];
    GSIStore.saveToDisk('payments', MemoryStore.payments);
    if (db) await addDoc(collection(db, "payments"), { ...payment, createdAt: Timestamp.now() });
  },

  subscribeAnnouncements(callback: (anns: Announcement[]) => void) {
    callback(MemoryStore.announcements);
    if (!db) return () => {};
    return onSnapshot(query(collection(db, "announcements"), orderBy("date", "desc")), (snapshot) => {
      const anns = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Announcement));
      MemoryStore.announcements = anns;
      GSIStore.saveToDisk('announcements', anns);
      callback(anns);
    });
  },

  async addAnnouncement(ann: Announcement) {
    MemoryStore.announcements = [ann, ...MemoryStore.announcements];
    GSIStore.saveToDisk('announcements', MemoryStore.announcements);
    if (db) await addDoc(collection(db, "announcements"), { ...ann, createdAt: Timestamp.now() });
  },

  subscribeLatestSchedule(campus: string, niveau: string, callback: (schedule: any) => void) {
    const key = `${campus}_${niveau}`;
    callback(MemoryStore.schedules[key] || null);
    if (!db) return () => {};
    return onSnapshot(query(collection(db, "schedules"), where("campus", "==", campus), where("niveau", "==", niveau), orderBy("createdAt", "desc")), (snapshot) => {
      if (!snapshot.empty) {
        const s = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
        MemoryStore.schedules[key] = s;
        GSIStore.saveToDisk('schedules', MemoryStore.schedules);
        callback(s);
      }
    });
  },

  async addSchedule(schedule: any) {
    if (db) await addDoc(collection(db, "schedules"), { ...schedule, createdAt: Timestamp.now() });
  },

  async uploadFile(file: File, path: string, onProgress?: (progress: number) => void): Promise<string> {
    if (!storage) {
      console.warn("Storage not available, skipping upload.");
      return "";
    }
    const storageRef = ref(storage, path);
    return new Promise((resolve, reject) => {
      const uploadTask = uploadBytesResumable(storageRef, file);

      const timeout = setTimeout(() => {
        uploadTask.cancel();
        reject(new Error("Upload timeout (60s)"));
      }, 60000);

      uploadTask.on('state_changed',
        (snapshot) => {
          if (onProgress) onProgress((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        },
        (error) => {
          clearTimeout(timeout);
          reject(error);
        },
        () => {
          clearTimeout(timeout);
          getDownloadURL(uploadTask.snapshot.ref)
            .then(url => resolve(url))
            .catch(err => reject(err));
        }
      );
    });
  },

  getCache: <T>(key: string): T | null => {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem(`gsi_v4_pack_${key}`);
    return data ? JSON.parse(data) : null;
  },
  setCache: (key: string, data: any) => GSIStore.saveToDisk(key, data),
  async getUsers() { return MemoryStore.users; },
  async getLessons() { return MemoryStore.lessons; },
  async getAssignments() { return MemoryStore.assignments; },
  async getGrades() { return MemoryStore.grades; },
  async getPayments() { return MemoryStore.payments; },
  async getAnnouncements() { return MemoryStore.announcements; },
  async getUser(id: string) {
    if (db) {
      try {
        const snap = await getDoc(doc(db, "users", id));
        if (snap.exists()) return snap.data() as User;
      } catch(e) {}
    }
    return MemoryStore.users.find(u => u.id === id) || null;
  },
  async deleteUser(id: string) {
    MemoryStore.users = MemoryStore.users.filter(u => u.id !== id);
    notifyStoreListeners('users', MemoryStore.users);
    if (db) await deleteDoc(doc(db, "users", id));
  },
  async updateUser(user: User) {
    MemoryStore.users = MemoryStore.users.map(u => u.id === user.id ? user : u);
    notifyStoreListeners('users', MemoryStore.users);
    if (db) await updateDoc(doc(db, "users", user.id), { ...user });
  },
  saveProgress: (id: string, p: any) => {
    const all = JSON.parse(localStorage.getItem('gsi_progress') || '{}');
    all[id] = { ...p, ts: Date.now() };
    localStorage.setItem('gsi_progress', JSON.stringify(all));
  },
  getProgress: (id: string) => JSON.parse(localStorage.getItem('gsi_progress') || '{}')[id] || null,
  setDownloaded: (id: string, s = true) => {
    const all = JSON.parse(localStorage.getItem('gsi_downloaded') || '{}');
    all[id] = s;
    localStorage.setItem('gsi_downloaded', JSON.stringify(all));
  },
  isDownloaded: (id: string) => !!JSON.parse(localStorage.getItem('gsi_downloaded') || '{}')[id],
  async addSubmission(s: Submission) { if (db) await addDoc(collection(db, "submissions"), { ...s, createdAt: Timestamp.now() }); }
};
