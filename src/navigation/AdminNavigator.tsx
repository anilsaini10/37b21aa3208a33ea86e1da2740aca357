/** Admin role navigator: bottom tabs (Dashboard/Students/Fees/More) + detail stack. */
import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {useTheme} from '../core/theme';
import {Icon} from '../shared/components';
import type {AdminStackParamList, AdminTabParamList} from './types';

import {AdminDashboardScreen} from '../features/dashboard/screens/AdminDashboardScreen';
import {StudentsListScreen} from '../features/students/screens/StudentsListScreen';
import {StudentDetailScreen} from '../features/students/screens/StudentDetailScreen';
import {StudentFormScreen} from '../features/students/screens/StudentFormScreen';
import {TeachersListScreen} from '../features/teachers/screens/TeachersListScreen';
import {TeacherFormScreen} from '../features/teachers/screens/TeacherFormScreen';
import {FeesListScreen} from '../features/fees/screens/FeesListScreen';
import {FeeReceiptScreen} from '../features/fees/screens/FeeReceiptScreen';
import {AttendanceReportScreen} from '../features/attendance/screens/AttendanceReportScreen';
import {ExamsListScreen} from '../features/exams/screens/ExamsListScreen';
import {ExamReportScreen} from '../features/exams/screens/ExamReportScreen';
import {ReportsScreen} from '../features/reports/screens/ReportsScreen';
import {TransportScreen} from '../features/transport/screens/TransportScreen';
import {LibraryScreen} from '../features/library/screens/LibraryScreen';
import {InventoryScreen} from '../features/inventory/screens/InventoryScreen';
import {EventsScreen} from '../features/events/screens/EventsScreen';
import {SettingsScreen} from '../features/settings/screens/SettingsScreen';
import {MoreScreen} from '../features/admin/screens/MoreScreen';
import {AnnouncementsScreen} from '../features/communication/screens/AnnouncementsScreen';
import {AnnouncementFormScreen} from '../features/communication/screens/AnnouncementFormScreen';
import {NotificationsScreen} from '../features/communication/screens/NotificationsScreen';

const Tab = createBottomTabNavigator<AdminTabParamList>();
const Stack = createNativeStackNavigator<AdminStackParamList>();

const TAB_ICON: Record<keyof AdminTabParamList, string> = {
  Dashboard: 'dashboard',
  Students: 'students',
  Fees: 'fee',
  More: 'settings',
};

function AdminTabs(): React.JSX.Element {
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
      <Tab.Screen name="Dashboard" component={AdminDashboardScreen} />
      <Tab.Screen name="Students" component={StudentsListScreen} />
      <Tab.Screen name="Fees" component={FeesListScreen} />
      <Tab.Screen name="More" component={MoreScreen} />
    </Tab.Navigator>
  );
}

export function AdminNavigator(): React.JSX.Element {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="Tabs" component={AdminTabs} />
      <Stack.Screen name="StudentDetail" component={StudentDetailScreen} />
      <Stack.Screen name="StudentForm" component={StudentFormScreen} />
      <Stack.Screen name="Teachers" component={TeachersListScreen} />
      <Stack.Screen name="TeacherForm" component={TeacherFormScreen} />
      <Stack.Screen name="Attendance" component={AttendanceReportScreen} />
      <Stack.Screen name="Exams" component={ExamsListScreen} />
      <Stack.Screen name="ExamReport" component={ExamReportScreen} />
      <Stack.Screen name="Announcements" component={AnnouncementsScreen} />
      <Stack.Screen name="AnnouncementForm" component={AnnouncementFormScreen} />
      <Stack.Screen name="Events" component={EventsScreen} />
      <Stack.Screen name="Transport" component={TransportScreen} />
      <Stack.Screen name="Library" component={LibraryScreen} />
      <Stack.Screen name="Inventory" component={InventoryScreen} />
      <Stack.Screen name="Reports" component={ReportsScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="FeeReceipt" component={FeeReceiptScreen} />
    </Stack.Navigator>
  );
}
