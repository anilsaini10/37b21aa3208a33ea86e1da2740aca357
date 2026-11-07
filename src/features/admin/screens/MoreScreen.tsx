/** More — entry point to secondary admin modules, as a searchable 3-column grid. */
import React, {useMemo, useState} from 'react';
import {Pressable, ScrollView, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme, useThemedStyles} from '../../../core/theme';
import {useLanguage, type TranslationKey} from '../../../core/i18n';
import {
  Screen,
  AppText,
  Avatar,
  Icon,
  Row,
  SearchBar,
  EmptyState,
  Spacer,
  MoreMenuTile,
  moreMenuAccentForIndex,
} from '../../../shared/components';
import {useAuthStore} from '../../auth/authStore';
import {P, type PermissionKey} from '../../../core/config/permissions';
import {usePermissionGate} from '../../auth/usePermissionGate';
import {TestPaymentButton} from '../../subscription/components/TestPaymentButton';
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
  | 'AcademicCalendar'
  | 'Announcements'
  | 'Leave'
  | 'Events'
  | 'Transport'
  | 'Library'
  | 'Inventory'
  | 'Reports'
  | 'Settings'
  | 'SubscriptionPlans'
  | 'Notifications'
  | 'RecoveryRequests'
  | 'SyllabusDashboard';

interface ModuleItem {
  labelKey: TranslationKey;
  icon: string;
  route: NoParamRoute;
  permission?: PermissionKey;
}

const MODULES: ModuleItem[] = [
  {labelKey: 'teacherProfile_profile', icon: 'profile', route: ScreenNames.Profile},
  // {labelKey: 'feesList_headerTitle', icon: 'fee', route: ScreenNames.Fees, permission: P.FEES_COLLECT},
  {labelKey: 'moreScreen_classes', icon: 'class', route: ScreenNames.ClassesManage, permission: P.CLASSES_MANAGE},
  // {labelKey: 'moreScreen_subjects', icon: 'homework', route: ScreenNames.SubjectsManage, permission: P.SUBJECTS_MANAGE},
  {labelKey: 'moreScreen_classSchedule', icon: 'timetable', route: ScreenNames.ClassSchedule, permission: P.TIMETABLE_MANAGE},
  {labelKey: 'moreScreen_teacherSchedule', icon: 'timetable', route: ScreenNames.TeacherSchedule, permission: P.TIMETABLE_MANAGE},
  {labelKey: 'moreScreen_staff', icon: 'staff', route: ScreenNames.Staff, permission: P.STAFF_MANAGE},
  {labelKey: 'moreScreen_attendance', icon: 'attendance', route: ScreenNames.Attendance, permission: P.ATTENDANCE_VIEW},
  {labelKey: 'moreScreen_exams', icon: 'exam', route: ScreenNames.Exams, permission: P.EXAMS_MANAGE},
  {labelKey: 'calendar_title', icon: 'calendar', route: ScreenNames.AcademicCalendar, permission: P.CALENDAR_MANAGE},
  {labelKey: 'moreScreen_announcements', icon: 'announcement', route: ScreenNames.Announcements, permission: P.ANNOUNCEMENTS_MANAGE},
  {labelKey: 'moreScreen_leave', icon: 'calendar', route: ScreenNames.Leave, permission: P.LEAVE_APPROVE},
  {labelKey: 'moreScreen_recovery', icon: 'recovery', route: ScreenNames.RecoveryRequests, permission: P.RECOVERY_APPROVE},

  {labelKey: 'syllabus_title', icon: 'homework', route: ScreenNames.SyllabusDashboard, permission: P.SYLLABUS_DASHBOARD_VIEW},
  {labelKey: 'moreScreen_events', icon: 'event', route: ScreenNames.Events, permission: P.EVENTS_MANAGE},
  
  {labelKey: 'subscription_title', icon: 'card', route: ScreenNames.SubscriptionPlans},
  // {labelKey: 'moreScreen_transport', icon: 'transport', route: ScreenNames.Transport},
  // {labelKey: 'moreScreen_library', icon: 'library', route: ScreenNames.Library},
  // {labelKey: 'moreScreen_inventory', icon: 'inventory', route: ScreenNames.Inventory},
  // {labelKey: 'moreScreen_reports', icon: 'reports', route: ScreenNames.Reports, permission: P.REPORTS_VIEW},
  {labelKey: 'moreScreen_settings', icon: 'settings', route: ScreenNames.Settings, permission: P.SCHOOL_SETTINGS},
  // {labelKey: 'moreScreen_notifications', icon: 'notification', route: ScreenNames.Notifications},
];

export function MoreScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const navigation = useNavigation<Nav>();
  const {t} = useLanguage();
  const user = useAuthStore(s => s.user);
  const {gate, PermissionModal} = usePermissionGate();
  const [search, setSearch] = useState('');

  const allModules = useMemo(
    () => MODULES.map((m, index) => ({...m, index})),
    [],
  );

  const filteredModules = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return allModules;
    }
    return allModules.filter(m => t(m.labelKey).toLowerCase().includes(query));
  }, [search, t, allModules]);

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
    iconButton: {
      width: 38,
      height: 38,
      borderRadius: 19,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.dark ? t2.colors.surfaceVariant : '#F1EFFE',
    },
    searchSection: {
      paddingHorizontal: 20,
      paddingTop: t2.spacing.md,
    },
    filterButton: {
      width: 44,
      height: 44,
      borderRadius: t2.radius.md,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.dark ? t2.colors.surfaceVariant : '#F1EFFE',
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingTop: t2.spacing.md,
      paddingBottom: t2.spacing.xl,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginHorizontal: -t2.spacing.xs,
    },
    gridItem: {
      width: '33.333%',
      paddingHorizontal: t2.spacing.xs,
      marginBottom: t2.spacing.sm,
    },
  }));

  return (
    <Screen padded={false} style={styles.screen}>
      <View style={styles.header}>
        <Row justify="space-between" align="flex-start">
          <View style={{flex: 1}}>
            <AppText variant="h1" style={styles.headerTitleColor}>
              {t('moreScreen_title')}
            </AppText>
            <AppText variant="caption" color="textSecondary">
              {t('moreScreen_subtitle')}
            </AppText>
          </View>
          <Row gap={theme.spacing.sm} align="center">
            <Pressable
              onPress={() => navigation.navigate(ScreenNames.Notifications)}
              hitSlop={8}
              style={styles.iconButton}
              accessibilityRole="button">
              <Icon name="notification" size={19} color={theme.colors.primary} />
            </Pressable>
            <Pressable onPress={() => navigation.navigate(ScreenNames.Profile)} hitSlop={4} accessibilityRole="button">
              <Avatar name={user?.name ?? 'Admin'} uri={user?.avatarUrl} size={38} />
            </Pressable>
          </Row>
        </Row>
      </View>

      <View style={styles.searchSection}>
        <Row gap={theme.spacing.sm} align="center">
          <View style={{flex: 1}}>
            <SearchBar value={search} onChangeText={setSearch} placeholder={t('moreScreen_searchPlaceholder')} />
          </View>
          <Pressable style={styles.filterButton} accessibilityRole="button">
            <Icon name="filter" size={18} color={theme.colors.primary} />
          </Pressable>
        </Row>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {filteredModules.length === 0 ? (
          <EmptyState
            icon="search"
            title={t('moreScreen_noResultsTitle')}
            message={t('moreScreen_noResultsMessage')}
          />
        ) : (
          <View style={styles.grid}>
            {filteredModules.map(m => (
              <View key={m.route} style={styles.gridItem}>
                <MoreMenuTile
                  icon={m.icon}
                  title={t(m.labelKey)}
                  accentColor={m.route === ScreenNames.Settings ? theme.colors.textMuted : moreMenuAccentForIndex(m.index)}
                  onPress={gate(m.permission, () => navigation.navigate(m.route))}
                />
              </View>
            ))}
          </View>
        )}
        <Spacer size={16} />
        <TestPaymentButton />
        <Spacer size={24} />
      </ScrollView>
      <PermissionModal />
    </Screen>
  );
}
