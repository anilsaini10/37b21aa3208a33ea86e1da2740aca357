/** Admin Syllabus Dashboard — summary cards, status breakdown, quick nav. */
import React, {useState, useCallback} from 'react';
import {RefreshControl, ScrollView, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme, useThemedStyles} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {
  Screen,
  CustomHeader,
  Select,
  StatGrid,
  Badge,
  Spacer,
  SectionTitle,
  Loader,
  EmptyState,
  MoreMenuItem,
  moreMenuAccentForIndex,
} from '../../../shared/components';
import {formatSessionYear} from '../../../shared/helpers';
import {useSyllabusDashboard} from '../adminSyllabus.service';
import type {AdminStackParamList} from '../../../navigation/types';
import {ScreenNames} from '../../../navigation/ScreenNames';
import type {StatCard} from '../../../shared/types';

type Nav = NativeStackNavigationProp<AdminStackParamList>;

const YEARS = Array.from({length: 7}, (_, i) => {
  const y = 2024 + i;
  return {label: formatSessionYear(y), value: String(y)};
});

export function SyllabusDashboardScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const navigation = useNavigation<Nav>();
  const currentYear = new Date().getFullYear();
  const [sessionYear, setSessionYear] = useState(String(currentYear));

  const {data, isLoading, refetch, isRefetching} = useSyllabusDashboard({sessionYear: Number(sessionYear)});

  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const styles = useThemedStyles(t2 => ({
    content: {padding: t2.spacing.lg, paddingBottom: t2.spacing.xxl},
    breakdownRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: t2.spacing.sm,
      marginTop: t2.spacing.sm,
    },
    navList: {marginTop: t2.spacing.sm},
  }));

  const stats: StatCard[] = data
    ? [
        {key: 'plans', label: t('syllabus_totalPlans'), value: data.totalPlans, icon: 'homework', accent: 'primary'},
        {key: 'chapters', label: t('syllabus_totalChapters'), value: data.totalChapters, icon: 'class', accent: 'info'},
        {key: 'avg', label: t('syllabus_avgCompletion'), value: `${Math.round(data.avgCompletion)}%`, icon: 'performance', accent: 'success'},
        {key: 'delayed', label: t('syllabus_delayed'), value: data.delayedCount, icon: 'calendar', accent: 'error'},
      ]
    : [];

  const navItems = [
    {label: t('syllabus_plans'), icon: 'homework', route: ScreenNames.AdminPlanList as keyof AdminStackParamList},
    {label: t('syllabus_classProgress'), icon: 'students', route: ScreenNames.ClassProgress as keyof AdminStackParamList},
    {label: t('syllabus_teacherProgress'), icon: 'teacher', route: ScreenNames.TeacherProgressReport as keyof AdminStackParamList},
    {label: t('syllabus_delayedChapters'), icon: 'calendar', route: ScreenNames.DelayedChapters as keyof AdminStackParamList},
    {label: t('syllabus_approvals'), icon: 'check', route: ScreenNames.ApprovalQueue as keyof AdminStackParamList},
  ];

  return (
    <Screen padded={false}>
      <CustomHeader title={t('syllabus_dashboard')} onBack={() => navigation.goBack()} />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}>
        <Select
          label={t('syllabus_sessionYear')}
          value={sessionYear}
          options={YEARS}
          onChange={setSessionYear}
        />

        {isLoading ? (
          <Loader />
        ) : !data ? (
          <EmptyState title={t('syllabus_noPlans')} message={t('syllabus_noPlansMessage')} />
        ) : (
          <>
            <StatGrid stats={stats} />

            <Spacer size={theme.spacing.lg} />
            <SectionTitle title={t('common_status')} />
            <View style={styles.breakdownRow}>
              <Badge label={`${t('syllabus_notStarted')}: ${data.statusBreakdown?.NOT_STARTED ?? 0}`} tone="neutral" />
              <Badge label={`${t('syllabus_inProgress')}: ${data.statusBreakdown?.IN_PROGRESS ?? 0}`} tone="info" />
              <Badge label={`${t('syllabus_completed')}: ${data.statusBreakdown?.COMPLETED ?? 0}`} tone="success" />
            </View>

            <Spacer size={theme.spacing.lg} />
            <SectionTitle title={t('syllabus_plans')} />
            <View style={styles.breakdownRow}>
              <Badge label={`${t('syllabus_draft')}: ${data.planStatusBreakdown?.DRAFT ?? 0}`} tone="neutral" />
              <Badge label={`${t('syllabus_active')}: ${data.planStatusBreakdown?.ACTIVE ?? 0}`} tone="info" />
              <Badge label={`${t('syllabus_completed')}: ${data.planStatusBreakdown?.COMPLETED ?? 0}`} tone="success" />
              <Badge label={`${t('syllabus_archived')}: ${data.planStatusBreakdown?.ARCHIVED ?? 0}`} tone="warning" />
            </View>
          </>
        )}

        <Spacer size={theme.spacing.lg} />
        <SectionTitle title={t('syllabus_title')} />
        <View style={styles.navList}>
          {navItems.map((item, i) => (
            <MoreMenuItem
              key={item.route}
              title={item.label}
              icon={item.icon}
              accentColor={moreMenuAccentForIndex(i)}
              onPress={() => navigation.navigate(item.route as any)}
            />
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}
