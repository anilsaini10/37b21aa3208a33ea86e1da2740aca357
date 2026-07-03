/** Teacher role navigator: tabs (Dashboard/Homework/Classes/Profile) + stack. */
import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from '../core/theme';
import {Icon} from '../shared/components';
import type {TeacherStackParamList, TeacherTabParamList} from './types';

import {TeacherDashboardScreen} from '../features/dashboard/screens/TeacherDashboardScreen';
import {HomeworkListScreen} from '../features/homework/screens/HomeworkListScreen';
import {CreateHomeworkScreen} from '../features/homework/screens/CreateHomeworkScreen';
import {ClassStudentsScreen} from '../features/teacher/screens/ClassStudentsScreen';
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
      <Tab.Screen name="Dashboard" component={TeacherDashboardScreen} />
      <Tab.Screen name="Homework" component={HomeworkListScreen} />
      <Tab.Screen name="Classes" component={ClassStudentsScreen} />
      <Tab.Screen name="Profile" component={TeacherProfileScreen} />
    </Tab.Navigator>
  );
}

export function TeacherNavigator(): React.JSX.Element {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="Tabs" component={TeacherTabs} />
      <Stack.Screen name="MarkAttendance" component={MarkAttendanceScreen} />
      <Stack.Screen name="CreateHomework" component={CreateHomeworkScreen} />
      <Stack.Screen name="Timetable" component={TimetableScreen} />
      <Stack.Screen name="ClassStudents" component={ClassStudentsScreen} />
      <Stack.Screen name="Leave" component={LeaveScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="Announcements" component={AnnouncementsScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
    </Stack.Navigator>
  );
}
