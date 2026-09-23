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
  // {labelKey: 'feesList_headerTitle', icon: 'fee', route: ScreenNames.Fees},
  {labelKey: 'moreScreen_classes', icon: 'class', route: ScreenNames.ClassesManage},
  // {labelKey: 'moreScreen_subjects', icon: 'homework', route: ScreenNames.SubjectsManage},
  {labelKey: 'moreScreen_classSchedule', icon: 'timetable', route: ScreenNames.ClassSchedule},
  {labelKey: 'moreScreen_teacherSchedule', icon: 'timetable', route: ScreenNames.TeacherSchedule},
  {labelKey: 'moreScreen_staff', icon: 'staff', route: ScreenNames.Staff},
  {labelKey: 'moreScreen_attendance', icon: 'attendance', route: ScreenNames.Attendance},
  {labelKey: 'moreScreen_exams', icon: 'exam', route: ScreenNames.Exams},
  {labelKey: 'moreScreen_announcements', icon: 'announcement', route: ScreenNames.Announcements},
  {labelKey: 'moreScreen_leave', icon: 'calendar', route: ScreenNames.Leave},
  {labelKey: 'moreScreen_events', icon: 'event', route: ScreenNames.Events},
  // {labelKey: 'moreScreen_transport', icon: 'transport', route: ScreenNames.Transport},
  // {labelKey: 'moreScreen_library', icon: 'library', route: ScreenNames.Library},
  // {labelKey: 'moreScreen_inventory', icon: 'inventory', route: ScreenNames.Inventory},
  // {labelKey: 'moreScreen_reports', icon: 'reports', route: ScreenNames.Reports},
  {labelKey: 'moreScreen_settings', icon: 'settings', route: ScreenNames.Settings},
  // {labelKey: 'moreScreen_notifications', icon: 'notification', route: ScreenNames.Notifications},
];

const INDEXED_MODULES = MODULES.map((m, index) => ({...m, index}));

export function MoreScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const navigation = useNavigation<Nav>();
  const {t} = useLanguage();
  const user = useAuthStore(s => s.user);
  const [search, setSearch] = useState('');

  const filteredModules = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return INDEXED_MODULES;
    }
    return INDEXED_MODULES.filter(m => t(m.labelKey).toLowerCase().includes(query));
  }, [search, t]);

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
                  onPress={() => navigation.navigate(m.route)}
                />
              </View>
            ))}
          </View>
        )}
        <Spacer size={24} />
      </ScrollView>
    </Screen>
  );
}
