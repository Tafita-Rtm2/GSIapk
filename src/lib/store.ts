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

// --- MONGODB ATLAS CONFIGURATION (SYNC & ACCELERATION) ---
// Note: Pour le web, Atlas nécessite un App ID (Realm/App Services).
const MONGODB_APP_ID = process.env.NEXT_PUBLIC_MONGODB_APP_ID || "gsi-insight-data-v1";

let mongoApp: any = null;
if (typeof window !== 'undefined') {
  try {
    mongoApp = new Realm.App({ id: MONGODB_APP_ID });
  } catch (e) {
    console.warn("MongoDB Atlas initialization... Local Pack enabled.");
  }
}

// --- LOCAL DATA PACK STORE (Game Pack Logic - Ultra Fluid) ---
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
  if (storeListeners[key]) storeListeners[key].forEach(callback => callback(data));
};

// --- INITIAL LOAD FROM DISK (0s Loading) ---
if (typeof window !== 'undefined') {
  const keys = ['currentUser', 'users', 'lessons', 'assignments', 'submissions', 'grades', 'announcements', 'payments', 'schedules'];
  keys.forEach(key => {
    const saved = localStorage.getItem(`gsi_data_pack_${key}`);
    if (saved) MemoryStore[key as keyof typeof MemoryStore] = JSON.parse(saved);
  });

  // Launch Background Sync with MongoDB
  setTimeout(() => {
    GSIStore.syncWithMongoDB();
  }, 1000);
}

// Firebase Auth remains for secure account access
if (typeof window !== 'undefined') {
  onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      const docRef = doc(db, "users", firebaseUser.uid);
      onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) GSIStore.setCurrentUser(docSnap.data() as User);
      });
    } else {
      const current = MemoryStore.currentUser;
      if (current && !['admin-id', 'prof-id'].includes(current.id)) GSIStore.setCurrentUser(null);
    }
  });
}

export const GSIStore = {
  // Sync to local disk
  saveToDisk(key: string, data: any) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`gsi_data_pack_${key}`, JSON.stringify(data));
    }
  },

  // Auth
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

  // CORE DATA SYNC (MongoDB Ready)
  async syncWithMongoDB() {
    if (!mongoApp) return;
    try {
      // 1. Authenticate with Atlas App Services
      if (!mongoApp.currentUser) {
        await mongoApp.logIn(Realm.Credentials.anonymous());
      }

      const mongodb = mongoApp.currentUser.mongoClient("mongodb-atlas");
      const lessonsColl = mongodb.db("gsi_insight").collection("lessons");

      // 2. High Speed Fetch from MongoDB
      const remoteLessons = await lessonsColl.find({});
      if (remoteLessons && remoteLessons.length > 0) {
        MemoryStore.lessons = remoteLessons.map((l: any) => ({ ...l, id: l._id.toString() }));
        GSIStore.saveToDisk('lessons', MemoryStore.lessons);
        notifyStoreListeners('lessons', MemoryStore.lessons);
        console.log("Sync MongoDB: Lessons updated.");
      }
    } catch (e) {
      console.warn("MongoDB Sync failed, using Local Pack + Firebase.", e);
    }
  },

  // USERS
  subscribeUsers(callback: (users: User[]) => void) {
    storeListeners.users.push(callback);
    callback(MemoryStore.users);

    return onSnapshot(query(collection(db, "users"), orderBy("fullName", "asc")), (snapshot) => {
      const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
      MemoryStore.users = users;
      GSIStore.saveToDisk('users', users);
      callback(users);
    });
  },

  async addUser(user: User) {
    MemoryStore.users = [...MemoryStore.users, user].sort((a,b) => a.fullName.localeCompare(b.fullName));
    GSIStore.saveToDisk('users', MemoryStore.users);
    await setDoc(doc(db, "users", user.id), { ...user, createdAt: Timestamp.now() });
  },

  // LESSONS
  subscribeLessons(filter: { niveau?: string }, callback: (lessons: Lesson[]) => void) {
    storeListeners.lessons.push(callback);
    const initial = filter.niveau ? MemoryStore.lessons.filter(l => l.niveau === filter.niveau) : MemoryStore.lessons;
    callback(initial);

    return onSnapshot(query(collection(db, "lessons"), orderBy("date", "desc")), (snapshot) => {
      const lessons = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Lesson));
      MemoryStore.lessons = lessons;
      GSIStore.saveToDisk('lessons', lessons);
      const filtered = filter.niveau ? lessons.filter(l => l.niveau === filter.niveau) : lessons;
      callback(filtered);
    });
  },

  async addLesson(lesson: Lesson) {
    const newL = { ...lesson, id: Math.random().toString(36).substr(2, 9) };
    MemoryStore.lessons = [newL, ...MemoryStore.lessons];
    GSIStore.saveToDisk('lessons', MemoryStore.lessons);
    await addDoc(collection(db, "lessons"), { ...lesson, createdAt: Timestamp.now() });
  },

  // ASSIGNMENTS
  subscribeAssignments(filter: { niveau?: string }, callback: (assignments: Assignment[]) => void) {
    storeListeners.assignments.push(callback);
    callback(filter.niveau ? MemoryStore.assignments.filter(a => a.niveau === filter.niveau) : MemoryStore.assignments);

    return onSnapshot(query(collection(db, "assignments"), orderBy("deadline", "asc")), (snapshot) => {
      const as = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Assignment));
      MemoryStore.assignments = as;
      GSIStore.saveToDisk('assignments', as);
      callback(filter.niveau ? as.filter(a => a.niveau === filter.niveau) : as);
    });
  },

  async addAssignment(assignment: Assignment) {
    const newA = { ...assignment, id: Math.random().toString(36).substr(2, 9) };
    MemoryStore.assignments = [newA, ...MemoryStore.assignments];
    GSIStore.saveToDisk('assignments', MemoryStore.assignments);
    await addDoc(collection(db, "assignments"), { ...assignment, createdAt: Timestamp.now() });
  },

  // GRADES
  subscribeGrades(studentId: string, callback: (grades: Grade[]) => void) {
    callback(MemoryStore.grades.filter(g => g.studentId === studentId));
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
    await addDoc(collection(db, "grades"), { ...grade, createdAt: Timestamp.now() });
  },

  // PAYMENTS
  subscribePayments(callback: (payments: Payment[]) => void) {
    callback(MemoryStore.payments);
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
    await addDoc(collection(db, "payments"), { ...payment, createdAt: Timestamp.now() });
  },

  // ANNOUNCEMENTS
  subscribeAnnouncements(callback: (anns: Announcement[]) => void) {
    callback(MemoryStore.announcements);
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
    await addDoc(collection(db, "announcements"), { ...ann, createdAt: Timestamp.now() });
  },

  // SCHEDULES
  subscribeLatestSchedule(campus: string, niveau: string, callback: (schedule: any) => void) {
    const key = `${campus}_${niveau}`;
    callback(MemoryStore.schedules[key] || null);
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
    await addDoc(collection(db, "schedules"), { ...schedule, createdAt: Timestamp.now() });
  },

  // FILE UPLOAD
  async uploadFile(file: File, path: string, onProgress?: (progress: number) => void): Promise<string> {
    const storageRef = ref(storage, path);
    return new Promise((resolve, reject) => {
      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTask.on('state_changed',
        (snapshot) => { if (onProgress) onProgress((snapshot.bytesTransferred / snapshot.totalBytes) * 100); },
        (error) => reject(error),
        () => getDownloadURL(uploadTask.snapshot.ref).then(url => resolve(url))
      );
    });
  },

  // UTILS
  getCache: <T>(key: string): T | null => {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem(`gsi_data_pack_${key}`);
    return data ? JSON.parse(data) : null;
  },
  setCache: (key: string, data: any) => GSIStore.saveToDisk(key, data),
  async getUsers() { return MemoryStore.users; },
  async getLessons() { return MemoryStore.lessons; },
  async getAssignments() { return MemoryStore.assignments; },
  async getGrades() { return MemoryStore.grades; },
  async getPayments() { return MemoryStore.payments; },
  async getAnnouncements() { return MemoryStore.announcements; },
  async getUser(id: string) { return MemoryStore.users.find(u => u.id === id) || null; },
  async deleteUser(id: string) { await deleteDoc(doc(db, "users", id)); },
  async updateUser(user: User) { await updateDoc(doc(db, "users", user.id), { ...user }); },
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
  async addSubmission(s: Submission) { await addDoc(collection(db, "submissions"), { ...s, createdAt: Timestamp.now() }); }
};
