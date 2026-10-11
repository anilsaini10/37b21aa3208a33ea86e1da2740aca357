/** Parent dashboard — child overview (real backend), quick links, upcoming events/announcements and trend charts. */
import React, {useState} from 'react';
import {Pressable, View, ScrollView, RefreshControl} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import {useTheme, useThemedStyles} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {
  Screen,
  AppText,
  CustomHeader,
  DashboardGreetingHeader,
  CustomCard,
  CustomButton,
  StatGrid,
  SectionTitle,
  BarChart,
  LineChart,
  Loader,
  ListRow,
  Badge,
  Avatar,
  Icon,
  Row,
  Spacer,
  Divider,
  EmptyState,
  DashboardProfileCard,
} from '../../../shared/components';
import {formatCurrency, formatDate} from '../../../core/utils/format';
import {attendancePercentageTone} from '../../../shared/helpers';
import {useAuthStore} from '../../auth/authStore';
import {useParentDashboard} from '../dashboard.service';
import {useParentDashboardStats} from '../parentDashboardStats.service';
import {useParentProfile} from '../../parent/parentStudents.service';
import {useEventsFeed} from '../../events/events.service';
import {useAnnouncementsFeed} from '../../communication/announcements.service';
import {useUnreadNotificationsCount} from '../../communication/notifications.service';
import type {ParentStackParamList, ParentTabParamList} from '../../../navigation/types';
import {ScreenNames} from '../../../navigation/ScreenNames';
import type {StatCard, ParentChild, AttendanceStatusCode} from '../../../shared/types';

const MAX_UPCOMING_EVENTS = 3;

type Nav = NativeStackNavigationProp<ParentStackParamList>;
type TabNav = BottomTabNavigationProp<ParentTabParamList>;

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function ParentDashboardScreen(): React.JSX.Element {
  const {t} = useLanguage();
  const {data: profile, isLoading, isError, error, refetch} = useParentProfile();
  const [activeChildId, setActiveChildId] = useState<string | null>(null);

  if (isLoading || !profile) {
    if (isError) {
      return (
        <Screen padded={false}>
          <CustomHeader title={t('parentDashboard_title')} />
          <EmptyState
            icon="warning"
            title={t('common_somethingWentWrong')}
            message={(error as {message?: string} | null)?.message ?? t('common_checkConnection')}
            actionLabel={t('common_retry')}
            onAction={() => refetch()}
          />
        </Screen>
      );
    }
    return <Loader message={t('parentDashboard_loadingDashboard')} />;
  }

  const {children} = profile;

  if (children.length === 0) {
    return (
      <Screen padded={false}>
        <CustomHeader title={t('parentDashboard_title')} />
        <EmptyState
          icon="student"
          title={t('childProfile_noChildrenTitle')}
          message={t('childProfile_noChildrenMessage')}
        />
      </Screen>
    );
  }

  if (children.length === 1) {
    return <ParentDashboardContent child={children[0]} />;
  }

  const activeChild = children.find(c => c.id === activeChildId);
  if (!activeChild) {
    return <ChildrenList children={children} onSelect={setActiveChildId} />;
  }
  return <ParentDashboardContent child={activeChild} onSwitchChild={() => setActiveChildId(null)} />;
}

function ChildrenList({
  children,
  onSelect,
}: {
  children: ParentChild[];
  onSelect: (id: string) => void;
}): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const styles = useThemedStyles(t2 => ({
    scrollContent: {padding: t2.spacing.lg},
    card: {paddingHorizontal: t2.spacing.lg},
  }));

  return (
    <Screen padded={false}>
      <CustomHeader title={t('parentDashboard_title')} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <AppText variant="caption" color="textSecondary">
          {t('parentAttendance_selectChild')}
        </AppText>
        <Spacer size={theme.spacing.sm} />
        <CustomCard padded={false} style={styles.card}>
          {children.map((child, i) => (
            <View key={child.id}>
              {i > 0 ? <Divider /> : null}
              <ListRow
                avatarName={child.name}
                title={child.name}
                subtitle={t('mySchedule_classSection', {className: child.className, sectionName: child.sectionName})}
                onPress={() => onSelect(child.id)}
                right={
                  <Badge
                    label={`${child.attendancePercentage}%`}
                    tone={attendancePercentageTone(child.attendancePercentage)}
                  />
                }
              />
            </View>
          ))}
        </CustomCard>
      </ScrollView>
    </Screen>
  );
}

function ParentDashboardContent({
  child,
  onSwitchChild,
}: {
  child: ParentChild;
  onSwitchChild?: () => void;
}): React.JSX.Element {
  const {theme} = useTheme();
  const navigation = useNavigation<Nav>();
  const tabNavigation = useNavigation<TabNav>();
  const user = useAuthStore(s => s.user);
  const {t} = useLanguage();

  const {
    data: stats,
    isLoading: statsLoading,
    isError: statsIsError,
    error: statsError,
    isRefetching: statsRefetching,
    refetch: refetchStats,
  } = useParentDashboardStats(child.id);
  const {data: mockData, isLoading: mockLoading} = useParentDashboard();
  
  const {
    data: eventsPage,
    isLoading: eventsLoading,
    isRefetching: eventsRefetching,
    refetch: refetchEvents,
  } = useEventsFeed('parent', {page: 1, pageSize: 10, from: todayIso()});
  const {
    data: announcementsPage,
    isLoading: announcementsLoading,
    refetch: refetchAnnouncements,
  } = useAnnouncementsFeed('parent', {page: 1, pageSize: 3, from: todayIso()});
  const {data: unreadCount} = useUnreadNotificationsCount();

  const styles = useThemedStyles(t2 => ({
    scrollContent: {
      padding: t2.spacing.lg,
    },
    flexOne: {
      flex: 1,
    },
  }));

  const STATUS_LABEL: Record<AttendanceStatusCode, string> = {
    PRESENT: t('markAttendance_presentLabel'),
    ABSENT: t('markAttendance_absentLabel'),
    LATE: t('markAttendance_lateLabel'),
    LEAVE: t('attendanceReport_leave'),
    HOLIDAY: t('attendance_holiday'),
  };
  const STATUS_ACCENT: Record<AttendanceStatusCode, StatCard['accent']> = {
    PRESENT: 'success',
    ABSENT: 'error',
    LATE: 'warning',
    LEAVE: 'info',
    HOLIDAY: 'info',
  };

  if (statsLoading || !stats || mockLoading || !mockData || eventsLoading || !eventsPage || announcementsLoading || !announcementsPage) {
    if (statsIsError) {
      return (
        <Screen padded={false}>
          <CustomHeader title={t('parentDashboard_title')} onBack={onSwitchChild} />
          <EmptyState
            icon="warning"
            title={t('common_somethingWentWrong')}
            message={(statsError as {message?: string} | null)?.message ?? t('common_checkConnection')}
            actionLabel={t('common_retry')}
            onAction={() => refetchStats()}
          />
        </Screen>
      );
    }
    return <Loader message={t('parentDashboard_loadingDashboard')} />;
  }

  const upcomingEvents = [...eventsPage.items]
    .sort((a, b) => a.startDate.localeCompare(b.startDate))
    .slice(0, MAX_UPCOMING_EVENTS);

  const attendanceStatus = stats.todayAttendance.status;

  const stat_cards: StatCard[] = [
    {
      key: 'attendance',
      label: t('parentDashboard_todayAttendance'),
      value: attendanceStatus ? STATUS_LABEL[attendanceStatus] : t('parentDashboard_notMarkedYet'),
      icon: 'attendance',
      accent: attendanceStatus ? STATUS_ACCENT[attendanceStatus] : 'warning',
    },
    // {key: 'fees', label: t('parentDashboard_pendingFees'), value: formatCurrency(mockData.pendingFees), icon: 'fee', accent: 'error'},
    {
      key: 'exams',
      label: t('parentDashboard_upcomingExams'),
      value: stats.upcomingExamsCount,
      icon: 'exam',
      accent: 'info',
      onPress: () => navigation.navigate(ScreenNames.Results),
    },
    {
      key: 'homework',
      label: t('parentDashboard_ActiveHomework'),
      value: stats.activeHomeworkCount,
      icon: 'homework',
      accent: 'warning',
      onPress: () => tabNavigation.navigate(ScreenNames.Homework),
    },
  ];

  return (
    <Screen padded={false}>
      <DashboardGreetingHeader
        name={stats.parentName.split(' ')[0] ?? 'Parent'}
        schoolName={stats.schoolName}
        actions={[
          {icon: 'announcement', onPress: () => navigation.navigate(ScreenNames.Announcements)},
          {icon: 'notification', onPress: () => navigation.navigate(ScreenNames.Notifications), badgeCount: unreadCount},
        ]}
      />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={eventsRefetching || statsRefetching}
            onRefresh={() => {
              refetchStats();
              refetchEvents();
              refetchAnnouncements();
            }}
          />
        }>
        <DashboardProfileCard
          name={user?.name ?? 'Parent'}
          avatarUri={user?.avatarUrl}
          schoolName={user?.schoolName}
          roleLabel={t('parentProfile_parent')}
          email={user?.email}
        />
        <Spacer size={theme.spacing.md} />

        <CustomCard>
          <Row gap={theme.spacing.md}>
            <Avatar name={stats.studentName} size={52} />
            <View style={styles.flexOne}>
              <AppText variant="h3">{stats.studentName}</AppText>
              <AppText variant="caption" color="textSecondary">
                {t('mySchedule_classSection', {className: stats.className, sectionName: stats.sectionName})}
              </AppText>
              <AppText variant="caption" color="textMuted">
                {t('parentDashboard_classTeacher')}: {stats.classTeacherName ?? t('common_notAssigned')}
              </AppText>
            </View>
          </Row>
          {onSwitchChild ? (
            <>
              <Divider />
              <Pressable onPress={onSwitchChild}>
                <Row gap={theme.spacing.xs} align="center">
                  <Icon name="forward" size={16} color={theme.colors.primary} />
                  <AppText variant="label" color="primary">
                    {t('parentDashboard_switchChild')}
                  </AppText>
                </Row>
              </Pressable>
            </>
          ) : null}
        </CustomCard>

        <Spacer size={theme.spacing.md} />
        <StatGrid stats={stat_cards} />

        <SectionTitle title={t('parentDashboard_quickLinks')} />
        <Row gap={theme.spacing.md}>
          <View style={styles.flexOne}>
            <CustomButton title={t('parentDashboard_results')} variant="outline" onPress={() => navigation.navigate(ScreenNames.Results)} />
          </View>
          <View style={styles.flexOne}>
            <CustomButton title={t('parentDashboard_timetable')} variant="outline" onPress={() => navigation.navigate(ScreenNames.ChildTimetable)} />
          </View>
        </Row>

        <SectionTitle
          title={t('parentDashboard_upcomingEvents')}
          actionLabel={t('common_seeAll')}
          onAction={() => navigation.navigate(ScreenNames.Events)}
        />
        <CustomCard padded={false} style={{paddingHorizontal: theme.spacing.lg}}>
          {upcomingEvents.length === 0 ? (
            <AppText variant="caption" color="textMuted" style={{paddingVertical: theme.spacing.md}}>
              {t('parentDashboard_noUpcomingEvents')}
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
          title={t('parentDashboard_announcements')}
          actionLabel={t('common_seeAll')}
          onAction={() => navigation.navigate(ScreenNames.Announcements)}
        />
        <CustomCard padded={false} style={{paddingHorizontal: theme.spacing.lg}}>
          {announcementsPage.items.length === 0 ? (
            <AppText variant="caption" color="textMuted" style={{paddingVertical: theme.spacing.md}}>
              {t('parentDashboard_noAnnouncements')}
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

        {/* <SectionTitle title={t('parentDashboard_attendanceTrend')} />
        <CustomCard>
          <LineChart series={mockData.attendanceTrend} color={theme.colors.success} />
        </CustomCard> */}

        {/* <SectionTitle title={t('parentDashboard_performance')} />
        <CustomCard>
          <BarChart series={mockData.performanceTrend} height={140} valueFormatter={v => `${v}%`} />
        </CustomCard> */}
        <Spacer size={24} />
      </ScrollView>
    </Screen>
  );
}
