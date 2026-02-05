"use client";

// Mock Data Types
export interface User {
  id: string;
  fullName: string;
  email: string;
  role: 'student' | 'professor' | 'admin';
  campus: string;
  filiere: string;
  niveau: string;
  photo?: string;
  payments?: Payment[];
}

export interface Payment {
  id: string;
  amount: string;
  date: string;
  status: 'paid' | 'pending' | 'overdue';
  description: string;
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
  submissions: Submission[];
}

export interface Submission {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  file: string;
  score?: number;
  feedback?: string;
}

export interface ScheduleItem {
  id: string;
  day: string;
  time: string;
  subject: string;
  instructor: string;
  location: string;
  niveau: string;
  filiere: string;
  campus: string;
}

// Initial Mock Data
const INITIAL_LESSONS: Lesson[] = [
  {
    id: 'l1',
    title: 'Introduction à l\'Algorithmique',
    description: 'Bases de la logique de programmation.',
    subject: 'Informatique',
    niveau: 'L1',
    filiere: ['Informatique'],
    campus: ['Antananarivo', 'Antsirabe'],
    date: '2025-02-10',
    files: ['algorithmique_bases.pdf']
  }
];

const INITIAL_SCHEDULE: ScheduleItem[] = [
  {
    id: 's1',
    day: 'Lundi',
    time: '08:00 - 10:00',
    subject: 'Mathématiques',
    instructor: 'Dr. Rakoto',
    location: 'Salle 101',
    niveau: 'L1',
    filiere: 'Informatique',
    campus: 'Antananarivo'
  }
];

// Storage Keys
const KEYS = {
  USERS: 'gsi_users',
  LESSONS: 'gsi_lessons',
  ASSIGNMENTS: 'gsi_assignments',
  SCHEDULE: 'gsi_schedule',
  CURRENT_USER: 'gsi_current_user',
  NOTIFICATIONS: 'gsi_notifications'
};

export const GSIStore = {
  // Generic Load/Save
  save: (key: string, data: any) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(data));
    }
  },
  load: (key: string, defaultValue: any) => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : defaultValue;
    }
    return defaultValue;
  },

  // Users
  getUsers: () => GSIStore.load(KEYS.USERS, []),
  addUser: (user: User) => {
    const users = GSIStore.getUsers();
    users.push(user);
    GSIStore.save(KEYS.USERS, users);
  },
  getCurrentUser: () => GSIStore.load(KEYS.CURRENT_USER, null),
  setCurrentUser: (user: User | null) => GSIStore.save(KEYS.CURRENT_USER, user),

  // Lessons
  getLessons: () => GSIStore.load(KEYS.LESSONS, INITIAL_LESSONS),
  addLesson: (lesson: Lesson) => {
    const lessons = GSIStore.getLessons();
    lessons.unshift(lesson);
    GSIStore.save(KEYS.LESSONS, lessons);
  },

  // Assignments
  getAssignments: () => GSIStore.load(KEYS.ASSIGNMENTS, []),
  addAssignment: (assignment: Assignment) => {
    const assignments = GSIStore.getAssignments();
    assignments.unshift(assignment);
    GSIStore.save(KEYS.ASSIGNMENTS, assignments);
  },
  submitAssignment: (assignmentId: string, submission: Submission) => {
    const assignments = GSIStore.getAssignments();
    const index = assignments.findIndex((a: any) => a.id === assignmentId);
    if (index !== -1) {
      assignments[index].submissions.push(submission);
      GSIStore.save(KEYS.ASSIGNMENTS, assignments);
    }
  },

  // Schedule
  getSchedule: () => GSIStore.load(KEYS.SCHEDULE, INITIAL_SCHEDULE),
  updateSchedule: (items: ScheduleItem[]) => GSIStore.save(KEYS.SCHEDULE, items),

  // Notifications
  getNotifications: () => GSIStore.load(KEYS.NOTIFICATIONS, []),
  addNotification: (notif: { id: string, title: string, message: string, date: string, type: string }) => {
    const notifs = GSIStore.getNotifications();
    notifs.unshift(notif);
    GSIStore.save(KEYS.NOTIFICATIONS, notifs);
  }
};
