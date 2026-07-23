/** Exams — every exam scheduled for the active child's class; tap one for its result. */
import React, {useState} from 'react';
import {Pressable, ScrollView, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme, useThemedStyles} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {Screen, CustomHeader, CustomCard, AppText, Row, Spacer, EmptyState, Loader} from '../../../shared/components';
import {formatDate} from '../../../core/utils/format';
import {useParentProfile} from '../../parent/parentStudents.service';
import {useParentExams} from '../../parent/parentExams.service';
import type {ParentStackParamList} from '../../../navigation/types';
import {ScreenNames} from '../../../navigation/ScreenNames';

type Nav = NativeStackNavigationProp<ParentStackParamList>;

export function ResultsScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const navigation = useNavigation<Nav>();
  const {t} = useLanguage();
  const {data: profile, isLoading: isProfileLoading} = useParentProfile();
  const [activeChildId, setActiveChildId] = useState<string | null>(null);

  const styles = useThemedStyles(t2 => ({
    scrollContent: {padding: t2.spacing.lg},
    switcherWrap: {paddingHorizontal: t2.spacing.lg, paddingTop: t2.spacing.md},
    switcherContent: {columnGap: t2.spacing.sm},
    childPill: {
      paddingHorizontal: t2.spacing.lg,
      paddingVertical: t2.spacing.sm,
      borderRadius: t2.radius.pill,
    },
    examCard: {marginBottom: t2.spacing.md},
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
        <ExamsList childId={child.id} styles={styles} />
      )}
    </Screen>
  );
}

function ExamsList({
  childId,
  styles,
}: {
  childId: string;
  styles: {scrollContent: object; examCard: object};
}): React.JSX.Element {
  const {t} = useLanguage();
  const navigation = useNavigation<Nav>();
  const {data: exams, isLoading, isError, error, refetch} = useParentExams(childId);

  if (isLoading || !exams) {
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
    return <Loader message={t('results_loading')} />;
  }

  if (exams.length === 0) {
    return <EmptyState icon="grade" title={t('results_noExamsTitle')} message={t('results_noExamsMessage')} />;
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {exams.map(exam => (
        <CustomCard
          key={exam.examId}
          style={styles.examCard}
          onPress={() => navigation.navigate(ScreenNames.ReportCard, {examId: exam.examId, studentId: childId})}>
          <AppText variant="bodyBold">{exam.title}</AppText>
          {exam.description ? (
            <AppText variant="caption" color="textSecondary">
              {exam.description}
            </AppText>
          ) : null}
          <Spacer size={6} />
          <Row justify="space-between" align="center">
            <AppText variant="caption" color="textSecondary">
              {formatDate(exam.startDate)} - {formatDate(exam.endDate)}
            </AppText>
            <AppText variant="label" color="primary">
              {t('results_maxMarks', {maxMarks: exam.maxMarks})}
            </AppText>
          </Row>
        </CustomCard>
      ))}
      <Spacer size={24} />
    </ScrollView>
  );
}
