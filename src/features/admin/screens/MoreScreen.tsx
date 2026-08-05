/** More — entry point to secondary admin modules. */
import React from 'react';
import {ScrollView, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme, useThemedStyles} from '../../../core/theme';
import {useLanguage, type TranslationKey} from '../../../core/i18n';
import {Screen, CustomCard, AppText, Spacer} from '../../../shared/components';
import {MoreMenuItem} from '../components/MoreMenuItem';
import type {AdminStackParamList} from '../../../navigation/types';
import {ScreenNames} from '../../../navigation/ScreenNames';

type Nav = NativeStackNavigationProp<AdminStackParamList>;

/** Modules reached from here — all take no route params. */
type NoParamRoute =
  | 'Profile'
  | 'Fees'
  | 'ClassesManage'
  | 'SubjectsManage'
  | 'ClassSchedule'
  | 'TeacherSchedule'
  | 'Staff'
  | 'Attendance'
  | 'Exams'
  | 'Announcements'
  | 'Leave'
  | 'TeacherLeaveRequests'
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
  {labelKey: 'feesList_headerTitle', icon: 'fee', route: ScreenNames.Fees},
  {labelKey: 'moreScreen_classes', icon: 'class', route: ScreenNames.ClassesManage},
  {labelKey: 'moreScreen_subjects', icon: 'homework', route: ScreenNames.SubjectsManage},
  {labelKey: 'moreScreen_classSchedule', icon: 'timetable', route: ScreenNames.ClassSchedule},
  {labelKey: 'moreScreen_teacherSchedule', icon: 'timetable', route: ScreenNames.TeacherSchedule},
  {labelKey: 'moreScreen_staff', icon: 'staff', route: ScreenNames.Staff},
  {labelKey: 'moreScreen_attendance', icon: 'attendance', route: ScreenNames.Attendance},
  {labelKey: 'moreScreen_exams', icon: 'exam', route: ScreenNames.Exams},
  {labelKey: 'moreScreen_announcements', icon: 'announcement', route: ScreenNames.Announcements},
  {labelKey: 'moreScreen_leave', icon: 'calendar', route: ScreenNames.Leave},
  {labelKey: 'moreScreen_teacherLeave', icon: 'calendar', route: ScreenNames.TeacherLeaveRequests},
  {labelKey: 'moreScreen_events', icon: 'event', route: ScreenNames.Events},
  {labelKey: 'moreScreen_transport', icon: 'transport', route: ScreenNames.Transport},
  // {labelKey: 'moreScreen_library', icon: 'library', route: ScreenNames.Library},
  {labelKey: 'moreScreen_inventory', icon: 'inventory', route: ScreenNames.Inventory},
  {labelKey: 'moreScreen_reports', icon: 'reports', route: ScreenNames.Reports},
  {labelKey: 'moreScreen_settings', icon: 'settings', route: ScreenNames.Settings},
  // {labelKey: 'moreScreen_notifications', icon: 'notification', route: ScreenNames.Notifications},
];

/** Soft accent palette for the rows' left bar + icon tint — matches the suggested per-module colors 1:1 for the first 11 modules, then cycles for the rest. */
const TONE_ACCENTS = {
  purple: '#7C5CFC',
  green: '#4CCB7F',
  blue: '#4D8DFF',
  orange: '#FF9F43',
  teal: '#35C9A5',
} as const;

type Tone = keyof typeof TONE_ACCENTS;

const TONE_SEQUENCE: Tone[] = ['purple', 'green', 'blue', 'orange', 'purple', 'green', 'blue', 'orange', 'purple', 'teal', 'blue'];
const TONE_CYCLE: Tone[] = ['purple', 'green', 'blue', 'orange', 'teal'];

function accentForIndex(index: number): string {
  const tone = TONE_SEQUENCE[index] ?? TONE_CYCLE[index % TONE_CYCLE.length];
  return TONE_ACCENTS[tone];
}

export function MoreScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const navigation = useNavigation<Nav>();
  const {t} = useLanguage();

  const styles = useThemedStyles(t2 => ({
    screen: theme.dark ? {} : {backgroundColor: '#F8F7FF'},
    header: {
      backgroundColor: theme.dark ? t2.colors.background : '#FFFFFF',
      paddingHorizontal: 22,
      paddingTop: t2.spacing.lg,
      paddingBottom: t2.spacing.md,
    },
    headerTitleColor: {
      color: theme.dark ? t2.colors.text : '#111827',
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingTop: 14,
      paddingBottom: t2.spacing.xl,
    },
    card: theme.dark
      ? {paddingVertical: 12}
      : {paddingVertical: 12, borderRadius: 22, borderColor: 'rgba(100, 100, 150, 0.08)'},
  }));

  return (
    <Screen padded={false} style={styles.screen}>
      <View style={styles.header}>
        <AppText variant="headerTitle" style={styles.headerTitleColor}>
          {t('moreScreen_title')}
        </AppText>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <CustomCard padded={false} style={styles.card}>
          {MODULES.map((m, index) => (
            <MoreMenuItem
              key={m.route}
              icon={m.icon}
              title={t(m.labelKey)}
              accentColor={accentForIndex(index)}
              onPress={() => navigation.navigate(m.route)}
            />
          ))}
        </CustomCard>
        <Spacer size={24} />
      </ScrollView>
    </Screen>
  );
}
