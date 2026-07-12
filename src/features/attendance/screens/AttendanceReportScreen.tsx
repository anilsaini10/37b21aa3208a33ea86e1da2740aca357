/** Attendance report — school-wide daily summary for both students and teachers, for a chosen date. */
import React, {useState} from 'react';
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
  DatePicker,
  BarChart,
  Icon,
  Loader,
  Row,
  Spacer,
} from '../../../shared/components';
import {useAttendanceSummary, useTeacherAttendanceSummary, attendanceToday} from '../attendance.service';
import type {AdminStackParamList} from '../../../navigation/types';
import type {DailyAttendanceSummary} from '../../../shared/types';

type Nav = NativeStackNavigationProp<AdminStackParamList>;

function AttendanceSection({
  icon,
  title,
  summary,
}: {
  icon: string;
  title: string;
  summary: DailyAttendanceSummary;
}): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const styles = useThemedStyles(t2 => ({
    headerCard: {
      marginBottom: t2.spacing.md,
    },
    iconCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: t2.colors.surfaceVariant,
      alignItems: 'center',
      justifyContent: 'center',
    },
    breakdownRow: {
      rowGap: t2.spacing.sm,
    },
    tileWrapper: {
      width: '31%',
    },
    tileCard: {
      alignItems: 'center',
    },
    chartCard: {
      marginTop: t2.spacing.md,
    },
  }));

  const {present, absent, late, leave, total, percentage} = summary;
  const tiles: {label: string; value: number; color: string}[] = [
    {label: t('attendance_present'), value: present, color: theme.colors.success},
    {label: t('attendance_absent'), value: absent, color: theme.colors.error},
    {label: t('attendance_late'), value: late, color: theme.colors.warning},
    {label: t('attendanceReport_leave'), value: leave, color: theme.colors.info},
    {label: t('attendanceReport_total'), value: total, color: theme.colors.primary},
  ];

  return (
    <View>
      <CustomCard style={styles.headerCard}>
        <Row justify="space-between" align="center">
          <Row gap={theme.spacing.sm}>
            <View style={styles.iconCircle}>
              <Icon name={icon} size={20} color={theme.colors.primary} />
            </View>
            <View>
              <AppText variant="h3">{title}</AppText>
              <AppText variant="caption" color="textSecondary">
                {t('attendanceReport_markedPresent', {present: String(present), total: String(total)})}
              </AppText>
            </View>
          </Row>
          <AppText variant="display" color="primary">
            {percentage}%
          </AppText>
        </Row>
      </CustomCard>

      <Row gap={theme.spacing.sm} wrap style={styles.breakdownRow}>
        {tiles.map(tile => (
          <View key={tile.label} style={styles.tileWrapper}>
            <CustomCard style={styles.tileCard}>
              <AppText variant="h2" style={{color: tile.color}}>
                {tile.value}
              </AppText>
              <AppText variant="label" color="textSecondary">
                {tile.label}
              </AppText>
            </CustomCard>
          </View>
        ))}
      </Row>

      <CustomCard style={styles.chartCard}>
        <BarChart
          series={{
            labels: [t('attendance_present'), t('attendance_absent'), t('attendance_late'), t('attendanceReport_leave')],
            values: [present, absent, late, leave],
          }}
          height={140}
        />
      </CustomCard>
    </View>
  );
}

export function AttendanceReportScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const navigation = useNavigation<Nav>();
  const {t} = useLanguage();
  const [selectedDate, setSelectedDate] = useState(attendanceToday);
  const {data: studentSummary, isLoading: studentsLoading} = useAttendanceSummary(selectedDate);
  const {data: teacherSummary, isLoading: teachersLoading} = useTeacherAttendanceSummary(selectedDate);

  const styles = useThemedStyles(t2 => ({
    scrollContent: {
      padding: t2.spacing.lg,
    },
  }));

  const isLoading = studentsLoading || teachersLoading || !studentSummary || !teacherSummary;

  return (
    <Screen padded={false}>
      <CustomHeader title={t('attendanceReport_title')} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <DatePicker label={t('attendanceReport_selectDate')} value={selectedDate} onChange={setSelectedDate} />

        {isLoading ? (
          <Loader message={t('attendanceReport_loadingAttendance')} />
        ) : (
          <>
            <AttendanceSection icon="students" title={t('attendanceReport_studentsSection')} summary={studentSummary} />
            <Spacer size={theme.spacing.lg} />
            <AttendanceSection icon="teacher" title={t('attendanceReport_teachersSection')} summary={teacherSummary} />
          </>
        )}
        <Spacer size={24} />
      </ScrollView>
    </Screen>
  );
}
