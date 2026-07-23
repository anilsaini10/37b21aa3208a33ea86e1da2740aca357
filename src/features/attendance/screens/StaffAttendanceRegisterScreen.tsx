/** Attendance Register (Admin) — filterable, paginated staff attendance history; tap a row to correct its status inline. */
import React, {useState} from 'react';
import {Pressable, View, ScrollView} from 'react-native';
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
  Badge,
  Pagination,
  Loader,
  EmptyState,
  Row,
  Spacer,
  Divider,
} from '../../../shared/components';
import type {BadgeTone} from '../../../shared/components';
import {DateRangeFilter} from './AttendanceReportScreen';
import {formatDate} from '../../../core/utils/format';
import {useTeachers} from '../../teachers/teachers.service';
import {useStaffAttendanceList, useCorrectStaffAttendance} from '../adminTeacherAttendance.service';
import type {AdminStackParamList} from '../../../navigation/types';
import type {AttendanceStatusCode, StaffAttendanceRecord} from '../../../shared/types';

type Nav = NativeStackNavigationProp<AdminStackParamList>;
type TabValue = AttendanceStatusCode | 'ALL';

const TABS: TabValue[] = ['ALL', 'PRESENT', 'ABSENT', 'LATE', 'LEAVE', 'HOLIDAY'];

const STATUS_TONE: Record<AttendanceStatusCode, BadgeTone> = {
  PRESENT: 'success',
  ABSENT: 'error',
  LATE: 'warning',
  LEAVE: 'info',
  HOLIDAY: 'neutral',
};

const ALL_TEACHERS_VALUE = '';

function isoDaysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function StaffAttendanceRegisterScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<AdminStackParamList, 'StaffAttendanceRegister'>>();

  const [statusFilter, setStatusFilter] = useState<TabValue>('ALL');
  const [teacherFilter, setTeacherFilter] = useState(route.params?.teacherId ?? ALL_TEACHERS_VALUE);
  const [fromDate, setFromDate] = useState(isoDaysAgo(30));
  const [toDate, setToDate] = useState(todayIso());
  const [page, setPage] = useState(1);
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [correctionError, setCorrectionError] = useState<string | undefined>();
  const [pendingChange, setPendingChange] = useState<{record: StaffAttendanceRecord; status: AttendanceStatusCode} | null>(
    null,
  );

  const {data: teachersPage} = useTeachers({pageSize: 100});
  const {data, isLoading, isError, error, refetch} = useStaffAttendanceList({
    page,
    pageSize: 15,
    from: fromDate,
    to: toDate,
    status: statusFilter === 'ALL' ? undefined : statusFilter,
    teacherId: teacherFilter || undefined,
  });
  const correctMutation = useCorrectStaffAttendance();

  const STATUS_LABEL: Record<AttendanceStatusCode, string> = {
    PRESENT: t('markAttendance_presentLabel'),
    ABSENT: t('markAttendance_absentLabel'),
    LATE: t('markAttendance_lateLabel'),
    LEAVE: t('attendanceReport_leave'),
    HOLIDAY: t('attendance_holiday'),
  };

  const teacherOptions = [
    {label: t('staffAttendance_allTeachers'), value: ALL_TEACHERS_VALUE},
    ...(teachersPage?.items ?? []).map(tch => ({label: tch.name, value: tch.id})),
  ];

  const styles = useThemedStyles(t2 => ({
    tabsWrap: {alignItems: 'center', paddingTop: t2.spacing.md},
    tabsContent: {columnGap: t2.spacing.sm, paddingHorizontal: t2.spacing.lg},
    tabPill: {
      paddingHorizontal: t2.spacing.lg,
      paddingVertical: t2.spacing.sm,
      borderRadius: t2.radius.pill,
    },
    filterRow: {paddingHorizontal: t2.spacing.lg},
    scrollContent: {padding: t2.spacing.lg},
    recordCard: {marginBottom: t2.spacing.md},
    recordRow: {paddingVertical: t2.spacing.xs},
    correctionPill: {
      paddingHorizontal: t2.spacing.sm,
      paddingVertical: t2.spacing.xs,
      borderRadius: t2.radius.pill,
    },
    modalButtonWrap: {flex: 1},
  }));

  const requestCorrect = (record: StaffAttendanceRecord, status: AttendanceStatusCode): void => {
    if (status === record.status) {
      return;
    }
    setCorrectionError(undefined);
    setPendingChange({record, status});
  };

  const confirmCorrect = (): void => {
    if (!pendingChange) {
      return;
    }
    setCorrectionError(undefined);
    correctMutation.mutate(
      {recordId: pendingChange.record.id, status: pendingChange.status},
      {
        onSuccess: () => {
          setPendingChange(null);
          setEditingRecordId(null);
        },
        onError: (e: Error) => setCorrectionError(e.message),
      },
    );
  };

  return (
    <Screen padded={false}>
      <CustomHeader title={t('staffAttendance_registerTitle')} onBack={() => navigation.goBack()} />
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

      <View style={styles.filterRow}>
        <DateRangeFilter
          fromDate={fromDate}
          toDate={toDate}
          onChange={(f, tD) => {
            setFromDate(f);
            setToDate(tD);
            setPage(1);
          }}
        />
        <Select
          label={t('staffAttendance_filterByTeacher')}
          value={teacherFilter}
          options={teacherOptions}
          onChange={val => {
            setTeacherFilter(val);
            setPage(1);
          }}
        />
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
          <Loader message={t('staffAttendance_loadingRecords')} />
        ) : data.items.length === 0 ? (
          <EmptyState
            icon="attendance"
            title={t('staffAttendance_noRecordsTitle')}
            message={t('staffAttendance_noRecordsMessage')}
          />
        ) : (
          <>
            {correctionError ? (
              <AppText variant="caption" color="error" style={{marginBottom: theme.spacing.sm}}>
                {correctionError}
              </AppText>
            ) : null}
            {data.items.map(record => (
              <CustomCard
                key={record.id}
                style={styles.recordCard}
                onPress={() => setEditingRecordId(prev => (prev === record.id ? null : record.id))}>
                <Row justify="space-between" align="center">
                  <View style={{flex: 1}}>
                    <AppText variant="bodyBold" numberOfLines={1}>
                      {record.teacherName}
                    </AppText>
                    <AppText variant="caption" color="textSecondary">
                      {formatDate(record.date)} · {record.employeeId}
                    </AppText>
                  </View>
                  <Badge label={STATUS_LABEL[record.status]} tone={STATUS_TONE[record.status]} />
                </Row>
                <Spacer size={4} />
                <AppText variant="label" color="textMuted">
                  {t('staffAttendance_markedBy', {name: record.markedBy.name})}
                </AppText>

                {editingRecordId === record.id ? (
                  <>
                    <Divider />
                    <Row gap={theme.spacing.sm} wrap>
                      {(['PRESENT', 'ABSENT', 'LATE', 'LEAVE', 'HOLIDAY'] as AttendanceStatusCode[]).map(code => {
                        const isSelected = record.status === code;
                        const color = theme.colors[STATUS_TONE[code] === 'neutral' ? 'textMuted' : STATUS_TONE[code]];
                        return (
                          <Pressable
                            key={code}
                            onPress={() => requestCorrect(record, code)}
                            style={[
                              styles.correctionPill,
                              {
                                backgroundColor: isSelected ? color : color + '18',
                                borderWidth: isSelected ? 0 : 1,
                                borderColor: color + '55',
                              },
                            ]}>
                            <AppText variant="caption" style={{color: isSelected ? theme.colors.onPrimary : color}}>
                              {STATUS_LABEL[code]}
                            </AppText>
                          </Pressable>
                        );
                      })}
                    </Row>
                  </>
                ) : null}
              </CustomCard>
            ))}
            <Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} />
          </>
        )}
        <Spacer size={24} />
      </ScrollView>

      <CustomModal
        visible={!!pendingChange}
        onClose={() => setPendingChange(null)}
        title={t('staffAttendance_confirmChangeTitle')}>
        {pendingChange ? (
          <AppText variant="body" color="textSecondary">
            {t('staffAttendance_confirmChangeMessage', {
              name: pendingChange.record.teacherName,
              date: formatDate(pendingChange.record.date),
              status: STATUS_LABEL[pendingChange.status],
            })}
          </AppText>
        ) : null}
        {correctionError ? (
          <AppText variant="caption" color="error" style={{marginTop: theme.spacing.sm}}>
            {correctionError}
          </AppText>
        ) : null}
        <Spacer size={16} />
        <Row gap={theme.spacing.md}>
          <View style={styles.modalButtonWrap}>
            <CustomButton title={t('common_cancel')} variant="outline" onPress={() => setPendingChange(null)} />
          </View>
          <View style={styles.modalButtonWrap}>
            <CustomButton
              title={t('common_confirm')}
              loading={correctMutation.isPending}
              onPress={confirmCorrect}
            />
          </View>
        </Row>
      </CustomModal>
    </Screen>
  );
}
