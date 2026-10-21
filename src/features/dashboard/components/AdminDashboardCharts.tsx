/**
 * Admin dashboard charts — today's student and teacher attendance (donuts), school at a
 * glance (bars) and attendance by class today (stacked bars). Each card loads on its own,
 * so a slow attendance call never blocks the rest of the dashboard.
 */
import React from 'react';
import {ActivityIndicator, View} from 'react-native';
import {useTheme, useThemedStyles} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {AppText, CustomCard} from '../../../shared/components';
import {useClassAttendanceSummaries} from '../../attendance/adminStudentAttendance.service';
import {useStaffAttendanceList} from '../../attendance/adminTeacherAttendance.service';
import {DonutChart, ProgressBarList, StackedBarChart, type ChartSlice} from './DashboardCharts';
import type {AdminDashboardStats} from '../adminDashboard.service';

/** Local "YYYY-MM-DD" (toISOString is UTC — early morning in IST it would still be yesterday). */
function todayLocalIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function AdminDashboardCharts({stats}: {stats: AdminDashboardStats}): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const today = todayLocalIso();
  const classAttendance = useClassAttendanceSummaries(today);
  const staffAttendance = useStaffAttendanceList({date: today, pageSize: 100});

  const styles = useThemedStyles(t2 => ({
    card: {marginTop: t2.spacing.md},
    subtitle: {marginTop: 2, marginBottom: t2.spacing.md},
    loading: {paddingVertical: t2.spacing.lg, alignItems: 'center'},
  }));

  const COLORS = {
    present: theme.colors.success,
    late: theme.colors.warning,
    leave: theme.colors.info,
    absent: theme.colors.error,
    holiday: theme.colors.primary,
    notMarked: theme.colors.textMuted,
  };

  const header = (title: string, subtitle: string): React.JSX.Element => (
    <>
      <AppText variant="h3">{title}</AppText>
      <AppText variant="caption" color="textSecondary" style={styles.subtitle}>
        {subtitle}
      </AppText>
    </>
  );
  const loading = (
    <View style={styles.loading}>
      <ActivityIndicator color={theme.colors.primary} />
    </View>
  );
  const failed = (
    <AppText variant="caption" color="error">
      {t('common_somethingWentWrong')}
    </AppText>
  );

  // ---- Students today: sum of every class's counts; whoever isn't counted is "not marked".
  const classes = classAttendance.data?.classes ?? [];
  const sum = (k: 'present' | 'late' | 'leave' | 'absent'): number => classes.reduce((s, c) => s + (c[k] ?? 0), 0);
  const studentMarked = sum('present') + sum('late') + sum('leave') + sum('absent');
  const studentSlices: ChartSlice[] = [
    {key: 'present', label: t('markAttendance_presentLabel'), value: sum('present'), color: COLORS.present},
    {key: 'late', label: t('markAttendance_lateLabel'), value: sum('late'), color: COLORS.late},
    {key: 'leave', label: t('attendanceReport_leave'), value: sum('leave'), color: COLORS.leave},
    {key: 'absent', label: t('markAttendance_absentLabel'), value: sum('absent'), color: COLORS.absent},
    {
      key: 'notMarked',
      label: t('dashboardCharts_notMarked'),
      value: Math.max(0, (stats.studentsCount ?? 0) - studentMarked),
      color: COLORS.notMarked,
    },
  ];

  // ---- Teachers today: FINAL status (admin's mark, else the teacher's check-in).
  const records = staffAttendance.data?.items ?? [];
  const countStatus = (s: string): number => records.filter(r => r.status === s).length;
  const teacherSlices: ChartSlice[] = [
    {key: 'present', label: t('markAttendance_presentLabel'), value: countStatus('PRESENT'), color: COLORS.present},
    {key: 'late', label: t('markAttendance_lateLabel'), value: countStatus('LATE'), color: COLORS.late},
    {key: 'leave', label: t('attendanceReport_leave'), value: countStatus('LEAVE'), color: COLORS.leave},
    {key: 'absent', label: t('markAttendance_absentLabel'), value: countStatus('ABSENT'), color: COLORS.absent},
    {key: 'holiday', label: t('attendance_holiday'), value: countStatus('HOLIDAY'), color: COLORS.holiday},
    {
      key: 'notMarked',
      label: t('dashboardCharts_notMarked'),
      value: Math.max(0, (stats.teachersCount ?? 0) - records.length),
      color: COLORS.notMarked,
    },
  ];
  const teacherTotal = teacherSlices.reduce((s, x) => s + x.value, 0);
  const studentTotal = studentSlices.reduce((s, x) => s + x.value, 0);

  return (
    <View>
      <CustomCard style={styles.card}>
        {header(t('dashboardCharts_studentTitle'), t('dashboardCharts_studentSubtitle'))}
        {classAttendance.isError ? failed : classAttendance.isLoading ? loading : (
          <DonutChart
            slices={studentSlices}
            centerValue={studentTotal}
            centerLabel={t('dashboardCharts_studentsUnit')}
            emptyLabel={t('dashboardCharts_noData')}
          />
        )}
      </CustomCard>

      <CustomCard style={styles.card}>
        {header(t('dashboardCharts_teacherTitle'), t('dashboardCharts_teacherSubtitle'))}
        {staffAttendance.isError ? failed : staffAttendance.isLoading ? loading : (
          <DonutChart
            slices={teacherSlices}
            centerValue={teacherTotal}
            centerLabel={t('dashboardCharts_teachersUnit')}
            emptyLabel={t('dashboardCharts_noData')}
          />
        )}
      </CustomCard>

      <CustomCard style={styles.card}>
        {header(t('dashboardCharts_glanceTitle'), t('dashboardCharts_glanceSubtitle'))}
        <ProgressBarList
          items={[
            {key: 'students', label: t('adminDashboard_students'), value: stats.studentsCount ?? 0, color: theme.colors.primary},
            {key: 'teachers', label: t('adminDashboard_teachers'), value: stats.teachersCount ?? 0, color: theme.colors.info},
            {key: 'staff', label: t('adminDashboard_staff'), value: stats.staffCount ?? 0, color: theme.colors.warning},
            {key: 'classes', label: t('adminDashboard_classes'), value: stats.classesCount ?? 0, color: theme.colors.success},
          ]}
        />
      </CustomCard>

      <CustomCard style={styles.card}>
        {header(t('dashboardCharts_byClassTitle'), t('dashboardCharts_byClassSubtitle'))}
        {classAttendance.isError ? failed : classAttendance.isLoading ? loading : (
          <StackedBarChart
            emptyLabel={t('dashboardCharts_noClasses')}
            scrollHint={t('dashboardCharts_swipeClasses', {count: classes.length})}
            series={[
              {key: 'present', label: t('markAttendance_presentLabel'), color: COLORS.present},
              {key: 'late', label: t('markAttendance_lateLabel'), color: COLORS.late},
              {key: 'leave', label: t('attendanceReport_leave'), color: COLORS.leave},
              {key: 'absent', label: t('markAttendance_absentLabel'), color: COLORS.absent},
            ]}
            bars={classes.map(c => ({
              key: c.classId,
              label: c.className,
              values: [c.present ?? 0, c.late ?? 0, c.leave ?? 0, c.absent ?? 0],
            }))}
          />
        )}
      </CustomCard>
    </View>
  );
}
