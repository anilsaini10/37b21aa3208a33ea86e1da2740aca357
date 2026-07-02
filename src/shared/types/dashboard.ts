import type {SchoolEvent} from './communication';

export interface AdminDashboardData {
  totalStudents: number;
  totalTeachers: number;
  totalStaff: number;
  totalClasses: number;
  totalSections: number;
  todayAttendancePercentage: number;
  feeCollected: number;
  feePending: number;
  upcomingEvents: SchoolEvent[];
  attendanceTrend: ChartSeries;
  feeCollectionTrend: ChartSeries;
  performanceTrend: ChartSeries;
}

export interface TeacherDashboardData {
  todayClasses: number;
  pendingHomework: number;
  upcomingExams: number;
  attendanceMarkedToday: boolean;
  schedule: {periodNo: number; time: string; subject: string; className: string}[];
  classPerformance: ChartSeries;
}

export interface ParentDashboardData {
  childName: string;
  className: string;
  attendancePercentage: number;
  pendingFees: number;
  upcomingExams: number;
  pendingHomework: number;
  attendanceTrend: ChartSeries;
  performanceTrend: ChartSeries;
}

export interface ChartSeries {
  labels: string[];
  values: number[];
}

export interface StatCard {
  key: string;
  label: string;
  value: string | number;
  icon: string;
  accent: 'primary' | 'success' | 'warning' | 'error' | 'info';
  delta?: number;
}
