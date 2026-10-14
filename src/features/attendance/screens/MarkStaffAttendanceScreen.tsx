/**
 * Mark Staff Attendance (Admin) — pick a date, quick-tap each teacher's status, save in bulk.
 *
 * This sets the ADMIN status, which becomes the final one; teachers' own check-ins are kept.
 * Each teacher pre-fills from the admin's existing mark, else their own check-in (so checked-in
 * teachers default to Present), else stays unset. Only new / changed marks are submitted.
 */
import React, {useEffect, useState} from 'react';
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
  CustomButton,
  DatePicker,
  SearchBar,
  ResultModal,
  Loader,
  EmptyState,
  Row,
  Spacer,
  Divider,
  Icon,
} from '../../../shared/components';
import {formatTime12h} from '../../../core/utils/format';
import {useTeachers} from '../../teachers/teachers.service';
import {useStaffAttendanceList, useMarkStaffAttendance} from '../adminTeacherAttendance.service';
import type {AdminStackParamList} from '../../../navigation/types';
import type {AttendanceStatusCode, StaffAttendanceRecord} from '../../../shared/types';

type Nav = NativeStackNavigationProp<AdminStackParamList>;

const STATUS_CODES: AttendanceStatusCode[] = ['PRESENT', 'ABSENT', 'LATE', 'LEAVE', 'HOLIDAY'];

const STATUS_TONE: Record<AttendanceStatusCode, 'success' | 'error' | 'warning' | 'info' | 'textMuted'> = {
  PRESENT: 'success',
  ABSENT: 'error',
  LATE: 'warning',
  LEAVE: 'info',
  HOLIDAY: 'textMuted',
};

/** Local "YYYY-MM-DD" (toISOString is UTC — early morning in IST it would still be yesterday). */
function todayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function MarkStaffAttendanceScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const navigation = useNavigation<Nav>();
  const {t} = useLanguage();

  const route = useRoute<RouteProp<AdminStackParamList, 'MarkStaffAttendance'>>();
  const [selectedDate, setSelectedDate] = useState(route.params?.date ?? todayIso());
  /** Teacher id → status chosen (or pre-filled); absent = not set, won't be submitted. */
  const [statuses, setStatuses] = useState<Record<string, AttendanceStatusCode>>({});
  const [result, setResult] = useState<{variant: 'success' | 'error'; message?: string} | null>(null);
  const [search, setSearch] = useState('');

  const {data: teachersPage, isLoading: teachersLoading, isError, error, refetch} = useTeachers({status: 'ACTIVE', pageSize: 100});
  const {data: existing, isLoading: existingLoading} = useStaffAttendanceList({
    date: selectedDate,
    pageSize: 100,
  });
  const markAttendance = useMarkStaffAttendance();

  const teachers = teachersPage?.items ?? [];

  const STATUS_ABBR: Record<AttendanceStatusCode, string> = {
    PRESENT: t('markAttendance_presentAbbr'),
    ABSENT: t('markAttendance_absentAbbr'),
    LATE: t('markAttendance_lateAbbr'),
    LEAVE: t('markAttendance_leaveAbbr'),
    HOLIDAY: t('markAttendance_holidayAbbr'),
  };
  const STATUS_LABEL: Record<AttendanceStatusCode, string> = {
    PRESENT: t('markAttendance_presentLabel'),
    ABSENT: t('markAttendance_absentLabel'),
    LATE: t('markAttendance_lateLabel'),
    LEAVE: t('attendanceReport_leave'),
    HOLIDAY: t('attendance_holiday'),
  };

  const styles = useThemedStyles(t2 => ({
    scrollContent: {padding: t2.spacing.lg},
    summaryRow: {marginBottom: t2.spacing.md},
    summaryItem: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: t2.spacing.xs,
      borderRadius: t2.radius.md,
    },
    teacherInfo: {flex: 1},
    optionButton: {
      width: 40,
      height: 36,
      borderRadius: t2.components.button.radius,
      alignItems: 'center',
      justifyContent: 'center',
    },
  }));

  const recordByTeacher = new Map<string, StaffAttendanceRecord>((existing?.items ?? []).map(r => [r.teacherId, r]));

  useEffect(() => {
    if (teachersPage && !existingLoading) {
      const next: Record<string, AttendanceStatusCode> = {};
      teachersPage.items.forEach(tch => {
        const record = existing?.items.find(r => r.teacherId === tch.id);
        const prefill = record?.adminStatus ?? record?.teacherStatus;
        if (prefill) {
          next[tch.id] = prefill;
        }
      });
      setStatuses(next);
    }
  }, [selectedDate, teachersPage, existing, existingLoading]);

  /** Only marks that are new or differ from the admin's current one — re-sending unchanged marks would just re-stamp who/when. */
  const changedEntries = Object.entries(statuses).filter(
    ([teacherId, status]) => recordByTeacher.get(teacherId)?.adminStatus !== status,
  );
  const unsetCount = teachers.filter(tch => !statuses[tch.id]).length;

  const setStatus = (teacherId: string, status: AttendanceStatusCode): void => {
    setStatuses(prev => ({...prev, [teacherId]: status}));
  };

  const counts: Record<AttendanceStatusCode, number> = {PRESENT: 0, ABSENT: 0, LATE: 0, LEAVE: 0, HOLIDAY: 0};
  Object.values(statuses).forEach(status => {
    counts[status] += 1;
  });

  const query = search.trim().toLowerCase();
  const filteredTeachers = query
    ? teachers.filter(tch => tch.name.toLowerCase().includes(query) || tch.employeeId.toLowerCase().includes(query))
    : teachers;

  const onSave = (): void => {
    markAttendance.mutate(
      {
        date: selectedDate,
        records: changedEntries.map(([teacherId, status]) => ({teacherId, status})),
      },
      {
        onSuccess: () => setResult({variant: 'success'}),
        onError: (e: Error) => setResult({variant: 'error', message: e.message}),
      },
    );
  };

  return (
    <Screen padded={false}>
      <CustomHeader title={t('staffAttendance_markTitle')} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <DatePicker label={t('markAttendance_date')} value={selectedDate} onChange={setSelectedDate} />
        <Row gap={6} align="flex-start" style={{marginBottom: theme.spacing.md}}>
          <Icon name="info" size={14} color={theme.colors.info} />
          <AppText variant="caption" color="textSecondary" style={{flex: 1}}>
            {t('staffAttendance_markHelp')}
          </AppText>
        </Row>

        {isError ? (
          <EmptyState
            icon="warning"
            title={t('common_somethingWentWrong')}
            message={(error as {message?: string} | null)?.message ?? t('common_checkConnection')}
            actionLabel={t('common_retry')}
            onAction={() => refetch()}
          />
        ) : teachersLoading || existingLoading ? (
          <Loader message={t('staffAttendance_loadingTeachers')} />
        ) : teachers.length === 0 ? (
          <EmptyState
            icon="teacher"
            title={t('staffAttendance_noTeachersTitle')}
            message={t('staffAttendance_noTeachersMessage')}
          />
        ) : (
          <>
            <Row gap={theme.spacing.xs} style={styles.summaryRow}>
              {STATUS_CODES.map(code => {
                const color = theme.colors[STATUS_TONE[code]];
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

            <SearchBar value={search} onChangeText={setSearch} placeholder={t('staffAttendance_searchTeachersPlaceholder')} />
            <Spacer size={theme.spacing.md} />

            {filteredTeachers.length === 0 ? (
              <EmptyState
                icon="search"
                title={t('studentsWiseClassList_noResultsTitle')}
                message={t('studentsWiseClassList_noResultsMessage')}
              />
            ) : (
              <CustomCard>
                {filteredTeachers.map((tch, i) => (
                  <View key={tch.id}>
                    {i > 0 ? <Divider /> : null}
                    <Row justify="space-between" gap={theme.spacing.sm}>
                      <View style={styles.teacherInfo}>
                        <AppText variant="bodyBold" numberOfLines={1}>
                          {tch.name}
                        </AppText>
                        <AppText variant="caption" color="textSecondary">
                          {t('staffAttendance_employeeIdLabel', {employeeId: tch.employeeId})}
                        </AppText>
                        {/* Who already checked in themselves — so the admin knows before marking. */}
                        {(() => {
                          const rec = recordByTeacher.get(tch.id);
                          return rec?.teacherStatus ? (
                            <AppText variant="label" color="success" numberOfLines={1}>
                              {rec.teacherMarkedAt
                                ? t('staffAttendance_checkedInAt', {time: formatTime12h(rec.teacherMarkedAt)})
                                : t('staffAttendance_selfLine', {status: STATUS_LABEL[rec.teacherStatus], time: '—'})}
                            </AppText>
                          ) : (
                            <AppText variant="label" color="textMuted">
                              {t('staffAttendance_notCheckedIn')}
                            </AppText>
                          );
                        })()}
                      </View>
                      <Row gap={4}>
                        {STATUS_CODES.map(code => {
                          const isSelected = statuses[tch.id] === code;
                          const color = theme.colors[STATUS_TONE[code]];
                          return (
                            <Pressable
                              key={code}
                              onPress={() => setStatus(tch.id, code)}
                              style={[
                                styles.optionButton,
                                {
                                  backgroundColor: isSelected ? color : color + '18',
                                  borderWidth: isSelected ? 0 : 1.5,
                                  borderColor: color + '55',
                                },
                              ]}>
                              <AppText variant="button" style={{color: isSelected ? theme.colors.onPrimary : color, fontSize: 12}}>
                                {STATUS_ABBR[code]}
                              </AppText>
                            </Pressable>
                          );
                        })}
                      </Row>
                    </Row>
                  </View>
                ))}
              </CustomCard>
            )}

            <Spacer size={16} />
            {unsetCount > 0 ? (
              <AppText variant="caption" color="textMuted" center style={{marginBottom: theme.spacing.sm}}>
                {t('staffAttendance_unsetCount', {count: unsetCount})}
              </AppText>
            ) : null}
            <CustomButton
              title={
                changedEntries.length > 0
                  ? t('staffAttendance_saveCount', {count: changedEntries.length})
                  : t('markAttendance_saveAttendance')
              }
              iconLeft="check"
              loading={markAttendance.isPending}
              disabled={changedEntries.length === 0}
              onPress={onSave}
            />
          </>
        )}
        <Spacer size={24} />
      </ScrollView>

      <ResultModal
        visible={!!result}
        variant={result?.variant ?? 'success'}
        title={result?.variant === 'error' ? t('markAttendance_saveErrorTitle') : t('markAttendance_saveSuccessTitle')}
        message={result?.variant === 'error' ? result.message : t('markAttendance_saveSuccessMessage')}
        onClose={() => setResult(null)}
      />
    </Screen>
  );
}
