/**
 * Screen name constants — the single source of truth for every route name
 * used across the app's navigators. Navigators register screens with these
 * (`<Stack.Screen name={ScreenNames.X} />`) and callers navigate with them
 * (`navigation.navigate(ScreenNames.X)`) instead of ad-hoc string literals.
 */

export const ScreenNames = {
  // Root
  Auth: 'Auth',
  Admin: 'Admin',
  Teacher: 'Teacher',
  Parent: 'Parent',

  // Shared
  Tabs: 'Tabs',
  Dashboard: 'Dashboard',
  Profile: 'Profile',
  Attendance: 'Attendance',
  ClassAttendance: 'ClassAttendance',
  Fees: 'Fees',
  Homework: 'Homework',
  Timetable: 'Timetable',
  Announcements: 'Announcements',
  Chat: 'Chat',
  Leave: 'Leave',
  LeaveApply: 'LeaveApply',
  Notifications: 'Notifications',
  ChangePassword: 'ChangePassword',
  FeeReceipt: 'FeeReceipt',
  StudentDetail: 'StudentDetail',
  StudentAttendanceHistory: 'StudentAttendanceHistory',

  // Auth
  RoleSelect: 'RoleSelect',
  SelectSchool: 'SelectSchool',
  Login: 'Login',
  SignUp: 'SignUp',
  ForgotPassword: 'ForgotPassword',

  // Admin
  Students: 'Students',
  StudentsList: 'StudentsList',
  FeesStudentsList: 'FeesStudentsList',
  More: 'More',
  StudentForm: 'StudentForm',
  Teachers: 'Teachers',
  TeacherForm: 'TeacherForm',
  TeacherDetail: 'TeacherDetail',
  TeacherEdit: 'TeacherEdit',
  Exams: 'Exams',
  ExamForm: 'ExamForm',
  ExamClasses: 'ExamClasses',
  ExamReport: 'ExamReport',
  StudentMarks: 'StudentMarks',
  AnnouncementForm: 'AnnouncementForm',
  Events: 'Events',
  EventForm: 'EventForm',
  Transport: 'Transport',
  Library: 'Library',
  Inventory: 'Inventory',
  Reports: 'Reports',
  Settings: 'Settings',
  ClassesManage: 'ClassesManage',
  SubjectsManage: 'SubjectsManage',
  ClassSchedule: 'ClassSchedule',
  PeriodForm: 'PeriodForm',
  TeacherSchedule: 'TeacherSchedule',
  TeacherLeaveRequests: 'TeacherLeaveRequests',
  MarkStaffAttendance: 'MarkStaffAttendance',
  StaffAttendanceRegister: 'StaffAttendanceRegister',
  Staff: 'Staff',
  StaffForm: 'StaffForm',
  StaffDetail: 'StaffDetail',

  // Teacher
  Classes: 'Classes',
  MarkAttendance: 'MarkAttendance',
  HomeworkForm: 'HomeworkForm',
  ClassStudents: 'ClassStudents',
  MySchedule: 'MySchedule',
  MyLeave: 'MyLeave',
  MyLeaveApply: 'MyLeaveApply',
  MyAttendance: 'MyAttendance',
  MyProfile: 'MyProfile',

  // Parent
  ChildProfile: 'ChildProfile',
  ChildTimetable: 'ChildTimetable',
  Results: 'Results',
  ReportCard: 'ReportCard',
} as const;

export type ScreenName = (typeof ScreenNames)[keyof typeof ScreenNames];
