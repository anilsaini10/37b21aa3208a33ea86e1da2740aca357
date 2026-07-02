/** More — entry point to secondary admin modules. */
import React from 'react';
import {ScrollView} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme} from '../../../core/theme';
import {Screen, CustomHeader, CustomCard, ListRow, Spacer} from '../../../shared/components';
import type {AdminStackParamList} from '../../../navigation/types';

type Nav = NativeStackNavigationProp<AdminStackParamList>;

/** Modules reached from here — all take no route params. */
type NoParamRoute =
  | 'Teachers'
  | 'Attendance'
  | 'Exams'
  | 'Announcements'
  | 'Events'
  | 'Transport'
  | 'Library'
  | 'Inventory'
  | 'Reports'
  | 'Settings'
  | 'Notifications';

interface ModuleItem {
  label: string;
  icon: string;
  route: NoParamRoute;
}

const MODULES: ModuleItem[] = [
  {label: 'Teachers', icon: 'teacher', route: 'Teachers'},
  {label: 'Attendance', icon: 'attendance', route: 'Attendance'},
  {label: 'Exams', icon: 'exam', route: 'Exams'},
  {label: 'Announcements', icon: 'announcement', route: 'Announcements'},
  {label: 'Events', icon: 'event', route: 'Events'},
  {label: 'Transport', icon: 'transport', route: 'Transport'},
  {label: 'Library', icon: 'library', route: 'Library'},
  {label: 'Inventory', icon: 'inventory', route: 'Inventory'},
  {label: 'Reports', icon: 'reports', route: 'Reports'},
  {label: 'Settings', icon: 'settings', route: 'Settings'},
  {label: 'Notifications', icon: 'notification', route: 'Notifications'},
];

export function MoreScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const navigation = useNavigation<Nav>();

  return (
    <Screen padded={false}>
      <CustomHeader title="More" />
      <ScrollView
        contentContainerStyle={{padding: theme.spacing.lg}}
        showsVerticalScrollIndicator={false}>
        <CustomCard padded={false} style={{paddingHorizontal: theme.spacing.lg}}>
          {MODULES.map(m => (
            <ListRow
              key={m.route}
              icon={m.icon}
              title={m.label}
              onPress={() => navigation.navigate(m.route)}
            />
          ))}
        </CustomCard>
        <Spacer size={24} />
      </ScrollView>
    </Screen>
  );
}
