/** Teacher dashboard — daily KPIs, quick actions, schedule + class performance. */
import React from 'react';
import {View, ScrollView, RefreshControl} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useThemedStyles} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {
  Screen,
  AppText,
  CustomHeader,
  CustomCard,
  CustomButton,
  StatGrid,
  SectionTitle,
  BarChart,
  Loader,
  Spacer,
  Divider,
} from '../../../shared/components';
import {useAuthStore} from '../../auth/authStore';
import {useTeacherDashboard} from '../dashboard.service';
import {useTodaySchedule} from '../../timetable/teacherSchedule.service';
import type {TeacherStackParamList} from '../../../navigation/types';
import {ScreenNames} from '../../../navigation/ScreenNames';
import type {StatCard} from '../../../shared/types';

type Nav = NativeStackNavigationProp<TeacherStackParamList>;

export function TeacherDashboardScreen(): React.JSX.Element {
  const navigation = useNavigation<Nav>();
  const user = useAuthStore(s => s.user);
  const {data, isLoading} = useTeacherDashboard();
  const {data: todaySchedule, isLoading: isScheduleLoading, isRefetching, refetch} = useTodaySchedule();
  const {t} = useLanguage();
  const styles = useThemedStyles(t2 => ({
    scrollContent: {
      padding: t2.spacing.lg,
    },
  }));

  if (isLoading || !data) {
    return <Loader message={t('teacherDashboard_loadingDashboard')} />;
  }

  const stats: StatCard[] = [
    {
      key: 'classes',
      label: t('teacherDashboard_todaysClasses'),
      value: todaySchedule?.periods.length ?? 0,
      icon: 'class',
      accent: 'primary',
    },
    {key: 'homework', label: t('teacherDashboard_pendingHomework'), value: data.pendingHomework, icon: 'homework', accent: 'warning'},
    {key: 'exams', label: t('teacherDashboard_upcomingExams'), value: data.upcomingExams, icon: 'exam', accent: 'info'},
    {
      key: 'attendance',
      label: t('teacherDashboard_attendance'),
      value: data.attendanceMarkedToday ? t('teacherDashboard_marked') : t('teacherDashboard_pending'),
      icon: 'attendance',
      accent: data.attendanceMarkedToday ? 'success' : 'error',
    },
  ];

  return (
    <Screen padded={false}>
      <CustomHeader
        title={t('teacherDashboard_greeting', {name: user?.name?.split(' ')[0] ?? 'Teacher'})}
        subtitle={user?.schoolName}
        actions={[
          {icon: 'announcement', onPress: () => navigation.navigate(ScreenNames.Announcements)},
          {icon: 'notification', onPress: () => navigation.navigate(ScreenNames.Notifications), badgeCount: 2},
        ]}
      />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}>
        <StatGrid stats={stats} />

        <SectionTitle title={t('teacherDashboard_quickActions')} />
        <CustomButton
          title={t('teacherDashboard_createHomework')}
          iconLeft="homework"
          onPress={() => navigation.navigate(ScreenNames.HomeworkForm, {})}
        />

        <SectionTitle title={t('teacherDashboard_todaysSchedule')} />
        <CustomCard>
          {isScheduleLoading || !todaySchedule ? (
            <Loader message={t('mySchedule_loading')} />
          ) : todaySchedule.periods.length === 0 ? (
            <AppText variant="caption" color="textSecondary">
              {t('teacherDashboard_noClassesToday')}
            </AppText>
          ) : (
            todaySchedule.periods.map((period, i) => (
              <View key={period.id}>
                {i > 0 ? <Divider /> : null}
                <AppText variant="bodyBold">
                  {t('teacherDashboard_periodTime', {
                    periodNo: String(period.periodNo),
                    time: `${period.startTime} - ${period.endTime}`,
                  })}
                </AppText>
                <AppText variant="caption" color="textSecondary">
                  {`${period.subjectName} — ${period.className} - ${period.sectionName}`}
                </AppText>
              </View>
            ))
          )}
        </CustomCard>

        <SectionTitle title={t('teacherDashboard_classPerformance')} />
        <CustomCard>
          <AppText variant="caption" color="textSecondary">
            {t('teacherDashboard_gradeDistribution')}
          </AppText>
          <Spacer size={12} />
          <BarChart series={data.classPerformance} height={150} />
        </CustomCard>
        <Spacer size={24} />
      </ScrollView>
    </Screen>
  );
}
