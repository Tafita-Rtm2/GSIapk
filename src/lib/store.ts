"use client";

import { Filesystem, Directory } from '@capacitor/filesystem';
import { Browser } from '@capacitor/browser';

// --- CONFIGURATION ---
const API_BASE = "https://groupegsi.mg/rtmggmg/api";

// Types
export interface User {
  id: string; // Internal/Public UID
  fullName: string;
  email: string;
  password?: string; // Stored for custom auth
  role: 'student' | 'professor' | 'admin';
  campus: string;
  filiere: string;
  niveau: string;
  photo?: string;
  _id?: string; // API internal ID
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
  private saveTimeout: any = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.hydrate();
      this.startGlobalSync();
      window.addEventListener('beforeunload', () => this.saveImmediate());
    }
  }

  private hydrate() {
    try {
      const saved = localStorage.getItem('gsi_v8_master');
      if (saved) {
        this.state = { ...initialState, ...JSON.parse(saved) };
      }
      if (this.state.users.length === 0) this.generateMockData();
    } catch (e) {}
  }

  private generateMockData() {
    const mockUsers: User[] = [
      { id: 'admin-id', fullName: 'Nina GSI', email: 'admin@gsi.mg', password: 'password', role: 'admin', campus: 'Antananarivo', filiere: 'Directeur', niveau: 'N/A' },
      { id: 'prof-id', fullName: 'Professeur GSI', email: 'prof@gsi.mg', password: 'password', role: 'professor', campus: 'Antananarivo', filiere: 'Informatique', niveau: 'L1' }
    ];

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
        localStorage.setItem('gsi_v8_master', JSON.stringify(this.state));
      } catch (e) {
        console.error("Failed to save GSIStore state", e);
      }
    }
  }

  private notify(key: string, data: any) {
    if (this.listeners[key]) {
      this.listeners[key].forEach(cb => { try { cb(data); } catch(e) {} });
    }
    Object.keys(this.listeners).forEach(subKey => {
      if (subKey !== key && subKey.startsWith(key + '_')) {
        this.listeners[subKey].forEach(cb => { try { cb(data); } catch(e) {} });
      }
    });
  }

  private startGlobalSync() {
    // Initial aggressive sync
    this.syncAll();
    setTimeout(() => this.syncAll(), 5000);
    // Background polling
    setInterval(() => this.syncAll(), 30000);
  }

  private async syncAll() {
     this.fetchCollection('users', 'users');
     this.fetchCollection('lessons', 'lessons');
     this.fetchCollection('assignments', 'assignments');
     this.fetchCollection('announcements', 'announcements');
     this.fetchCollection('grades', 'grades');
     this.fetchCollection('schedules', 'schedules');
  }

  // --- API HELPERS ---

  private async apiCall(endpoint: string, method = 'GET', body?: any) {
    const options: RequestInit = {
      method,
      headers: { 'Content-Type': 'application/json' }
    };
    if (body) options.body = JSON.stringify(body);

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, options);
      if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
      return await response.json();
    } catch (e) {
      console.warn(`API call to ${endpoint} failed:`, e);
      return null;
    }
  }

  private async fetchCollection(key: keyof State, collectionName: string, queryParams = "") {
    const data = await this.apiCall(`/db/${collectionName}${queryParams}`);
    if (data) {
      const cloudData = Array.isArray(data) ? data : [];
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
      this.notify(key as string, merged);

      Object.keys(this.listeners).forEach(subKey => {
         if (subKey.startsWith(`${key as string}_`)) {
            this.notify(subKey, merged);
         }
      });
    }
  }

  // --- CUSTOM AUTH ---

  async login(email: string, password: string): Promise<User | null> {
    const data = await this.apiCall(`/db/users?q={"email":"${email}","password":"${password}"}`);
    if (data && Array.isArray(data) && data.length > 0) {
       const user = data[0] as User;
       this.setCurrentUser(user);
       return user;
    }
    // Check local fallback (mock accounts)
    const local = this.state.users.find(u => u.email === email && u.password === password);
    if (local) {
       this.setCurrentUser(local);
       return local;
    }
    return null;
  }

  async register(user: User): Promise<User | null> {
    const res = await this.apiCall('/db/users', 'POST', user);
    if (res) {
       this.setCurrentUser(res);
       return res;
    }
    return null;
  }

  logout() {
    this.setCurrentUser(null);
  }

  async resetPassword(email: string): Promise<boolean> {
     const data = await this.apiCall(`/db/users?q={"email":"${email}"}`);
     if (data && Array.isArray(data) && data.length > 0) {
        // Simulated success
        return true;
     }
     return false;
  }

  // --- STORE ACCESS ---

  getCurrentUser() { return this.state.currentUser; }
  setCurrentUser(user: User | null) {
    this.state.currentUser = user;
    this.save();
    this.notify('auth', user);
  }

  subscribe(cb: (u: User | null) => void) { return this.subscribeAuth(cb); }

  subscribeAuth(cb: (u: User | null) => void) {
    if (!this.listeners['auth']) this.listeners['auth'] = [];
    this.listeners['auth'].push(cb);
    cb(this.state.currentUser);
    return () => { this.listeners['auth'] = this.listeners['auth']?.filter(l => l !== cb); };
  }

  subscribeUsers(cb: (us: User[]) => void) {
    if (!this.listeners['users']) this.listeners['users'] = [];
    this.listeners['users'].push(cb);
    cb(this.state.users);
    this.fetchCollection('users', 'users');
    return () => { this.listeners['users'] = this.listeners['users']?.filter(l => l !== cb); };
  }

  subscribeLessons(filter: { niveau?: string }, cb: (ls: Lesson[]) => void) {
    const subKey = filter.niveau ? `lessons_${filter.niveau}` : 'lessons';
    if (!this.listeners[subKey]) this.listeners[subKey] = [];
    this.listeners[subKey].push(cb);
    const applyFilter = (data: Lesson[]) => {
      const filtered = filter.niveau ? data.filter((l: any) => l.niveau === filter.niveau) : data;
      cb(filtered);
    };
    applyFilter(this.state.lessons);
    this.fetchCollection('lessons', 'lessons');
    return () => { this.listeners[subKey] = this.listeners[subKey]?.filter(l => l !== cb); };
  }

  subscribeAssignments(filter: { niveau?: string }, cb: (as: Assignment[]) => void) {
    const subKey = filter.niveau ? `assignments_${filter.niveau}` : 'assignments';
    if (!this.listeners[subKey]) this.listeners[subKey] = [];
    this.listeners[subKey].push(cb);
    const applyFilter = (data: Assignment[]) => {
      const filtered = filter.niveau ? data.filter((a: any) => a.niveau === filter.niveau) : data;
      cb(filtered);
    };
    applyFilter(this.state.assignments);
    this.fetchCollection('assignments', 'assignments');
    return () => { this.listeners[subKey] = this.listeners[subKey]?.filter(l => l !== cb); };
  }

  subscribeAnnouncements(cb: (as: Announcement[]) => void) {
    if (!this.listeners['announcements']) this.listeners['announcements'] = [];
    this.listeners['announcements'].push(cb);
    cb(this.state.announcements);
    this.fetchCollection('announcements', 'announcements');
    return () => { this.listeners['announcements'] = this.listeners['announcements']?.filter(l => l !== cb); };
  }

  subscribeGrades(studentId: string, cb: (gs: Grade[]) => void) {
    const subKey = `grades_${studentId}`;
    if (!this.listeners[subKey]) this.listeners[subKey] = [];
    this.listeners[subKey].push(cb);
    const applyFilter = (data: Grade[]) => {
      cb(data.filter((g: any) => g.studentId === studentId));
    };
    applyFilter(this.state.grades);
    this.fetchCollection('grades', 'grades', `?q={"studentId":"${studentId}"}`);
    return () => { this.listeners[subKey] = this.listeners[subKey]?.filter(l => l !== cb); };
  }

  subscribeLatestSchedule(campus: string, niveau: string, cb: (s: any) => void) {
    const sKey = `${campus}_${niveau}`;
    const subKey = `schedule_${sKey}`;
    if (!this.listeners[subKey]) this.listeners[subKey] = [];
    this.listeners[subKey].push(cb);
    cb(this.state.schedules[sKey] || null);
    this.fetchCollection('schedules', 'schedules', `?q={"campus":"${campus}","niveau":"${niveau}"}`);
    return () => { this.listeners[subKey] = this.listeners[subKey]?.filter(l => l !== cb); };
  }

  // --- ACTIONS ---

  async addUser(user: User) {
    this.state.users = [user, ...this.state.users.filter(u => u.id !== user.id)];
    this.save();
    this.notify('users', this.state.users);
    const existing = await this.apiCall(`/db/users?q={"id":"${user.id}"}`);
    if (existing && Array.isArray(existing) && existing.length > 0) {
       return await this.apiCall(`/db/users/${existing[0]._id}`, 'PATCH', user);
    } else {
       return await this.apiCall('/db/users', 'POST', user);
    }
  }

  async addLesson(lesson: Lesson) {
    this.state.lessons = [lesson, ...this.state.lessons.filter(l => l.id !== lesson.id)];
    this.save();
    this.notify('lessons', this.state.lessons);
    await this.apiCall('/db/lessons', 'POST', lesson);
  }

  async addAssignment(assignment: Assignment) {
    this.state.assignments = [assignment, ...this.state.assignments.filter(a => a.id !== assignment.id)];
    this.save();
    this.notify('assignments', this.state.assignments);
    await this.apiCall('/db/assignments', 'POST', assignment);
  }

  async addAnnouncement(ann: Announcement) {
    this.state.announcements = [ann, ...this.state.announcements];
    this.save();
    this.notify('announcements', this.state.announcements);
    await this.apiCall('/db/announcements', 'POST', ann);
  }

  async addGrade(grade: Grade) {
    this.state.grades = [grade, ...this.state.grades];
    this.save();
    this.notify('grades', this.state.grades);
    await this.apiCall('/db/grades', 'POST', grade);
  }

  async updateUser(user: User) {
    this.state.users = this.state.users.map(u => u.id === user.id ? user : u);
    this.save();
    this.notify('users', this.state.users);
    const targetId = user._id;
    if (targetId) {
       await this.apiCall(`/db/users/${targetId}`, 'PATCH', user);
    } else {
       const existing = await this.apiCall(`/db/users?q={"id":"${user.id}"}`);
       if (existing && Array.isArray(existing) && existing.length > 0) {
          await this.apiCall(`/db/users/${existing[0]._id}`, 'PATCH', user);
       }
    }
  }

  async deleteUser(id: string) {
    const userToDelete = this.state.users.find(u => u.id === id);
    this.state.users = this.state.users.filter(u => u.id !== id);
    this.save();
    this.notify('users', this.state.users);
    if (userToDelete?._id) {
       await this.apiCall(`/db/users/${userToDelete._id}`, 'DELETE');
    } else {
       const existing = await this.apiCall(`/db/users?q={"id":"${id}"}`);
       if (existing && Array.isArray(existing) && existing.length > 0) {
          await this.apiCall(`/db/users/${existing[0]._id}`, 'DELETE');
       }
    }
  }

  async addSubmission(s: Submission) {
    await this.apiCall('/db/submissions', 'POST', s);
  }

  async addSchedule(schedule: any) {
    await this.apiCall('/db/schedules', 'POST', schedule);
  }

  // --- FILES ENGINE ---

  async uploadFile(file: File, path: string, onProgress?: (p: number) => void): Promise<string> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      formData.append('file', file);
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          onProgress((e.loaded / e.total) * 100);
        }
      });
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response.viewUrl || response.downloadUrl);
          } catch (e) {
            reject(new Error("Failed to parse upload response"));
          }
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });
      xhr.addEventListener('error', () => reject(new Error("Network error during upload")));
      xhr.open('POST', `${API_BASE}/upload`);
      xhr.send(formData);
    });
  }

  async downloadPackFile(url: string, fileName: string, lessonId: string) {
    try {
      if (typeof window === 'undefined' || !window.navigator.onLine) {
         throw new Error("Connexion requise pour le téléchargement.");
      }
      const response = await fetch(url);
      const blob = await response.blob();
      const reader = new FileReader();
      const base64Data = await new Promise<string>((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
      const path = `gsi_packs/${lessonId}_${fileName}`;
      await Filesystem.writeFile({
        path,
        data: base64Data,
        directory: Directory.Data,
        recursive: true
      });
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
         const stat = await Filesystem.stat({
           path: progress.localPath,
           directory: Directory.Data
         });
         if (stat) {
            const fileUri = await Filesystem.getUri({
              path: progress.localPath,
              directory: Directory.Data
            });
            await Browser.open({ url: fileUri.uri });
            return;
         }
      }
      if (fallbackUrl) {
         if (typeof window !== 'undefined') window.open(fallbackUrl, '_blank');
      }
    } catch (e) {
      console.warn("Could not open local pack, falling back to cloud.");
      if (fallbackUrl && typeof window !== 'undefined') window.open(fallbackUrl, '_blank');
    }
  }

  async getUser(id: string, forceCloud = false): Promise<User | null> {
    const local = this.state.users.find(u => u.id === id);
    if (local && !forceCloud) return local;
    try {
      const data = await this.apiCall(`/db/users?q={"id":"${id}"}`);
      if (data && data.length > 0) {
        const userData = data[0] as User;
        this.state.users = [userData, ...this.state.users.filter(u => u.id !== id)];
        this.save();
        return userData;
      }
    } catch (e) {
      console.error("Error fetching user from Custom API:", e);
    }
    return local || null;
  }

  // --- CACHE & UTILS ---
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
