"use client";

import { Filesystem, Directory } from '@capacitor/filesystem';
import { Browser } from '@capacitor/browser';
import { Capacitor, CapacitorHttp } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { toast } from 'sonner';

// --- CONFIGURATION ---
const API_BASE = "https://groupegsi.mg/rtmggmg/api";
const MEDIA_BASE = "https://groupegsi.mg/rtmggmg";

// Types
export interface User {
  id: string; fullName: string; email: string; password?: string;
  role: 'student' | 'professor' | 'admin';
  campus: string; filiere: string; niveau: string;
  photo?: string; matricule?: string; contact?: string; _id?: string;
}

export interface Lesson { id: string; title: string; description: string; subject: string; niveau: string; filiere: string[]; campus: string[]; date: string; files: string[]; _id?: string; }
export interface Assignment { id: string; title: string; description: string; subject: string; niveau: string; filiere: string[]; campus: string[]; deadline: string; timeLimit: string; maxScore: number; files?: string[]; _id?: string; }
export interface Submission { id: string; assignmentId: string; studentId: string; studentName: string; date: string; file: string; score?: number; feedback?: string; _id?: string; }
export interface Grade { id: string; studentId: string; studentName: string; subject: string; score: number; maxScore: number; date: string; niveau: string; filiere: string; _id?: string; }
export interface Announcement { id: string; title: string; message: string; date: string; author: string; type?: 'info' | 'convocation'; targetUserId?: string; campus?: string[]; filiere?: string[]; niveau?: string; _id?: string; }

export interface ChatMessage {
  id: string; senderId: string; senderName: string; senderPhoto?: string; text: string;
  replyTo?: { senderName: string; text: string; };
  timestamp: string; filiere: string; niveau: string; _id?: string;
}

export interface Reminder {
  id: string; title: string; date: string; time: string; subject: string; notes?: string; completed: boolean; isAlarm?: boolean;
}

export interface ScheduleSlot {
  day: string; startTime: string; endTime: string; subject: string; room: string; instructor: string; color?: string;
}

export interface StructuredSchedule {
  id: string; campus: string; niveau: string; lastUpdated: string; slots: ScheduleSlot[];
  url?: string; fileUrl?: string; data?: any; _id?: string;
}

interface State {
  currentUser: User | null;
  users: User[];
  lessons: Lesson[];
  assignments: Assignment[];
  submissions: Submission[];
  grades: Grade[];
  announcements: Announcement[];
  schedules: Record<string, StructuredSchedule>;
  messages: ChatMessage[];
  reminders: Reminder[];
}

const initialState: State = {
  currentUser: null, users: [], lessons: [], assignments: [], submissions: [], grades: [], announcements: [], schedules: {}, messages: [], reminders: []
};

class GSIStoreClass {
  private state: State = { ...initialState };
  private listeners: Record<string, ((data: any) => void)[]> = {};
  private saveTimeout: any = null;
  private syncingCount = 0;
  private apiCache: Record<string, { data: any, ts: number }> = {};

  constructor() {
    if (typeof window !== 'undefined') {
      this.hydrate();
      setTimeout(() => this.startGlobalSync(), 2000);
      window.addEventListener('beforeunload', () => this.saveImmediate());
    }
  }

  private hydrate() {
    try {
      const saved = localStorage.getItem('gsi_v8_master');
      if (saved) this.state = { ...initialState, ...JSON.parse(saved) };
      if (this.state.users.length === 0) this.generateMockData();
    } catch (e) {}
  }

  private generateMockData() {
    const mockUsers: User[] = [
      { id: 'admin-id', fullName: 'Nina GSI', email: 'admin@gsi.mg', password: 'password', role: 'admin', campus: 'Antananarivo', filiere: 'Directeur', niveau: 'N/A' },
      { id: 'prof-id', fullName: 'Professeur GSI', email: 'prof@gsi.mg', password: 'password', role: 'professor', campus: 'Antananarivo', filiere: 'Informatique', niveau: 'L1' }
    ];
    mockUsers.forEach(mu => { if (!this.state.users.find(u => u.id === mu.id)) this.state.users.push(mu); });
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
      try { localStorage.setItem('gsi_v8_master', JSON.stringify(this.state)); } catch (e) {}
    }
  }

  private notify(key: string, data: any) {
    if (this.listeners[key]) this.listeners[key].forEach(cb => { try { cb(data); } catch(e) {} });
    Object.keys(this.listeners).forEach(subKey => {
      if (subKey !== key && subKey.startsWith(key + '_')) this.listeners[subKey].forEach(cb => { try { cb(data); } catch(e) {} });
    });
  }

  private startGlobalSync() {
    this.syncAll();
    setInterval(() => this.syncAll(), 30000);
    setInterval(() => { if (this.state.currentUser) this.fetchChatMessages(); }, 8000);
  }

  public async syncAll() {
     return Promise.all([
       this.fetchCollection('users', 'users'),
       this.fetchCollection('lessons', 'lessons'),
       this.fetchCollection('assignments', 'assignments'),
       this.fetchCollection('announcements', 'announcements'),
       this.fetchCollection('grades', 'grades'),
       this.fetchCollection('schedules', 'schedules'),
       this.fetchChatMessages()
     ]);
  }

  private async fetchChatMessages() {
    if (!this.state.currentUser) return;
    const { filiere, niveau } = this.state.currentUser;
    const q = encodeURIComponent(JSON.stringify({ filiere, niveau }));
    const data = await this.apiCall(`/db/messages?q=${q}&s={"timestamp":-1}&l=60`);
    if (data && Array.isArray(data)) {
      const newMessages = data.reverse();
      if (JSON.stringify(newMessages) !== JSON.stringify(this.state.messages)) {
        this.state.messages = newMessages;
        this.notify('messages', this.state.messages);
      }
    }
  }

  private async apiCall(endpoint: string, method = 'GET', body?: any): Promise<any> {
    const cacheTime = endpoint.includes('messages') ? 3000 : 300000;
    if (method === 'GET' && this.apiCache[endpoint] && (Date.now() - this.apiCache[endpoint].ts < cacheTime)) return this.apiCache[endpoint].data;
    this.syncingCount++;
    this.notify('sync_status', true);
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    try {
      let response: any;
      if (Capacitor.isNativePlatform()) {
        response = await CapacitorHttp.request({ url, method, headers: { 'Content-Type': 'application/json' }, data: body });
      } else {
        const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
        response = { status: res.status, data: await res.json(), ok: res.ok };
      }
      this.syncingCount = Math.max(0, this.syncingCount - 1);
      if (this.syncingCount === 0) this.notify('sync_status', false);
      if (response.status >= 200 && response.status < 300) {
        if (method === 'GET') this.apiCache[endpoint] = { data: response.data, ts: Date.now() };
        return response.data;
      }
      return null;
    } catch (e) {
      this.syncingCount = Math.max(0, this.syncingCount - 1);
      if (this.syncingCount === 0) this.notify('sync_status', false);
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
         merged = [...cloudData, ...currentLocal.filter(item => !cloudIds.has(item.id))];
      } else {
         merged = { ...currentLocal };
         cloudData.forEach((d: any) => {
            if (key === 'schedules') merged[`${d.campus}_${d.niveau}`] = d;
            else merged[d.id] = d;
         });
      }
      (this.state[key] as any) = merged;
      if (key === 'users' && this.state.currentUser) {
        const updatedSelf = (merged as User[]).find(u => u.id === this.state.currentUser!.id);
        if (updatedSelf) { this.state.currentUser = { ...this.state.currentUser, ...updatedSelf }; this.notify('auth', this.state.currentUser); }
      }
      this.save();
      this.notify(key as string, merged);
    }
  }

  async login(email: string, password: string): Promise<User | null> {
    const q = encodeURIComponent(JSON.stringify({ email, password }));
    const data = await this.apiCall(`/db/users?q=${q}`);
    if (data?.[0]) { this.setCurrentUser(data[0]); return data[0]; }
    const local = this.state.users.find(u => u.email === email && u.password === password);
    if (local) { this.setCurrentUser(local); return local; }
    return null;
  }

  async register(user: User): Promise<User | null> {
    const res = await this.apiCall('/db/users', 'POST', user);
    if (res) { const final = { ...user, ...res }; this.setCurrentUser(final); return final; }
    return null;
  }

  async resetPassword(email: string): Promise<boolean> {
     const q = encodeURIComponent(JSON.stringify({ email }));
     const data = await this.apiCall(`/db/users?q=${q}`);
     return !!(data && data.length > 0);
  }

  async adminCreateStudent(user: User): Promise<any> {
    const auth = localStorage.getItem('gsi_admin_auth');
    try {
        const res = await fetch(`/web/api/admin/create-student`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Basic ${auth}` },
            body: JSON.stringify(user)
        });
        return await res.json();
    } catch (e) { return { error: "Connection error" }; }
  }

  getCurrentUser() { return this.state.currentUser; }
  setCurrentUser(user: User | null) { this.state.currentUser = user; this.save(); this.notify('auth', user); }
  logout() { this.setCurrentUser(null); }
  subscribe(cb: (u: User | null) => void) { return this.subscribeAuth(cb); }
  subscribeAuth(cb: (u: User | null) => void) { if (!this.listeners['auth']) this.listeners['auth'] = []; this.listeners['auth'].push(cb); cb(this.state.currentUser); return () => { this.listeners['auth'] = this.listeners['auth']?.filter(l => l !== cb); }; }
  subscribeUsers(cb: (us: User[]) => void) { if (!this.listeners['users']) this.listeners['users'] = []; this.listeners['users'].push(cb); cb(this.state.users); this.fetchCollection('users', 'users'); return () => { this.listeners['users'] = this.listeners['users']?.filter(l => l !== cb); }; }
  subscribeLessons(filter: any, cb: (ls: Lesson[]) => void) {
    const subKey = filter.niveau ? `lessons_${filter.niveau}` : 'lessons';
    if (!this.listeners[subKey]) this.listeners[subKey] = [];
    const wrapper = (data: Lesson[]) => cb(filter.niveau ? data.filter((l: any) => l.niveau === filter.niveau) : data);
    this.listeners[subKey].push(wrapper); wrapper(this.state.lessons); this.fetchCollection('lessons', 'lessons');
    return () => { this.listeners[subKey] = this.listeners[subKey]?.filter(l => l !== wrapper); };
  }
  subscribeAssignments(filter: any, cb: (as: Assignment[]) => void) {
    const subKey = filter.niveau ? `assignments_${filter.niveau}` : 'assignments';
    if (!this.listeners[subKey]) this.listeners[subKey] = [];
    const wrapper = (data: Assignment[]) => cb(filter.niveau ? data.filter((a: any) => a.niveau === filter.niveau) : data);
    this.listeners[subKey].push(wrapper); wrapper(this.state.assignments); this.fetchCollection('assignments', 'assignments');
    return () => { this.listeners[subKey] = this.listeners[subKey]?.filter(l => l !== wrapper); };
  }
  subscribeAnnouncements(cb: (as: Announcement[]) => void) { if (!this.listeners['announcements']) this.listeners['announcements'] = []; this.listeners['announcements'].push(cb); cb(this.state.announcements); this.fetchCollection('announcements', 'announcements'); return () => { this.listeners['announcements'] = this.listeners['announcements']?.filter(l => l !== cb); }; }
  subscribeGrades(studentId: string, cb: (gs: Grade[]) => void) {
    const subKey = `grades_${studentId}`;
    if (!this.listeners[subKey]) this.listeners[subKey] = [];
    this.listeners[subKey].push(cb); cb(this.state.grades.filter((g: any) => g.studentId === studentId)); this.fetchCollection('grades', 'grades', `?q={"studentId":"${studentId}"}`);
    return () => { this.listeners[subKey] = this.listeners[subKey]?.filter(l => l !== cb); };
  }
  subscribeLatestSchedule(campus: string, niveau: string, cb: (s: StructuredSchedule | null) => void) {
    const sKey = campus && niveau ? `${campus}_${niveau}` : 'all';
    const subKey = `schedule_${sKey}`;
    if (!this.listeners[subKey]) this.listeners[subKey] = [];
    this.listeners[subKey].push(cb);
    if (sKey === 'all') { cb(this.state.schedules as any); this.fetchCollection('schedules', 'schedules'); }
    else { cb(this.state.schedules[sKey] || null); this.fetchCollection('schedules', 'schedules', `?q={"campus":"${campus}","niveau":"${niveau}"}`); }
    return () => { this.listeners[subKey] = this.listeners[subKey]?.filter(l => l !== cb); };
  }
  subscribeMessages(cb: (ms: ChatMessage[]) => void) { if (!this.listeners['messages']) this.listeners['messages'] = []; this.listeners['messages'].push(cb); cb(this.state.messages); this.fetchChatMessages(); return () => { this.listeners['messages'] = this.listeners['messages']?.filter(l => l !== cb); }; }
  subscribeSyncStatus(cb: (s: boolean) => void) { if (!this.listeners['sync_status']) this.listeners['sync_status'] = []; this.listeners['sync_status'].push(cb); cb(this.syncingCount > 0); return () => { this.listeners['sync_status'] = this.listeners['sync_status']?.filter(l => l !== cb); }; }
  subscribeReminders(cb: (rs: Reminder[]) => void) { if (!this.listeners['reminders']) this.listeners['reminders'] = []; this.listeners['reminders'].push(cb); cb(this.state.reminders); return () => { this.listeners['reminders'] = this.listeners['reminders']?.filter(l => l !== cb); }; }
  subscribeSubmissions(assignmentId?: string, cb?: (ss: Submission[]) => void) {
    const key = assignmentId ? `submissions_${assignmentId}` : 'submissions';
    if (!this.listeners[key]) this.listeners[key] = [];
    if (cb) { this.listeners[key].push(cb); cb(assignmentId ? this.state.submissions.filter(s => s.assignmentId === assignmentId) : this.state.submissions); }
    this.fetchCollection('submissions', 'submissions');
    return () => { if (cb) this.listeners[key] = this.listeners[key]?.filter(l => l !== cb); };
  }

  async addUser(user: User) { await this.apiCall('/db/users', 'POST', user); this.fetchCollection('users', 'users'); }
  async updateUser(user: User) { if (user._id) await this.apiCall(`/db/users/${user._id}`, 'PATCH', user); this.fetchCollection('users', 'users'); }
  async deleteUser(id: string) {
    const u = this.state.users.find(x => x.id === id);
    if (u?._id) await this.apiCall(`/db/users/${u._id}`, 'DELETE');
    this.fetchCollection('users', 'users');
  }
  async addLesson(l: Lesson) { await this.apiCall('/db/lessons', 'POST', l); this.fetchCollection('lessons', 'lessons'); }
  async deleteLesson(id: string) {
    const x = this.state.lessons.find(it => it.id === id);
    if (x?._id) await this.apiCall(`/db/lessons/${x._id}`, 'DELETE');
    this.fetchCollection('lessons', 'lessons');
  }
  async addAssignment(a: Assignment) { await this.apiCall('/db/assignments', 'POST', a); this.fetchCollection('assignments', 'assignments'); }
  async deleteAssignment(id: string) {
    const x = this.state.assignments.find(it => it.id === id);
    if (x?._id) await this.apiCall(`/db/assignments/${x._id}`, 'DELETE');
    this.fetchCollection('assignments', 'assignments');
  }
  async addAnnouncement(a: Announcement) { await this.apiCall('/db/announcements', 'POST', a); this.fetchCollection('announcements', 'announcements'); }
  async deleteAnnouncement(id: string) {
    const x = this.state.announcements.find(it => it.id === id);
    if (x?._id) await this.apiCall(`/db/announcements/${x._id}`, 'DELETE');
    this.fetchCollection('announcements', 'announcements');
  }
  async addGrade(g: Grade) { await this.apiCall('/db/grades', 'POST', g); this.fetchCollection('grades', 'grades'); }
  async deleteGrade(id: string) {
    const x = this.state.grades.find(it => it.id === id);
    if (x?._id) await this.apiCall(`/db/grades/${x._id}`, 'DELETE');
    this.fetchCollection('grades', 'grades');
  }
  async addSubmission(s: Submission) { await this.apiCall('/db/submissions', 'POST', s); this.fetchCollection('submissions', 'submissions'); }
  async updateSubmission(s: Submission) {
    const existing = await this.apiCall(`/db/submissions?q={"id":"${s.id}"}`);
    if (existing?.[0]?._id) await this.apiCall(`/db/submissions/${existing[0]._id}`, 'PATCH', s);
    this.fetchCollection('submissions', 'submissions');
  }
  async addSchedule(s: StructuredSchedule) { await this.apiCall('/db/schedules', 'POST', s); this.fetchCollection('schedules', 'schedules'); }
  async deleteSchedule(id: string) { await this.apiCall(`/db/schedules/${id}`, 'DELETE'); this.fetchCollection('schedules', 'schedules'); }
  async sendMessage(text: string, replyTo?: any) {
    if (!this.state.currentUser) return;
    const msg = { id: Math.random().toString(36).substr(2, 9), senderId: this.state.currentUser.id, senderName: this.state.currentUser.fullName, text, replyTo, timestamp: new Date().toISOString(), filiere: this.state.currentUser.filiere, niveau: this.state.currentUser.niveau };
    await this.apiCall('/db/messages', 'POST', msg);
    this.fetchChatMessages();
  }

  getAbsoluteUrl(url: string | undefined): string {
    if (!url) return "";
    if (url.startsWith('http')) return url;
    return `${MEDIA_BASE}${url.startsWith('/') ? '' : '/'}${url}`;
  }

  getStudentQrData(user: User): string {
    return JSON.stringify({ m: user.matricule, n: user.fullName, c: user.campus, f: user.filiere, l: user.niveau, v: `https://groupegsi.mg/presence?id=${user.id}` });
  }

  async uploadFile(file: File, path: string, onProgress?: (p: number) => void): Promise<string> {
    const formData = new FormData(); formData.append('file', file, file.name); formData.append('path', path);
    if (onProgress) onProgress(100);
    const res = await fetch(`${API_BASE}/upload`, { method: 'POST', body: formData });
    const data = await res.json(); return data.url;
  }

  async openPackFile(lessonId: string, url: string): Promise<void> {
    window.dispatchEvent(new CustomEvent('gsi-open-viewer', { detail: { url: this.getAbsoluteUrl(url), type: 'pdf' } }));
  }

  async downloadPackFile(url: string, title: string, id: string): Promise<string> { return this.getAbsoluteUrl(url); }

  getCache<T = any>(key: string): T | null { return (this.state as any)[key] || null; }
  setCache(key: string, data: any) { (this.state as any)[key] = data; this.save(); }
  async getUsers() { return this.state.users; }
  async getLessons() { return this.state.lessons; }
  async getAssignments() { return this.state.assignments; }
  async getGrades() { return this.state.grades; }
  async getAnnouncements() { return this.state.announcements; }
  async getUser(id: string, force = false): Promise<User | null> {
     const local = this.state.users.find(u => u.id === id);
     if (local && !force) return local;
     const data = await this.apiCall(`/db/users?q={"id":"${id}"}`);
     return data?.[0] || local || null;
  }
  saveProgress(id: string, data: any) {
     const saved = JSON.parse(localStorage.getItem('gsi_progress') || '{}');
     saved[id] = { ...saved[id], ...data };
     localStorage.setItem('gsi_progress', JSON.stringify(saved));
  }
  getProgress(id: string) { return JSON.parse(localStorage.getItem('gsi_progress') || '{}')[id] || null; }
  isDownloaded(id: string) { return false; }
  toggleLessonCompleted(id: string) {
     const p = this.getProgress(id) || {};
     this.saveProgress(id, { completed: !p.completed });
  }
  async addReminder(r: Reminder) { this.state.reminders.push(r); this.save(); this.notify('reminders', this.state.reminders); }
  async updateReminder(r: Reminder) { this.state.reminders = this.state.reminders.map(it => it.id === r.id ? r : it); this.save(); this.notify('reminders', this.state.reminders); }
  async deleteReminder(id: string) { this.state.reminders = this.state.reminders.filter(it => it.id !== id); this.save(); this.notify('reminders', this.state.reminders); }
}

export const GSIStore = new GSIStoreClass();
