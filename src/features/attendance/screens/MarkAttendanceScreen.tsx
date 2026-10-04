/** Mark Attendance (Class Teacher only) — pick a date, quick-tap each student's status, save in bulk. */
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
  ResultModal,
  Loader,
  EmptyState,
  Row,
  Spacer,
  Divider,
} from '../../../shared/components';
import {useSectionAttendance, useMarkSectionAttendance} from '../teacherAttendance.service';
import type {TeacherStackParamList} from '../../../navigation/types';
import type {AttendanceStatusCode} from '../../../shared/types';

type Nav = NativeStackNavigationProp<TeacherStackParamList>;

const STATUS_CODES: AttendanceStatusCode[] = ['PRESENT', 'ABSENT', 'LATE', 'LEAVE', 'HOLIDAY'];

const STATUS_TONE: Record<AttendanceStatusCode, 'success' | 'error' | 'warning' | 'info' | 'textMuted'> = {
  PRESENT: 'success',
  ABSENT: 'error',
  LATE: 'warning',
  LEAVE: 'info',
  HOLIDAY: 'textMuted',
};

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function MarkAttendanceScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<TeacherStackParamList, 'MarkAttendance'>>();
  const {t} = useLanguage();
  const {className, sectionName, sectionId} = route.params;

  const [selectedDate, setSelectedDate] = useState(todayIso());
  const [statuses, setStatuses] = useState<Record<string, AttendanceStatusCode>>({});
  const [result, setResult] = useState<{variant: 'success' | 'error'; message?: string} | null>(null);

  const {data, isLoading, isError, error, refetch} = useSectionAttendance(sectionId, selectedDate);
  const markAttendance = useMarkSectionAttendance();

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
    scrollContent: {
      padding: t2.spacing.lg,
    },
    summaryRow: {
      marginBottom: t2.spacing.md,
    },
    summaryItem: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: t2.spacing.xs,
      borderRadius: t2.radius.md,
    },
    studentInfo: {
      flex: 1,
    },
    optionButton: {
      width: 40,
      height: 36,
      borderRadius: t2.components.button.radius,
      alignItems: 'center',
      justifyContent: 'center',
    },
  }));

  useEffect(() => {
    if (data) {
      const next: Record<string, AttendanceStatusCode> = {};
      data.students.forEach(s => {
        next[s.studentId] = s.status ?? 'PRESENT';
      });
      setStatuses(next);
    }
  }, [data]);

  const setStatus = (studentId: string, status: AttendanceStatusCode): void => {
    setStatuses(prev => ({...prev, [studentId]: status}));
  };

  const counts: Record<AttendanceStatusCode, number> = {PRESENT: 0, ABSENT: 0, LATE: 0, LEAVE: 0, HOLIDAY: 0};
  Object.values(statuses).forEach(status => {
    counts[status] += 1;
  });

  const onSave = (): void => {
    markAttendance.mutate(
      {
        sectionId,
        date: selectedDate,
        records: Object.entries(statuses).map(([studentId, status]) => ({studentId, status})),
      },
      {
        onSuccess: () => setResult({variant: 'success'}),
        onError: (e: Error) => setResult({variant: 'error', message: e.message}),
      },
    );
  };

  const notClassTeacher = isError && (error as {code?: string} | null)?.code === 'NOT_CLASS_TEACHER';

  return (
    <Screen padded={false}>
      <CustomHeader
        title={t('markAttendance_title')}
        subtitle={t('markAttendance_classSectionSubtitle', {className, sectionName})}
        onBack={() => navigation.goBack()}
      />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <DatePicker label={t('markAttendance_date')} value={selectedDate} onChange={setSelectedDate} />

        {notClassTeacher ? (
          <EmptyState
            icon="warning"
            title={t('markAttendance_notClassTeacherTitle')}
            message={t('markAttendance_notClassTeacherMessage')}
          />
        ) : isError ? (
          <EmptyState
            icon="warning"
            title={t('common_somethingWentWrong')}
            message={(error as {message?: string} | null)?.message ?? t('common_checkConnection')}
            actionLabel={t('common_retry')}
            onAction={() => refetch()}
          />
        ) : isLoading || !data ? (
          <Loader message={t('markAttendance_loadingStudents')} />
        ) : data.students.length === 0 ? (
          <EmptyState
            icon="students"
            title={t('markAttendance_noStudentsTitle')}
            message={t('markAttendance_noStudentsMessage')}
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

            <CustomCard>
              {data.students.map((student, i) => (
                <View key={student.studentId}>
                  {i > 0 ? <Divider /> : null}
                  <Row justify="space-between" gap={theme.spacing.sm}>
                    <View style={styles.studentInfo}>
                      <AppText variant="bodyBold" numberOfLines={1}>
                        {student.name}
                      </AppText>
                      <AppText variant="caption" color="textSecondary">
                        {t('markAttendance_rollNumber', {rollNo: String(student.rollNo)})}
                      </AppText>
                    </View>
                    <Row gap={4}>
                      {STATUS_CODES.map(code => {
                        const isSelected = statuses[student.studentId] === code;
                        const color = theme.colors[STATUS_TONE[code]];
                        return (
                          <Pressable
                            key={code}
                            onPress={() => setStatus(student.studentId, code)}
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

            <Spacer size={16} />
            <CustomButton
              title={t('markAttendance_saveAttendance')}
              iconLeft="check"
              loading={markAttendance.isPending}
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
        message={result?.variant === 'error' ? result.message : t('markAttendance_studentSaveSuccessMessage')}
        onClose={() => setResult(null)}
      />
    </Screen>
  );
}
