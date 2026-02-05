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

export interface Announcement {
  id: string;
  title: string;
  message: string;
  date: string;
  author: string;
  targetCampus?: string;
  targetFiliere?: string;
  targetNiveau?: string;
}

// Storage Keys
const KEYS = {
  USERS: 'gsi_users_v2',
  LESSONS: 'gsi_lessons_v2',
  ASSIGNMENTS: 'gsi_assignments_v2',
  SUBMISSIONS: 'gsi_submissions_v2',
  GRADES: 'gsi_grades_v2',
  SCHEDULE: 'gsi_schedule_v2',
  CURRENT_USER: 'gsi_current_user_v2',
  ANNOUNCEMENTS: 'gsi_announcements_v2',
  PAYMENTS: 'gsi_payments_v2'
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
  getUsers: (): User[] => GSIStore.load(KEYS.USERS, []),
  addUser: (user: User) => {
    const users = GSIStore.getUsers();
    users.push(user);
    GSIStore.save(KEYS.USERS, users);

    // Add default payments for student
    if (user.role === 'student') {
      GSIStore.addPayment({
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
  deleteUser: (id: string) => {
    const users = GSIStore.getUsers().filter(u => u.id !== id);
    GSIStore.save(KEYS.USERS, users);
  },
  updateUser: (user: User) => {
    const users = GSIStore.getUsers().map(u => u.id === user.id ? user : u);
    GSIStore.save(KEYS.USERS, users);
    if (GSIStore.getCurrentUser()?.id === user.id) {
      GSIStore.setCurrentUser(user);
    }
  },
  getCurrentUser: (): User | null => GSIStore.load(KEYS.CURRENT_USER, null),
  setCurrentUser: (user: User | null) => GSIStore.save(KEYS.CURRENT_USER, user),

  // Lessons
  getLessons: (): Lesson[] => GSIStore.load(KEYS.LESSONS, []),
  addLesson: (lesson: Lesson) => {
    const lessons = GSIStore.getLessons();
    lessons.unshift(lesson);
    GSIStore.save(KEYS.LESSONS, lessons);
  },

  // Assignments
  getAssignments: (): Assignment[] => GSIStore.load(KEYS.ASSIGNMENTS, []),
  addAssignment: (assignment: Assignment) => {
    const assignments = GSIStore.getAssignments();
    assignments.unshift(assignment);
    GSIStore.save(KEYS.ASSIGNMENTS, assignments);
  },

  // Submissions
  getSubmissions: (): Submission[] => GSIStore.load(KEYS.SUBMISSIONS, []),
  addSubmission: (submission: Submission) => {
    const subs = GSIStore.getSubmissions();
    subs.unshift(submission);
    GSIStore.save(KEYS.SUBMISSIONS, subs);
  },
  gradeSubmission: (submissionId: string, score: number, feedback: string) => {
    const subs = GSIStore.getSubmissions().map(s => {
      if (s.id === submissionId) {
        const updated = { ...s, score, feedback };
        // Also add to grades
        GSIStore.addGrade({
           id: Math.random().toString(36).substr(2, 9),
           studentId: s.studentId,
           studentName: s.studentName,
           subject: 'Devoir', // Should ideally come from assignment
           score,
           maxScore: 20, // default
           date: new Date().toISOString().split('T')[0],
           niveau: '', // Should come from student
           filiere: ''
        });
        return updated;
      }
      return s;
    });
    GSIStore.save(KEYS.SUBMISSIONS, subs);
  },

  // Grades
  getGrades: (): Grade[] => GSIStore.load(KEYS.GRADES, []),
  addGrade: (grade: Grade) => {
    const grades = GSIStore.getGrades();
    grades.unshift(grade);
    GSIStore.save(KEYS.GRADES, grades);
  },

  // Schedule
  getSchedule: (): ScheduleItem[] => GSIStore.load(KEYS.SCHEDULE, []),
  updateSchedule: (items: ScheduleItem[]) => GSIStore.save(KEYS.SCHEDULE, items),

  // Announcements
  getAnnouncements: (): Announcement[] => GSIStore.load(KEYS.ANNOUNCEMENTS, []),
  addAnnouncement: (ann: Announcement) => {
    const anns = GSIStore.getAnnouncements();
    anns.unshift(ann);
    GSIStore.save(KEYS.ANNOUNCEMENTS, anns);
  },

  // Payments
  getPayments: (): Payment[] => GSIStore.load(KEYS.PAYMENTS, []),
  addPayment: (payment: Payment) => {
    const payments = GSIStore.getPayments();
    payments.unshift(payment);
    GSIStore.save(KEYS.PAYMENTS, payments);
  }
};
