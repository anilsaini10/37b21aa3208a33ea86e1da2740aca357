/** Admin dashboard — KPIs, charts, upcoming events. */
import React from 'react';
import {View, ScrollView, RefreshControl} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {
  Screen,
  AppText,
  CustomHeader,
  CustomCard,
  CustomButton,
  StatGrid,
  SectionTitle,
  Loader,
  ListRow,
  Avatar,
  Icon,
  Divider,
  Row,
  Spacer,
} from '../../../shared/components';
import type {TranslationKey} from '../../../core/i18n';
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

const DAY_KEYS: TranslationKey[] = [
  'common_daySun', 'common_dayMon', 'common_dayTue', 'common_dayWed',
  'common_dayThu', 'common_dayFri', 'common_daySat',
];
const MONTH_KEYS: TranslationKey[] = [
  'common_monthJan', 'common_monthFeb', 'common_monthMar', 'common_monthApr',
  'common_monthMay', 'common_monthJun', 'common_monthJul', 'common_monthAug',
  'common_monthSep', 'common_monthOct', 'common_monthNov', 'common_monthDec',
];

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

/** Time-of-day greeting — before noon/before evening/otherwise. */
function greetingKey(hour: number): TranslationKey {
  if (hour < 12) {
    return 'adminDashboard_goodMorning';
  }
  if (hour < 17) {
    return 'adminDashboard_goodAfternoon';
  }
  return 'adminDashboard_goodEvening';
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

  const now = new Date();
  const todayLabel = `${t(DAY_KEYS[now.getDay()])}, ${now.getDate()} ${t(MONTH_KEYS[now.getMonth()])} ${now.getFullYear()}`;

  const stats: StatCard[] = [
    {key: 'students', label: t('adminDashboard_students'), value: statsData.studentsCount ?? 0, icon: 'students', accent: 'primary'},
    {key: 'teachers', label: t('adminDashboard_teachers'), value: statsData.teachersCount ?? 0, icon: 'teacher', accent: 'info'},
    {key: 'staff', label: t('adminDashboard_staff'), value: statsData.staffCount ?? 0, icon: 'staff', accent: 'success'},
    {key: 'classes', label: t('adminDashboard_classes'), value: statsData.classesCount ?? 0, icon: 'class', accent: 'warning'},
  ];

  return (
    <Screen padded={false}>
      <CustomHeader
        title={t(greetingKey(now.getHours()), {name: user?.name?.split(' ')[0] ?? 'Admin'})}
        subtitle={t('adminDashboard_subtitle', {schoolName: user?.schoolName ?? ''})}
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
        <LinearGradient
          colors={[theme.colors.primary + '08', theme.colors.primary + '24']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={{
            marginBottom: theme.spacing.md,
            borderRadius: theme.components.card.radius,
            borderWidth: 1,
            borderColor: theme.colors.primary + '2A',
            padding: theme.components.card.padding,
          }}>
          <Row gap={theme.spacing.md} align="flex-start">
            <Avatar name={user?.name ?? 'Admin'} uri={user?.avatarUrl} size={56} />
            <View style={{flex: 1}}>
              <Row justify="space-between" align="flex-start" gap={theme.spacing.sm}>
                <View style={{flex: 1}}>
                  <AppText variant="h3" numberOfLines={1}>
                    {user?.name ?? 'Admin'}
                  </AppText>
                  <Spacer size={2} />
                  <Row gap={4} align="center">
                    <Icon name="home" size={13} color={theme.colors.textMuted} />
                    <AppText variant="caption" color="textSecondary" numberOfLines={1} style={{flex: 1}}>
                      {user?.schoolName}
                    </AppText>
                  </Row>
                </View>
                <View
                  style={{
                    backgroundColor: theme.colors.primary,
                    paddingHorizontal: theme.spacing.sm,
                    paddingVertical: 3,
                    borderRadius: theme.radius.pill,
                  }}>
                  <AppText variant="label" color="onPrimary" style={{fontWeight: '700'}}>
                    {capitalize(user?.role ?? 'admin')}
                  </AppText>
                </View>
              </Row>
            </View>
          </Row>
          <Divider />
          <Row justify="space-between" align="center">
            <Row gap={4} align="center">
              <Icon name="calendar" size={14} color={theme.colors.textMuted} />
              <AppText variant="caption" color="textSecondary">
                {todayLabel}
              </AppText>
            </Row>
            {user?.email ? (
              <Row gap={4} align="center" style={{flexShrink: 1, marginLeft: theme.spacing.sm}}>
                <Icon name="email" size={14} color={theme.colors.textMuted} />
                <AppText variant="caption" color="textMuted" numberOfLines={1} style={{flexShrink: 1}}>
                  {user.email}
                </AppText>
              </Row>
            ) : null}
          </Row>
        </LinearGradient>

        <StatGrid stats={stats} />

        {/* <SectionTitle title={t('adminDashboard_todaysAttendance')} />
        <CustomCard>
          <Row justify="space-between">
            <View>
              <AppText variant="display" color="primary">
                {data.todayAttendancePercentage}%
              </AppText>
              <AppText variant="caption" color="textSecondary">
                {t('adminDashboard_presentTodayAcrossSchool')}
              </AppText>
            </View>
            <Icon name="attendance" size={40} />
          </Row>
          <Spacer size={12} />
          <BarChart series={data.attendanceTrend} height={130} valueFormatter={v => `${v}%`} />
        </CustomCard> */}

        {!isTodayMarked ? (
          <CustomCard
          style={{marginTop:12}}
          >
            <Row justify="space-between" align="center">
              <View style={{flex: 1}}>
                <AppText variant="bodyBold">{t('staffAttendance_dashboardReminderTitle')}</AppText>
                <AppText variant="caption" color="textSecondary">
                  {t('staffAttendance_dashboardReminderMessage')}
                </AppText>
              </View>
              <CustomButton
                title={t('staffAttendance_markNowButton')}
                size="sm"
                fullWidth={false}
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
