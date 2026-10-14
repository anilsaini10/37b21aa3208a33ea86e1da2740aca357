/**
 * Attendance Register (Admin) — teacher self check-in vs admin mark vs final status.
 *
 * Day view: one date, EVERY active teacher (records merged with the teacher list —
 * teachers with nothing recorded don't come back from the API), quick chips for
 * "checked in but marked absent", "not checked in" and mismatches.
 * History view: paginated records filtered by final / self check-in / admin status,
 * teacher and date range.
 * Tapping a record edits the ADMIN status only (PATCH) — the teacher's check-in is kept.
 */
import React, {useMemo, useState} from 'react';
import {FlatList, Pressable, View} from 'react-native';
import {useNavigation, useRoute, type RouteProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme, useThemedStyles} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {
  Screen,
  AppText,
  CustomHeader,
  CustomCard,
  CustomModal,
  CustomButton,
  Select,
  DatePicker,
  Pagination,
  Loader,
  EmptyState,
  Row,
  Spacer,
} from '../../../shared/components';
import {formatDate, formatTime12h} from '../../../core/utils/format';
import {useTeachers} from '../../teachers/teachers.service';
import {
  useStaffAttendanceList,
  useCorrectStaffAttendance,
  type StaffAttendanceFilters,
} from '../adminTeacherAttendance.service';
import {ATTENDANCE_STATUS_CODES, ATTENDANCE_STATUS_TONE, useAttendanceStatusLabels} from '../components/attendanceStatus';
import {StaffAttendanceRow, isAttendanceMismatch} from '../components/StaffAttendanceRow';
import {ScreenNames} from '../../../navigation/ScreenNames';
import type {AdminStackParamList} from '../../../navigation/types';
import type {AttendanceStatusCode, StaffAttendanceRecord} from '../../../shared/types';

type Nav = NativeStackNavigationProp<AdminStackParamList>;
type Mode = 'day' | 'history';
type DayChip = 'all' | 'checkedInAbsent' | 'notCheckedIn' | 'mismatch';
type StatusFilter = AttendanceStatusCode | '';

const ALL = '';

/** Local "YYYY-MM-DD" (not toISOString, which is UTC and can be yesterday early in the morning in IST). */
function localIso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function isoDaysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return localIso(d);
}

interface DayRow {
  teacherId: string;
  teacherName: string;
  employeeId: string;
  record: StaffAttendanceRecord | null;
}

export function StaffAttendanceRegisterScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<AdminStackParamList, 'StaffAttendanceRegister'>>();
  const LABEL = useAttendanceStatusLabels();

  // Opened for one teacher (from Teacher detail) → their history; otherwise today's register.
  const [mode, setMode] = useState<Mode>(route.params?.teacherId ? 'history' : 'day');

  // Day view
  const [dayDate, setDayDate] = useState(localIso(new Date()));
  const [dayChip, setDayChip] = useState<DayChip>('all');

  // History view
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(ALL);
  const [teacherStatusFilter, setTeacherStatusFilter] = useState<StatusFilter>(ALL);
  const [adminStatusFilter, setAdminStatusFilter] = useState<StatusFilter>(ALL);
  const [teacherFilter, setTeacherFilter] = useState(route.params?.teacherId ?? ALL);
  const [fromDate, setFromDate] = useState(isoDaysAgo(30));
  const [toDate, setToDate] = useState(localIso(new Date()));
  const [page, setPage] = useState(1);

  // Edit (admin status)
  const [updateTarget, setUpdateTarget] = useState<StaffAttendanceRecord | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<AttendanceStatusCode | null>(null);
  const [correctionError, setCorrectionError] = useState<string | undefined>();

  const {data: teachersPage, isLoading: teachersLoading} = useTeachers({status: 'ACTIVE', pageSize: 100});

  const dayQuery = useStaffAttendanceList({date: dayDate, pageSize: 100});
  const historyFilters: StaffAttendanceFilters = {
    page,
    pageSize: 15,
    from: fromDate,
    to: toDate,
    status: statusFilter || undefined,
    teacherStatus: teacherStatusFilter || undefined,
    adminStatus: adminStatusFilter || undefined,
    teacherId: teacherFilter || undefined,
  };
  const historyQuery = useStaffAttendanceList(historyFilters);
  const correctMutation = useCorrectStaffAttendance();

  const styles = useThemedStyles(t2 => ({
    segmentBar: {
      flexDirection: 'row',
      marginHorizontal: 16,
      marginTop: 12,
      padding: 3,
      borderRadius: t2.radius.md,
      backgroundColor: t2.colors.surfaceVariant,
    },
    segmentItem: {flex: 1, alignItems: 'center', paddingVertical: t2.spacing.sm, borderRadius: t2.radius.md - 2},
    segmentItemActive: {backgroundColor: t2.colors.surface},
    filterSection: {paddingHorizontal: 16, paddingTop: 12},
    filterCard: {borderRadius: 7, padding: 12, borderColor: 'transparent'},
    filterItem: {flex: 1},
    chipsRow: {flexDirection: 'row', flexWrap: 'wrap', gap: t2.spacing.sm},
    chip: {paddingHorizontal: t2.spacing.md, paddingVertical: 6, borderRadius: 999, borderWidth: 1},
    listContent: {padding: 16, paddingTop: 8, flexGrow: 1},
    correctionPill: {paddingHorizontal: t2.spacing.sm, paddingVertical: 5, borderRadius: t2.radius.pill},
    modalButtonWrap: {flex: 1},
    filterValueText: {fontSize: t2.typography.fontSize.sm},
  }));

  // ---- Day view: merge the teacher list with that date's records ----
  const dayRows = useMemo<DayRow[]>(() => {
    const byTeacher = new Map((dayQuery.data?.items ?? []).map(r => [r.teacherId, r]));
    const rows: DayRow[] = (teachersPage?.items ?? []).map(tch => ({
      teacherId: tch.id,
      teacherName: tch.name,
      employeeId: tch.employeeId,
      record: byTeacher.get(tch.id) ?? null,
    }));
    // Records of teachers no longer in the active list (e.g. deactivated since) still belong on the register.
    const listed = new Set(rows.map(r => r.teacherId));
    (dayQuery.data?.items ?? [])
      .filter(r => !listed.has(r.teacherId))
      .forEach(r => rows.push({teacherId: r.teacherId, teacherName: r.teacherName, employeeId: r.employeeId, record: r}));
    return rows;
  }, [teachersPage, dayQuery.data]);

  const dayChipMatch: Record<DayChip, (r: DayRow) => boolean> = {
    all: () => true,
    checkedInAbsent: r => r.record?.teacherStatus === 'PRESENT' && r.record.adminStatus === 'ABSENT',
    notCheckedIn: r => !r.record?.teacherStatus,
    mismatch: r => isAttendanceMismatch(r.record),
  };
  const visibleDayRows = dayRows.filter(dayChipMatch[dayChip]);
  const DAY_CHIPS: {key: DayChip; label: string}[] = [
    {key: 'all', label: t('common_all')},
    {key: 'checkedInAbsent', label: t('staffAttendance_chipCheckedInAbsent')},
    {key: 'notCheckedIn', label: t('staffAttendance_chipNotCheckedIn')},
    {key: 'mismatch', label: t('staffAttendance_chipMismatch')},
  ].map(c => ({...c, label: `${c.label} (${dayRows.filter(dayChipMatch[c.key as DayChip]).length})`})) as {
    key: DayChip;
    label: string;
  }[];

  // ---- Filters ----
  const statusOptions = [
    {label: t('common_all'), value: ALL},
    ...ATTENDANCE_STATUS_CODES.map(code => ({label: LABEL[code], value: code})),
  ];
  const teacherOptions = [
    {label: t('staffAttendance_allTeachers'), value: ALL},
    ...(teachersPage?.items ?? []).map(tch => ({label: tch.name, value: tch.id})),
  ];
  const checkedInAbsentActive = teacherStatusFilter === 'PRESENT' && adminStatusFilter === 'ABSENT';

  const chip = (label: string, active: boolean, onPress: () => void, key?: string): React.JSX.Element => (
    <Pressable
      key={key ?? label}
      onPress={onPress}
      style={[
        styles.chip,
        {
          borderColor: active ? theme.colors.primary : theme.colors.border,
          backgroundColor: active ? theme.colors.primary : theme.colors.surface,
        },
      ]}>
      <AppText variant="label" color={active ? 'onPrimary' : 'textSecondary'}>
        {label}
      </AppText>
    </Pressable>
  );

  // ---- Edit admin status ----
  const openUpdateModal = (record: StaffAttendanceRecord): void => {
    setCorrectionError(undefined);
    setSelectedStatus(record.adminStatus ?? record.status);
    setUpdateTarget(record);
  };
  const closeUpdateModal = (): void => {
    setUpdateTarget(null);
    setSelectedStatus(null);
    setCorrectionError(undefined);
  };
  const confirmUpdate = (): void => {
    if (!updateTarget || !selectedStatus || selectedStatus === updateTarget.adminStatus) {
      return;
    }
    setCorrectionError(undefined);
    correctMutation.mutate(
      {recordId: updateTarget.id, status: selectedStatus},
      {
        onSuccess: () => closeUpdateModal(),
        onError: (e: Error & {code?: string}) => {
          setCorrectionError(e.message);
          if (e.code === 'RECORD_NOT_FOUND') {
            dayQuery.refetch();
            historyQuery.refetch();
          }
        },
      },
    );
  };

  const onDayRowPress = (row: DayRow): void => {
    if (row.record) {
      openUpdateModal(row.record);
    } else {
      // Nothing recorded yet — PATCH needs a record, so mark it from the bulk screen for that date.
      navigation.navigate(ScreenNames.MarkStaffAttendance, {date: dayDate});
    }
  };

  const errorState = (error: unknown, retry: () => void): React.JSX.Element => (
    <EmptyState
      icon="warning"
      title={t('common_somethingWentWrong')}
      message={(error as {message?: string} | null)?.message ?? t('common_checkConnection')}
      actionLabel={t('common_retry')}
      onAction={retry}
    />
  );

  return (
    <Screen padded={false} style={theme.dark ? undefined : {backgroundColor: '#F5F7FB'}}>
      <CustomHeader
        title={route.params?.teacherName ?? t('staffAttendance_registerTitle')}
        onBack={() => navigation.goBack()}
        actions={[{icon: 'attendance', onPress: () => navigation.navigate(ScreenNames.MarkStaffAttendance, {date: dayDate})}]}
      />

      <View style={styles.segmentBar}>
        {(
          [
            ['day', t('staffAttendance_modeDay')],
            ['history', t('staffAttendance_modeHistory')],
          ] as [Mode, string][]
        ).map(([key, label]) => (
          <Pressable
            key={key}
            onPress={() => setMode(key)}
            style={[styles.segmentItem, mode === key ? styles.segmentItemActive : null]}>
            <AppText variant="label" color={mode === key ? 'primary' : 'textSecondary'}>
              {label}
            </AppText>
          </Pressable>
        ))}
      </View>

      {mode === 'day' ? (
        <>
          <View style={styles.filterSection}>
            <DatePicker value={dayDate} onChange={setDayDate} valueStyle={styles.filterValueText} />
            <View style={styles.chipsRow}>
              {DAY_CHIPS.map(c => chip(c.label, dayChip === c.key, () => setDayChip(c.key), c.key))}
            </View>
          </View>
          {dayQuery.isError ? (
            errorState(dayQuery.error, () => dayQuery.refetch())
          ) : dayQuery.isLoading || teachersLoading ? (
            <Loader message={t('staffAttendance_loadingRecords')} />
          ) : (
            <FlatList
              data={visibleDayRows}
              keyExtractor={item => item.teacherId}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              refreshing={dayQuery.isRefetching}
              onRefresh={() => dayQuery.refetch()}
              renderItem={({item}) => (
                <StaffAttendanceRow
                  teacherName={item.teacherName}
                  employeeId={item.employeeId}
                  record={item.record}
                  onPress={() => onDayRowPress(item)}
                />
              )}
              ListEmptyComponent={
                <EmptyState
                  icon="attendance"
                  title={t('staffAttendance_noRecordsTitle')}
                  message={t('staffAttendance_dayEmptyMessage', {date: formatDate(`${dayDate}T00:00:00`)})}
                />
              }
            />
          )}
        </>
      ) : (
        <>
          <View style={styles.filterSection}>
            <CustomCard style={styles.filterCard}>
              <Row gap={theme.spacing.sm} align="flex-start">
                <View style={styles.filterItem}>
                  <Select
                    label={t('staffAttendance_finalStatus')}
                    value={statusFilter}
                    options={statusOptions}
                    onChange={val => {
                      setStatusFilter(val as StatusFilter);
                      setPage(1);
                    }}
                    valueStyle={styles.filterValueText}
                  />
                </View>
                <View style={styles.filterItem}>
                  <Select
                    label={t('staffAttendance_selfCheckIn')}
                    value={teacherStatusFilter}
                    options={statusOptions}
                    onChange={val => {
                      setTeacherStatusFilter(val as StatusFilter);
                      setPage(1);
                    }}
                    valueStyle={styles.filterValueText}
                  />
                </View>
                <View style={styles.filterItem}>
                  <Select
                    label={t('staffAttendance_adminMark')}
                    value={adminStatusFilter}
                    options={statusOptions}
                    onChange={val => {
                      setAdminStatusFilter(val as StatusFilter);
                      setPage(1);
                    }}
                    valueStyle={styles.filterValueText}
                  />
                </View>
              </Row>
              <Row gap={theme.spacing.sm} align="flex-start">
                <View style={styles.filterItem}>
                  <DatePicker
                    label={t('attendanceReport_fromDate')}
                    value={fromDate}
                    onChange={d => {
                      setFromDate(d);
                      setToDate(prev => (d > prev ? d : prev));
                      setPage(1);
                    }}
                    valueStyle={styles.filterValueText}
                  />
                </View>
                <View style={styles.filterItem}>
                  <DatePicker
                    label={t('attendanceReport_toDate')}
                    value={toDate}
                    onChange={d => {
                      setToDate(d);
                      setFromDate(prev => (d < prev ? d : prev));
                      setPage(1);
                    }}
                    valueStyle={styles.filterValueText}
                  />
                </View>
              </Row>
              <Select
                label={t('staffAttendance_filterByTeacher')}
                value={teacherFilter}
                options={teacherOptions}
                onChange={val => {
                  setTeacherFilter(val);
                  setPage(1);
                }}
                valueStyle={styles.filterValueText}
              />
              <View style={styles.chipsRow}>
                {chip(t('staffAttendance_chipCheckedInAbsent'), checkedInAbsentActive, () => {
                  if (checkedInAbsentActive) {
                    setTeacherStatusFilter(ALL);
                    setAdminStatusFilter(ALL);
                  } else {
                    setTeacherStatusFilter('PRESENT');
                    setAdminStatusFilter('ABSENT');
                  }
                  setPage(1);
                })}
              </View>
            </CustomCard>
          </View>

          {historyQuery.isError ? (
            errorState(historyQuery.error, () => historyQuery.refetch())
          ) : historyQuery.isLoading || !historyQuery.data ? (
            <Loader message={t('staffAttendance_loadingRecords')} />
          ) : (
            <FlatList
              data={historyQuery.data.items}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              refreshing={historyQuery.isRefetching}
              onRefresh={() => historyQuery.refetch()}
              renderItem={({item}) => (
                <StaffAttendanceRow
                  teacherName={item.teacherName}
                  employeeId={item.employeeId}
                  record={item}
                  showDate
                  onPress={() => openUpdateModal(item)}
                />
              )}
              ListEmptyComponent={
                <EmptyState
                  icon="attendance"
                  title={t('staffAttendance_noRecordsTitle')}
                  message={t('staffAttendance_noRecordsMessage')}
                />
              }
              ListFooterComponent={
                historyQuery.data.items.length > 0 ? (
                  <>
                    <Spacer size={8} />
                    <Pagination page={historyQuery.data.page} totalPages={historyQuery.data.totalPages} onChange={setPage} />
                  </>
                ) : null
              }
            />
          )}
        </>
      )}

      <CustomModal visible={!!updateTarget} onClose={closeUpdateModal} title={t('staffAttendance_editAdminTitle')}>
        {updateTarget ? (
          <>
            <AppText variant="bodyBold" numberOfLines={1}>
              {updateTarget.teacherName}
            </AppText>
            <AppText variant="label" color="textSecondary" numberOfLines={1}>
              {updateTarget.employeeId} · {formatDate(`${updateTarget.date.slice(0, 10)}T00:00:00`)}
            </AppText>
            <AppText variant="caption" color="textMuted">
              {updateTarget.teacherStatus
                ? t('staffAttendance_selfLine', {
                    status: LABEL[updateTarget.teacherStatus],
                    time: updateTarget.teacherMarkedAt ? formatTime12h(updateTarget.teacherMarkedAt) : '—',
                  })
                : t('staffAttendance_selfNone')}
            </AppText>
            <AppText variant="label" color="textSecondary">
              {t('staffAttendance_selectStatus')}
            </AppText>
            <Row gap={theme.spacing.xs} wrap style={{rowGap: theme.spacing.xs}}>
              {ATTENDANCE_STATUS_CODES.map(code => {
                const isSelected = selectedStatus === code;
                const tone = ATTENDANCE_STATUS_TONE[code];
                const color = theme.colors[tone === 'neutral' ? 'textMuted' : tone];
                return (
                  <Pressable
                    key={code}
                    onPress={() => setSelectedStatus(code)}
                    style={[
                      styles.correctionPill,
                      {
                        backgroundColor: isSelected ? color : color + '18',
                        borderWidth: isSelected ? 0 : 1,
                        borderColor: color + '55',
                      },
                    ]}>
                    <AppText variant="label" style={{color: isSelected ? theme.colors.onPrimary : color}}>
                      {LABEL[code]}
                    </AppText>
                  </Pressable>
                );
              })}
            </Row>
            <AppText variant="caption" color="textMuted">
              {t('staffAttendance_editAdminHint')}
            </AppText>
          </>
        ) : null}
        {correctionError ? (
          <AppText variant="caption" color="error">
            {correctionError}
          </AppText>
        ) : null}
        <Row gap={theme.spacing.sm}>
          <View style={styles.modalButtonWrap}>
            <CustomButton title={t('common_cancel')} variant="outline" size="sm" onPress={closeUpdateModal} />
          </View>
          <View style={styles.modalButtonWrap}>
            <CustomButton
              title={t('common_confirm')}
              size="sm"
              loading={correctMutation.isPending}
              disabled={!updateTarget || !selectedStatus || selectedStatus === updateTarget.adminStatus}
              onPress={confirmUpdate}
            />
          </View>
        </Row>
      </CustomModal>
    </Screen>
  );
}
