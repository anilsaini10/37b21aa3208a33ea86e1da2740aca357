/** Teacher dashboard — daily KPIs, quick actions, schedule + class performance. */
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
  Loader,
  Row,
  Spacer,
  Divider,
} from '../../../shared/components';
import {useAuthStore} from '../../auth/authStore';
import {useTeacherDashboard} from '../dashboard.service';
import type {TeacherStackParamList} from '../../../navigation/types';
import type {StatCard} from '../../../shared/types';

type Nav = NativeStackNavigationProp<TeacherStackParamList>;

export function TeacherDashboardScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const navigation = useNavigation<Nav>();
  const user = useAuthStore(s => s.user);
  const {data, isLoading} = useTeacherDashboard();

  if (isLoading || !data) {
    return <Loader message="Loading dashboard…" />;
  }

  const stats: StatCard[] = [
    {key: 'classes', label: "Today's Classes", value: data.todayClasses, icon: 'class', accent: 'primary'},
    {key: 'homework', label: 'Pending HW', value: data.pendingHomework, icon: 'homework', accent: 'warning'},
    {key: 'exams', label: 'Upcoming Exams', value: data.upcomingExams, icon: 'exam', accent: 'info'},
    {
      key: 'attendance',
      label: 'Attendance',
      value: data.attendanceMarkedToday ? 'Marked' : 'Pending',
      icon: 'attendance',
      accent: data.attendanceMarkedToday ? 'success' : 'error',
    },
  ];

  return (
    <Screen padded={false}>
      <CustomHeader
        title={`Hello, ${user?.name?.split(' ')[0] ?? 'Teacher'}`}
        subtitle={user?.schoolName}
        actions={[{icon: 'notification', onPress: () => navigation.navigate('Notifications'), badgeCount: 2}]}
      />
      <ScrollView
        contentContainerStyle={{padding: theme.spacing.lg}}
        showsVerticalScrollIndicator={false}>
        <StatGrid stats={stats} />

        <SectionTitle title="Quick Actions" />
        <Row gap={theme.spacing.md}>
          <View style={{flex: 1}}>
            <CustomButton
              title="Mark Attendance"
              iconLeft="attendance"
              onPress={() => navigation.navigate('MarkAttendance')}
            />
          </View>
          <View style={{flex: 1}}>
            <CustomButton
              title="Create Homework"
              variant="outline"
              iconLeft="homework"
              onPress={() => navigation.navigate('CreateHomework')}
            />
          </View>
        </Row>

        <SectionTitle title="Today's Schedule" />
        <CustomCard>
          {data.schedule.map((slot, i) => (
            <View key={slot.periodNo}>
              {i > 0 ? <Divider /> : null}
              <AppText variant="bodyBold">
                {`Period ${slot.periodNo} · ${slot.time}`}
              </AppText>
              <AppText variant="caption" color="textSecondary">
                {`${slot.subject} — ${slot.className}`}
              </AppText>
            </View>
          ))}
        </CustomCard>

        <SectionTitle title="Class Performance" />
        <CustomCard>
          <AppText variant="caption" color="textSecondary">
            Grade distribution across your classes
          </AppText>
          <Spacer size={12} />
          <BarChart series={data.classPerformance} height={150} />
        </CustomCard>
        <Spacer size={24} />
      </ScrollView>
    </Screen>
  );
}
