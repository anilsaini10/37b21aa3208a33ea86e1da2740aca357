/** Parent dashboard — child overview, KPIs, quick links and trend charts. */
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
  CustomButton,
  StatGrid,
  SectionTitle,
  BarChart,
  LineChart,
  Loader,
  Avatar,
  Row,
  Spacer,
} from '../../../shared/components';
import {formatCurrency} from '../../../core/utils/format';
import {useAuthStore} from '../../auth/authStore';
import {useParentDashboard} from '../dashboard.service';
import type {ParentStackParamList} from '../../../navigation/types';
import type {StatCard} from '../../../shared/types';

type Nav = NativeStackNavigationProp<ParentStackParamList>;

export function ParentDashboardScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const navigation = useNavigation<Nav>();
  const user = useAuthStore(s => s.user);
  const {data, isLoading} = useParentDashboard();

  if (isLoading || !data) {
    return <Loader message="Loading dashboard…" />;
  }

  const stats: StatCard[] = [
    {key: 'attendance', label: 'Attendance', value: `${data.attendancePercentage}%`, icon: 'attendance', accent: 'success'},
    {key: 'fees', label: 'Pending Fees', value: formatCurrency(data.pendingFees), icon: 'fee', accent: 'error'},
    {key: 'exams', label: 'Upcoming Exams', value: data.upcomingExams, icon: 'exam', accent: 'info'},
    {key: 'homework', label: 'Pending HW', value: data.pendingHomework, icon: 'homework', accent: 'warning'},
  ];

  return (
    <Screen padded={false}>
      <CustomHeader
        title={`Hi, ${user?.name?.split(' ')[0] ?? 'Parent'}`}
        actions={[{icon: 'notification', onPress: () => navigation.navigate('Notifications'), badgeCount: 2}]}
      />
      <ScrollView
        contentContainerStyle={{padding: theme.spacing.lg}}
        showsVerticalScrollIndicator={false}>
        <CustomCard>
          <Row gap={theme.spacing.md}>
            <Avatar name={data.childName} size={52} />
            <View style={{flex: 1}}>
              <AppText variant="h3">{data.childName}</AppText>
              <AppText variant="caption" color="textSecondary">
                {data.className}
              </AppText>
            </View>
          </Row>
        </CustomCard>

        <Spacer size={theme.spacing.md} />
        <StatGrid stats={stats} />

        <SectionTitle title="Quick Links" />
        <Row gap={theme.spacing.md}>
          <View style={{flex: 1}}>
            <CustomButton title="Results" variant="outline" onPress={() => navigation.navigate('Results')} />
          </View>
          <View style={{flex: 1}}>
            <CustomButton title="Timetable" variant="outline" onPress={() => navigation.navigate('Timetable')} />
          </View>
        </Row>

        <SectionTitle title="Attendance Trend" />
        <CustomCard>
          <LineChart series={data.attendanceTrend} color={theme.colors.success} />
        </CustomCard>

        <SectionTitle title="Performance" />
        <CustomCard>
          <BarChart series={data.performanceTrend} height={140} valueFormatter={v => `${v}%`} />
        </CustomCard>
        <Spacer size={24} />
      </ScrollView>
    </Screen>
  );
}
