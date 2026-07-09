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
    addSection: (classId: string) => `/api/classes/${classId}/sections`,
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
    fees: '/api/admin/fees',
    attendance: '/api/admin/attendance',
    exams: '/api/admin/exams',
    reports: '/api/admin/reports',
    settings: '/api/admin/settings',
  },
  teacher: {
    dashboard: '/api/teacher/dashboard',
    attendance: '/api/teacher/attendance',
    homework: '/api/teacher/homework',
    timetable: '/api/teacher/timetable',
  },
  parent: {
    dashboard: '/api/parent/dashboard',
    attendance: '/api/parent/attendance',
    fees: '/api/parent/fees',
    results: '/api/parent/results',
  },
} as const;
