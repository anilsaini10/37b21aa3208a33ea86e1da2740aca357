/** Attendance Register (Admin) — filterable, paginated staff attendance history; tap a card to update its status via a modal. */
import React, {useState} from 'react';
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
import type {BadgeTone} from '../../../shared/components';
import {formatDate} from '../../../core/utils/format';
import {useTeachers} from '../../teachers/teachers.service';
import {useStaffAttendanceList, useCorrectStaffAttendance} from '../adminTeacherAttendance.service';
import type {AdminStackParamList} from '../../../navigation/types';
import type {AttendanceStatusCode, StaffAttendanceRecord} from '../../../shared/types';

type Nav = NativeStackNavigationProp<AdminStackParamList>;
type TabValue = AttendanceStatusCode | 'ALL';

const TABS: TabValue[] = ['ALL', 'PRESENT', 'ABSENT', 'LATE', 'LEAVE', 'HOLIDAY'];
const STATUS_CODES: AttendanceStatusCode[] = ['PRESENT', 'ABSENT', 'LATE', 'LEAVE', 'HOLIDAY'];

// Local to this screen's badge/pill colours only — matches the requested
// green/red/orange/blue palette using existing theme tone tokens.
const STATUS_TONE: Record<AttendanceStatusCode, BadgeTone> = {
  PRESENT: 'success',
  ABSENT: 'error',
  LATE: 'info',
  LEAVE: 'warning',
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

function StatusBadge({label, tone}: {label: string; tone: BadgeTone}): React.JSX.Element {
  const {theme} = useTheme();
  const color = theme.colors[tone === 'neutral' ? 'textMuted' : tone];
  const styles = useThemedStyles(() => ({
    badge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
    },
  }));
  return (
    <View style={[styles.badge, {backgroundColor: color + '1F'}]}>
      <AppText variant="label" style={{color, fontWeight: '600'}}>
        {label}
      </AppText>
    </View>
  );
}

function AttendanceRecordCard({
  record,
  statusLabel,
  onPress,
}: {
  record: StaffAttendanceRecord;
  statusLabel: string;
  onPress: () => void;
}): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const styles = useThemedStyles(t2 => ({
    card: {
      backgroundColor: t2.colors.card,
      borderRadius: 16,
      padding: 12,
      marginVertical: 6,
      shadowColor: t2.colors.shadow,
      shadowOpacity: theme.dark ? 0.28 : 0.06,
      shadowRadius: 8,
      shadowOffset: {width: 0, height: 2},
      elevation: 2,
    },
    nameBlock: {flex: 1, paddingRight: t2.spacing.sm},
    name: {
      fontSize: t2.typography.fontSize.sm,
      fontFamily: t2.typography.fontFamily.semibold,
      fontWeight: t2.typography.fontWeight.semibold,
    },
    // One size-step below the name, so the hierarchy reads name > meta > marked-by at a glance.
    meta: {
      fontSize: t2.typography.fontSize.xs,
      fontFamily: t2.typography.fontFamily.medium,
      fontWeight: t2.typography.fontWeight.medium,
    },
    markedBy: {
      fontSize: t2.typography.fontSize.xs,
      fontFamily: t2.typography.fontFamily.regular,
      fontWeight: t2.typography.fontWeight.regular,
    },
  }));

  return (
    <Pressable
      onPress={onPress}
      android_ripple={{color: theme.colors.divider}}
      style={({pressed}) => [styles.card, {opacity: pressed ? 0.85 : 1}]}>
      <Row justify="space-between" align="flex-start">
        <View style={styles.nameBlock}>
          <AppText style={styles.name} numberOfLines={1}>
            {record.teacherName}
          </AppText>
        </View>
        <StatusBadge label={statusLabel} tone={STATUS_TONE[record.status]} />
      </Row>
      <Spacer size={3} />
      <AppText style={styles.meta} color="textSecondary" numberOfLines={1}>
        {record.employeeId} · {formatDate(record.date)}
      </AppText>
      <Spacer size={3} />
      <AppText style={styles.markedBy} color="textMuted" numberOfLines={1}>
        {t('staffAttendance_markedBy', {name: record.markedBy.name})}
      </AppText>
    </Pressable>
  );
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
  const [updateTarget, setUpdateTarget] = useState<StaffAttendanceRecord | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<AttendanceStatusCode | null>(null);
  const [correctionError, setCorrectionError] = useState<string | undefined>();

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

  const statusOptions = TABS.map(value => ({
    label: value === 'ALL' ? t('common_all') : STATUS_LABEL[value],
    value,
  }));

  const styles = useThemedStyles(t2 => ({
    filterSection: {paddingHorizontal: 16, paddingTop: 16},
    filterCard: {
      borderRadius: 7,
      padding: 16,
      borderColor: 'transparent',
      shadowColor: t2.colors.shadow,
      shadowOpacity: theme.dark ? 0.25 : 0.05,
      shadowRadius: 10,
      shadowOffset: {width: 0, height: 3},
      elevation: 2,
    },
    filterItem: {flex: 1},
    listContent: {padding: 16, paddingTop: 12, flexGrow: 1},
    modalButtonWrap: {
      flex: 1,
    },
    modalButton: {height: 35, width: 120,
      alignSelf:"center"
    },
    correctionPill: {
      paddingHorizontal: t2.spacing.sm,
      paddingVertical: 5,
      borderRadius: t2.radius.pill,
    },
    modalTeacherName: {
      fontSize: t2.typography.fontSize.sm,
      fontFamily: t2.typography.fontFamily.semibold,
      fontWeight: t2.typography.fontWeight.semibold,
    },
    modalMeta: {
      fontSize: t2.typography.fontSize.xs,
      fontFamily: t2.typography.fontFamily.medium,
      fontWeight: t2.typography.fontWeight.medium,
    },
    filterValueText: {
      fontSize: t2.typography.fontSize.sm,
    },
  }));

  const openUpdateModal = (record: StaffAttendanceRecord): void => {
    setCorrectionError(undefined);
    setSelectedStatus(record.status);
    setUpdateTarget(record);
  };

  const closeUpdateModal = (): void => {
    setUpdateTarget(null);
    setSelectedStatus(null);
    setCorrectionError(undefined);
  };

  const confirmUpdate = (): void => {
    if (!updateTarget || !selectedStatus || selectedStatus === updateTarget.status) {
      return;
    }
    setCorrectionError(undefined);
    correctMutation.mutate(
      {recordId: updateTarget.id, status: selectedStatus},
      {
        onSuccess: () => closeUpdateModal(),
        onError: (e: Error) => setCorrectionError(e.message),
      },
    );
  };

  return (
    <Screen padded={false} style={theme.dark ? undefined : {backgroundColor: '#F5F7FB'}}>
      <CustomHeader title={t('staffAttendance_registerTitle')} onBack={() => navigation.goBack()} />

      <View style={styles.filterSection}>
        <CustomCard style={styles.filterCard}>
          <Row gap={theme.spacing.sm} align="flex-start">
            <View style={styles.filterItem}>
              <Select
                label={t('common_status')}
                value={statusFilter}
                options={statusOptions}
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
        </CustomCard>
      </View>

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
      ) : (
        <FlatList
          data={data.items}
          keyExtractor={(item: StaffAttendanceRecord) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({item}) => (
            <AttendanceRecordCard
              record={item}
              statusLabel={STATUS_LABEL[item.status]}
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
            data.items.length > 0 ? (
              <>
                <Spacer size={8} />
                <Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} />
              </>
            ) : null
          }
        />
      )}

      <CustomModal visible={!!updateTarget} onClose={closeUpdateModal} title={t('staffAttendance_confirmChangeTitle')}>
        {updateTarget ? (
          <>
            <AppText style={styles.modalTeacherName} numberOfLines={1}>
              {updateTarget.teacherName}
            </AppText>
            {/* <Spacer size={5} /> */}
            <AppText style={styles.modalMeta} color="textSecondary" numberOfLines={1}>
              {updateTarget.employeeId} · {formatDate(updateTarget.date)}
            </AppText>
            {/* <Spacer size={5} /> */}
            <AppText variant="label" color="textSecondary">
              {t('staffAttendance_selectStatus')}
            </AppText>
            {/* <Spacer size={5} /> */}
            <Row gap={theme.spacing.xs} wrap>
              {STATUS_CODES.map(code => {
                const isSelected = selectedStatus === code;
                const tone = STATUS_TONE[code];
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
                      {STATUS_LABEL[code]}
                    </AppText>
                  </Pressable>
                );
              })}
            </Row>
          </>
        ) : null}
        {correctionError ? (
          <AppText variant="caption" color="error" style={{marginTop: theme.spacing.sm}}>
            {correctionError}
          </AppText>
        ) : null}
        <Spacer size={5} />
        <Row gap={theme.spacing.sm}
        style={{
          alignSelf:'center',
          // justifyContent:"space-between"
        }}
        >
          <View style={styles.modalButtonWrap}>
            <CustomButton
              title={t('common_cancel')}
              variant="outline"
              size="sm"
              style={styles.modalButton}
              onPress={closeUpdateModal}
            />
          </View>
          <View style={styles.modalButtonWrap}>
            <CustomButton
              title={t('common_confirm')}
              size="sm"
              loading={correctMutation.isPending}
              style={styles.modalButton}
              disabled={!updateTarget || !selectedStatus || selectedStatus === updateTarget.status}
              onPress={confirmUpdate}
            />
          </View>
        </Row>
      </CustomModal>
    </Screen>
  );
}
