/** Endpoint registry + shared axios config. */
import {ENV} from '../config/env';

export const API_CONFIG = {
  baseURL: ENV.API_BASE_URL,
  timeout: ENV.API_TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
};

/** Centralised endpoint paths (kept out of feature code). Backend mounts everything under `/api`. */
export const Endpoints = {
  auth: {
    signup: '/api/auth/signup',
    login: '/api/auth/login',
    otpRequest: '/api/auth/otp/request',
    otpVerify: '/api/auth/otp/verify',
    forgotPassword: '/api/auth/forgot-password',
    changePassword: '/api/auth/change-password',
    refresh: '/api/auth/refresh',
    logout: '/api/auth/logout',
  },
  schools: {
    search: '/api/schools',
  },
  classes: {
    list: '/api/classes',
    create: '/api/classes',
    byId: (classId: string) => `/api/classes/${classId}`,
    addSection: (classId: string) => `/api/classes/${classId}/sections`,
    sectionById: (classId: string, sectionId: string) => `/api/classes/${classId}/sections/${sectionId}`,
    linkSubject: (classId: string) => `/api/classes/${classId}/subjects`,
  },
  subjects: {
    list: '/api/subjects',
    create: '/api/subjects',
  },
  admin: {
    dashboard: '/api/admin/dashboard',
    students: '/api/admin/students',
    students_byId: (id: string) => `/api/admin/students/${id}`,
    teachers: '/api/admin/teachers',
    teachers_byId: (id: string) => `/api/admin/teachers/${id}`,
    announcements: '/api/admin/announcements',
    announcements_byId: (id: string) => `/api/admin/announcements/${id}`,
    events: '/api/admin/events',
    events_byId: (id: string) => `/api/admin/events/${id}`,
    fees: '/api/admin/fees',
    attendance: '/api/admin/attendance',
    exams: '/api/admin/exams',
    exams_byId: (examId: string) => `/api/admin/exams/${examId}`,
    exams_classes: (examId: string) => `/api/admin/exams/${examId}/classes`,
    exams_classById: (examId: string, classId: string) => `/api/admin/exams/${examId}/classes/${classId}`,
    exams_classStudents: (examId: string, classId: string) =>
      `/api/admin/exams/${examId}/classes/${classId}/students`,
    exams_results: (examId: string) => `/api/admin/exams/${examId}/results`,
    exams_resultById: (examId: string, resultId: string) => `/api/admin/exams/${examId}/results/${resultId}`,
    reports: '/api/admin/reports',
    settings: '/api/admin/settings',
  },
  teacher: {
    dashboard: '/api/teacher/dashboard',
    classes: '/api/teacher/classes',
    attendance: '/api/teacher/attendance',
    attendance_studentHistory: (studentId: string) => `/api/teacher/attendance/students/${studentId}`,
    attendance_byId: (recordId: string) => `/api/teacher/attendance/${recordId}`,
    homework: '/api/teacher/homework',
    homework_byId: (homeworkId: string) => `/api/teacher/homework/${homeworkId}`,
    timetable: '/api/teacher/timetable',
    announcements: '/api/teacher/announcements',
  },
  parent: {
    dashboard: '/api/parent/dashboard',
    attendance: '/api/parent/attendance',
    fees: '/api/parent/fees',
    results: '/api/parent/results',
  },
  // Parent's announcements feed is mounted under `/api/students`, not `/api/parent` — matches the backend as given.
  students: {
    announcements: '/api/students/announcements',
  },
} as const;
