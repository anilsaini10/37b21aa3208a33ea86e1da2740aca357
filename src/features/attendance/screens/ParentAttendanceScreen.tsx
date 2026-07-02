/** Parent attendance — child's overall attendance + monthly trend. */
import React from 'react';
import {View, ScrollView} from 'react-native';
import {useTheme} from '../../../core/theme';
import {
  Screen,
  AppText,
  CustomHeader,
  CustomCard,
  BarChart,
  Loader,
  Row,
  Spacer,
} from '../../../shared/components';
import {db} from '../../../core/mock/db';
import {useParentDashboard} from '../../dashboard/dashboard.service';

export function ParentAttendanceScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const child = db.students[0];
  const {data, isLoading} = useParentDashboard();

  if (isLoading || !data) {
    return <Loader message="Loading attendance…" />;
  }

  const totalDays = 200;
  const presentDays = Math.round((child.attendancePercentage / 100) * totalDays);
  const absentDays = totalDays - presentDays;

  return (
    <Screen padded={false}>
      <CustomHeader title="Attendance" />
      <ScrollView
        contentContainerStyle={{padding: theme.spacing.lg}}
        showsVerticalScrollIndicator={false}>
        <CustomCard>
          <View style={{alignItems: 'center'}}>
            <AppText variant="display" color="success">
              {child.attendancePercentage}%
            </AppText>
            <AppText variant="caption" color="textSecondary">
              Overall attendance
            </AppText>
          </View>
          <Spacer size={theme.spacing.md} />
          <Row justify="space-around">
            <View style={{alignItems: 'center'}}>
              <AppText variant="h3" color="success">
                {presentDays}
              </AppText>
              <AppText variant="label" color="textMuted">
                Present
              </AppText>
            </View>
            <View style={{alignItems: 'center'}}>
              <AppText variant="h3" color="error">
                {absentDays}
              </AppText>
              <AppText variant="label" color="textMuted">
                Absent
              </AppText>
            </View>
          </Row>
        </CustomCard>

        <Spacer size={theme.spacing.md} />
        <CustomCard>
          <AppText variant="bodyBold">Monthly Trend</AppText>
          <Spacer size={theme.spacing.sm} />
          <BarChart
            series={data.attendanceTrend}
            height={150}
            color={theme.colors.success}
            valueFormatter={v => `${v}%`}
          />
        </CustomCard>
        <Spacer size={24} />
      </ScrollView>
    </Screen>
  );
}
