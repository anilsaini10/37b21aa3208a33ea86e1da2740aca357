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
  ScheduleDay,
  ScheduleEntry,
  Staff,
  Student,
  Teacher,
  TeacherHomework,
  UserRole,
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
  Login: {role: UserRole; schoolId?: string; schoolName?: string};
  SignUp: undefined;
  ForgotPassword: undefined;
  ResetPassword: {email: string};
};

// ---- Admin ----------------------------------------------------------------
export type AdminTabParamList = {
  Dashboard: undefined;
  Students: undefined;
  Teachers: undefined;
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
  Fees: undefined;
  TeacherForm: undefined;
  TeacherDetail: {teacherId: string; initial?: Teacher};
  TeacherEdit: {teacherId: string; initial: Teacher};
  Attendance: undefined;
  ClassAttendance: {classId: string; className: string; date: string};
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
  PeriodForm: {classId: string; sectionId: string; day: ScheduleDay; scheduleId?: string; initial?: ScheduleEntry};
  TeacherSchedule: undefined;
  Leave: undefined;
  TeacherLeaveRequests: undefined;
  MarkStaffAttendance: undefined;
  StaffAttendanceRegister: {teacherId?: string; teacherName?: string} | undefined;
  Staff: undefined;
  StaffForm: {staffId?: string; initial?: Staff} | undefined;
  StaffDetail: {staffId: string; initial?: Staff};
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
  /** No teacher-facing student-by-id endpoint exists — the roster row already has everything a basic detail view needs. */
  StudentDetail: {student: Student};
  StudentAttendanceHistory: {studentId: string; studentName?: string};
  MySchedule: undefined;
  Leave: undefined;
  MyLeave: undefined;
  MyLeaveApply: undefined;
  MyAttendance: undefined;
  MyProfile: undefined;
  Chat: undefined;
  Announcements: undefined;
  Events: undefined;
  Notifications: undefined;
  ChangePassword: undefined;
};

// ---- Parent ---------------------------------------------------------------
export type ParentTabParamList = {
  Dashboard: undefined;
  Attendance: undefined;
  Homework: undefined;
  Profile: undefined;
};

export type ParentStackParamList = {
  Tabs: undefined;
  ChildProfile: undefined;
  ChildTimetable: undefined;
  Results: undefined;
  ReportCard: {examId: string; studentId: string};
  Fees: undefined;
  Timetable: undefined;
  Announcements: undefined;
  Events: undefined;
  Chat: undefined;
  Leave: undefined;
  LeaveApply: {studentId: string; studentName: string};
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
