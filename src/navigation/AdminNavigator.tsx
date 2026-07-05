/** Admin role navigator: bottom tabs (Dashboard/Students/Fees/More) + detail stack. */
import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from '../core/theme';
import {Icon} from '../shared/components';
import type {AdminStackParamList, AdminTabParamList} from './types';
import {ScreenNames} from './ScreenNames';

import {AdminDashboardScreen} from '../features/dashboard/screens/AdminDashboardScreen';
import {StudentsWiseClassListScreen} from '../features/students/screens/StudentsWiseClassList';
import {StudentsListScreen} from '../features/students/screens/StudentsListScreen';
import {StudentDetailScreen} from '../features/students/screens/StudentDetailScreen';
import {StudentFormScreen} from '../features/students/screens/StudentFormScreen';
import {TeachersListScreen} from '../features/teachers/screens/TeachersListScreen';
import {TeacherFormScreen} from '../features/teachers/screens/TeacherFormScreen';
import {FeesListScreen} from '../features/fees/screens/FeesListScreen';
import {FeesStudentsListScreen} from '../features/fees/screens/FeesStudentsListScreen';
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
      <Tab.Screen name={ScreenNames.Dashboard} component={AdminDashboardScreen} />
      <Tab.Screen name={ScreenNames.Students} component={StudentsWiseClassListScreen} />
      <Tab.Screen name={ScreenNames.Fees} component={FeesListScreen} />
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
      <Stack.Screen name={ScreenNames.Teachers} component={TeachersListScreen} />
      <Stack.Screen name={ScreenNames.TeacherForm} component={TeacherFormScreen} />
      <Stack.Screen name={ScreenNames.Attendance} component={AttendanceReportScreen} />
      <Stack.Screen name={ScreenNames.Exams} component={ExamsListScreen} />
      <Stack.Screen name={ScreenNames.ExamReport} component={ExamReportScreen} />
      <Stack.Screen name={ScreenNames.Announcements} component={AnnouncementsScreen} />
      <Stack.Screen name={ScreenNames.AnnouncementForm} component={AnnouncementFormScreen} />
      <Stack.Screen name={ScreenNames.Events} component={EventsScreen} />
      <Stack.Screen name={ScreenNames.Transport} component={TransportScreen} />
      <Stack.Screen name={ScreenNames.Library} component={LibraryScreen} />
      <Stack.Screen name={ScreenNames.Inventory} component={InventoryScreen} />
      <Stack.Screen name={ScreenNames.Reports} component={ReportsScreen} />
      <Stack.Screen name={ScreenNames.Settings} component={SettingsScreen} />
      <Stack.Screen name={ScreenNames.Notifications} component={NotificationsScreen} />
      <Stack.Screen name={ScreenNames.FeeReceipt} component={FeeReceiptScreen} />
      <Stack.Screen name={ScreenNames.FeesStudentsList} component={FeesStudentsListScreen} />
    </Stack.Navigator>
  );
}
