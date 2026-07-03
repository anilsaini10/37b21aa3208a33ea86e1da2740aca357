/** Parent dashboard — child overview, KPIs, quick links and trend charts. */
import React from 'react';
import {View, ScrollView} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme, useThemedStyles} from '../../../core/theme';
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
import {ScreenNames} from '../../../navigation/ScreenNames';
import type {StatCard} from '../../../shared/types';

type Nav = NativeStackNavigationProp<ParentStackParamList>;

export function ParentDashboardScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const navigation = useNavigation<Nav>();
  const user = useAuthStore(s => s.user);
  const {data, isLoading} = useParentDashboard();
  const {t} = useLanguage();
  const styles = useThemedStyles(t2 => ({
    scrollContent: {
      padding: t2.spacing.lg,
    },
    flexOne: {
      flex: 1,
    },
  }));

  if (isLoading || !data) {
    return <Loader message={t('parentDashboard_loadingDashboard')} />;
  }

  const stats: StatCard[] = [
    {key: 'attendance', label: t('parentDashboard_attendance'), value: `${data.attendancePercentage}%`, icon: 'attendance', accent: 'success'},
    {key: 'fees', label: t('parentDashboard_pendingFees'), value: formatCurrency(data.pendingFees), icon: 'fee', accent: 'error'},
    {key: 'exams', label: t('parentDashboard_upcomingExams'), value: data.upcomingExams, icon: 'exam', accent: 'info'},
    {key: 'homework', label: t('parentDashboard_pendingHomework'), value: data.pendingHomework, icon: 'homework', accent: 'warning'},
  ];

  return (
    <Screen padded={false}>
      <CustomHeader
        title={t('parentDashboard_greeting', {name: user?.name?.split(' ')[0] ?? 'Parent'})}
        actions={[{icon: 'notification', onPress: () => navigation.navigate(ScreenNames.Notifications), badgeCount: 2}]}
      />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <CustomCard>
          <Row gap={theme.spacing.md}>
            <Avatar name={data.childName} size={52} />
            <View style={styles.flexOne}>
              <AppText variant="h3">{data.childName}</AppText>
              <AppText variant="caption" color="textSecondary">
                {data.className}
              </AppText>
            </View>
          </Row>
        </CustomCard>

        <Spacer size={theme.spacing.md} />
        <StatGrid stats={stats} />

        <SectionTitle title={t('parentDashboard_quickLinks')} />
        <Row gap={theme.spacing.md}>
          <View style={styles.flexOne}>
            <CustomButton title={t('parentDashboard_results')} variant="outline" onPress={() => navigation.navigate(ScreenNames.Results)} />
          </View>
          <View style={styles.flexOne}>
            <CustomButton title={t('parentDashboard_timetable')} variant="outline" onPress={() => navigation.navigate(ScreenNames.Timetable)} />
          </View>
        </Row>

        <SectionTitle title={t('parentDashboard_attendanceTrend')} />
        <CustomCard>
          <LineChart series={data.attendanceTrend} color={theme.colors.success} />
        </CustomCard>

        <SectionTitle title={t('parentDashboard_performance')} />
        <CustomCard>
          <BarChart series={data.performanceTrend} height={140} valueFormatter={v => `${v}%`} />
        </CustomCard>
        <Spacer size={24} />
      </ScrollView>
    </Screen>
  );
}
