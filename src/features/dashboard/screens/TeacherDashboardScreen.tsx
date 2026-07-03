/** Teacher dashboard — daily KPIs, quick actions, schedule + class performance. */
import React from 'react';
import {View, ScrollView} from 'react-native';
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
  const {t} = useLanguage();

  if (isLoading || !data) {
    return <Loader message={t('teacherDashboard_loadingDashboard')} />;
  }

  const stats: StatCard[] = [
    {key: 'classes', label: t('teacherDashboard_todaysClasses'), value: data.todayClasses, icon: 'class', accent: 'primary'},
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
        actions={[{icon: 'notification', onPress: () => navigation.navigate('Notifications'), badgeCount: 2}]}
      />
      <ScrollView
        contentContainerStyle={{padding: theme.spacing.lg}}
        showsVerticalScrollIndicator={false}>
        <StatGrid stats={stats} />

        <SectionTitle title={t('teacherDashboard_quickActions')} />
        <Row gap={theme.spacing.md}>
          <View style={{flex: 1}}>
            <CustomButton
              title={t('teacherDashboard_markAttendance')}
              iconLeft="attendance"
              onPress={() => navigation.navigate('MarkAttendance')}
            />
          </View>
          <View style={{flex: 1}}>
            <CustomButton
              title={t('teacherDashboard_createHomework')}
              variant="outline"
              iconLeft="homework"
              onPress={() => navigation.navigate('CreateHomework')}
            />
          </View>
        </Row>

        <SectionTitle title={t('teacherDashboard_todaysSchedule')} />
        <CustomCard>
          {data.schedule.map((slot, i) => (
            <View key={slot.periodNo}>
              {i > 0 ? <Divider /> : null}
              <AppText variant="bodyBold">
                {t('teacherDashboard_periodTime', {periodNo: String(slot.periodNo), time: slot.time})}
              </AppText>
              <AppText variant="caption" color="textSecondary">
                {`${slot.subject} — ${slot.className}`}
              </AppText>
            </View>
          ))}
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
