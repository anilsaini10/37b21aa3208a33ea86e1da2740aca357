/**
 * Navigation param lists (React Navigation v7, typed).
 *
 * Structure: a Root stack swaps between the Auth flow and a role-specific
 * navigator. Each role navigator is a native-stack whose first route (`Tabs`)
 * renders that role's bottom-tab navigator; detail / form routes are pushed on
 * top of the tabs.
 */
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {
  AdminAnnouncement,
  AdminEvent,
  AdminExam,
  ExamResult,
  Student,
  Teacher,
  TeacherHomework,
  TimetablePeriod,
  UserRole,
  WeekDay,
} from '../shared/types';

// ---- Root -----------------------------------------------------------------
export type RootStackParamList = {
  Auth: undefined;
  Admin: undefined;
  Teacher: undefined;
  Parent: undefined;
};

// ---- Auth -----------------------------------------------------------------
export type AuthStackParamList = {
  RoleSelect: undefined;
  SelectSchool: {role: Extract<UserRole, 'teacher' | 'parent'>};
  Login: {role: Extract<UserRole, 'admin' | 'teacher'>; schoolId?: string; schoolName?: string};
  SignUp: undefined;
  ParentLogin: {schoolId: string; schoolName: string};
  ForgotPassword: undefined;
};

// ---- Admin ----------------------------------------------------------------
export type AdminTabParamList = {
  Dashboard: undefined;
  Students: undefined;
  Fees: undefined;
  More: undefined;
};

export type AdminStackParamList = {
  Tabs: undefined;
  StudentsList: {
    classId: string;
    className: string;
    sectionId?: string;
    sectionName?: string;
    /** Every section of this class, so the list screen can offer a section filter without another API call. */
    sections?: {id: string; name: string; studentCount: number}[];
  };
  StudentDetail: {id: string; initial?: Student};
  StudentForm: {id?: string};
  Teachers: undefined;
  TeacherForm: undefined;
  TeacherDetail: {teacherId: string; initial?: Teacher};
  Attendance: undefined;
  ClassAttendance: {classId: string; className: string; fromDate: string; toDate: string};
  Exams: undefined;
  ExamForm: {examId?: string; initial?: AdminExam};
  ExamClasses: {examId: string; examName?: string};
  ExamReport: {examId: string; classId: string; className?: string; maxMarks: number};
  StudentMarks: {
    examId: string;
    classId: string;
    studentId: string;
    studentName: string;
    maxMarks: number;
    resultId?: string;
    initial?: ExamResult | null;
  };
  Announcements: undefined;
  AnnouncementForm: {id?: string; initial?: AdminAnnouncement};
  Events: undefined;
  EventForm: {id?: string; initial?: AdminEvent};
  Transport: undefined;
  Library: undefined;
  Inventory: undefined;
  Reports: undefined;
  Settings: undefined;
  Notifications: undefined;
  FeeReceipt: {invoiceId: string};
  FeesStudentsList: {classId: string; className: string; sectionId?: string; sectionName?: string};
  Profile: undefined;
  ChangePassword: undefined;
  ClassesManage: undefined;
  SubjectsManage: undefined;
  ClassSchedule: undefined;
  PeriodForm: {classId: string; sectionId: string; day: WeekDay; periodId?: string; initial?: TimetablePeriod};
};

// ---- Teacher --------------------------------------------------------------
export type TeacherTabParamList = {
  Dashboard: undefined;
  Homework: undefined;
  Classes: undefined;
  Profile: undefined;
};

export type TeacherStackParamList = {
  Tabs: undefined;
  MarkAttendance: {classId: string; className: string; sectionId: string; sectionName: string};
  HomeworkForm: {homeworkId?: string; initial?: TeacherHomework};
  Timetable: undefined;
  ClassStudents: {classId: string; className: string; sectionId?: string; sectionName?: string};
  StudentDetail: {id: string};
  StudentAttendanceHistory: {studentId: string; studentName?: string};
  Leave: undefined;
  Chat: undefined;
  Announcements: undefined;
  Notifications: undefined;
  ChangePassword: undefined;
};

// ---- Parent ---------------------------------------------------------------
export type ParentTabParamList = {
  Dashboard: undefined;
  Attendance: undefined;
  Fees: undefined;
  Profile: undefined;
};

export type ParentStackParamList = {
  Tabs: undefined;
  ChildProfile: undefined;
  Results: undefined;
  ReportCard: {examId: string};
  Homework: undefined;
  Timetable: undefined;
  Announcements: undefined;
  Chat: undefined;
  Leave: undefined;
  Notifications: undefined;
  ChangePassword: undefined;
  FeeReceipt: {invoiceId: string};
};

// ---- Screen prop helpers --------------------------------------------------
export type AdminScreenProps<T extends keyof AdminStackParamList> = NativeStackScreenProps<
  AdminStackParamList,
  T
>;
export type TeacherScreenProps<T extends keyof TeacherStackParamList> = NativeStackScreenProps<
  TeacherStackParamList,
  T
>;
export type ParentScreenProps<T extends keyof ParentStackParamList> = NativeStackScreenProps<
  ParentStackParamList,
  T
>;
export type AuthScreenProps<T extends keyof AuthStackParamList> = NativeStackScreenProps<
  AuthStackParamList,
  T
>;
