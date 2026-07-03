/** Admin dashboard — KPIs, charts, upcoming events. */
import React from 'react';
import {View, ScrollView} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme} from '../../../core/theme';
import {
  Screen,
  AppText,
  CustomHeader,
  CustomCard,
  StatGrid,
  SectionTitle,
  BarChart,
  LineChart,
  Loader,
  ListRow,
  Icon,
  Row,
  Spacer,
} from '../../../shared/components';
import {formatCurrency, formatDate, formatCompact} from '../../../core/utils/format';
import {useAuthStore} from '../../auth/authStore';
import {useAdminDashboard} from '../dashboard.service';
import type {AdminStackParamList} from '../../../navigation/types';
import type {StatCard} from '../../../shared/types';

type Nav = NativeStackNavigationProp<AdminStackParamList>;

export function AdminDashboardScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const navigation = useNavigation<Nav>();
  const user = useAuthStore(s => s.user);
  const {data, isLoading} = useAdminDashboard();

  if (isLoading || !data) {
    return <Loader message="Loading dashboard…" />;
  }

  const stats: StatCard[] = [
    {key: 'students', label: 'Students', value: data.totalStudents, icon: 'students', accent: 'primary', delta: 4},
    {key: 'teachers', label: 'Teachers', value: data.totalTeachers, icon: 'teacher', accent: 'info'},
    {key: 'staff', label: 'Staff', value: data.totalStaff, icon: 'staff', accent: 'success'},
    {key: 'classes', label: 'Classes', value: data.totalClasses, icon: 'class', accent: 'warning'},
  ];

  return (
    <Screen padded={false}>
      <CustomHeader
        title={`Hello, ${user?.name?.split(' ')[0] ?? 'Admin'}`}
        subtitle={user?.schoolName}
        actions={[{icon: 'notification', onPress: () => navigation.navigate('Notifications'), badgeCount: 3}]}
      />
      <ScrollView
        contentContainerStyle={{padding: theme.spacing.lg}}
        showsVerticalScrollIndicator={false}>
        <StatGrid stats={stats} />

        <SectionTitle title="Today's Attendance" />
        <CustomCard>
          <Row justify="space-between">
            <View>
              <AppText variant="display" color="primary">
                {data.todayAttendancePercentage}%
              </AppText>
              <AppText variant="caption" color="textSecondary">
                Present today across school
              </AppText>
            </View>
            <Icon name="attendance" size={40} />
          </Row>
          <Spacer size={12} />
          <BarChart series={data.attendanceTrend} height={130} valueFormatter={v => `${v}%`} />
        </CustomCard>

        <SectionTitle title="Fee Collection" actionLabel="Details" onAction={() => navigation.navigate('Reports')} />
        <CustomCard>
          <Row justify="space-between">
            <View>
              <AppText variant="caption" color="textSecondary">Collected</AppText>
              <AppText variant="h2" color="success">{formatCurrency(data.feeCollected)}</AppText>
            </View>
            <View>
              <AppText variant="caption" color="textSecondary">Pending</AppText>
              <AppText variant="h2" color="error">{formatCurrency(data.feePending)}</AppText>
            </View>
          </Row>
          <Spacer size={12} />
          <LineChart series={data.feeCollectionTrend} color={theme.colors.success} />
          <AppText variant="label" color="textMuted" center>
            Monthly collection (₹ thousands) · latest {formatCompact(data.feeCollected)}
          </AppText>
        </CustomCard>

        <SectionTitle title="Upcoming Events" actionLabel="See all" onAction={() => navigation.navigate('Events')} />
        <CustomCard padded={false} style={{paddingHorizontal: theme.spacing.lg}}>
          {data.upcomingEvents.map(ev => (
            <ListRow
              key={ev.id}
              icon="event"
              title={ev.title}
              subtitle={`${formatDate(ev.date)} · ${ev.type}`}
            />
          ))}
        </CustomCard>
        <Spacer size={24} />
      </ScrollView>
    </Screen>
  );
}
