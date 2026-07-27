/** Teacher dashboard — daily KPIs, quick actions, class-teacher attendance status, schedule, announcements + class performance. */
import React from 'react';
import {Pressable, View, ScrollView, RefreshControl} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme, useThemedStyles} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {
  Screen,
  AppText,
  DashboardGreetingHeader,
  CustomCard,
  CustomButton,
  StatGrid,
  SectionTitle,
  BarChart,
  Loader,
  ListRow,
  Badge,
  Row,
  Spacer,
  Divider,
  DashboardProfileCard,
} from '../../../shared/components';
import {formatDate} from '../../../core/utils/format';
import {capitalize} from '../../../shared/helpers';
import {useAuthStore} from '../../auth/authStore';
import {useTeacherDashboard} from '../dashboard.service';
import {useTeacherDashboardStats} from '../teacherDashboard.service';
import {useTodaySchedule} from '../../timetable/teacherSchedule.service';
import {useAnnouncementsFeed} from '../../communication/announcements.service';
import {useEventsFeed} from '../../events/events.service';
import type {TeacherStackParamList} from '../../../navigation/types';
import {ScreenNames} from '../../../navigation/ScreenNames';
import type {StatCard} from '../../../shared/types';

const MAX_UPCOMING_EVENTS = 3;

type Nav = NativeStackNavigationProp<TeacherStackParamList>;

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function TeacherDashboardScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const navigation = useNavigation<Nav>();
  const user = useAuthStore(s => s.user);
  const {data, isLoading} = useTeacherDashboard();
  const {
    data: dashboardStats,
    isLoading: statsLoading,
    isRefetching: statsRefetching,
    refetch: refetchStats,
  } = useTeacherDashboardStats();
  const {data: todaySchedule, isLoading: isScheduleLoading, isRefetching, refetch} = useTodaySchedule();
  const {
    data: announcementsPage,
    isLoading: announcementsLoading,
    refetch: refetchAnnouncements,
  } = useAnnouncementsFeed('teacher', {page: 1, pageSize: 3, from: todayIso()});
  const {
    data: eventsPage,
    isLoading: eventsLoading,
    refetch: refetchEvents,
  } = useEventsFeed('teacher', {page: 1, pageSize: 10, from: todayIso()});
  const {t} = useLanguage();
  const styles = useThemedStyles(t2 => ({
    scrollContent: {
      padding: t2.spacing.lg,
    },
  }));

  if (
    isLoading ||
    !data ||
    statsLoading ||
    !dashboardStats ||
    announcementsLoading ||
    !announcementsPage ||
    eventsLoading ||
    !eventsPage
  ) {
    return <Loader message={t('teacherDashboard_loadingDashboard')} />;
  }

  const upcomingEvents = [...eventsPage.items]
    .sort((a, b) => a.startDate.localeCompare(b.startDate))
    .slice(0, MAX_UPCOMING_EVENTS);

  const stats: StatCard[] = [
    {
      key: 'classes',
      label: t('teacherDashboard_todaysClasses'),
      value: dashboardStats.todayClassesCount,
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
      <DashboardGreetingHeader
        name={user?.name?.split(' ')[0] ?? 'Teacher'}
        schoolName={user?.schoolName}
        actions={[
          {icon: 'announcement', onPress: () => navigation.navigate(ScreenNames.Announcements)},
          {icon: 'notification', onPress: () => navigation.navigate(ScreenNames.Notifications), badgeCount: 2},
        ]}
      />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching || statsRefetching}
            onRefresh={() => {
              refetch();
              refetchStats();
              refetchAnnouncements();
              refetchEvents();
            }}
          />
        }>
        <DashboardProfileCard
          name={user?.name ?? 'Teacher'}
          avatarUri={user?.avatarUrl}
          schoolName={user?.schoolName}
          roleLabel={capitalize(user?.role ?? 'teacher')}
          email={user?.email}
        />

        <StatGrid stats={stats} />

        {dashboardStats.attendance.length > 0 ? (
          <>
            <SectionTitle title={t('teacherDashboard_classAttendanceStatus')} />
            <CustomCard padded={false} style={{paddingHorizontal: theme.spacing.lg}}>
              {dashboardStats.attendance.map((section, i) => (
                <React.Fragment key={section.sectionId}>
                  {i > 0 ? <Divider /> : null}
                  <Pressable
                    onPress={
                      section.isMarked
                        ? undefined
                        : () =>
                            navigation.navigate(ScreenNames.MarkAttendance, {
                              classId: section.classId,
                              className: section.className,
                              sectionId: section.sectionId,
                              sectionName: section.sectionName,
                            })
                    }>
                    <Row justify="space-between" align="center" style={{paddingVertical: theme.spacing.sm}}>
                      <View style={{flex: 1}}>
                        <AppText variant="bodyBold">
                          {section.className} - {section.sectionName}
                        </AppText>
                        {!section.isMarked ? (
                          <AppText variant="caption" color="textSecondary">
                            {t('teacherDashboard_markedCount', {marked: section.markedCount, total: section.totalStudents})}
                          </AppText>
                        ) : null}
                      </View>
                      <Badge
                        label={section.isMarked ? t('teacherDashboard_attendanceMarked') : t('teacherDashboard_attendancePending')}
                        tone={section.isMarked ? 'success' : 'warning'}
                      />
                    </Row>
                  </Pressable>
                </React.Fragment>
              ))}
            </CustomCard>
          </>
        ) : null}

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

        <SectionTitle
          title={t('teacherDashboard_upcomingEvents')}
          actionLabel={t('common_seeAll')}
          onAction={() => navigation.navigate(ScreenNames.Events)}
        />
        <CustomCard padded={false} style={{paddingHorizontal: theme.spacing.lg}}>
          {upcomingEvents.length === 0 ? (
            <AppText variant="caption" color="textMuted" style={{paddingVertical: theme.spacing.md}}>
              {t('teacherDashboard_noUpcomingEvents')}
            </AppText>
          ) : (
            upcomingEvents.map((ev, i) => (
              <React.Fragment key={ev.id}>
                {i > 0 ? <Divider /> : null}
                <ListRow icon="event" title={ev.title} subtitle={`${formatDate(ev.startDate)} · ${ev.eventType}`} />
              </React.Fragment>
            ))
          )}
        </CustomCard>

        <SectionTitle
          title={t('teacherDashboard_announcements')}
          actionLabel={t('common_seeAll')}
          onAction={() => navigation.navigate(ScreenNames.Announcements)}
        />
        <CustomCard padded={false} style={{paddingHorizontal: theme.spacing.lg}}>
          {announcementsPage.items.length === 0 ? (
            <AppText variant="caption" color="textMuted" style={{paddingVertical: theme.spacing.md}}>
              {t('teacherDashboard_noAnnouncements')}
            </AppText>
          ) : (
            announcementsPage.items.map((item, i) => (
              <React.Fragment key={item.id}>
                {i > 0 ? <Divider /> : null}
                <ListRow icon="announcement" title={item.title} subtitle={item.message} />
              </React.Fragment>
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
