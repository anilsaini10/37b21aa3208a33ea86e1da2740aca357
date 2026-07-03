/**
 * Navigation param lists (React Navigation v7, typed).
 *
 * Structure: a Root stack swaps between the Auth flow and a role-specific
 * navigator. Each role navigator is a native-stack whose first route (`Tabs`)
 * renders that role's bottom-tab navigator; detail / form routes are pushed on
 * top of the tabs.
 */
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {UserRole} from '../shared/types';

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
  Login: {role: Extract<UserRole, 'admin' | 'teacher'>};
  ParentLogin: undefined;
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
  StudentDetail: {id: string};
  StudentForm: {id?: string};
  Teachers: undefined;
  TeacherForm: undefined;
  Attendance: undefined;
  Exams: undefined;
  ExamReport: {examId: string};
  Announcements: undefined;
  AnnouncementForm: undefined;
  Events: undefined;
  Transport: undefined;
  Library: undefined;
  Inventory: undefined;
  Reports: undefined;
  Settings: undefined;
  Notifications: undefined;
  FeeReceipt: {invoiceId: string};
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
  MarkAttendance: undefined;
  CreateHomework: undefined;
  Timetable: undefined;
  ClassStudents: {classId: string; className: string; sectionId?: string; sectionName?: string};
  HomeworkList: {classId: string; className: string; sectionId?: string; sectionName?: string};
  HomeworkDetail: {id: string};
  StudentDetail: {id: string};
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
