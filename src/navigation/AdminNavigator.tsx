/** Admin role navigator: bottom tabs (Dashboard/Students/Teachers/More) + detail stack. */
import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from '../core/theme';
import {Icon} from '../shared/components';
import type {AdminStackParamList, AdminTabParamList} from './types';
import {ScreenNames} from './ScreenNames';
import {floatingTabBarStyle} from './floatingTabBar';

import {AdminDashboardScreen} from '../features/dashboard/screens/AdminDashboardScreen';
import {StudentsWiseClassListScreen} from '../features/students/screens/StudentsWiseClassList';
import {StudentsListScreen} from '../features/students/screens/StudentsListScreen';
import {StudentDetailScreen} from '../features/students/screens/StudentDetailScreen';
import {StudentFormScreen} from '../features/students/screens/StudentFormScreen';
import {TeachersListScreen} from '../features/teachers/screens/TeachersListScreen';
import {TeacherFormScreen} from '../features/teachers/screens/TeacherFormScreen';
import {TeacherDetailScreen} from '../features/teachers/screens/TeacherDetailScreen';
import {TeacherEditScreen} from '../features/teachers/screens/TeacherEditScreen';
import {FeesListScreen} from '../features/fees/screens/FeesListScreen';
import {FeesStudentsListScreen} from '../features/fees/screens/FeesStudentsListScreen';
import {FeeReceiptScreen} from '../features/fees/screens/FeeReceiptScreen';
import {AttendanceReportScreen} from '../features/attendance/screens/AttendanceReportScreen';
import {ClassAttendanceScreen} from '../features/attendance/screens/ClassAttendanceScreen';
import {MarkStaffAttendanceScreen} from '../features/attendance/screens/MarkStaffAttendanceScreen';
import {StaffAttendanceRegisterScreen} from '../features/attendance/screens/StaffAttendanceRegisterScreen';
import {StaffListScreen} from '../features/staff/screens/StaffListScreen';
import {StaffFormScreen} from '../features/staff/screens/StaffFormScreen';
import {StaffDetailScreen} from '../features/staff/screens/StaffDetailScreen';
import {ExamsListScreen} from '../features/exams/screens/ExamsListScreen';
import {ExamFormScreen} from '../features/exams/screens/ExamFormScreen';
import {ExamClassesScreen} from '../features/exams/screens/ExamClassesScreen';
import {ExamReportScreen} from '../features/exams/screens/ExamReportScreen';
import {StudentMarksScreen} from '../features/exams/screens/StudentMarksScreen';
import {ReportsScreen} from '../features/reports/screens/ReportsScreen';
import {TransportScreen} from '../features/transport/screens/TransportScreen';
import {LibraryScreen} from '../features/library/screens/LibraryScreen';
import {InventoryScreen} from '../features/inventory/screens/InventoryScreen';
import {EventsScreen} from '../features/events/screens/EventsScreen';
import {EventFormScreen} from '../features/events/screens/EventFormScreen';
import {SettingsScreen} from '../features/settings/screens/SettingsScreen';
import {ClassesManageScreen} from '../features/classes/screens/ClassesManageScreen';
import {SubjectsManageScreen} from '../features/subjects/screens/SubjectsManageScreen';
import {AdminTimetableScreen} from '../features/timetable/screens/AdminTimetableScreen';
import {PeriodFormScreen} from '../features/timetable/screens/PeriodFormScreen';
import {TeacherScheduleScreen} from '../features/timetable/screens/TeacherScheduleScreen';
import {MoreScreen} from '../features/admin/screens/MoreScreen';
import {AdminProfileScreen} from '../features/admin/screens/AdminProfileScreen';
import {ChangePasswordScreen} from '../features/auth/screens/ChangePasswordScreen';
import {AnnouncementsScreen} from '../features/communication/screens/AnnouncementsScreen';
import {AnnouncementFormScreen} from '../features/communication/screens/AnnouncementFormScreen';
import {NotificationsScreen} from '../features/communication/screens/NotificationsScreen';
import {AdminLeaveScreen} from '../features/leave/screens/AdminLeaveScreen';
import {AdminTeacherLeaveScreen} from '../features/leave/screens/AdminTeacherLeaveScreen';

const Tab = createBottomTabNavigator<AdminTabParamList>();
const Stack = createNativeStackNavigator<AdminStackParamList>();

const TAB_ICON: Record<keyof AdminTabParamList, string> = {
  Dashboard: 'dashboard',
  Students: 'students',
  Teachers: 'teacher',
  More: 'settings',
};

function AdminTabs(): React.JSX.Element {
  const {theme} = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.tabActive,
        tabBarInactiveTintColor: theme.colors.tabInactive,
        tabBarStyle: floatingTabBarStyle(theme, insets),
        tabBarIcon: ({color}) => <Icon name={TAB_ICON[route.name]} size={22} color={color} />,
      })}>
      <Tab.Screen name={ScreenNames.Dashboard} component={AdminDashboardScreen} />
      <Tab.Screen name={ScreenNames.Students} component={StudentsWiseClassListScreen} />
      <Tab.Screen name={ScreenNames.Teachers} component={TeachersListScreen} />
      <Tab.Screen name={ScreenNames.More} component={MoreScreen} />
    </Tab.Navigator>
  );
}

export function AdminNavigator(): React.JSX.Element {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name={ScreenNames.Tabs} component={AdminTabs} />
      <Stack.Screen name={ScreenNames.StudentsList} component={StudentsListScreen} />
      <Stack.Screen name={ScreenNames.StudentDetail} component={StudentDetailScreen} />
      <Stack.Screen name={ScreenNames.StudentForm} component={StudentFormScreen} />
      <Stack.Screen name={ScreenNames.Fees} component={FeesListScreen} />
      <Stack.Screen name={ScreenNames.TeacherForm} component={TeacherFormScreen} />
      <Stack.Screen name={ScreenNames.TeacherDetail} component={TeacherDetailScreen} />
      <Stack.Screen name={ScreenNames.TeacherEdit} component={TeacherEditScreen} />
      <Stack.Screen name={ScreenNames.Attendance} component={AttendanceReportScreen} />
      <Stack.Screen name={ScreenNames.ClassAttendance} component={ClassAttendanceScreen} />
      <Stack.Screen name={ScreenNames.Exams} component={ExamsListScreen} />
      <Stack.Screen name={ScreenNames.ExamForm} component={ExamFormScreen} />
      <Stack.Screen name={ScreenNames.ExamClasses} component={ExamClassesScreen} />
      <Stack.Screen name={ScreenNames.ExamReport} component={ExamReportScreen} />
      <Stack.Screen name={ScreenNames.StudentMarks} component={StudentMarksScreen} />
      <Stack.Screen name={ScreenNames.Announcements} component={AnnouncementsScreen} />
      <Stack.Screen name={ScreenNames.AnnouncementForm} component={AnnouncementFormScreen} />
      <Stack.Screen name={ScreenNames.Events} component={EventsScreen} />
      <Stack.Screen name={ScreenNames.EventForm} component={EventFormScreen} />
      <Stack.Screen name={ScreenNames.Transport} component={TransportScreen} />
      <Stack.Screen name={ScreenNames.Library} component={LibraryScreen} />
      <Stack.Screen name={ScreenNames.Inventory} component={InventoryScreen} />
      <Stack.Screen name={ScreenNames.Reports} component={ReportsScreen} />
      <Stack.Screen name={ScreenNames.Settings} component={SettingsScreen} />
      <Stack.Screen name={ScreenNames.Notifications} component={NotificationsScreen} />
      <Stack.Screen name={ScreenNames.FeeReceipt} component={FeeReceiptScreen} />
      <Stack.Screen name={ScreenNames.FeesStudentsList} component={FeesStudentsListScreen} />
      <Stack.Screen name={ScreenNames.Profile} component={AdminProfileScreen} />
      <Stack.Screen name={ScreenNames.ChangePassword} component={ChangePasswordScreen} />
      <Stack.Screen name={ScreenNames.ClassesManage} component={ClassesManageScreen} />
      <Stack.Screen name={ScreenNames.SubjectsManage} component={SubjectsManageScreen} />
      <Stack.Screen name={ScreenNames.ClassSchedule} component={AdminTimetableScreen} />
      <Stack.Screen name={ScreenNames.PeriodForm} component={PeriodFormScreen} />
      <Stack.Screen name={ScreenNames.TeacherSchedule} component={TeacherScheduleScreen} />
      <Stack.Screen name={ScreenNames.Leave} component={AdminLeaveScreen} />
      <Stack.Screen name={ScreenNames.TeacherLeaveRequests} component={AdminTeacherLeaveScreen} />
      <Stack.Screen name={ScreenNames.MarkStaffAttendance} component={MarkStaffAttendanceScreen} />
      <Stack.Screen name={ScreenNames.StaffAttendanceRegister} component={StaffAttendanceRegisterScreen} />
      <Stack.Screen name={ScreenNames.Staff} component={StaffListScreen} />
      <Stack.Screen name={ScreenNames.StaffForm} component={StaffFormScreen} />
      <Stack.Screen name={ScreenNames.StaffDetail} component={StaffDetailScreen} />
    </Stack.Navigator>
  );
}
