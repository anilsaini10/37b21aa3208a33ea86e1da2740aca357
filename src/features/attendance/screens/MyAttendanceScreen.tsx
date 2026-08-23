/** Teacher — My Attendance: read-only view of the admin-marked staff attendance history. No edit affordance; corrections are admin-only. */
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
  Badge,
  Loader,
  EmptyState,
  Pagination,
  Row,
  Spacer,
  Divider,
} from '../../../shared/components';
import type {BadgeTone} from '../../../shared/components';
import {DateRangeFilter} from './AttendanceReportScreen';
import {formatDate} from '../../../core/utils/format';
import {useMyAttendance} from '../myStaffAttendance.service';
import type {TeacherStackParamList} from '../../../navigation/types';
import type {AttendanceStatusCode} from '../../../shared/types';

type Nav = NativeStackNavigationProp<TeacherStackParamList>;
type TabValue = AttendanceStatusCode | 'ALL';
type DateMode = 'range' | 'single';

const TABS: TabValue[] = ['ALL', 'PRESENT', 'ABSENT', 'LATE', 'LEAVE', 'HOLIDAY'];

const STATUS_TONE: Record<AttendanceStatusCode, BadgeTone> = {
  PRESENT: 'success',
  ABSENT: 'error',
  LATE: 'warning',
  LEAVE: 'info',
  HOLIDAY: 'neutral',
};

const SUMMARY_TONE: Record<AttendanceStatusCode, 'success' | 'error' | 'warning' | 'info' | 'textMuted'> = {
  PRESENT: 'success',
  ABSENT: 'error',
  LATE: 'warning',
  LEAVE: 'info',
  HOLIDAY: 'textMuted',
};

function isoDaysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function MyAttendanceScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const navigation = useNavigation<Nav>();

  const [statusFilter, setStatusFilter] = useState<TabValue>('ALL');
  const [dateMode, setDateMode] = useState<DateMode>('range');
  const [fromDate, setFromDate] = useState(isoDaysAgo(30));
  const [toDate, setToDate] = useState(todayIso());
  const [singleDate, setSingleDate] = useState(todayIso());
  const [page, setPage] = useState(1);

  const {data, isLoading, isError, error, refetch} = useMyAttendance({
    page,
    pageSize: 100,
    ...(dateMode === 'single' ? {date: singleDate} : {from: fromDate, to: toDate}),
    status: statusFilter === 'ALL' ? undefined : statusFilter,
  });

  const STATUS_LABEL: Record<AttendanceStatusCode, string> = {
    PRESENT: t('markAttendance_presentLabel'),
    ABSENT: t('markAttendance_absentLabel'),
    LATE: t('markAttendance_lateLabel'),
    LEAVE: t('attendanceReport_leave'),
    HOLIDAY: t('attendance_holiday'),
  };

  const styles = useThemedStyles(t2 => ({
    tabsWrap: {alignItems: 'center', paddingTop: t2.spacing.md},
    tabsContent: {columnGap: t2.spacing.sm, paddingHorizontal: t2.spacing.lg},
    tabPill: {
      paddingHorizontal: t2.spacing.lg,
      paddingVertical: t2.spacing.sm,
      borderRadius: t2.radius.pill,
    },
    modeRow: {
      paddingHorizontal: t2.spacing.lg, 
      paddingTop: t2.spacing.sm,
      marginBottom:10

    },
    modePill: {
      alignItems: 'center',
      paddingVertical: t2.spacing.xs,
      borderRadius: t2.radius.sm,
      width:'25%',
      height:30,
      justifyContent:'center'
    },
    filterRow: {paddingHorizontal: t2.spacing.lg},
    scrollContent: {padding: t2.spacing.lg},
    summaryRow: {marginBottom: t2.spacing.md},
    summaryItem: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: t2.spacing.xs,
      borderRadius: t2.radius.md,
    },
    recordRow: {paddingVertical: t2.spacing.sm},
  }));

  const counts: Record<AttendanceStatusCode, number> = {PRESENT: 0, ABSENT: 0, LATE: 0, LEAVE: 0, HOLIDAY: 0};
  (data?.items ?? []).forEach(record => {
    counts[record.status] += 1;
  });

  return (
    <Screen padded={false}>
      <CustomHeader title={t('teacherProfile_myAttendance')} onBack={() => navigation.goBack()} />

      <View style={styles.tabsWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsContent}>
          {TABS.map(value => {
            const active = value === statusFilter;
            const label = value === 'ALL' ? t('common_all') : STATUS_LABEL[value];
            return (
              <Pressable
                key={value}
                onPress={() => {
                  setStatusFilter(value);
                  setPage(1);
                }}
                style={[styles.tabPill, {backgroundColor: active ? theme.colors.primary : theme.colors.surfaceVariant}]}>
                <AppText variant="label" style={{color: active ? theme.colors.onPrimary : theme.colors.textSecondary}}>
                  {label}
                </AppText>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <Row gap={theme.spacing.sm} style={styles.modeRow}>
        {(['range', 'single'] as DateMode[]).map(mode => {
          const active = dateMode === mode;
          return (
            <Pressable
              key={mode}
              onPress={() => {
                setDateMode(mode);
                setPage(1);
              }}
              style={[styles.modePill, {backgroundColor: active ? theme.colors.primary : theme.colors.surfaceVariant}]}>
              <AppText variant="label" style={{color: active ? theme.colors.onPrimary : theme.colors.textSecondary}}>
                {mode === 'range' ? t('myAttendance_rangeMode') : t('myAttendance_singleDayMode')}
              </AppText>
            </Pressable>
          );
        })}
      </Row>

      <View style={styles.filterRow}>
        {dateMode === 'range' ? (
          <DateRangeFilter
            fromDate={fromDate}
            toDate={toDate}
            onChange={(f, tD) => {
              setFromDate(f);
              setToDate(tD);
              setPage(1);
            }}
          />
        ) : (
          <DatePicker
            label={t('markAttendance_date')}
            value={singleDate}
            onChange={val => {
              setSingleDate(val);
              setPage(1);
            }}
          />
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {isError ? (
          <EmptyState
            icon="warning"
            title={t('common_somethingWentWrong')}
            message={(error as {message?: string} | null)?.message ?? t('common_checkConnection')}
            actionLabel={t('common_retry')}
            onAction={() => refetch()}
          />
        ) : isLoading || !data ? (
          <Loader message={t('myAttendance_loading')} />
        ) : (
          <>
            <Row gap={theme.spacing.xs} style={styles.summaryRow}>
              {(['PRESENT', 'ABSENT', 'LATE', 'LEAVE', 'HOLIDAY'] as AttendanceStatusCode[]).map(code => {
                const color = theme.colors[SUMMARY_TONE[code]];
                return (
                  <View key={code} style={[styles.summaryItem, {backgroundColor: color + '18'}]}>
                    <AppText variant="bodyBold" style={{color}}>
                      {counts[code]}
                    </AppText>
                    <AppText variant="label" style={{color}}>
                      {STATUS_LABEL[code]}
                    </AppText>
                  </View>
                );
              })}
            </Row>

            {data.items.length === 0 ? (
              <EmptyState
                icon="attendance"
                title={t('myAttendance_noRecordsTitle')}
                message={t('myAttendance_noRecordsMessage')}
              />
            ) : (
              <CustomCard>
                {data.items.map((record, i) => (
                  <View key={record.id}>
                    {i > 0 ? <Divider /> : null}
                    <Row justify="space-between" align="center" style={styles.recordRow}>
                      <View style={{flex: 1}}>
                        <AppText variant="bodyBold">{formatDate(record.date)}</AppText>
                        <AppText variant="label" color="textMuted">
                          {t('staffAttendance_markedBy', {name: record.markedBy.name})}
                        </AppText>
                      </View>
                      <Badge label={STATUS_LABEL[record.status]} tone={STATUS_TONE[record.status]} />
                    </Row>
                  </View>
                ))}
              </CustomCard>
            )}

            {data.totalPages > 1 ? <Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} /> : null}
          </>
        )}
        <Spacer size={24} />
      </ScrollView>
    </Screen>
  );
}
