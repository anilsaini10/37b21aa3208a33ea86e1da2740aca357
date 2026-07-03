/** Teacher role navigator: tabs (Dashboard/Homework/Classes/Profile) + stack. */
import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from '../core/theme';
import {Icon} from '../shared/components';
import type {TeacherStackParamList, TeacherTabParamList} from './types';
import {ScreenNames} from './ScreenNames';

import {TeacherDashboardScreen} from '../features/dashboard/screens/TeacherDashboardScreen';
import {HomeWorkClassListScreen} from '../features/homework/screens/HomeWorkClassList';
import {HomeworkListScreen} from '../features/homework/screens/HomeworkListScreen';
import {HomeworkDetailScreen} from '../features/homework/screens/HomeworkDetailScreen';
import {CreateHomeworkScreen} from '../features/homework/screens/CreateHomeworkScreen';
import {ClassListScreen} from '../features/teacher/screens/ClassList';
import {ClassStudentsScreen} from '../features/teacher/screens/ClassStudentsScreen';
import {StudentDetailScreen} from '../features/teacher/screens/StudentDetailScreen';
import {TeacherProfileScreen} from '../features/teacher/screens/TeacherProfileScreen';
import {MarkAttendanceScreen} from '../features/attendance/screens/MarkAttendanceScreen';
import {TimetableScreen} from '../features/timetable/screens/TimetableScreen';
import {LeaveScreen} from '../features/communication/screens/LeaveScreen';
import {ChatScreen} from '../features/communication/screens/ChatScreen';
import {AnnouncementsScreen} from '../features/communication/screens/AnnouncementsScreen';
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
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.divider,
          height: theme.components.tab.height + insets.bottom,
          paddingBottom: Math.max(insets.bottom, 6),
          paddingTop: 6,
        },
        tabBarIcon: ({color}) => <Icon name={TAB_ICON[route.name]} size={22} color={color} />,
      })}>
      <Tab.Screen name={ScreenNames.Dashboard} component={TeacherDashboardScreen} />
      <Tab.Screen name={ScreenNames.Homework} component={HomeWorkClassListScreen} />
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
      <Stack.Screen name={ScreenNames.CreateHomework} component={CreateHomeworkScreen} />
      <Stack.Screen name={ScreenNames.Timetable} component={TimetableScreen} />
      <Stack.Screen name={ScreenNames.ClassStudents} component={ClassStudentsScreen} />
      <Stack.Screen name={ScreenNames.HomeworkList} component={HomeworkListScreen} />
      <Stack.Screen name={ScreenNames.HomeworkDetail} component={HomeworkDetailScreen} />
      <Stack.Screen name={ScreenNames.StudentDetail} component={StudentDetailScreen} />
      <Stack.Screen name={ScreenNames.Leave} component={LeaveScreen} />
      <Stack.Screen name={ScreenNames.Chat} component={ChatScreen} />
      <Stack.Screen name={ScreenNames.Announcements} component={AnnouncementsScreen} />
      <Stack.Screen name={ScreenNames.Notifications} component={NotificationsScreen} />
      <Stack.Screen name={ScreenNames.ChangePassword} component={ChangePasswordScreen} />
    </Stack.Navigator>
  );
}
