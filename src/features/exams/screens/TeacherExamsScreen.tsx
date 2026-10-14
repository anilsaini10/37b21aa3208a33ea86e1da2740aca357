/**
 * Teacher → Exams: papers for subjects the teacher teaches (own sections only)
 * and papers they invigilate, in three segments — Upcoming / Marks entry /
 * Invigilation duty — grouped by exam.
 */
import React, {useMemo, useState} from 'react';
import {Pressable, RefreshControl, ScrollView, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme, useThemedStyles} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {
  Screen,
  CustomHeader,
  CustomCard,
  AppText,
  Badge,
  Icon,
  Row,
  Spacer,
  Loader,
  EmptyState,
} from '../../../shared/components';
import {useTeacherExams} from '../teacherExams.service';
import {todayIso} from '../examSchedule.utils';
import {dayLabel} from '../components/examUi';
import {ScreenNames} from '../../../navigation/ScreenNames';
import type {TeacherStackParamList} from '../../../navigation/types';
import type {TeacherExamPaper} from '../../../shared/types';

type Nav = NativeStackNavigationProp<TeacherStackParamList>;
type Segment = 'upcoming' | 'marks' | 'invigilation';

export function TeacherExamsScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const navigation = useNavigation<Nav>();
  const [segment, setSegment] = useState<Segment>('upcoming');
  const {data, isLoading, isRefetching, isError, error, refetch} = useTeacherExams();

  const styles = useThemedStyles(t2 => ({
    segmentBar: {
      flexDirection: 'row',
      marginHorizontal: t2.spacing.lg,
      marginTop: t2.spacing.md,
      padding: 3,
      borderRadius: t2.radius.md,
      backgroundColor: t2.colors.surfaceVariant,
    },
    segmentItem: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: t2.spacing.sm,
      paddingHorizontal: 2,
      borderRadius: t2.radius.md - 2,
    },
    segmentItemActive: {backgroundColor: t2.colors.surface},
    content: {padding: t2.spacing.lg, flexGrow: 1},
    groupTitle: {marginTop: t2.spacing.sm, marginBottom: t2.spacing.sm},
    card: {marginBottom: t2.spacing.sm},
    track: {height: 6, borderRadius: 3, backgroundColor: t2.colors.surfaceVariant, overflow: 'hidden'},
    fill: {height: '100%', borderRadius: 3, backgroundColor: t2.colors.primary},
  }));

  const today = todayIso();

  /** Papers per segment, still grouped by exam (the API already sorts papers by date, then time). */
  const groups = useMemo(() => {
    const matches: Record<Segment, (p: TeacherExamPaper) => boolean> = {
      upcoming: p => p.date.slice(0, 10) >= today,
      marks: p => p.canEnterMarks && p.date.slice(0, 10) <= today,
      invigilation: p => p.isInvigilator,
    };
    const result = {} as Record<Segment, {examId: string; title: string; papers: TeacherExamPaper[]}[]>;
    (Object.keys(matches) as Segment[]).forEach(seg => {
      result[seg] = (data ?? [])
        .map(exam => ({examId: exam.examId, title: exam.title, papers: exam.papers.filter(matches[seg])}))
        .filter(g => g.papers.length > 0);
    });
    return result;
  }, [data, today]);

  const countOf = (seg: Segment): number => groups[seg].reduce((n, g) => n + g.papers.length, 0);

  const SEGMENTS: {key: Segment; label: string}[] = [
    {key: 'upcoming', label: t('teacherExams_upcoming')},
    {key: 'marks', label: t('teacherExams_marksEntry')},
    {key: 'invigilation', label: t('teacherExams_invigilation')},
  ];
  const EMPTY: Record<Segment, {title: string; message: string}> = {
    upcoming: {title: t('teacherExams_noUpcoming'), message: t('teacherExams_noUpcomingMessage')},
    marks: {title: t('teacherExams_noMarksEntry'), message: t('teacherExams_noMarksEntryMessage')},
    invigilation: {title: t('teacherExams_noInvigilation'), message: t('teacherExams_noInvigilationMessage')},
  };

  const paperCard = (p: TeacherExamPaper): React.JSX.Element => {
    const pending = Math.max(0, p.studentCount - p.markedCount);
    return (
      <CustomCard
        key={p.id}
        style={styles.card}
        onPress={() => navigation.navigate(ScreenNames.TeacherPaperMarks, {scheduleId: p.id, paper: p})}>
        <Row justify="space-between" align="flex-start">
          <View style={{flex: 1}}>
            <AppText variant="bodyBold">
              {p.className} · {p.subjectName}
            </AppText>
            <Row gap={4} style={{marginTop: 2}}>
              <Icon name="calendar" size={13} color={theme.colors.textMuted} />
              <AppText variant="label" color="textMuted">
                {dayLabel(p.date, t, false)} · {p.startTime}–{p.endTime}
              </AppText>
            </Row>
          </View>
          {segment === 'marks' && pending > 0 ? (
            <Badge label={t('teacherExams_pendingCount', {count: pending})} tone="warning" />
          ) : null}
        </Row>
        <Spacer size={theme.spacing.xs} />
        <Row gap={theme.spacing.sm} wrap style={{rowGap: theme.spacing.xs}}>
          <Badge label={t('dateSheet_maxMarksValue', {max: p.maxMarks})} tone="primary" />
          {p.roomNo ? <Badge label={t('dateSheet_roomValue', {room: p.roomNo})} tone="neutral" /> : null}
          {p.mySections.length > 0 ? (
            <Badge
              label={t('teacherExams_yourSections', {sections: p.mySections.map(s => s.name).join(', ')})}
              tone="info"
            />
          ) : null}
          {p.isInvigilator ? <Badge label={t('dateSheet_invigilator')} tone="success" /> : null}
        </Row>
        {p.canEnterMarks ? (
          <>
            <Spacer size={theme.spacing.sm} />
            <View style={styles.track}>
              <View
                style={[styles.fill, {width: `${p.studentCount ? Math.min(1, p.markedCount / p.studentCount) * 100 : 0}%`}]}
              />
            </View>
            <Spacer size={theme.spacing.xs} />
            <AppText variant="caption" color="textSecondary">
              {t('paperMarks_progress', {marked: p.markedCount, total: p.studentCount})}
            </AppText>
          </>
        ) : null}
      </CustomCard>
    );
  };

  return (
    <Screen padded={false}>
      <CustomHeader title={t('teacherExams_title')} onBack={() => navigation.goBack()} />
      <View style={styles.segmentBar}>
        {SEGMENTS.map(s => {
          const active = segment === s.key;
          const count = data ? countOf(s.key) : 0;
          return (
            <Pressable
              key={s.key}
              onPress={() => setSegment(s.key)}
              style={[styles.segmentItem, active ? styles.segmentItemActive : null]}>
              <AppText variant="label" color={active ? 'primary' : 'textSecondary'} numberOfLines={1}>
                {s.label}
                {count > 0 ? ` (${count})` : ''}
              </AppText>
            </Pressable>
          );
        })}
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
        <Loader message={t('teacherExams_loading')} />
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />}>
          {groups[segment].length === 0 ? (
            <EmptyState icon="exam" title={EMPTY[segment].title} message={EMPTY[segment].message} />
          ) : (
            groups[segment].map(g => (
              <View key={g.examId}>
                <AppText variant="label" color="textSecondary" style={styles.groupTitle}>
                  {g.title}
                </AppText>
                {g.papers.map(paperCard)}
              </View>
            ))
          )}
          <Spacer size={24} />
        </ScrollView>
      )}
    </Screen>
  );
}
