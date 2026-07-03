/** Homework detail — assignment info + per-student completion tracking. */
import React from 'react';
import {Pressable, ScrollView, StyleSheet, View} from 'react-native';
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
  Row,
  Spacer,
  SectionTitle,
  Divider,
  EmptyState,
  Loader,
} from '../../../shared/components';
import {formatDate} from '../../../core/utils/format';
import {
  useHomeworkItem,
  useHomeworkSubmissions,
  useUpdateHomeworkSubmission,
} from '../homework.service';
import type {TeacherStackParamList} from '../../../navigation/types';
import type {Homework, HomeworkSubmission} from '../../../shared/types';

type Nav = NativeStackNavigationProp<TeacherStackParamList>;
type SubmissionStatus = HomeworkSubmission['status'];

const infoRowStyles = StyleSheet.create({
  row: {
    paddingVertical: 4,
  },
});

function InfoRow({label, value}: {label: string; value: string}): React.JSX.Element {
  return (
    <Row justify="space-between" style={infoRowStyles.row}>
      <AppText variant="body" color="textSecondary">
        {label}
      </AppText>
      <AppText variant="body">{value}</AppText>
    </Row>
  );
}

function statusTone(status: Homework['status']): 'success' | 'info' | 'warning' {
  return status === 'graded' ? 'success' : status === 'submitted' ? 'info' : 'warning';
}

/** Completed → green, Pending → amber — matches the app's semantic tones. */
const SUBMISSION_TONE: Record<SubmissionStatus, 'success' | 'warning'> = {
  completed: 'success',
  pending: 'warning',
};

export function HomeworkDetailScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<TeacherStackParamList, 'HomeworkDetail'>>();
  const {id} = route.params;

  const {data: homework, isLoading} = useHomeworkItem(id);
  const {data: submissions, isLoading: isLoadingSubmissions} = useHomeworkSubmissions(id);
  const updateSubmission = useUpdateHomeworkSubmission();

  const styles = useThemedStyles(t2 => ({
    scrollContent: {
      padding: t2.spacing.lg,
    },
    summaryRow: {
      marginBottom: t2.spacing.md,
    },
    summaryTile: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: t2.spacing.xs,
      borderRadius: t2.radius.md,
    },
    studentBlock: {
      flex: 1,
    },
    toggle: {
      width: 78,
      height: 34,
      borderRadius: t2.components.button.radius,
      alignItems: 'center',
      justifyContent: 'center',
    },
  }));

  if (isLoading || !homework) {
    return <Loader message={t('homeworkDetail_loadingHomework')} />;
  }

  const statusLabel =
    homework.status === 'graded'
      ? t('homework_graded')
      : homework.status === 'submitted'
        ? t('homework_submitted')
        : t('homework_pending');

  const counts = {completed: 0, pending: 0};
  (submissions ?? []).forEach(s => {
    counts[s.status] += 1;
  });

  const onToggle = (submissionId: string, next: SubmissionStatus) => {
    updateSubmission.mutate({id: submissionId, status: next});
  };

  return (
    <Screen padded={false}>
      <CustomHeader
        title={t('homeworkDetail_headerTitle')}
        onBack={navigation.canGoBack() ? () => navigation.goBack() : undefined}
      />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <CustomCard>
          <AppText variant="h2">{homework.title}</AppText>
          <Spacer size={6} />
          <Badge label={statusLabel} tone={statusTone(homework.status)} />
          <Spacer size={12} />
          <AppText variant="body" color="textSecondary">
            {homework.description}
          </AppText>
        </CustomCard>

        <SectionTitle title={t('homeworkDetail_detailsSection')} />
        <CustomCard>
          <InfoRow label={t('createHomework_subject')} value={homework.subjectName} />
          <InfoRow label={t('createHomework_class')} value={homework.className} />
          <InfoRow label={t('homeworkDetail_assignedBy')} value={homework.assignedByName} />
          <InfoRow label={t('homeworkDetail_assignedDate')} value={formatDate(homework.assignedDate)} />
          <InfoRow label={t('createHomework_dueDate')} value={formatDate(homework.dueDate)} />
        </CustomCard>

        <SectionTitle title={t('homeworkDetail_studentsSection')} />

        {isLoadingSubmissions ? (
          <Loader message={t('homeworkDetail_loadingHomework')} />
        ) : !submissions || submissions.length === 0 ? (
          <EmptyState
            icon="students"
            title={t('homeworkDetail_noStudentsTitle')}
            message={t('homeworkDetail_noStudentsMessage')}
          />
        ) : (
          <>
            <Row gap={8} style={styles.summaryRow}>
              {(['completed', 'pending'] as SubmissionStatus[]).map(key => {
                const color = theme.colors[SUBMISSION_TONE[key]];
                return (
                  <View key={key} style={[styles.summaryTile, {backgroundColor: color + '18'}]}>
                    <AppText variant="bodyBold" style={{color}}>
                      {counts[key]}
                    </AppText>
                    <AppText variant="label" style={{color}}>
                      {key === 'completed' ? t('homeworkDetail_completedLabel') : t('homework_pending')}
                    </AppText>
                  </View>
                );
              })}
            </Row>

            <CustomCard>
              {submissions.map((submission, i) => (
                <View key={submission.id}>
                  {i > 0 ? <Divider /> : null}
                  <Row justify="space-between" gap={8}>
                    <View style={styles.studentBlock}>
                      <AppText variant="bodyBold" numberOfLines={1}>
                        {submission.studentName}
                      </AppText>
                      <AppText variant="caption" color="textSecondary">
                        {t('markAttendance_rollNumber', {rollNo: String(submission.rollNo)})}
                      </AppText>
                    </View>
                    <Row gap={8}>
                      {(['completed', 'pending'] as SubmissionStatus[]).map(optionStatus => {
                        const isSelected = submission.status === optionStatus;
                        const color = theme.colors[SUBMISSION_TONE[optionStatus]];
                        return (
                          <Pressable
                            key={optionStatus}
                            onPress={() => onToggle(submission.id, optionStatus)}
                            style={[
                              styles.toggle,
                              {
                                backgroundColor: isSelected ? color : color + '18',
                                borderWidth: isSelected ? 0 : 1.5,
                                borderColor: color + '55',
                              },
                            ]}>
                            <AppText variant="label" style={{color: isSelected ? theme.colors.onPrimary : color}}>
                              {optionStatus === 'completed'
                                ? t('homeworkDetail_doneAction')
                                : t('homework_pending')}
                            </AppText>
                          </Pressable>
                        );
                      })}
                    </Row>
                  </Row>
                </View>
              ))}
            </CustomCard>
          </>
        )}

        <Spacer size={24} />
      </ScrollView>
    </Screen>
  );
}
