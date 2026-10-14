/**
 * Exam detail (parent) — two tabs for the selected child:
 *  - Date Sheet: subject papers grouped by date; today's and the next upcoming paper highlighted.
 *  - Results: summary (graded subjects only) + per-subject marks / status.
 * Marks appear as soon as teachers save them — pull to refresh shows new results.
 */
import React, {useMemo, useState} from 'react';
import {Pressable, RefreshControl, ScrollView, View} from 'react-native';
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
  EmptyState,
  Icon,
  Loader,
  ResultModal,
  Row,
  Spacer,
  Divider,
} from '../../../shared/components';
import {extractErrorCode} from '../../../core/api/apiError';
import {useParentExamDetail} from '../../parent/parentExams.service';
import {todayIso} from '../examSchedule.utils';
import {dayLabel} from '../components/examUi';
import {dateRangeLabel} from './ResultsScreen';
import type {ParentStackParamList} from '../../../navigation/types';
import type {ParentExamDetail, ParentExamSubject} from '../../../shared/types';

type Nav = NativeStackNavigationProp<ParentStackParamList>;
type Tab = 'dateSheet' | 'results';

/** Errors that mean "this exam isn't for this child" — explain and go back to the list. */
const LEAVE_CODES = new Set(['NOT_YOUR_CHILD', 'EXAM_NOT_FOUND']);

/** 78 → "78", 78.456 → "78.46". */
function formatNumber(n: number): string {
  return String(Math.round(n * 100) / 100);
}

export function ReportCardScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<ParentStackParamList, 'ReportCard'>>();
  const {examId, studentId} = route.params;
  const {t} = useLanguage();
  const [tab, setTab] = useState<Tab>('dateSheet');
  const {data: exam, isLoading, isRefetching, isError, error, refetch} = useParentExamDetail(examId, studentId);

  const styles = useThemedStyles(t2 => ({
    tabBar: {
      flexDirection: 'row',
      marginHorizontal: t2.spacing.lg,
      marginTop: t2.spacing.md,
      padding: 3,
      borderRadius: t2.radius.md,
      backgroundColor: t2.colors.surfaceVariant,
    },
    tabItem: {flex: 1, alignItems: 'center', paddingVertical: t2.spacing.sm, borderRadius: t2.radius.md - 2},
    tabItemActive: {backgroundColor: t2.colors.surface},
    scrollContent: {padding: t2.spacing.lg, flexGrow: 1},
  }));

  const errorCode = isError ? extractErrorCode(error) : undefined;
  const leaveError = errorCode && LEAVE_CODES.has(errorCode);

  const header = <CustomHeader title={exam?.title ?? t('reportCard_title')} onBack={() => navigation.goBack()} />;

  if (isError && !exam) {
    return (
      <Screen padded={false}>
        {header}
        {leaveError ? null : (
          <EmptyState
            icon="warning"
            title={t('common_somethingWentWrong')}
            message={(error as {message?: string} | null)?.message ?? t('common_checkConnection')}
            actionLabel={t('common_retry')}
            onAction={() => refetch()}
          />
        )}
        <ResultModal
          visible={!!leaveError}
          variant="error"
          title={t('common_error')}
          message={(error as {message?: string} | null)?.message}
          onClose={() => navigation.goBack()}
        />
      </Screen>
    );
  }
  if (isLoading || !exam) {
    return <Loader message={t('reportCard_loading')} />;
  }

  const range = dateRangeLabel(exam);

  return (
    <Screen padded={false}>
      {header}
      <View style={styles.tabBar}>
        {(
          [
            ['dateSheet', t('parentExams_tabDateSheet')],
            ['results', t('parentExams_tabResults')],
          ] as [Tab, string][]
        ).map(([key, label]) => (
          <Pressable key={key} onPress={() => setTab(key)} style={[styles.tabItem, tab === key ? styles.tabItemActive : null]}>
            <AppText variant="label" color={tab === key ? 'primary' : 'textSecondary'}>
              {label}
            </AppText>
          </Pressable>
        ))}
      </View>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />}>
        {range || exam.description ? (
          <>
            {range ? (
              <Row gap={4}>
                <Icon name="calendar" size={13} color={theme.colors.textMuted} />
                <AppText variant="label" color="textMuted">
                  {range}
                </AppText>
              </Row>
            ) : null}
            {exam.description ? (
              <AppText variant="caption" color="textSecondary" style={{marginTop: 2}}>
                {exam.description}
              </AppText>
            ) : null}
            <Spacer size={theme.spacing.md} />
          </>
        ) : null}
        {tab === 'dateSheet' ? <DateSheet subjects={exam.subjects} /> : <Results exam={exam} />}
        <Spacer size={24} />
      </ScrollView>
    </Screen>
  );
}

function DateSheet({subjects}: {subjects: ParentExamSubject[]}): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const styles = useThemedStyles(t2 => ({
    groupHeader: {marginTop: t2.spacing.sm, marginBottom: t2.spacing.sm},
    card: {marginBottom: t2.spacing.sm},
    highlight: {borderWidth: 1.5, borderColor: t2.colors.primary},
  }));

  const today = todayIso();
  const groups = useMemo(() => {
    const map = new Map<string, ParentExamSubject[]>();
    subjects.forEach(s => {
      const key = s.date.slice(0, 10);
      map.set(key, [...(map.get(key) ?? []), s]);
    });
    return [...map.entries()];
  }, [subjects]);
  /** The first paper after today — highlighted as "Next". */
  const nextScheduleId = subjects.find(s => s.date.slice(0, 10) > today)?.scheduleId;

  if (subjects.length === 0) {
    return <EmptyState icon="calendar" title={t('parentExams_dateSheetEmpty')} message={t('parentExams_dateSheetEmptyMessage')} />;
  }

  return (
    <>
      {groups.map(([date, papers]) => (
        <View key={date}>
          <AppText variant="label" color={date === today ? 'primary' : 'textSecondary'} style={styles.groupHeader}>
            {dayLabel(date, t)}
          </AppText>
          {papers.map(p => {
            const isToday = date === today;
            const isNext = p.scheduleId === nextScheduleId;
            return (
              <CustomCard key={p.scheduleId} style={[styles.card, isToday || isNext ? styles.highlight : null]}>
                <Row justify="space-between" align="flex-start">
                  <View style={{flex: 1}}>
                    <AppText variant="bodyBold">{p.subjectName}</AppText>
                    <Row gap={4} style={{marginTop: 2}}>
                      <Icon name="clock" size={13} color={theme.colors.textMuted} />
                      <AppText variant="label" color="textMuted">
                        {p.startTime}–{p.endTime}
                        {p.roomNo ? ` · ${t('dateSheet_roomValue', {room: p.roomNo})}` : ''}
                      </AppText>
                    </Row>
                  </View>
                  {isToday ? (
                    <Badge label={t('common_today')} tone="primary" />
                  ) : isNext ? (
                    <Badge label={t('parentExams_next')} tone="info" />
                  ) : null}
                </Row>
              </CustomCard>
            );
          })}
        </View>
      ))}
    </>
  );
}

function Results({exam}: {exam: ParentExamDetail}): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const styles = useThemedStyles(t2 => ({
    card: {marginBottom: t2.spacing.sm},
    summaryCard: {marginBottom: t2.spacing.md},
  }));
  const {summary, result, subjects} = exam;
  const today = todayIso();

  const statusBadge = (s: ParentExamSubject): React.JSX.Element => {
    if (s.status === 'GRADED') {
      return (
        <AppText variant="bodyBold">
          {s.marksObtained != null ? formatNumber(s.marksObtained) : '—'} / {s.maxMarks}
        </AppText>
      );
    }
    if (s.status === 'ABSENT') {
      return <Badge label={t('examResult_statusAbsent')} tone="error" />;
    }
    return (
      <Badge
        label={s.date.slice(0, 10) > today ? t('parentExams_upcoming') : t('parentExams_awaitingResult')}
        tone="neutral"
      />
    );
  };

  return (
    <>
      {result.status === 'GRADED' && (result.grade || result.remarks) ? (
        <CustomCard style={styles.summaryCard}>
          <Row justify="space-between" align="center">
            <AppText variant="label" color="textSecondary">
              {t('parentExams_overallRemarks')}
            </AppText>
            {result.grade ? <Badge label={result.grade} tone="success" /> : null}
          </Row>
          {result.remarks ? (
            <>
              <Spacer size={6} />
              <AppText variant="body">{result.remarks}</AppText>
            </>
          ) : null}
        </CustomCard>
      ) : null}

      <CustomCard style={styles.summaryCard}>
        {summary.percentage == null ? (
          <>
            <AppText variant="bodyBold">{t('parentExams_resultsNotAvailable')}</AppText>
            {summary.totalSubjects > 0 ? (
              <AppText variant="caption" color="textSecondary">
                {t('parentExams_gradedOf', {graded: summary.gradedSubjects, total: summary.totalSubjects})}
              </AppText>
            ) : null}
          </>
        ) : (
          <>
            <Row justify="space-between" align="center">
              <AppText variant="h2">
                {formatNumber(summary.obtainedMarks)} / {formatNumber(summary.gradedMaxMarks)}
              </AppText>
              <AppText variant="h2" color="primary">
                {formatNumber(summary.percentage)}%
              </AppText>
            </Row>
            <Spacer size={4} />
            <AppText variant="caption" color="textSecondary">
              {t('parentExams_gradedOf', {graded: summary.gradedSubjects, total: summary.totalSubjects})}
            </AppText>
          </>
        )}
        {summary.absentSubjects > 0 ? (
          <AppText variant="caption" color="error" style={{marginTop: 2}}>
            {t('parentExams_absentCount', {count: summary.absentSubjects})}
          </AppText>
        ) : null}
      </CustomCard>

      {subjects.length === 0 ? (
        <EmptyState icon="grade" title={t('parentExams_dateSheetEmpty')} message={t('parentExams_dateSheetEmptyMessage')} />
      ) : (
        subjects.map(s => (
          <CustomCard key={s.scheduleId} style={styles.card}>
            <Row justify="space-between" align="center">
              <View style={{flex: 1}}>
                <AppText variant="bodyBold">{s.subjectName}</AppText>
                <AppText variant="label" color="textMuted">
                  {dayLabel(s.date, t, false)}
                </AppText>
              </View>
              <Row gap={theme.spacing.sm} align="center">
                {statusBadge(s)}
                {s.status === 'GRADED' && s.grade ? <Badge label={s.grade} tone="success" /> : null}
              </Row>
            </Row>
            {s.remarks ? (
              <>
                <Spacer size={8} />
                <Divider />
                <Spacer size={8} />
                <AppText variant="caption" color="textSecondary">
                  {s.remarks}
                </AppText>
              </>
            ) : null}
          </CustomCard>
        ))
      )}
    </>
  );
}
