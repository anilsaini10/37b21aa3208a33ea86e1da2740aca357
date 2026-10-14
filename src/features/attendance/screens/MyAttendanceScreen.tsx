/** Teacher — My Attendance: own attendance history (self check-ins + admin-marked days). Read-only; corrections are admin-only. */
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
  Select,
  Badge,
  Loader,
  EmptyState,
  Pagination,
  Row,
  Spacer,
  CustomTable,
} from '../../../shared/components';
import type {BadgeTone, TableColumn} from '../../../shared/components';
import {formatDateDMY, formatDuration, formatTime12h} from '../../../core/utils/format';
import {useMyAttendance} from '../myStaffAttendance.service';
import {TodayCheckInPanel} from '../components/TodayCheckInPanel';
import type {TeacherStackParamList} from '../../../navigation/types';
import type {AttendanceStatusCode, MyStaffAttendanceRecord} from '../../../shared/types';

type Nav = NativeStackNavigationProp<TeacherStackParamList>;
type TabValue = AttendanceStatusCode | 'ALL';

const PAGE_SIZE = 100;

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

/** Local "YYYY-MM-DD" (toISOString is UTC — early morning in IST it would still be yesterday). */
function localIso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Default range: 1st of the current month → today. */
function firstOfMonthIso(): string {
  const d = new Date();
  return localIso(new Date(d.getFullYear(), d.getMonth(), 1));
}

export function MyAttendanceScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const navigation = useNavigation<Nav>();

  const [statusFilter, setStatusFilter] = useState<TabValue>('ALL');
  const [fromDate, setFromDate] = useState(firstOfMonthIso);
  const [toDate, setToDate] = useState(() => localIso(new Date()));
  const [page, setPage] = useState(1);

  const {data, isLoading, isError, error, refetch} = useMyAttendance({
    page,
    pageSize: PAGE_SIZE,
    from: fromDate,
    to: toDate,
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
    // Status dropdown + From + To side by side.
    filterRow: {flexDirection: 'row', columnGap: t2.spacing.sm, paddingHorizontal: t2.spacing.lg, paddingTop: t2.spacing.md},
    filterItem: {flex: 1},
    filterValueText: {fontSize: t2.typography.fontSize.sm},
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

  const dash = (
    <AppText variant="caption" color="textMuted">
      —
    </AppText>
  );
  const statusCell = (status: AttendanceStatusCode | null): React.ReactNode =>
    status ? <Badge label={STATUS_LABEL[status]} tone={STATUS_TONE[status]} /> : dash;
  const timeCell = (iso: string | null | undefined): React.ReactNode =>
    iso ? <AppText variant="caption">{formatTime12h(iso)}</AppText> : dash;

  const columns: TableColumn<MyStaffAttendanceRecord>[] = [
    {
      key: 'sno',
      title: t('myAttendance_colSno'),
      width: 48,
      align: 'center',
      // Continues across pages.
      render: record => (
        <AppText variant="caption">{((data?.page ?? 1) - 1) * PAGE_SIZE + (data?.items.indexOf(record) ?? 0) + 1}</AppText>
      ),
    },
    {
      key: 'date',
      title: t('common_date'),
      width: 100,
      render: record => <AppText variant="caption">{formatDateDMY(record.date)}</AppText>,
    },
    {key: 'checkIn', title: t('myAttendance_colCheckIn'), width: 84, render: record => timeCell(record.teacherMarkedAt)},
    {key: 'checkOut', title: t('myAttendance_colCheckOut'), width: 84, render: record => timeCell(record.teacherCheckOutAt)},
    {key: 'teacher', title: t('myAttendance_colTeacher'), width: 96, render: record => statusCell(record.teacherStatus)},
    {key: 'admin', title: t('myAttendance_colAdmin'), width: 96, render: record => statusCell(record.adminStatus)},
    {
      key: 'hours',
      title: t('myAttendance_colWorkingHours'),
      width: 92,
      render: record =>
        record.workedMinutes != null ? <AppText variant="caption">{formatDuration(record.workedMinutes)}</AppText> : dash,
    },
  ];

  return (
    <Screen padded={false}>
      <CustomHeader title={t('teacherProfile_myAttendance')} onBack={() => navigation.goBack()} />

      <View style={styles.filterRow}>
        <View style={styles.filterItem}>
          <Select
            label={t('common_status')}
            value={statusFilter}
            options={TABS.map(value => ({label: value === 'ALL' ? t('common_all') : STATUS_LABEL[value], value}))}
            onChange={val => {
              setStatusFilter(val as TabValue);
              setPage(1);
            }}
            valueStyle={styles.filterValueText}
          />
        </View>
        <View style={styles.filterItem}>
          <DatePicker
            label={t('attendanceReport_fromDate')}
            value={fromDate}
            maxDate={toDate}
            onChange={d => {
              setFromDate(d);
              setPage(1);
            }}
            valueStyle={styles.filterValueText}
          />
        </View>
        <View style={styles.filterItem}>
          <DatePicker
            label={t('attendanceReport_toDate')}
            value={toDate}
            minDate={fromDate}
            maxDate={localIso(new Date())}
            onChange={d => {
              setToDate(d);
              setPage(1);
            }}
            valueStyle={styles.filterValueText}
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Today's check-in / check-out — same card as on the Home screen. */}
        <CustomCard style={{marginBottom: theme.spacing.md}}>
          <TodayCheckInPanel />
        </CustomCard>
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
              // S.No · Date · Check In · Check Out · Teacher · Admin · Working hours — scrolls sideways on narrow screens.
              <CustomTable
                columns={columns}
                data={data.items}
                keyExtractor={record => record.id}
              />
            )}

            {data.totalPages > 1 ? <Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} /> : null}
          </>
        )}
        <Spacer size={24} />
      </ScrollView>
    </Screen>
  );
}
