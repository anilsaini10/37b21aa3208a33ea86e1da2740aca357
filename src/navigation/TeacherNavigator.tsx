/** Teacher role navigator: tabs (Dashboard/Homework/Classes/Profile) + stack. */
import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from '../core/theme';
import {Icon} from '../shared/components';
import type {TeacherStackParamList, TeacherTabParamList} from './types';
import {ScreenNames} from './ScreenNames';
import {floatingTabBarStyle} from './floatingTabBar';

import {TeacherDashboardScreen} from '../features/dashboard/screens/TeacherDashboardScreen';
import {HomeworkListScreen} from '../features/homework/screens/HomeworkListScreen';
import {HomeworkFormScreen} from '../features/homework/screens/HomeworkFormScreen';
import {HomeworkDetailScreen} from '../features/homework/screens/HomeworkDetailScreen';
import {HomeworkSubmissionsScreen} from '../features/homework/screens/HomeworkSubmissionsScreen';
import {ClassListScreen} from '../features/teacher/screens/ClassList';
import {ClassStudentsScreen} from '../features/teacher/screens/ClassStudentsScreen';
import {StudentDetailScreen} from '../features/teacher/screens/StudentDetailScreen';
import {StudentAttendanceHistoryScreen} from '../features/attendance/screens/StudentAttendanceHistoryScreen';
import {TeacherProfileScreen} from '../features/teacher/screens/TeacherProfileScreen';
import {MarkAttendanceScreen} from '../features/attendance/screens/MarkAttendanceScreen';
import {TimetableScreen} from '../features/timetable/screens/TimetableScreen';
import {MyScheduleScreen} from '../features/timetable/screens/MyScheduleScreen';
import {TeacherLeaveScreen} from '../features/leave/screens/TeacherLeaveScreen';
import {MyLeaveScreen} from '../features/leave/screens/MyLeaveScreen';
import {MyLeaveApplyScreen} from '../features/leave/screens/MyLeaveApplyScreen';
import {MyAttendanceScreen} from '../features/attendance/screens/MyAttendanceScreen';
import {MyProfileScreen} from '../features/teacher/screens/MyProfileScreen';
import {ChatScreen} from '../features/communication/screens/ChatScreen';
import {AnnouncementsScreen} from '../features/communication/screens/AnnouncementsScreen';
import {EventsScreen} from '../features/events/screens/EventsScreen';
import {NotificationsScreen} from '../features/communication/screens/NotificationsScreen';
import {ChangePasswordScreen} from '../features/auth/screens/ChangePasswordScreen';

const Tab = createBottomTabNavigator<TeacherTabParamList>();
const Stack = createNativeStackNavigator<TeacherStackParamList>();

const TAB_ICON: Record<keyof TeacherTabParamList, string> = {
  Dashboard: 'dashboard',
  Homework: 'homework',
  Classes: 'students',
  Profile: 'profile',
};

function TeacherTabs(): React.JSX.Element {
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
      <Tab.Screen name={ScreenNames.Dashboard} component={TeacherDashboardScreen} />
      <Tab.Screen name={ScreenNames.Homework} component={HomeworkListScreen} />
      <Tab.Screen name={ScreenNames.Classes} component={ClassListScreen} />
      <Tab.Screen name={ScreenNames.Profile} component={TeacherProfileScreen} />
    </Tab.Navigator>
  );
}

export function TeacherNavigator(): React.JSX.Element {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name={ScreenNames.Tabs} component={TeacherTabs} />
      <Stack.Screen name={ScreenNames.MarkAttendance} component={MarkAttendanceScreen} />
      <Stack.Screen name={ScreenNames.HomeworkForm} component={HomeworkFormScreen} />
      <Stack.Screen name={ScreenNames.HomeworkDetail} component={HomeworkDetailScreen} />
      <Stack.Screen name={ScreenNames.HomeworkSubmissions} component={HomeworkSubmissionsScreen} />
      <Stack.Screen name={ScreenNames.Timetable} component={TimetableScreen} />
      <Stack.Screen name={ScreenNames.MySchedule} component={MyScheduleScreen} />
      <Stack.Screen name={ScreenNames.ClassStudents} component={ClassStudentsScreen} />
      <Stack.Screen name={ScreenNames.StudentDetail} component={StudentDetailScreen} />
      <Stack.Screen name={ScreenNames.StudentAttendanceHistory} component={StudentAttendanceHistoryScreen} />
      <Stack.Screen name={ScreenNames.Leave} component={TeacherLeaveScreen} />
      <Stack.Screen name={ScreenNames.MyLeave} component={MyLeaveScreen} />
      <Stack.Screen name={ScreenNames.MyLeaveApply} component={MyLeaveApplyScreen} />
      <Stack.Screen name={ScreenNames.MyAttendance} component={MyAttendanceScreen} />
      <Stack.Screen name={ScreenNames.MyProfile} component={MyProfileScreen} />
      <Stack.Screen name={ScreenNames.Chat} component={ChatScreen} />
      <Stack.Screen name={ScreenNames.Announcements} component={AnnouncementsScreen} />
      <Stack.Screen name={ScreenNames.Events} component={EventsScreen} />
      <Stack.Screen name={ScreenNames.Notifications} component={NotificationsScreen} />
      <Stack.Screen name={ScreenNames.ChangePassword} component={ChangePasswordScreen} />
    </Stack.Navigator>
  );
}
