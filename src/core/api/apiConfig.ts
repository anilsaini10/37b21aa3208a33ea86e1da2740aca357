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

/** Centralised endpoint paths (kept out of feature code). */
export const Endpoints = {
  auth: {
    login: '/auth/login',
    otpRequest: '/auth/otp/request',
    otpVerify: '/auth/otp/verify',
    forgotPassword: '/auth/forgot-password',
    changePassword: '/auth/change-password',
    refresh: '/auth/refresh',
    logout: '/auth/logout',
  },
  admin: {
    dashboard: '/admin/dashboard',
    students: '/admin/students',
    teachers: '/admin/teachers',
    fees: '/admin/fees',
    attendance: '/admin/attendance',
    exams: '/admin/exams',
    reports: '/admin/reports',
    settings: '/admin/settings',
  },
  teacher: {
    dashboard: '/teacher/dashboard',
    attendance: '/teacher/attendance',
    homework: '/teacher/homework',
    timetable: '/teacher/timetable',
  },
  parent: {
    dashboard: '/parent/dashboard',
    attendance: '/parent/attendance',
    fees: '/parent/fees',
    results: '/parent/results',
  },
} as const;
