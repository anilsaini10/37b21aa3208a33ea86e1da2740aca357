/** Attendance report — Teacher tab (summary + per-teacher breakdown) and Students tab (class-wise, drill into a class), for a chosen date range. */
import React, {useState} from 'react';
import {Pressable, View, ScrollView} from 'react-native';
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
  Badge,
  Icon,
  Loader,
  EmptyState,
  Row,
  Spacer,
  Divider,
} from '../../../shared/components';
import {
  useTeacherRangeSummary,
  useTeacherAttendanceList,
  useClassAttendanceSummaries,
  attendanceToday,
} from '../attendance.service';
import {ScreenNames} from '../../../navigation/ScreenNames';
import type {AdminStackParamList} from '../../../navigation/types';
import type {AttendanceCounts, ClassAttendanceSummary} from '../../../shared/types';

type Nav = NativeStackNavigationProp<AdminStackParamList>;

type Tab = 'teacher' | 'students';

/** From/To date pickers laid out side by side with a connecting arrow — auto-clamps so the range is never inverted. */
export function DateRangeFilter({
  fromDate,
  toDate,
  onChange,
}: {
  fromDate: string;
  toDate: string;
  onChange: (fromDate: string, toDate: string) => void;
}): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const styles = useThemedStyles(t2 => ({
    card: {
      marginBottom: t2.spacing.md,
    },
    fieldWrap: {
      flex: 1,
    },
    arrow: {
      marginTop: 30,
    },
  }));

  return (
    <CustomCard style={styles.card}>
      <AppText variant="label" color="textSecondary">
        {t('attendanceReport_dateRangeLabel')}
      </AppText>
      <Spacer size={theme.spacing.xs} />
      <Row gap={theme.spacing.sm} align="flex-start">
        <View style={styles.fieldWrap}>
          <DatePicker
            label={t('attendanceReport_fromDate')}
            value={fromDate}
            onChange={d => onChange(d, d > toDate ? d : toDate)}
          />
        </View>
        <Icon name="forward" size={16} color={theme.colors.textMuted} style={styles.arrow} />
        <View style={styles.fieldWrap}>
          <DatePicker
            label={t('attendanceReport_toDate')}
            value={toDate}
            onChange={d => onChange(d < fromDate ? d : fromDate, d)}
          />
        </View>
      </Row>
    </CustomCard>
  );
}

function AttendanceSection({
  icon,
  title,
  summary,
}: {
  icon: string;
  title: string;
  summary: AttendanceCounts;
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

export function BreakdownLine({present, absent, late, leave}: AttendanceCounts): React.JSX.Element {
  const {theme} = useTheme();
  return (
    <Row gap={theme.spacing.sm}>
      <AppText variant="caption" style={{color: theme.colors.success}}>
        {present}P
      </AppText>
      <AppText variant="caption" style={{color: theme.colors.error}}>
        {absent}A
      </AppText>
      <AppText variant="caption" style={{color: theme.colors.warning}}>
        {late}L
      </AppText>
      <AppText variant="caption" style={{color: theme.colors.info}}>
        {leave}Lv
      </AppText>
    </Row>
  );
}

function MiniStat({label, value, color}: {label: string; value: number; color: string}): React.JSX.Element {
  return (
    <View style={{alignItems: 'center'}}>
      <AppText variant="bodyBold" style={{color}}>
        {value}
      </AppText>
      <AppText variant="label" color="textMuted">
        {label}
      </AppText>
    </View>
  );
}

function ClassAttendanceCard({
  cls,
  onPress,
}: {
  cls: ClassAttendanceSummary;
  onPress: () => void;
}): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  return (
    <CustomCard onPress={onPress} style={{marginBottom: theme.spacing.md}}>
      <Row justify="space-between" align="center">
        <AppText variant="bodyBold">{cls.className}</AppText>
        <AppText variant="caption" color="primary">
          {cls.percentage}%
        </AppText>
      </Row>
      <Spacer size={theme.spacing.sm} />
      <Row justify="space-around">
        <MiniStat label={t('attendance_present')} value={cls.present} color={theme.colors.success} />
        <MiniStat label={t('attendance_absent')} value={cls.absent} color={theme.colors.error} />
        <MiniStat label={t('attendanceReport_leave')} value={cls.leave} color={theme.colors.info} />
        <MiniStat label={t('attendanceReport_total')} value={cls.total} color={theme.colors.primary} />
      </Row>
    </CustomCard>
  );
}

export function AttendanceReportScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const navigation = useNavigation<Nav>();
  const {t} = useLanguage();
  const [fromDate, setFromDate] = useState(attendanceToday);
  const [toDate, setToDate] = useState(attendanceToday);
  const [tab, setTab] = useState<Tab>('teacher');

  const {data: teacherSummary, isLoading: teacherSummaryLoading} = useTeacherRangeSummary(fromDate, toDate);
  const {data: teacherList, isLoading: teacherListLoading} = useTeacherAttendanceList(fromDate, toDate);
  const {data: classSummaries, isLoading: classSummariesLoading} = useClassAttendanceSummaries(fromDate, toDate);

  const styles = useThemedStyles(t2 => ({
    scrollContent: {
      padding: t2.spacing.lg,
    },
    tabsRow: {
      flexDirection: 'row',
      columnGap: t2.spacing.sm,
      marginBottom: t2.spacing.sm,
    },
  }));

  const TABS: {label: string; value: Tab}[] = [
    {label: t('attendanceReport_tabTeacher'), value: 'teacher'},
    {label: t('attendanceReport_tabStudents'), value: 'students'},
  ];

  const isTeacherLoading = teacherSummaryLoading || teacherListLoading || !teacherSummary || !teacherList;
  const isStudentsLoading = classSummariesLoading || !classSummaries;

  return (
    <Screen padded={false}>
      <CustomHeader title={t('attendanceReport_title')} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <DateRangeFilter
          fromDate={fromDate}
          toDate={toDate}
          onChange={(f, tD) => {
            setFromDate(f);
            setToDate(tD);
          }}
        />

        <Row gap={theme.spacing.sm} style={styles.tabsRow}>
          {TABS.map(tabOption => (
            <Pressable key={tabOption.value} onPress={() => setTab(tabOption.value)}>
              <Badge label={tabOption.label} tone={tab === tabOption.value ? 'primary' : 'neutral'} />
            </Pressable>
          ))}
        </Row>

        {tab === 'teacher' ? (
          isTeacherLoading ? (
            <Loader message={t('attendanceReport_loadingAttendance')} />
          ) : (
            <>
              <AttendanceSection icon="teacher" title={t('attendanceReport_teachersSection')} summary={teacherSummary} />
              <Spacer size={theme.spacing.md} />
              <AppText variant="label" color="textSecondary">
                {t('attendanceReport_teacherListTitle')}
              </AppText>
              <Spacer size={theme.spacing.xs} />
              {teacherList.length === 0 ? (
                <EmptyState
                  icon="teacher"
                  title={t('attendanceReport_noTeacherRecords')}
                  message={t('attendanceReport_noRecordsMessage')}
                />
              ) : (
                <CustomCard padded={false} style={{paddingHorizontal: theme.spacing.lg}}>
                  {teacherList.map((rec, i) => (
                    <React.Fragment key={rec.teacherId}>
                      {i > 0 ? <Divider /> : null}
                      <Row justify="space-between" align="center" style={{paddingVertical: theme.spacing.sm}}>
                        <AppText variant="bodyBold">{rec.teacherName}</AppText>
                        <BreakdownLine present={rec.present} absent={rec.absent} late={rec.late} leave={rec.leave} total={rec.total} percentage={rec.percentage} />
                      </Row>
                    </React.Fragment>
                  ))}
                </CustomCard>
              )}
            </>
          )
        ) : isStudentsLoading ? (
          <Loader message={t('attendanceReport_loadingAttendance')} />
        ) : classSummaries.length === 0 ? (
          <EmptyState
            icon="students"
            title={t('attendanceReport_noClassRecords')}
            message={t('attendanceReport_noRecordsMessage')}
          />
        ) : (
          classSummaries.map(cls => (
            <ClassAttendanceCard
              key={cls.classId}
              cls={cls}
              onPress={() =>
                navigation.navigate(ScreenNames.ClassAttendance, {
                  classId: cls.classId,
                  className: cls.className,
                  fromDate,
                  toDate,
                })
              }
            />
          ))
        )}
        <Spacer size={24} />
      </ScrollView>
    </Screen>
  );
}
