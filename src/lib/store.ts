"use client";

import { auth, db } from "./firebase";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp
} from "firebase/firestore";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL, uploadBytesResumable } from "firebase/storage";
import { storage } from "./firebase";

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

export interface Payment {
  id: string;
  studentId: string;
  studentName: string;
  amount: string;
  date: string;
  status: 'paid' | 'pending' | 'overdue';
  description: string;
  campus: string;
  filiere: string;
  niveau: string;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  subject: string;
  niveau: string;
  filiere: string[];
  campus: string[];
  date: string;
  files: string[];
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  subject: string;
  niveau: string;
  filiere: string[];
  campus: string[];
  deadline: string;
  timeLimit: string;
  maxScore: number;
  files?: string[];
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  date: string;
  file: string;
  score?: number;
  feedback?: string;
}

export interface Grade {
  id: string;
  studentId: string;
  studentName: string;
  subject: string;
  score: number;
  maxScore: number;
  date: string;
  niveau: string;
  filiere: string;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  date: string;
  author: string;
}

// Global state for current user to avoid too many Firestore calls
let cachedUser: User | null = null;

// Auth Listener
if (typeof window !== 'undefined') {
  onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      const userData = await GSIStore.getUser(firebaseUser.uid);
      if (userData) {
        GSIStore.setCurrentUser(userData);
      }
    } else {
      GSIStore.setCurrentUser(null);
    }
  });
}

export const GSIStore = {
  // Auth & User Management
  getCurrentUser: (): User | null => {
    // This is synchronous for initial render, will be updated by listener
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('gsi_current_user_v2');
      return saved ? JSON.parse(saved) : cachedUser;
    }
    return cachedUser;
  },

  setCurrentUser: (user: User | null) => {
    cachedUser = user;
    if (typeof window !== 'undefined') {
      if (user) localStorage.setItem('gsi_current_user_v2', JSON.stringify(user));
      else localStorage.removeItem('gsi_current_user_v2');
    }
  },

  // Users
  async getUser(id: string): Promise<User | null> {
    const docRef = doc(db, "users", id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? (docSnap.data() as User) : null;
  },

  async getUsers(): Promise<User[]> {
    const querySnapshot = await getDocs(collection(db, "users"));
    const users = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
    // Sort client-side to be more resilient to missing fields
    return users.sort((a, b) => (a.fullName || "").localeCompare(b.fullName || ""));
  },

  async addUser(user: User) {
    await setDoc(doc(db, "users", user.id), {
      ...user,
      createdAt: Timestamp.now()
    });

    if (user.role === 'student') {
      await GSIStore.addPayment({
        id: Math.random().toString(36).substr(2, 9),
        studentId: user.id,
        studentName: user.fullName,
        amount: '1.200.000 Ar',
        date: new Date().toISOString().split('T')[0],
        status: 'paid',
        description: 'Frais d\'inscription',
        campus: user.campus,
        filiere: user.filiere,
        niveau: user.niveau
      });
    }
  },

  async deleteUser(id: string) {
    await deleteDoc(doc(db, "users", id));
  },

  async updateUser(user: User) {
    await updateDoc(doc(db, "users", user.id), { ...user });
    if (GSIStore.getCurrentUser()?.id === user.id) {
      GSIStore.setCurrentUser(user);
    }
  },

  // Lessons
  async getLessons(): Promise<Lesson[]> {
    const q = query(collection(db, "lessons"), orderBy("date", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Lesson));
  },

  async addLesson(lesson: Lesson) {
    await addDoc(collection(db, "lessons"), {
      ...lesson,
      createdAt: Timestamp.now()
    });
  },

  // Schedules
  async addSchedule(schedule: any) {
    await addDoc(collection(db, "schedules"), {
      ...schedule,
      createdAt: Timestamp.now()
    });
  },

  async getLatestSchedule(campus: string, niveau: string): Promise<any> {
    const querySnapshot = await getDocs(collection(db, "schedules"));
    const schedules = querySnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as any))
      .filter(s => s.campus === campus && s.niveau === niveau);

    if (schedules.length > 0) {
      return schedules.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))[0];
    }
    return null;
  },

  // Assignments
  async getAssignments(): Promise<Assignment[]> {
    const q = query(collection(db, "assignments"), orderBy("deadline", "asc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Assignment));
  },

  async addAssignment(assignment: Assignment) {
    await addDoc(collection(db, "assignments"), {
      ...assignment,
      createdAt: Timestamp.now()
    });
  },

  // Submissions
  async getSubmissions(): Promise<Submission[]> {
    const querySnapshot = await getDocs(collection(db, "submissions"));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Submission));
  },

  async addSubmission(submission: Submission) {
    await addDoc(collection(db, "submissions"), {
      ...submission,
      createdAt: Timestamp.now()
    });
  },

  // Grades
  async getGrades(): Promise<Grade[]> {
    const querySnapshot = await getDocs(collection(db, "grades"));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Grade));
  },

  async addGrade(grade: Grade) {
    await addDoc(collection(db, "grades"), {
      ...grade,
      createdAt: Timestamp.now()
    });
  },

  // Announcements
  async getAnnouncements(): Promise<Announcement[]> {
    const q = query(collection(db, "announcements"), orderBy("date", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Announcement));
  },

  async addAnnouncement(ann: Announcement) {
    await addDoc(collection(db, "announcements"), {
      ...ann,
      createdAt: Timestamp.now()
    });
  },

  // Payments
  async getPayments(): Promise<Payment[]> {
    const querySnapshot = await getDocs(collection(db, "payments"));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Payment));
  },

  async addPayment(payment: Payment) {
    await addDoc(collection(db, "payments"), {
      ...payment,
      createdAt: Timestamp.now()
    });
  },

  // File Upload
  async uploadFile(file: File, path: string, onProgress?: (progress: number) => void): Promise<string> {
    console.log(`Starting upload to ${path}...`);
    const storageRef = ref(storage, path);

    return new Promise((resolve, reject) => {
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log('Upload is ' + progress + '% done');
          if (onProgress) onProgress(progress);
        },
        (error) => {
          console.error("Upload error details:", error);
          reject(new Error(`Erreur Firebase Storage: ${error.message || 'Inconnue'}`));
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            console.log('File available at', downloadURL);
            resolve(downloadURL);
          });
        }
      );
    });
  },

  // Progress Tracking
  saveProgress(itemId: string, progress: any) {
    if (typeof window !== 'undefined') {
      const allProgress = JSON.parse(localStorage.getItem('gsi_progress') || '{}');
      allProgress[itemId] = { ...progress, timestamp: Date.now() };
      localStorage.setItem('gsi_progress', JSON.stringify(allProgress));
    }
  },

  getProgress(itemId: string) {
    if (typeof window !== 'undefined') {
      const allProgress = JSON.parse(localStorage.getItem('gsi_progress') || '{}');
      return allProgress[itemId] || null;
    }
    return null;
  },

  setDownloaded(itemId: string, status: boolean = true) {
    if (typeof window !== 'undefined') {
      const downloaded = JSON.parse(localStorage.getItem('gsi_downloaded') || '{}');
      downloaded[itemId] = status;
      localStorage.setItem('gsi_downloaded', JSON.stringify(downloaded));
    }
  },

  isDownloaded(itemId: string) {
    if (typeof window !== 'undefined') {
      const downloaded = JSON.parse(localStorage.getItem('gsi_downloaded') || '{}');
      return !!downloaded[itemId];
    }
    return false;
  }
};
