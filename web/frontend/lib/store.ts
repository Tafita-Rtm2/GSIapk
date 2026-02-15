"use client";

import { Capacitor, CapacitorHttp } from '@capacitor/core';
import { toast } from 'sonner';

// Dynamic import for Capacitor-only modules to avoid web crashes
let Filesystem: any;
let Directory: any;
let LocalNotifications: any;

if (typeof window !== 'undefined' && Capacitor.isNativePlatform()) {
  import('@capacitor/filesystem').then(m => { Filesystem = m.Filesystem; Directory = m.Directory; });
  import('@capacitor/local-notifications').then(m => { LocalNotifications = m.LocalNotifications; });
}

const API_BASE = (typeof window !== 'undefined' ? window.location.origin : '') + "/api";
const MEDIA_BASE = (typeof window !== 'undefined' ? window.location.origin : '');

// Types
export interface User { id: string; fullName: string; email: string; password?: string; role: 'student' | 'professor' | 'admin'; campus: string; filiere: string; niveau: string; photo?: string; matricule?: string; contact?: string; _id?: string; }
export interface Lesson { id: string; title: string; description: string; subject: string; niveau: string; filiere: string[]; campus: string[]; date: string; files: string[]; _id?: string; }
export interface Assignment { id: string; title: string; description: string; subject: string; niveau: string; filiere: string[]; campus: string[]; deadline: string; timeLimit: string; maxScore: number; files?: string[]; _id?: string; }
export interface Submission { id: string; assignmentId: string; studentId: string; studentName: string; date: string; file: string; score?: number; feedback?: string; _id?: string; }
export interface Grade { id: string; studentId: string; studentName: string; subject: string; score: number; maxScore: number; date: string; niveau: string; filiere: string; _id?: string; }
export interface Announcement { id: string; title: string; message: string; date: string; author: string; type?: 'info' | 'convocation'; targetUserId?: string; campus?: string[]; filiere?: string[]; niveau?: string; _id?: string; }
export interface ChatMessage { id: string; senderId: string; senderName: string; senderPhoto?: string; text: string; replyTo?: { senderName: string; text: string; }; timestamp: string; filiere: string; niveau: string; _id?: string; }
export interface Reminder { id: string; title: string; date: string; time: string; subject: string; notes?: string; completed: boolean; isAlarm?: boolean; }
export interface ScheduleSlot { day: string; startTime: string; endTime: string; subject: string; room: string; instructor: string; color?: string; }
export interface StructuredSchedule { id: string; campus: string; niveau: string; lastUpdated: string; slots: ScheduleSlot[]; url?: string; fileUrl?: string; data?: any; _id?: string; }

interface State { currentUser: User | null; users: User[]; lessons: Lesson[]; assignments: Assignment[]; submissions: Submission[]; grades: Grade[]; announcements: Announcement[]; schedules: Record<string, StructuredSchedule>; messages: ChatMessage[]; reminders: Reminder[]; }

const initialState: State = { currentUser: null, users: [], lessons: [], assignments: [], submissions: [], grades: [], announcements: [], schedules: {}, messages: [], reminders: [] };

class GSIStoreClass {
  private state: State = { ...initialState };
  private listeners: Record<string, ((data: any) => void)[]> = {};
  private syncingCount = 0;
  private apiCache: Record<string, { data: any, ts: number }> = {};

  constructor() {
    if (typeof window !== 'undefined') {
      this.hydrate();
      setTimeout(() => this.startGlobalSync(), 2000);
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
    this.save();
  }

  private save() {
    if (typeof window !== 'undefined') localStorage.setItem('gsi_v8_master', JSON.stringify(this.state));
  }

  private notify(key: string, data: any) {
    if (this.listeners[key]) this.listeners[key].forEach(cb => { try { cb(data); } catch(e) {} });
  }

  private startGlobalSync() {
    this.syncAll();
    setInterval(() => this.syncAll(), 30000);
  }

  private async syncAll() {
    if (!this.state.currentUser) return;
    return Promise.all([
       this.fetchCollection('users', 'users'),
       this.fetchCollection('lessons', 'lessons'),
       this.fetchCollection('assignments', 'assignments'),
       this.fetchCollection('announcements', 'announcements'),
       this.fetchCollection('grades', 'grades'),
       this.fetchCollection('schedules', 'schedules')
    ]);
  }

  private async apiCall(endpoint: string, method = 'GET', body?: any): Promise<any> {
    const cacheTime = endpoint.includes('messages') ? 3000 : 300000;
    if (method === 'GET' && this.apiCache[endpoint] && (Date.now() - this.apiCache[endpoint].ts < cacheTime)) return this.apiCache[endpoint].data;

    this.syncingCount++;
    this.notify('sync_status', true);

    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

    try {
      const headers: any = { 'Content-Type': 'application/json' };
      if (typeof window !== 'undefined') {
        const adminAuth = localStorage.getItem('gsi_admin_auth');
        if (adminAuth) headers['Authorization'] = `Basic ${adminAuth}`;
      }

      let response: any;
      if (Capacitor.isNativePlatform()) {
        response = await CapacitorHttp.request({ url, method, headers, data: body });
      } else {
        const res = await fetch(url, { method, headers, body: body ? JSON.stringify(body) : undefined });
        response = { status: res.status, data: await res.json(), ok: res.ok };
      }

      this.syncingCount = Math.max(0, this.syncingCount - 1);
      if (this.syncingCount === 0) this.notify('sync_status', false);

      if (response.status >= 200 && response.status < 300) {
        if (method === 'GET') this.apiCache[endpoint] = { data: response.data, ts: Date.now() };
        return response.data;
      }
      return null;
    } catch (e: any) {
      this.syncingCount = Math.max(0, this.syncingCount - 1);
      if (this.syncingCount === 0) this.notify('sync_status', false);
      return null;
    }
  }

  private async fetchCollection(key: keyof State, collectionName: string, queryParams = "") {
    const data = await this.apiCall(`/db/${collectionName}${queryParams}`);
    if (data) {
      this.state[key] = Array.isArray(data) ? data : this.state[key];
      this.save();
      this.notify(key as string, this.state[key]);
    }
  }

  async login(email: string, password: string): Promise<User | null> {
    const q = encodeURIComponent(JSON.stringify({ email, password }));
    const data = await this.apiCall(`/db/users?q=${q}`);
    if (data?.[0]) {
       this.setCurrentUser(data[0]);
       return data[0];
    }
    return null;
  }

  setCurrentUser(user: User | null) { this.state.currentUser = user; this.save(); this.notify('auth', user); }
  getCurrentUser() { return this.state.currentUser; }
  subscribeAuth(cb: (u: User | null) => void) { if (!this.listeners['auth']) this.listeners['auth'] = []; this.listeners['auth'].push(cb); cb(this.state.currentUser); return () => { this.listeners['auth'] = this.listeners['auth']?.filter(l => l !== cb); }; }
  subscribe(cb: (u: User | null) => void) { return this.subscribeAuth(cb); }

  async addUser(user: User) { return await this.apiCall('/db/users', 'POST', user); }

  getAbsoluteUrl(url: string | undefined): string {
    if (!url) return "";
    if (url.startsWith('http')) return url;
    return `${MEDIA_BASE}${url.startsWith('/') ? '' : '/'}${url}`;
  }

  async uploadFile(file: File, path: string): Promise<string> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    formData.append('path', path);
    const res = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Basic ${localStorage.getItem('gsi_admin_auth') || ''}` },
        body: formData
    });
    const data = await res.json();
    return data.url;
  }

  // Simplified for Web compatibility
  async openPackFile(lessonId: string, url: string): Promise<void> {
    const absoluteUrl = this.getAbsoluteUrl(url);
    window.dispatchEvent(new CustomEvent('gsi-open-viewer', { detail: { url: absoluteUrl, type: 'pdf' } }));
  }

  // ... (keeping other required methods but simplified for stability)
  subscribeLessons(f: any, cb: any) { this.fetchCollection('lessons', 'lessons'); cb(this.state.lessons); return () => {}; }
  subscribeAssignments(f: any, cb: any) { this.fetchCollection('assignments', 'assignments'); cb(this.state.assignments); return () => {}; }
  subscribeAnnouncements(cb: any) { this.fetchCollection('announcements', 'announcements'); cb(this.state.announcements); return () => {}; }
  subscribeLatestSchedule(c: any, n: any, cb: any) { cb(null); return () => {}; }
  subscribeSyncStatus(cb: any) { cb(false); return () => {}; }
  toggleLessonCompleted(id: string) {}
}

export const GSIStore = new GSIStoreClass();
