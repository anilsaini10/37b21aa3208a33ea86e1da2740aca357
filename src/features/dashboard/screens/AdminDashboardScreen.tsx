/** Admin dashboard — KPIs, charts, upcoming events. */
import React from 'react';
import {View, ScrollView, RefreshControl} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {
  Screen,
  AppText,
  DashboardGreetingHeader,
  CustomCard,
  CustomButton,
  StatGrid,
  SectionTitle,
  Loader,
  ListRow,
  Icon,
  Divider,
  DashboardProfileCard,
  Row,
  Spacer,
} from '../../../shared/components';
import {formatDate} from '../../../core/utils/format';
import {capitalize} from '../../../shared/helpers';
import {useAuthStore} from '../../auth/authStore';
import {useAdminDashboard} from '../dashboard.service';
import {useAdminDashboardStats} from '../adminDashboard.service';
import {useAdminEvents} from '../../events/events.service';
import {useAdminAnnouncements} from '../../communication/announcements.service';
import {useIsTodayStaffAttendanceMarked} from '../../attendance/adminTeacherAttendance.service';
import type {AdminStackParamList} from '../../../navigation/types';
import {ScreenNames} from '../../../navigation/ScreenNames';
import type {AdminAnnouncement, StatCard} from '../../../shared/types';

const MAX_UPCOMING_EVENTS = 3;
const MAX_UPCOMING_ANNOUNCEMENTS = 3;

/** Undated (general) announcements always count as relevant; dated ones only count once their day arrives, soonest first. */
function compareUpcomingAnnouncements(a: AdminAnnouncement, b: AdminAnnouncement): number {
  if (!a.eventDate && !b.eventDate) {
    return 0;
  }
  if (!a.eventDate) {
    return 1;
  }
  if (!b.eventDate) {
    return -1;
  }
  return a.eventDate.localeCompare(b.eventDate);
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

type Nav = NativeStackNavigationProp<AdminStackParamList>;

export function AdminDashboardScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const navigation = useNavigation<Nav>();
  const user = useAuthStore(s => s.user);
  const {data, isLoading} = useAdminDashboard();
  const {data: statsData, isLoading: statsLoading, isRefetching: statsRefetching, refetch: refetchStats} = useAdminDashboardStats();
  const {data: eventsPage, isLoading: eventsLoading, refetch: refetchEvents} = useAdminEvents({page: 1, pageSize: 20});
  const {
    data: announcementsPage,
    isLoading: announcementsLoading,
    refetch: refetchAnnouncements,
  } = useAdminAnnouncements({page: 1, pageSize: 20});
  const {isMarked: isTodayMarked} = useIsTodayStaffAttendanceMarked();
  const {t} = useLanguage();

  if (
    isLoading ||
    !data ||
    statsLoading ||
    !statsData ||
    eventsLoading ||
    !eventsPage ||
    announcementsLoading ||
    !announcementsPage
  ) {
    return <Loader message={t('adminDashboard_loadingDashboard')} />;
  }

  const today = todayIso();
  const upcomingEvents = eventsPage.items
    .filter(ev => ev.startDate >= today)
    .sort((a, b) => a.startDate.localeCompare(b.startDate))
    .slice(0, MAX_UPCOMING_EVENTS);
  const upcomingAnnouncements = announcementsPage.items
    .filter(a => !a.eventDate || a.eventDate >= today)
    .sort(compareUpcomingAnnouncements)
    .slice(0, MAX_UPCOMING_ANNOUNCEMENTS);

  const stats: StatCard[] = [
    {key: 'students', label: t('adminDashboard_students'), value: statsData.studentsCount ?? 0, icon: 'students', accent: 'primary'},
    {key: 'teachers', label: t('adminDashboard_teachers'), value: statsData.teachersCount ?? 0, icon: 'teacher', accent: 'info'},
    {key: 'staff', label: t('adminDashboard_staff'), value: statsData.staffCount ?? 0, icon: 'staff', accent: 'success'},
    {key: 'classes', label: t('adminDashboard_classes'), value: statsData.classesCount ?? 0, icon: 'class', accent: 'warning'},
  ];

  return (
    <Screen padded={false}>
      <DashboardGreetingHeader
        name={user?.name?.split(' ')[0] ?? 'Admin'}
        schoolName={user?.schoolName}
        actions={[
          {icon: 'announcement', onPress: () => navigation.navigate(ScreenNames.Announcements)},
          {icon: 'notification', onPress: () => navigation.navigate(ScreenNames.Notifications), badgeCount: 3},
        ]}
      />
      <ScrollView
        contentContainerStyle={{padding: theme.spacing.lg}}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={statsRefetching}
            onRefresh={() => {
              refetchStats();
              refetchEvents();
              refetchAnnouncements();
            }}
          />
        }>
        <DashboardProfileCard
          name={user?.name ?? 'Admin'}
          avatarUri={user?.avatarUrl}
          schoolName={user?.schoolName}
          roleLabel={capitalize(user?.role ?? 'admin')}
          email={user?.email}
        />

        <StatGrid stats={stats} />

        {!isTodayMarked ? (
          <CustomCard 
          style={{marginTop: theme.spacing.md}}>
            <Row justify="space-between" align="center" gap={theme.spacing.sm}>
              <Row gap={theme.spacing.md} align="center" style={{flex: 1}}>
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: theme.radius.md,
                    backgroundColor: theme.colors.primary + '22',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <Icon name="attendance" size={20} color={theme.colors.primary} />
                </View>
                <View style={{flex: 1}}>
                  <AppText variant="bodyBold">{t('staffAttendance_dashboardReminderTitle')}</AppText>
                  <AppText variant="caption" color="textSecondary">
                    {t('staffAttendance_dashboardReminderMessage')}
                  </AppText>
                </View>
              </Row>
              <CustomButton
                title={t('staffAttendance_markNowButton')}
                size="sm"
                fullWidth={false}
                iconRight="forward"
                onPress={() => navigation.navigate(ScreenNames.MarkStaffAttendance)}
              />
            </Row>
          </CustomCard>
        ) : null}

        {/* <SectionTitle title={t('adminDashboard_feeCollection')} actionLabel={t('common_details')} onAction={() => navigation.navigate(ScreenNames.Reports)} />
        <CustomCard>
          <Row justify="space-between">
            <View>
              <AppText variant="caption" color="textSecondary">{t('adminDashboard_collected')}</AppText>
              <AppText variant="h2" color="success">{formatCurrency(data.feeCollected)}</AppText>
            </View>
            <View>
              <AppText variant="caption" color="textSecondary">{t('adminDashboard_pending')}</AppText>
              <AppText variant="h2" color="error">{formatCurrency(data.feePending)}</AppText>
            </View>
          </Row>
          <Spacer size={12} />
          <LineChart series={data.feeCollectionTrend} color={theme.colors.success} />
          <AppText variant="label" color="textMuted" center>
            {t('adminDashboard_monthlyCollectionLatest', {amount: formatCompact(data.feeCollected)})}
          </AppText>
        </CustomCard> */}

        <SectionTitle title={t('adminDashboard_upcomingEvents')} actionLabel={t('common_seeAll')} onAction={() => navigation.navigate(ScreenNames.Events)} />
        <CustomCard padded={false} style={{paddingHorizontal: theme.spacing.lg}}>
          {upcomingEvents.length === 0 ? (
            <AppText variant="caption" color="textMuted" style={{paddingVertical: theme.spacing.md}}>
              {t('adminDashboard_noUpcomingEvents')}
            </AppText>
          ) : (
            upcomingEvents.map((ev, i) => (
              <React.Fragment key={ev.id}>
                {i > 0 ? <Divider /> : null}
                <ListRow
                  icon="event"
                  title={ev.title}
                  subtitle={`${formatDate(ev.startDate)} · ${ev.eventType}`}
                  onPress={() => navigation.navigate(ScreenNames.EventForm, {id: ev.id, initial: ev})}
                />
              </React.Fragment>
            ))
          )}
        </CustomCard>

        <SectionTitle
          title={t('adminDashboard_announcements')}
          actionLabel={t('common_seeAll')}
          onAction={() => navigation.navigate(ScreenNames.Announcements)}
        />
        <CustomCard padded={false} style={{paddingHorizontal: theme.spacing.lg}}>
          {upcomingAnnouncements.length === 0 ? (
            <AppText variant="caption" color="textMuted" style={{paddingVertical: theme.spacing.md}}>
              {t('adminDashboard_noAnnouncements')}
            </AppText>
          ) : (
            upcomingAnnouncements.map((item, i) => (
              <React.Fragment key={item.id}>
                {i > 0 ? <Divider /> : null}
                <ListRow
                  icon="announcement"
                  title={item.title}
                  subtitle={item.message}
                  onPress={() => navigation.navigate(ScreenNames.AnnouncementForm, {id: item.id, initial: item})}
                />
              </React.Fragment>
            ))
          )}
        </CustomCard>
        <Spacer size={24} />
      </ScrollView>
    </Screen>
  );
}
