/** Parent role navigator: tabs (Dashboard/Attendance/Homework/Profile) + stack. */
import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from '../core/theme';
import {Icon} from '../shared/components';
import type {ParentStackParamList, ParentTabParamList} from './types';
import {ScreenNames} from './ScreenNames';
import {floatingTabBarStyle} from './floatingTabBar';

import {ParentDashboardScreen} from '../features/dashboard/screens/ParentDashboardScreen';
import {ParentAttendanceScreen} from '../features/attendance/screens/ParentAttendanceScreen';
import {ParentFeesScreen} from '../features/fees/screens/ParentFeesScreen';
import {ParentProfileScreen} from '../features/parent/screens/ParentProfileScreen';
import {ChildProfileScreen} from '../features/parent/screens/ChildProfileScreen';
import {ChildTimetableScreen} from '../features/parent/screens/ChildTimetableScreen';
import {ResultsScreen} from '../features/exams/screens/ResultsScreen';
import {ReportCardScreen} from '../features/exams/screens/ReportCardScreen';
import {ParentHomeworkScreen} from '../features/homework/screens/ParentHomeworkScreen';
import {TimetableScreen} from '../features/timetable/screens/TimetableScreen';
import {FeeReceiptScreen} from '../features/fees/screens/FeeReceiptScreen';
import {ParentLeaveScreen} from '../features/leave/screens/ParentLeaveScreen';
import {ParentApplyLeaveScreen} from '../features/leave/screens/ParentApplyLeaveScreen';
import {ChatScreen} from '../features/communication/screens/ChatScreen';
import {AnnouncementsScreen} from '../features/communication/screens/AnnouncementsScreen';
import {NotificationsScreen} from '../features/communication/screens/NotificationsScreen';
import {ChangePasswordScreen} from '../features/auth/screens/ChangePasswordScreen';

const Tab = createBottomTabNavigator<ParentTabParamList>();
const Stack = createNativeStackNavigator<ParentStackParamList>();

const TAB_ICON: Record<keyof ParentTabParamList, string> = {
  Dashboard: 'dashboard',
  Attendance: 'attendance',
  Homework: 'homework',
  Profile: 'profile',
};

function ParentTabs(): React.JSX.Element {
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
      <Tab.Screen name={ScreenNames.Dashboard} component={ParentDashboardScreen} />
      <Tab.Screen name={ScreenNames.Attendance} component={ParentAttendanceScreen} />
      <Tab.Screen name={ScreenNames.Homework} component={ParentHomeworkScreen} />
      <Tab.Screen name={ScreenNames.Profile} component={ParentProfileScreen} />
    </Tab.Navigator>
  );
}

export function ParentNavigator(): React.JSX.Element {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name={ScreenNames.Tabs} component={ParentTabs} />
      <Stack.Screen name={ScreenNames.ChildProfile} component={ChildProfileScreen} />
      <Stack.Screen name={ScreenNames.ChildTimetable} component={ChildTimetableScreen} />
      <Stack.Screen name={ScreenNames.Results} component={ResultsScreen} />
      <Stack.Screen name={ScreenNames.ReportCard} component={ReportCardScreen} />
      <Stack.Screen name={ScreenNames.Fees} component={ParentFeesScreen} />
      <Stack.Screen name={ScreenNames.Timetable} component={TimetableScreen} />
      <Stack.Screen name={ScreenNames.Announcements} component={AnnouncementsScreen} />
      <Stack.Screen name={ScreenNames.Chat} component={ChatScreen} />
      <Stack.Screen name={ScreenNames.Leave} component={ParentLeaveScreen} />
      <Stack.Screen name={ScreenNames.LeaveApply} component={ParentApplyLeaveScreen} />
      <Stack.Screen name={ScreenNames.Notifications} component={NotificationsScreen} />
      <Stack.Screen name={ScreenNames.ChangePassword} component={ChangePasswordScreen} />
      <Stack.Screen name={ScreenNames.FeeReceipt} component={FeeReceiptScreen} />
    </Stack.Navigator>
  );
}
