/** One student's attendance history (Class Teacher only) — date range, summary, tap a record to correct it inline. */
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
  Badge,
  Loader,
  EmptyState,
  Row,
  Spacer,
  Divider,
} from '../../../shared/components';
import type {BadgeTone} from '../../../shared/components';
import {DateRangeFilter} from './AttendanceReportScreen';
import {formatDate} from '../../../core/utils/format';
import {useStudentAttendanceHistory, useCorrectAttendanceRecord} from '../teacherAttendance.service';
import type {TeacherStackParamList} from '../../../navigation/types';
import type {AttendanceStatusCode} from '../../../shared/types';

type Nav = NativeStackNavigationProp<TeacherStackParamList>;

const STATUS_CODES: AttendanceStatusCode[] = ['PRESENT', 'ABSENT', 'LATE', 'LEAVE', 'HOLIDAY'];

const STATUS_TONE: Record<AttendanceStatusCode, BadgeTone> = {
  PRESENT: 'success',
  ABSENT: 'error',
  LATE: 'warning',
  LEAVE: 'info',
  HOLIDAY: 'neutral',
};

function isoDaysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function SummaryStat({label, value, color}: {label: string; value: number; color: string}): React.JSX.Element {
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

export function StudentAttendanceHistoryScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<TeacherStackParamList, 'StudentAttendanceHistory'>>();
  const {studentId, studentName} = route.params;

  const [fromDate, setFromDate] = useState(isoDaysAgo(30));
  const [toDate, setToDate] = useState(todayIso());
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [correctionError, setCorrectionError] = useState<string | undefined>();

  const {data, isLoading, isError, error, refetch} = useStudentAttendanceHistory(studentId, fromDate, toDate);
  const correctMutation = useCorrectAttendanceRecord();

  const STATUS_LABEL: Record<AttendanceStatusCode, string> = {
    PRESENT: t('markAttendance_presentLabel'),
    ABSENT: t('markAttendance_absentLabel'),
    LATE: t('markAttendance_lateLabel'),
    LEAVE: t('attendanceReport_leave'),
    HOLIDAY: t('attendance_holiday'),
  };

  const styles = useThemedStyles(t2 => ({
    scrollContent: {
      padding: t2.spacing.lg,
    },
    summaryCard: {
      marginBottom: t2.spacing.md,
    },
    recordRow: {
      paddingVertical: t2.spacing.sm,
    },
  }));

  const onCorrect = (recordId: string, status: AttendanceStatusCode): void => {
    setCorrectionError(undefined);
    correctMutation.mutate(
      {recordId, status},
      {
        onSuccess: () => setEditingRecordId(null),
        onError: (e: Error) => setCorrectionError(e.message),
      },
    );
  };

  return (
    <Screen padded={false}>
      <CustomHeader
        title={studentName ?? t('studentAttendanceHistory_title')}
        onBack={() => navigation.goBack()}
      />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <DateRangeFilter
          fromDate={fromDate}
          toDate={toDate}
          onChange={(f, tD) => {
            setFromDate(f);
            setToDate(tD);
            setEditingRecordId(null);
          }}
        />

        {isError ? (
          <EmptyState
            icon="warning"
            title={t('common_somethingWentWrong')}
            message={(error as {message?: string} | null)?.message ?? t('common_checkConnection')}
            actionLabel={t('common_retry')}
            onAction={() => refetch()}
          />
        ) : isLoading || !data ? (
          <Loader message={t('studentAttendanceHistory_loading')} />
        ) : (
          <>
            <CustomCard style={styles.summaryCard}>
              <Row justify="space-around">
                <SummaryStat label={STATUS_LABEL.PRESENT} value={data.summary.present} color={theme.colors.success} />
                <SummaryStat label={STATUS_LABEL.ABSENT} value={data.summary.absent} color={theme.colors.error} />
                <SummaryStat label={STATUS_LABEL.LATE} value={data.summary.late} color={theme.colors.warning} />
                <SummaryStat label={STATUS_LABEL.LEAVE} value={data.summary.leave} color={theme.colors.info} />
                <SummaryStat label={STATUS_LABEL.HOLIDAY} value={data.summary.holiday} color={theme.colors.textMuted} />
              </Row>
            </CustomCard>

            {correctionError ? (
              <AppText variant="caption" color="error" style={{marginBottom: theme.spacing.sm}}>
                {correctionError}
              </AppText>
            ) : null}

            {data.records.length === 0 ? (
              <EmptyState
                icon="attendance"
                title={t('studentAttendanceHistory_noRecords')}
                message={t('studentAttendanceHistory_noRecordsMessage')}
              />
            ) : (
              <CustomCard padded={false} style={{paddingHorizontal: theme.spacing.lg}}>
                {[...data.records]
                  .reverse()
                  .map((record, i) => (
                    <View key={record.id}>
                      {i > 0 ? <Divider /> : null}
                      <Pressable
                        onPress={() => setEditingRecordId(prev => (prev === record.id ? null : record.id))}
                        style={styles.recordRow}>
                        <Row justify="space-between" align="center">
                          <AppText variant="bodyBold">{formatDate(record.date)}</AppText>
                          <Badge label={STATUS_LABEL[record.status]} tone={STATUS_TONE[record.status]} />
                        </Row>
                        {editingRecordId === record.id ? (
                          <>
                            <Spacer size={theme.spacing.sm} />
                            <Row gap={theme.spacing.sm} wrap>
                              {STATUS_CODES.map(code => {
                                const isSelected = record.status === code;
                                const color = theme.colors[STATUS_TONE[code] === 'neutral' ? 'textMuted' : STATUS_TONE[code]];
                                return (
                                  <Pressable
                                    key={code}
                                    onPress={() => onCorrect(record.id, code)}
                                    style={{
                                      paddingHorizontal: theme.spacing.sm,
                                      paddingVertical: theme.spacing.xs,
                                      borderRadius: theme.radius.pill,
                                      backgroundColor: isSelected ? color : color + '18',
                                      borderWidth: isSelected ? 0 : 1,
                                      borderColor: color + '55',
                                    }}>
                                    <AppText variant="caption" style={{color: isSelected ? theme.colors.onPrimary : color}}>
                                      {STATUS_LABEL[code]}
                                    </AppText>
                                  </Pressable>
                                );
                              })}
                            </Row>
                          </>
                        ) : null}
                      </Pressable>
                    </View>
                  ))}
              </CustomCard>
            )}
          </>
        )}
        <Spacer size={24} />
      </ScrollView>
    </Screen>
  );
}
