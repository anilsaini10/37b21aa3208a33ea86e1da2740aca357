/** Parent role navigator: tabs (Dashboard/Attendance/Fees/Profile) + stack. */
import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {useTheme} from '../core/theme';
import {Icon} from '../shared/components';
import type {ParentStackParamList, ParentTabParamList} from './types';

import {ParentDashboardScreen} from '../features/dashboard/screens/ParentDashboardScreen';
import {ParentAttendanceScreen} from '../features/attendance/screens/ParentAttendanceScreen';
import {ParentFeesScreen} from '../features/fees/screens/ParentFeesScreen';
import {ParentProfileScreen} from '../features/parent/screens/ParentProfileScreen';
import {ChildProfileScreen} from '../features/parent/screens/ChildProfileScreen';
import {ResultsScreen} from '../features/exams/screens/ResultsScreen';
import {ReportCardScreen} from '../features/exams/screens/ReportCardScreen';
import {ParentHomeworkScreen} from '../features/homework/screens/ParentHomeworkScreen';
import {TimetableScreen} from '../features/timetable/screens/TimetableScreen';
import {FeeReceiptScreen} from '../features/fees/screens/FeeReceiptScreen';
import {LeaveScreen} from '../features/communication/screens/LeaveScreen';
import {ChatScreen} from '../features/communication/screens/ChatScreen';
import {AnnouncementsScreen} from '../features/communication/screens/AnnouncementsScreen';
import {NotificationsScreen} from '../features/communication/screens/NotificationsScreen';
import {ChangePasswordScreen} from '../features/auth/screens/ChangePasswordScreen';

const Tab = createBottomTabNavigator<ParentTabParamList>();
const Stack = createNativeStackNavigator<ParentStackParamList>();

const TAB_ICON: Record<keyof ParentTabParamList, string> = {
  Dashboard: 'dashboard',
  Attendance: 'attendance',
  Fees: 'fee',
  Profile: 'profile',
};

function ParentTabs(): React.JSX.Element {
  const {theme} = useTheme();
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.tabActive,
        tabBarInactiveTintColor: theme.colors.tabInactive,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.divider,
          height: theme.components.tab.height,
          paddingBottom: 6,
        },
        tabBarIcon: ({color}) => <Icon name={TAB_ICON[route.name]} size={22} color={color} />,
      })}>
      <Tab.Screen name="Dashboard" component={ParentDashboardScreen} />
      <Tab.Screen name="Attendance" component={ParentAttendanceScreen} />
      <Tab.Screen name="Fees" component={ParentFeesScreen} />
      <Tab.Screen name="Profile" component={ParentProfileScreen} />
    </Tab.Navigator>
  );
}

export function ParentNavigator(): React.JSX.Element {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="Tabs" component={ParentTabs} />
      <Stack.Screen name="ChildProfile" component={ChildProfileScreen} />
      <Stack.Screen name="Results" component={ResultsScreen} />
      <Stack.Screen name="ReportCard" component={ReportCardScreen} />
      <Stack.Screen name="Homework" component={ParentHomeworkScreen} />
      <Stack.Screen name="Timetable" component={TimetableScreen} />
      <Stack.Screen name="Announcements" component={AnnouncementsScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="Leave" component={LeaveScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      <Stack.Screen name="FeeReceipt" component={FeeReceiptScreen} />
    </Stack.Navigator>
  );
}
