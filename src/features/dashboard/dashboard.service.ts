/**
 * Dashboard service — aggregates the mock DB into role-specific dashboard data,
 * plus React Query hooks the dashboard screens consume.
 */
import {useQuery} from '@tanstack/react-query';
import {db} from '../../core/mock/db';
import {respond} from '../../core/mock/mockApi';
import {QueryKeys} from '../../core/query/queryClient';
import {sumBy} from '../../core/utils/misc';
import type {
  AdminDashboardData,
  TeacherDashboardData,
  ParentDashboardData,
} from '../../shared/types';

function adminDashboard(): AdminDashboardData {
  const present = db.attendanceRecords.filter(a => a.status === 'present').length;
  const attPct = Math.round((present / Math.max(1, db.attendanceRecords.length)) * 100);
  const collected = sumBy(db.feeInvoices, i => i.paidAmount);
  const pending = sumBy(db.feeInvoices, i => i.dueAmount);

  return {
    totalStudents: db.students.length,
    totalTeachers: db.teachers.length,
    totalStaff: db.staff.length,
    totalClasses: db.classes.length,
    totalSections: db.sections.length,
    todayAttendancePercentage: attPct,
    feeCollected: collected,
    feePending: pending,
    upcomingEvents: db.events.slice(0, 4),
    attendanceTrend: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      values: [92, 88, 94, 90, attPct],
    },
    feeCollectionTrend: {
      labels: ['Feb', 'Mar', 'Apr', 'May', 'Jun'],
      values: [420, 510, 480, 600, Math.round(collected / 1000)],
    },
    performanceTrend: {
      labels: ['UT1', 'Mid', 'UT2', 'Pre', 'Final'],
      values: [72, 78, 75, 82, 80],
    },
  };
}

function teacherDashboard(): TeacherDashboardData {
  return {
    todayClasses: 5,
    pendingHomework: db.homework.filter(h => h.status === 'pending').length,
    upcomingExams: db.exams.filter(e => e.status !== 'completed').length,
    attendanceMarkedToday: false,
    schedule: [
      {periodNo: 1, time: '09:00 - 09:45', subject: 'Mathematics', className: 'Class 6 - A'},
      {periodNo: 2, time: '09:45 - 10:30', subject: 'Mathematics', className: 'Class 7 - B'},
      {periodNo: 3, time: '11:00 - 11:45', subject: 'Science', className: 'Class 8 - A'},
      {periodNo: 4, time: '11:45 - 12:30', subject: 'Mathematics', className: 'Class 6 - B'},
    ],
    classPerformance: {
      labels: ['A+', 'A', 'B', 'C', 'D'],
      values: [8, 14, 10, 5, 2],
    },
  };
}

function parentDashboard(): ParentDashboardData {
  const child = db.students[0];
  const invoice = db.feeInvoices.find(i => i.studentId === child.id);
  return {
    childName: child.name,
    className: `${child.className} - ${child.sectionName}`,
    attendancePercentage: child.attendancePercentage,
    pendingFees: invoice?.dueAmount ?? 0,
    upcomingExams: db.exams.filter(e => e.status !== 'completed').length,
    pendingHomework: db.homework.filter(h => h.status === 'pending').length,
    attendanceTrend: {
      labels: ['Feb', 'Mar', 'Apr', 'May', 'Jun'],
      values: [95, 92, 96, 94, child.attendancePercentage],
    },
    performanceTrend: {
      labels: ['English', 'Maths', 'Science', 'Social', 'Hindi'],
      values: [82, 76, 88, 79, 84],
    },
  };
}

export const dashboardApi = {
  admin: () => respond(adminDashboard()),
  teacher: () => respond(teacherDashboard()),
  parent: () => respond(parentDashboard()),
};

export const useAdminDashboard = () =>
  useQuery({queryKey: QueryKeys.adminDashboard, queryFn: dashboardApi.admin});

export const useTeacherDashboard = () =>
  useQuery({queryKey: QueryKeys.teacherDashboard, queryFn: dashboardApi.teacher});

export const useParentDashboard = () =>
  useQuery({queryKey: QueryKeys.parentDashboard, queryFn: dashboardApi.parent});
