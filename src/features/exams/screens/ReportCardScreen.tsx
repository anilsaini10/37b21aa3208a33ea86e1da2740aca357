/** Exam result — this child's marks/grade for one exam, or a pending/absent placeholder. */
import React from 'react';
import {ScrollView} from 'react-native';
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
  Loader,
  Row,
  Spacer,
  Divider,
} from '../../../shared/components';
import {formatDate} from '../../../core/utils/format';
import {examResultStatusTone} from '../../../shared/helpers';
import {useParentExamDetail} from '../../parent/parentExams.service';
import type {ParentStackParamList} from '../../../navigation/types';

type Nav = NativeStackNavigationProp<ParentStackParamList>;

export function ReportCardScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<ParentStackParamList, 'ReportCard'>>();
  const {examId, studentId} = route.params;
  const {t} = useLanguage();
  const {data: exam, isLoading, isError, error, refetch} = useParentExamDetail(examId, studentId);
  const styles = useThemedStyles(t2 => ({
    scrollContent: {padding: t2.spacing.lg},
  }));

  if (isLoading || !exam) {
    if (isError) {
      return (
        <Screen padded={false}>
          <CustomHeader title={t('reportCard_title')} onBack={() => navigation.goBack()} />
          <EmptyState
            icon="warning"
            title={t('common_somethingWentWrong')}
            message={(error as {message?: string} | null)?.message ?? t('common_checkConnection')}
            actionLabel={t('common_retry')}
            onAction={() => refetch()}
          />
        </Screen>
      );
    }
    return <Loader message={t('reportCard_loading')} />;
  }

  const {result} = exam;

  return (
    <Screen padded={false}>
      <CustomHeader title={t('reportCard_title')} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <CustomCard>
          <AppText variant="h3">{exam.title}</AppText>
          {exam.description ? (
            <AppText variant="caption" color="textSecondary">
              {exam.description}
            </AppText>
          ) : null}
          <Spacer size={6} />
          <AppText variant="caption" color="textSecondary">
            {formatDate(exam.startDate)} - {formatDate(exam.endDate)}
          </AppText>
          <Spacer size={4} />
          <AppText variant="label" color="textMuted">
            {t('reportCard_maxMarks')}: {exam.maxMarks}
          </AppText>
        </CustomCard>

        <Spacer size={theme.spacing.md} />

        {result.status === 'GRADED' ? (
          <CustomCard>
            <Row justify="space-between" align="center">
              <AppText variant="h2">
                {result.marksObtained} / {exam.maxMarks}
              </AppText>
              {result.grade ? <Badge label={result.grade} tone={examResultStatusTone(result.status)} /> : null}
            </Row>
            {result.remarks ? (
              <>
                <Spacer size={12} />
                <Divider />
                <Spacer size={12} />
                <AppText variant="caption" color="textSecondary">
                  {t('examResult_remarks')}
                </AppText>
                <AppText variant="body">{result.remarks}</AppText>
              </>
            ) : null}
          </CustomCard>
        ) : result.status === 'ABSENT' ? (
          <CustomCard>
            <Row justify="space-between" align="center">
              <AppText variant="body" color="textSecondary">
                {t('reportCard_absentMessage')}
              </AppText>
              <Badge label={t('examResult_statusAbsent')} tone={examResultStatusTone(result.status)} />
            </Row>
          </CustomCard>
        ) : (
          <EmptyState icon="grade" title={t('reportCard_pendingTitle')} message={t('reportCard_pendingMessage')} />
        )}
        <Spacer size={24} />
      </ScrollView>
    </Screen>
  );
}
