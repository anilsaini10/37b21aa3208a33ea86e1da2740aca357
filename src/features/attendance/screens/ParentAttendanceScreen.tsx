/** Parent attendance — child's overall attendance + monthly trend. */
import React from 'react';
import {View, ScrollView} from 'react-native';
import {useTheme, useThemedStyles} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
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
  const {t} = useLanguage();
  const styles = useThemedStyles(t2 => ({
    scrollContent: {
      padding: t2.spacing.lg,
    },
    centeredBlock: {
      alignItems: 'center',
    },
  }));
  const child = db.students[0];
  const {data, isLoading} = useParentDashboard();

  if (isLoading || !data) {
    return <Loader message={t('parentAttendance_loadingAttendance')} />;
  }

  const totalDays = 200;
  const presentDays = Math.round((child.attendancePercentage / 100) * totalDays);
  const absentDays = totalDays - presentDays;

  return (
    <Screen padded={false}>
      <CustomHeader title={t('parentAttendance_title')} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <CustomCard>
          <View style={styles.centeredBlock}>
            <AppText variant="display" color="success">
              {child.attendancePercentage}%
            </AppText>
            <AppText variant="caption" color="textSecondary">
              {t('parentAttendance_overallAttendance')}
            </AppText>
          </View>
          <Spacer size={theme.spacing.md} />
          <Row justify="space-around">
            <View style={styles.centeredBlock}>
              <AppText variant="h3" color="success">
                {presentDays}
              </AppText>
              <AppText variant="label" color="textMuted">
                {t('attendance_present')}
              </AppText>
            </View>
            <View style={styles.centeredBlock}>
              <AppText variant="h3" color="error">
                {absentDays}
              </AppText>
              <AppText variant="label" color="textMuted">
                {t('attendance_absent')}
              </AppText>
            </View>
          </Row>
        </CustomCard>

        <Spacer size={theme.spacing.md} />
        <CustomCard>
          <AppText variant="bodyBold">{t('parentAttendance_monthlyTrend')}</AppText>
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
