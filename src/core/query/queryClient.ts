/**
 * Shared React Query client with sensible mobile defaults.
 */
import {QueryClient} from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      retry: 2,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

/** Centralised query keys — avoids stringly-typed cache collisions. */
export const QueryKeys = {
  adminDashboard: ['admin', 'dashboard'] as const,
  teacherDashboard: ['teacher', 'dashboard'] as const,
  parentDashboard: ['parent', 'dashboard'] as const,
  students: (params?: unknown) => ['students', params] as const,
  student: (id: string) => ['student', id] as const,
  teachers: (params?: unknown) => ['teachers', params] as const,
  fees: (params?: unknown) => ['fees', params] as const,
  feeSummary: ['fees', 'summary'] as const,
  attendance: (params?: unknown) => ['attendance', params] as const,
  exams: (params?: unknown) => ['exams', params] as const,
  homework: (params?: unknown) => ['homework', params] as const,
  timetable: (classId: string, sectionId: string) => ['timetable', classId, sectionId] as const,
  announcements: ['announcements'] as const,
  events: ['events'] as const,
  notifications: ['notifications'] as const,
  chatThreads: ['chat', 'threads'] as const,
  chatMessages: (threadId: string) => ['chat', 'messages', threadId] as const,
  transport: ['transport'] as const,
  library: ['library'] as const,
  inventory: ['inventory'] as const,
} as const;
