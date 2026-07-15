/** More — entry point to secondary admin modules. */
import React from 'react';
import {ScrollView} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme} from '../../../core/theme';
import {useLanguage, type TranslationKey} from '../../../core/i18n';
import {Screen, CustomHeader, CustomCard, ListRow, Spacer} from '../../../shared/components';
import type {AdminStackParamList} from '../../../navigation/types';
import {ScreenNames} from '../../../navigation/ScreenNames';

type Nav = NativeStackNavigationProp<AdminStackParamList>;

/** Modules reached from here — all take no route params. */
type NoParamRoute =
  | 'Profile'
  | 'Teachers'
  | 'ClassesManage'
  | 'SubjectsManage'
  | 'ClassSchedule'
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
  labelKey: TranslationKey;
  icon: string;
  route: NoParamRoute;
}

const MODULES: ModuleItem[] = [
  {labelKey: 'teacherProfile_profile', icon: 'profile', route: ScreenNames.Profile},
  {labelKey: 'moreScreen_teachers', icon: 'teacher', route: ScreenNames.Teachers},
  {labelKey: 'moreScreen_classes', icon: 'class', route: ScreenNames.ClassesManage},
  {labelKey: 'moreScreen_subjects', icon: 'homework', route: ScreenNames.SubjectsManage},
  {labelKey: 'moreScreen_classSchedule', icon: 'timetable', route: ScreenNames.ClassSchedule},
  {labelKey: 'moreScreen_attendance', icon: 'attendance', route: ScreenNames.Attendance},
  {labelKey: 'moreScreen_exams', icon: 'exam', route: ScreenNames.Exams},
  {labelKey: 'moreScreen_announcements', icon: 'announcement', route: ScreenNames.Announcements},
  {labelKey: 'moreScreen_events', icon: 'event', route: ScreenNames.Events},
  {labelKey: 'moreScreen_transport', icon: 'transport', route: ScreenNames.Transport},
  // {labelKey: 'moreScreen_library', icon: 'library', route: ScreenNames.Library},
  {labelKey: 'moreScreen_inventory', icon: 'inventory', route: ScreenNames.Inventory},
  {labelKey: 'moreScreen_reports', icon: 'reports', route: ScreenNames.Reports},
  {labelKey: 'moreScreen_settings', icon: 'settings', route: ScreenNames.Settings},
  // {labelKey: 'moreScreen_notifications', icon: 'notification', route: ScreenNames.Notifications},
];

export function MoreScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const navigation = useNavigation<Nav>();
  const {t} = useLanguage();

  return (
    <Screen padded={false}>
      <CustomHeader title={t('moreScreen_title')} />
      <ScrollView
        contentContainerStyle={{padding: theme.spacing.lg}}
        showsVerticalScrollIndicator={false}>
        <CustomCard padded={false} style={{paddingHorizontal: theme.spacing.lg}}>
          {MODULES.map(m => (
            <ListRow
              key={m.route}
              icon={m.icon}
              title={t(m.labelKey)}
              onPress={() => navigation.navigate(m.route)}
            />
          ))}
        </CustomCard>
        <Spacer size={24} />
      </ScrollView>
    </Screen>
  );
}
