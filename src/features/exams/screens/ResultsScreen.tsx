/** Exams — every exam for the active child's class, split into Upcoming / Ongoing and Completed; tap one for its date sheet + results. */
import React, {useCallback, useEffect, useState} from 'react';
import {Pressable, RefreshControl, ScrollView, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme, useThemedStyles} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {
  Screen,
  CustomHeader,
  CustomCard,
  CustomButton,
  AppText,
  Icon,
  Row,
  Spacer,
  EmptyState,
  Loader,
  SectionTitle,
} from '../../../shared/components';
import {extractErrorCode} from '../../../core/api/apiError';
import {useParentProfile} from '../../parent/parentStudents.service';
import {useParentExams} from '../../parent/parentExams.service';
import {formatPaperDate, todayIso} from '../examSchedule.utils';
import type {ParentStackParamList} from '../../../navigation/types';
import {ScreenNames} from '../../../navigation/ScreenNames';
import type {ParentExam} from '../../../shared/types';

type Nav = NativeStackNavigationProp<ParentStackParamList>;

/** Upcoming / ongoing = ends today or later, or has no dates yet. */
function isCompleted(exam: ParentExam, today: string): boolean {
  return !!exam.endDate && exam.endDate.slice(0, 10) < today;
}

export function dateRangeLabel(exam: Pick<ParentExam, 'startDate' | 'endDate'>): string | undefined {
  if (exam.startDate && exam.endDate) {
    return `${formatPaperDate(exam.startDate)} – ${formatPaperDate(exam.endDate)}`;
  }
  const single = exam.startDate ?? exam.endDate;
  return single ? formatPaperDate(single) : undefined;
}

export function ResultsScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const navigation = useNavigation<Nav>();
  const {t} = useLanguage();
  const {data: profile, isLoading: isProfileLoading, refetch: refetchProfile} = useParentProfile();
  const [activeChildId, setActiveChildId] = useState<string | null>(null);
  // Stable, so ExamsList's effect fires once per NOT_YOUR_CHILD error rather than every render.
  const onNotYourChild = useCallback(() => {
    // The selected child isn't linked to this parent any more — reset to the first linked child.
    setActiveChildId(null);
    refetchProfile();
  }, [refetchProfile]);

  const styles = useThemedStyles(t2 => ({
    switcherWrap: {paddingHorizontal: t2.spacing.lg, paddingTop: t2.spacing.md},
    switcherContent: {columnGap: t2.spacing.sm},
    childPill: {
      paddingHorizontal: t2.spacing.lg,
      paddingVertical: t2.spacing.sm,
      borderRadius: t2.radius.pill,
    },
  }));

  if (isProfileLoading || !profile) {
    return <Loader message={t('results_loading')} />;
  }

  const {children} = profile;
  const child = children.find(c => c.id === activeChildId) ?? children[0];

  return (
    <Screen padded={false}>
      <CustomHeader title={t('results_title')} onBack={() => navigation.goBack()} />
      {children.length > 1 ? (
        <View style={styles.switcherWrap}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.switcherContent}>
            {children.map(c => {
              const active = c.id === child.id;
              return (
                <Pressable
                  key={c.id}
                  onPress={() => setActiveChildId(c.id)}
                  style={[
                    styles.childPill,
                    {backgroundColor: active ? theme.colors.primary : theme.colors.surfaceVariant},
                  ]}>
                  <AppText variant="label" style={{color: active ? theme.colors.onPrimary : theme.colors.textSecondary}}>
                    {c.name}
                  </AppText>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      ) : null}
      {!child ? (
        <EmptyState icon="grade" title={t('childProfile_noChildrenTitle')} message={t('childProfile_noChildrenMessage')} />
      ) : (
        <ExamsList childId={child.id} onNotYourChild={onNotYourChild} />
      )}
    </Screen>
  );
}

function ExamsList({childId, onNotYourChild}: {childId: string; onNotYourChild: () => void}): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const navigation = useNavigation<Nav>();
  const {data: exams, isLoading, isRefetching, isError, error, refetch} = useParentExams(childId);

  const styles = useThemedStyles(t2 => ({
    scrollContent: {padding: t2.spacing.lg, flexGrow: 1},
    examCard: {marginBottom: t2.spacing.md},
  }));

  const notYourChild = isError && extractErrorCode(error) === 'NOT_YOUR_CHILD';
  useEffect(() => {
    if (notYourChild) {
      onNotYourChild();
    }
  }, [notYourChild, onNotYourChild]);

  if (isError) {
    return (
      <EmptyState
        icon="warning"
        title={t('common_somethingWentWrong')}
        message={(error as {message?: string} | null)?.message ?? t('common_checkConnection')}
        actionLabel={t('common_retry')}
        onAction={() => refetch()}
      />
    );
  }
  if (isLoading || !exams) {
    return <Loader message={t('results_loading')} />;
  }
  if (exams.length === 0) {
    return <EmptyState icon="grade" title={t('results_noExamsTitle')} message={t('results_noExamsMessage')} />;
  }

  const today = todayIso();
  const current = exams.filter(e => !isCompleted(e, today));
  const completed = exams.filter(e => isCompleted(e, today));

  const examCard = (exam: ParentExam): React.JSX.Element => {
    const open = (): void => navigation.navigate(ScreenNames.ReportCard, {examId: exam.examId, studentId: childId});
    const range = dateRangeLabel(exam);
    return (
      <CustomCard key={exam.examId} style={styles.examCard} onPress={open}>
        <Row justify="space-between" align="center">
          <View style={{flex: 1}}>
            <AppText variant="bodyBold">{exam.title}</AppText>
            {exam.description ? (
              <AppText variant="caption" color="textSecondary" numberOfLines={2}>
                {exam.description}
              </AppText>
            ) : null}
            <Spacer size={4} />
            <Row gap={4}>
              <Icon name="calendar" size={13} color={theme.colors.textMuted} />
              <AppText variant="label" color="textMuted">
                {range ?? t('parentExams_datesTba')}
              </AppText>
            </Row>
          </View>
          <CustomButton title={t('parentExams_view')} size="sm" variant="outline" fullWidth={false} onPress={open} />
        </Row>
      </CustomCard>
    );
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />}>
      {current.length > 0 ? (
        <>
          <SectionTitle title={t('parentExams_upcomingOngoing')} />
          {current.map(examCard)}
        </>
      ) : null}
      {completed.length > 0 ? (
        <>
          <SectionTitle title={t('parentExams_completed')} />
          {completed.map(examCard)}
        </>
      ) : null}
      <Spacer size={24} />
    </ScrollView>
  );
}
