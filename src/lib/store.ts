"use client";

import { auth, db, storage } from "./firebase";
import {
  doc, getDoc, setDoc, Timestamp, collection, getDocs,
  query, orderBy, onSnapshot, where, addDoc, deleteDoc, updateDoc
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { ref, getDownloadURL, uploadBytesResumable } from "firebase/storage";

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
}

export interface Lesson { id: string; title: string; description: string; subject: string; niveau: string; filiere: string[]; campus: string[]; date: string; files: string[]; }
export interface Assignment { id: string; title: string; description: string; subject: string; niveau: string; filiere: string[]; campus: string[]; deadline: string; timeLimit: string; maxScore: number; files?: string[]; }
export interface Submission { id: string; assignmentId: string; studentId: string; studentName: string; date: string; file: string; score?: number; feedback?: string; }
export interface Grade { id: string; studentId: string; studentName: string; subject: string; score: number; maxScore: number; date: string; niveau: string; filiere: string; }
export interface Announcement { id: string; title: string; message: string; date: string; author: string; type?: 'info' | 'convocation'; targetUserId?: string; }

interface State {
  currentUser: User | null;
  users: User[];
  lessons: Lesson[];
  assignments: Assignment[];
  submissions: Submission[];
  grades: Grade[];
  announcements: Announcement[];
  schedules: Record<string, any>;
}

const initialState: State = {
  currentUser: null,
  users: [],
  lessons: [],
  assignments: [],
  submissions: [],
  grades: [],
  announcements: [],
  schedules: {}
};

class GSIStoreClass {
  private state: State = { ...initialState };
  private listeners: Record<string, ((data: any) => void)[]> = {};
  private firebaseUnsubs: Record<string, () => void> = {};
  private saveTimeout: any = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.hydrate();
      this.setupAuth();
      window.addEventListener('beforeunload', () => this.saveImmediate());
    }
  }

  private hydrate() {
    try {
      const saved = localStorage.getItem('gsi_v6_master');
      if (saved) {
        this.state = { ...initialState, ...JSON.parse(saved) };
      }
      if (this.state.users.length === 0) this.generateMockData();
    } catch (e) {}
  }

  private generateMockData() {
    this.state.users = [
      { id: 'admin-id', fullName: 'Nina GSI', email: 'admin@gsi.mg', role: 'admin', campus: 'Antananarivo', filiere: 'Directeur', niveau: 'N/A' },
      { id: 'prof-id', fullName: 'Professeur GSI', email: 'prof@gsi.mg', role: 'professor', campus: 'Antananarivo', filiere: 'Informatique', niveau: 'L1' }
    ];
    this.state.lessons = [
      { id: 'l1', title: 'Guide GSI Insight', description: 'Bienvenue.', subject: 'Général', niveau: 'L1', filiere: [], campus: [], date: new Date().toISOString(), files: [] }
    ];
    this.saveImmediate();
  }

  private save() {
    if (typeof window !== 'undefined') {
      if (this.saveTimeout) clearTimeout(this.saveTimeout);
      this.saveTimeout = setTimeout(() => this.saveImmediate(), 500);
    }
  }

  private saveImmediate() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('gsi_v6_master', JSON.stringify(this.state));
      } catch (e) {
        console.error("Failed to save GSIStore state", e);
      }
    }
  }

  private notify(key: string, data: any) {
    // Notify exact matches
    if (this.listeners[key]) {
      this.listeners[key].forEach(cb => { try { cb(data); } catch(e) {} });
    }
    // Also notify if this is a state key that has sub-listeners (e.g. 'users' notifies 'users_users')
    Object.keys(this.listeners).forEach(subKey => {
      if (subKey !== key && subKey.startsWith(key + '_')) {
        this.listeners[subKey].forEach(cb => { try { cb(data); } catch(e) {} });
      }
    });
  }

  private setupAuth() {
    if (auth) {
      onAuthStateChanged(auth, async (fbUser) => {
        if (fbUser) {
          const user = await this.getUser(fbUser.uid);
          if (user) this.setCurrentUser(user);
        }
      });
    }
  }

  // --- STORE ACCESS ---

  getCurrentUser() { return this.state.currentUser; }
  setCurrentUser(user: User | null) {
    this.state.currentUser = user;
    this.save();
    this.notify('auth', user);
  }

  // Robust Subscription with cache and multi-listener support
  private baseSubscribe(key: keyof State, cb: (data: any) => void, collectionName?: string, queryConstraint?: any, customSubKey?: string) {
    const subKey = customSubKey || (collectionName ? `${key as string}_${collectionName}` : key as string);

    if (!this.listeners[subKey]) this.listeners[subKey] = [];
    this.listeners[subKey].push(cb);

    // Immediate return local state to the new listener
    cb(this.state[key]);

    // Setup Firebase subscription if not already active for this key
    if (db && collectionName && !this.firebaseUnsubs[subKey]) {
      let q = query(collection(db, collectionName));
      if (queryConstraint) q = queryConstraint;

      this.firebaseUnsubs[subKey] = onSnapshot(q, (snap) => {
        const cloudData = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        const currentLocal = this.state[key];

        let merged: any;
        if (Array.isArray(currentLocal)) {
           const cloudIds = new Set(cloudData.map((d: any) => d.id));
           const localOnly = currentLocal.filter(item => !cloudIds.has(item.id));
           merged = [...cloudData, ...localOnly];
        } else {
           merged = { ...currentLocal };
           cloudData.forEach((d: any) => {
              if (key === 'schedules') {
                 const schedKey = `${d.campus}_${d.niveau}`;
                 merged[schedKey] = d;
              } else {
                 merged[d.id] = d;
              }
           });
        }

        (this.state[key] as any) = merged;
        this.save();
        this.notify(subKey, merged);
      }, (err) => {
        console.warn(`Sync ${subKey} offline:`, err);
      });
    }

    return () => {
      this.listeners[subKey] = this.listeners[subKey]?.filter(l => l !== cb);
      // Clean up Firebase if no more listeners for this specific subscription
      if (this.listeners[subKey]?.length === 0 && this.firebaseUnsubs[subKey]) {
        this.firebaseUnsubs[subKey]();
        delete this.firebaseUnsubs[subKey];
      }
    };
  }

  subscribe(cb: (u: User | null) => void) { return this.subscribeAuth(cb); }

  subscribeAuth(cb: (u: User | null) => void) {
    if (!this.listeners['auth']) this.listeners['auth'] = [];
    this.listeners['auth'].push(cb);
    cb(this.state.currentUser);
    return () => { this.listeners['auth'] = this.listeners['auth']?.filter(l => l !== cb); };
  }

  subscribeUsers(cb: (us: User[]) => void) { return this.baseSubscribe('users', cb, 'users'); }

  subscribeLessons(filter: { niveau?: string }, cb: (ls: Lesson[]) => void) {
    return this.baseSubscribe('lessons', (data) => {
      const filtered = filter.niveau ? data.filter((l: any) => l.niveau === filter.niveau) : data;
      cb(filtered);
    }, 'lessons');
  }

  subscribeAssignments(filter: { niveau?: string }, cb: (as: Assignment[]) => void) {
    return this.baseSubscribe('assignments', (data) => {
      const filtered = filter.niveau ? data.filter((a: any) => a.niveau === filter.niveau) : data;
      cb(filtered);
    }, 'assignments');
  }

  subscribeAnnouncements(cb: (as: Announcement[]) => void) { return this.baseSubscribe('announcements', cb, 'announcements'); }

  subscribeGrades(studentId: string, cb: (gs: Grade[]) => void) {
    return this.baseSubscribe('grades', (data) => {
      cb(data.filter((g: any) => g.studentId === studentId));
    }, 'grades', query(collection(db, "grades"), where("studentId", "==", studentId)), `grades_${studentId}`);
  }

  subscribeLatestSchedule(campus: string, niveau: string, cb: (s: any) => void) {
    const sKey = `${campus}_${niveau}`;
    return this.baseSubscribe('schedules', (data) => {
       cb(data[sKey] || null);
    }, 'schedules', query(collection(db, "schedules"), where("campus", "==", campus), where("niveau", "==", niveau), orderBy("createdAt", "desc")), `schedule_${sKey}`);
  }

  // --- NON-BLOCKING ACTIONS ---

  private async cloudTask(task: () => Promise<any>) {
    try { await task(); } catch(e) { console.error("Cloud background task failed", e); }
  }

  async addUser(user: User) {
    this.state.users = [user, ...this.state.users.filter(u => u.id !== user.id)];
    this.save();
    this.notify('users', this.state.users);
    if (db) this.cloudTask(() => setDoc(doc(db, "users", user.id), { ...user, updatedAt: Timestamp.now() }));
  }

  async addLesson(lesson: Lesson) {
    this.state.lessons = [lesson, ...this.state.lessons.filter(l => l.id !== lesson.id)];
    this.save();
    this.notify('lessons', this.state.lessons);
    if (db) this.cloudTask(() => setDoc(doc(db, "lessons", lesson.id), { ...lesson, createdAt: Timestamp.now() }));
  }

  async addAssignment(assignment: Assignment) {
    this.state.assignments = [assignment, ...this.state.assignments.filter(a => a.id !== assignment.id)];
    this.save();
    this.notify('assignments', this.state.assignments);
    if (db) this.cloudTask(() => setDoc(doc(db, "assignments", assignment.id), { ...assignment, createdAt: Timestamp.now() }));
  }

  async addAnnouncement(ann: Announcement) {
    this.state.announcements = [ann, ...this.state.announcements];
    this.save();
    this.notify('announcements', this.state.announcements);
    if (db) this.cloudTask(() => addDoc(collection(db, "announcements"), { ...ann, createdAt: Timestamp.now() }));
  }

  async addGrade(grade: Grade) {
    this.state.grades = [grade, ...this.state.grades];
    this.save();
    this.notify('grades', this.state.grades);
    if (db) this.cloudTask(() => addDoc(collection(db, "grades"), { ...grade, createdAt: Timestamp.now() }));
  }

  async updateUser(user: User) {
    this.state.users = this.state.users.map(u => u.id === user.id ? user : u);
    this.save();
    this.notify('users', this.state.users);
    if (db) this.cloudTask(() => updateDoc(doc(db, "users", user.id), { ...user }));
  }

  async deleteUser(id: string) {
    this.state.users = this.state.users.filter(u => u.id !== id);
    this.save();
    this.notify('users', this.state.users);
    if (db) this.cloudTask(() => deleteDoc(doc(db, "users", id)));
  }

  async addSubmission(s: Submission) {
    if (db) this.cloudTask(() => addDoc(collection(db, "submissions"), { ...s, createdAt: Timestamp.now() }));
  }

  async addSchedule(schedule: any) {
    if (db) this.cloudTask(() => addDoc(collection(db, "schedules"), { ...schedule, createdAt: Timestamp.now() }));
  }

  async uploadFile(file: File, path: string, onProgress?: (p: number) => void): Promise<string> {
    if (!storage) throw new Error("Storage offline");
    const storageRef = ref(storage, path);
    const uploadTask = uploadBytesResumable(storageRef, file);
    return new Promise((resolve, reject) => {
      uploadTask.on('state_changed',
        (snap) => { if (onProgress) onProgress((snap.bytesTransferred / snap.totalBytes) * 100); },
        (err) => reject(err),
        async () => {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(url);
        }
      );
    });
  }

  async getUser(id: string): Promise<User | null> {
    const local = this.state.users.find(u => u.id === id);
    if (local) return local;
    if (db) {
      try {
        const snap = await getDoc(doc(db, "users", id));
        if (snap.exists()) return { id: snap.id, ...snap.data() } as User;
      } catch (e) {}
    }
    return null;
  }

  async getUsers() { return this.state.users; }
  async getLessons() { return this.state.lessons; }
  async getAssignments() { return this.state.assignments; }
  async getGrades() { return this.state.grades; }
  async getAnnouncements() { return this.state.announcements; }
  getCache<T>(key: string): T | null { return (this.state as any)[key] || null; }
  setCache(key: string, data: any) { (this.state as any)[key] = data; this.save(); }

  saveProgress(id: string, p: any) {
    const all = JSON.parse(localStorage.getItem('gsi_progress') || '{}');
    all[id] = { ...p, ts: Date.now() };
    localStorage.setItem('gsi_progress', JSON.stringify(all));
  }
  getProgress(id: string) { return JSON.parse(localStorage.getItem('gsi_progress') || '{}')[id] || null; }
  setDownloaded(id: string, s = true) {
    const all = JSON.parse(localStorage.getItem('gsi_downloaded') || '{}');
    all[id] = s;
    localStorage.setItem('gsi_downloaded', JSON.stringify(all));
  }
  isDownloaded(id: string) { return !!JSON.parse(localStorage.getItem('gsi_downloaded') || '{}')[id]; }
}

export const GSIStore = new GSIStoreClass();
