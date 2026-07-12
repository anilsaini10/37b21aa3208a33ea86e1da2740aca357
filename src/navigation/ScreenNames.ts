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
  Fees: 'Fees',
  Homework: 'Homework',
  Timetable: 'Timetable',
  Announcements: 'Announcements',
  Chat: 'Chat',
  Leave: 'Leave',
  Notifications: 'Notifications',
  ChangePassword: 'ChangePassword',
  FeeReceipt: 'FeeReceipt',
  StudentDetail: 'StudentDetail',

  // Auth
  RoleSelect: 'RoleSelect',
  SelectSchool: 'SelectSchool',
  Login: 'Login',
  SignUp: 'SignUp',
  ParentLogin: 'ParentLogin',
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
  Exams: 'Exams',
  ExamReport: 'ExamReport',
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

  // Teacher
  Classes: 'Classes',
  MarkAttendance: 'MarkAttendance',
  CreateHomework: 'CreateHomework',
  ClassStudents: 'ClassStudents',
  HomeworkList: 'HomeworkList',
  HomeworkDetail: 'HomeworkDetail',

  // Parent
  ChildProfile: 'ChildProfile',
  Results: 'Results',
  ReportCard: 'ReportCard',
} as const;

export type ScreenName = (typeof ScreenNames)[keyof typeof ScreenNames];
