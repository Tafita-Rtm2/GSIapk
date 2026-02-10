"use client";

import { auth, db, storage } from "./firebase";
import {
  doc, getDoc, setDoc, Timestamp, collection, getDocs,
  query, orderBy, onSnapshot, where, addDoc, deleteDoc, updateDoc
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { ref, getDownloadURL, uploadBytesResumable } from "firebase/storage";
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Browser } from '@capacitor/browser';

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
export interface Announcement { id: string; title: string; message: string; date: string; author: string; type?: 'info' | 'convocation'; targetUserId?: string; campus?: string[]; filiere?: string[]; niveau?: string; }

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
    const mockUsers: User[] = [
      { id: 'admin-id', fullName: 'Nina GSI', email: 'admin@gsi.mg', role: 'admin', campus: 'Antananarivo', filiere: 'Directeur', niveau: 'N/A' },
      { id: 'prof-id', fullName: 'Professeur GSI', email: 'prof@gsi.mg', role: 'professor', campus: 'Antananarivo', filiere: 'Informatique', niveau: 'L1' }
    ];

    // Only add if not already present
    mockUsers.forEach(mu => {
      if (!this.state.users.find(u => u.id === mu.id)) {
        this.state.users.push(mu);
      }
    });

    if (this.state.lessons.length === 0) {
      this.state.lessons = [
        { id: 'l1', title: 'Guide GSI Insight', description: 'Bienvenue.', subject: 'Général', niveau: 'L1', filiere: [], campus: [], date: new Date().toISOString(), files: [] }
      ];
    }
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
    const q = filter.niveau ? query(collection(db, "lessons"), where("niveau", "==", filter.niveau)) : undefined;
    return this.baseSubscribe('lessons', (data) => {
      const filtered = filter.niveau ? data.filter((l: any) => l.niveau === filter.niveau) : data;
      cb(filtered);
    }, 'lessons', q, filter.niveau ? `lessons_${filter.niveau}` : undefined);
  }

  subscribeAssignments(filter: { niveau?: string }, cb: (as: Assignment[]) => void) {
    const q = filter.niveau ? query(collection(db, "assignments"), where("niveau", "==", filter.niveau)) : undefined;
    return this.baseSubscribe('assignments', (data) => {
      const filtered = filter.niveau ? data.filter((a: any) => a.niveau === filter.niveau) : data;
      cb(filtered);
    }, 'assignments', q, filter.niveau ? `assignments_${filter.niveau}` : undefined);
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
    if (db) {
      // CRITICAL: Await user creation to prevent "Profil Introuvable" on immediate login/sync
      return await setDoc(doc(db, "users", user.id), { ...user, updatedAt: Timestamp.now() });
    }
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

  // --- OFFLINE PACKS ENGINE ---

  async downloadPackFile(url: string, fileName: string, lessonId: string) {
    try {
      if (typeof window === 'undefined' || !window.navigator.onLine) {
         throw new Error("Connexion requise pour le téléchargement.");
      }

      // 1. Fetch file as blob
      const response = await fetch(url);
      const blob = await response.blob();

      // 2. Convert to Base64 (Capacitor requirement)
      const reader = new FileReader();
      const base64Data = await new Promise<string>((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });

      // 3. Save to Capacitor Filesystem
      const path = `gsi_packs/${lessonId}_${fileName}`;
      await Filesystem.writeFile({
        path,
        data: base64Data,
        directory: Directory.Data,
        recursive: true
      });

      // 4. Mark as downloaded locally
      this.setDownloaded(lessonId, true);
      this.saveProgress(lessonId, { localPath: path });

      return path;
    } catch (e: any) {
      console.error("Pack download failed", e);
      throw e;
    }
  }

  async openPackFile(lessonId: string, fallbackUrl: string) {
    try {
      const progress = this.getProgress(lessonId);
      if (progress?.localPath) {
         // Check if file still exists
         const stat = await Filesystem.stat({
           path: progress.localPath,
           directory: Directory.Data
         });

         if (stat) {
            // Get URI for the local file
            const fileUri = await Filesystem.getUri({
              path: progress.localPath,
              directory: Directory.Data
            });

            // Open via Capacitor Browser or standard window
            await Browser.open({ url: fileUri.uri });
            return;
         }
      }

      // Fallback to cloud URL
      if (fallbackUrl) {
         if (typeof window !== 'undefined') window.open(fallbackUrl, '_blank');
      }
    } catch (e) {
      console.warn("Could not open local pack, falling back to cloud.");
      if (fallbackUrl && typeof window !== 'undefined') window.open(fallbackUrl, '_blank');
    }
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

  async getUser(id: string, forceCloud = false): Promise<User | null> {
    const local = this.state.users.find(u => u.id === id);
    if (local && !forceCloud) return local;

    if (db) {
      try {
        // Robust fetch: try immediate, then retry after a short delay if it's a new device sync
        let snap = await getDoc(doc(db, "users", id));
        if (!snap.exists() && forceCloud) {
           // Small delay for Firestore propagation if needed
           await new Promise(r => setTimeout(r, 1000));
           snap = await getDoc(doc(db, "users", id));
        }

        if (snap.exists()) {
          const userData = { id: snap.id, ...snap.data() } as User;
          // Update local cache
          this.state.users = [userData, ...this.state.users.filter(u => u.id !== id)];
          this.save();
          return userData;
        }
      } catch (e) {
        console.error("Error fetching user from Firestore:", e);
      }
    }
    return local || null;
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
