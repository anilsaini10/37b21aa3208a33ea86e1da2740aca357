/** Teacher — chapter detail with actions (start, submit progress, mark complete). */
import React, {useState} from 'react';
import {Alert, RefreshControl, ScrollView, View} from 'react-native';
import {useNavigation, useRoute, type RouteProp} from '@react-navigation/native';
import {useTheme, useThemedStyles} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {
  Screen,
  Row,
  Spacer,
  Divider,
  CustomHeader,
  CustomCard,
  Badge,
  CustomButton,
  CustomBottomSheet,
  CustomInput,
  DatePicker,
  AppText,
} from '../../../shared/components';
import {
  progressBarColor,
  chapterProgressTone,
  approvalStatusTone,
} from '../../../shared/helpers';
import {
  useTeacherChapterDetail,
  useStartChapter,
  useSubmitProgress,
  useCompleteChapter,
} from '../teacherSyllabus.service';
import {extractErrorCode} from '../../../core/api/apiError';
import type {TeacherStackParamList} from '../../../navigation/types';

export function TeacherChapterDetailScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<TeacherStackParamList, 'TeacherChapterDetail'>>();
  const {planId, planChapterId} = route.params as {planId: string; planChapterId: string};

  const {data: chapter, isLoading, refetch} = useTeacherChapterDetail(planId, planChapterId);
  const startMutation = useStartChapter();
  const progressMutation = useSubmitProgress();
  const completeMutation = useCompleteChapter();

  const [showProgressSheet, setShowProgressSheet] = useState(false);
  const [progressDate, setProgressDate] = useState(new Date().toISOString().slice(0, 10));
  const [completionPct, setCompletionPct] = useState('');
  const [workingDays, setWorkingDays] = useState('1');
  const [remarks, setRemarks] = useState('');

  const styles = useThemedStyles(t2 => ({
    content: {padding: t2.spacing.lg, paddingBottom: t2.spacing.xxl},
    progressBar: {
      height: 8,
      borderRadius: 4,
      backgroundColor: t2.colors.border,
      marginTop: t2.spacing.sm,
    },
    progressFill: {height: 8, borderRadius: 4},
    historyItem: {
      paddingVertical: t2.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: t2.colors.divider,
    },
    actions: {
      gap: t2.spacing.sm,
      marginTop: t2.spacing.lg,
    },
  }));

  const handleStart = () => {
    Alert.alert(t('syllabus_startChapter'), t('syllabus_confirmStart'), [
      {text: t('common_cancel'), style: 'cancel'},
      {
        text: t('common_confirm'),
        onPress: () =>
          startMutation.mutate({planId, planChapterId}, {
            onSuccess: () => {
              Alert.alert(t('common_success'), t('syllabus_chapterStarted'));
              refetch();
            },
            onError: (e: any) => Alert.alert(t('common_error'), e.message),
          }),
      },
    ]);
  };

  const handleSubmitProgress = () => {
    const pct = Number(completionPct);
    if (isNaN(pct) || pct < 0 || pct > 100) {
      Alert.alert(t('common_error'), 'Percentage must be 0-100');
      return;
    }
    progressMutation.mutate(
      {
        planId,
        planChapterId,
        completionPercentage: pct,
        workingDaysAdded: Number(workingDays) || 1,
        remarks: remarks.trim() || undefined,
        progressDate,
      },
      {
        onSuccess: () => {
          setShowProgressSheet(false);
          setCompletionPct('');
          setWorkingDays('1');
          setRemarks('');
          Alert.alert(t('common_success'), t('syllabus_progressSubmitted'));
          refetch();
        },
        onError: (e: any) => {
          const code = extractErrorCode(e);
          if (code === 'PERCENTAGE_CANNOT_DECREASE') {
            Alert.alert(t('common_error'), t('syllabus_contactAdmin'));
          } else {
            Alert.alert(t('common_error'), e.message);
          }
        },
      },
    );
  };

  const handleComplete = () => {
    Alert.alert(t('syllabus_markComplete'), t('syllabus_confirmComplete'), [
      {text: t('common_cancel'), style: 'cancel'},
      {
        text: t('common_confirm'),
        onPress: () =>
          completeMutation.mutate({planId, planChapterId}, {
            onSuccess: () => {
              Alert.alert(t('common_success'), t('syllabus_chapterCompleted'));
              refetch();
            },
            onError: (e: any) => Alert.alert(t('common_error'), e.message),
          }),
      },
    ]);
  };

  const InfoRow = ({label, value}: {label: string; value?: string | number | null}) =>
    value != null ? (
      <Row justify="space-between" style={{paddingVertical: 4}}>
        <AppText variant="caption" color="textSecondary">{label}</AppText>
        <AppText variant="caption">{String(value)}</AppText>
      </Row>
    ) : null;

  return (
    <Screen padded={false}>
      <CustomHeader title={t('syllabus_chapterDetail')} onBack={() => navigation.goBack()} />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
        showsVerticalScrollIndicator={false}>
        {chapter ? (
          <>
            <Row justify="space-between" align="flex-start">
              <View style={{flex: 1}}>
                <AppText variant="h3">
                  {chapter.chapterNumber}. {chapter.chapterName}
                </AppText>
              </View>
              <Badge
                label={chapter.progressStatus.replace('_', ' ')}
                tone={chapterProgressTone(chapter.progressStatus)}
              />
            </Row>

            <Spacer size={theme.spacing.sm} />
            <AppText variant="bodyBold">{t('syllabus_completion')}: {chapter.completionPercentage}%</AppText>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${chapter.completionPercentage}%`,
                    backgroundColor: progressBarColor(chapter.completionPercentage),
                  },
                ]}
              />
            </View>

            <Spacer size={theme.spacing.md} />
            <InfoRow label={t('syllabus_expectedDays')} value={chapter.expectedWorkingDays} />
            <InfoRow label={t('syllabus_actualDays')} value={chapter.actualWorkingDays} />
            <InfoRow label={t('syllabus_plannedStart')} value={chapter.plannedStartDate} />
            <InfoRow label={t('syllabus_plannedEnd')} value={chapter.plannedEndDate} />
            <InfoRow label={t('syllabus_actualStart')} value={chapter.actualStartDate} />
            <InfoRow label={t('syllabus_actualEnd')} value={chapter.actualEndDate} />
            {chapter.teacherRemarks ? (
              <>
                <Spacer size={theme.spacing.sm} />
                <AppText variant="caption" color="textSecondary">{t('syllabus_teacherRemarks')}</AppText>
                <AppText>{chapter.teacherRemarks}</AppText>
              </>
            ) : null}

            {/* Approvals */}
            {chapter.approvals && chapter.approvals.length > 0 ? (
              <>
                <Divider />
                <AppText variant="bodyBold">{t('syllabus_approvals')}</AppText>
                <Spacer size={theme.spacing.xs} />
                {chapter.approvals.map(a => (
                  <CustomCard key={a.id} style={{marginBottom: theme.spacing.sm}}>
                    <Row justify="space-between">
                      <AppText variant="caption">{a.progressDate ?? a.createdAt.slice(0, 10)}</AppText>
                      <Badge label={a.status} tone={approvalStatusTone(a.status)} />
                    </Row>
                    {a.approvedPercentage != null ? (
                      <AppText variant="caption" color="textSecondary">
                        {t('syllabus_approvedPercentage')}: {a.approvedPercentage}%
                      </AppText>
                    ) : null}
                    {a.rejectionRemarks ? (
                      <AppText variant="caption" color="error">{a.rejectionRemarks}</AppText>
                    ) : null}
                  </CustomCard>
                ))}
              </>
            ) : null}

            {/* Progress History */}
            {chapter.progressHistory && chapter.progressHistory.length > 0 ? (
              <>
                <Divider />
                <AppText variant="bodyBold">{t('syllabus_progressHistory')}</AppText>
                <Spacer size={theme.spacing.xs} />
                {chapter.progressHistory.map(h => (
                  <View key={h.id} style={styles.historyItem}>
                    <Row justify="space-between">
                      <AppText variant="caption">{h.progressDate}</AppText>
                      <AppText variant="caption" color="primary">{h.completionPercentage}%</AppText>
                    </Row>
                    {h.remarks ? (
                      <AppText variant="caption" color="textSecondary">{h.remarks}</AppText>
                    ) : null}
                  </View>
                ))}
              </>
            ) : null}

            {/* Actions */}
            <View style={styles.actions}>
              {chapter.progressStatus === 'NOT_STARTED' ? (
                <CustomButton
                  title={t('syllabus_startChapter')}
                  onPress={handleStart}
                  loading={startMutation.isPending}
                />
              ) : null}
              {chapter.progressStatus === 'IN_PROGRESS' ? (
                <>
                  <CustomButton
                    title={t('syllabus_submitProgress')}
                    onPress={() => setShowProgressSheet(true)}
                  />
                  <CustomButton
                    title={t('syllabus_markComplete')}
                    variant="outline"
                    onPress={handleComplete}
                    loading={completeMutation.isPending}
                  />
                </>
              ) : null}
            </View>
          </>
        ) : null}
      </ScrollView>

      {/* Submit Progress Bottom Sheet */}
      <CustomBottomSheet
        visible={showProgressSheet}
        onClose={() => setShowProgressSheet(false)}
        title={t('syllabus_submitProgress')}>
        <DatePicker
          label={t('syllabus_progressDate')}
          value={progressDate}
          onChange={setProgressDate}
        />
        <CustomInput
          label={t('syllabus_percentage')}
          value={completionPct}
          onChangeText={setCompletionPct}
          keyboardType="numeric"
          placeholder="0-100"
        />
        <CustomInput
          label={t('syllabus_workingDays')}
          value={workingDays}
          onChangeText={setWorkingDays}
          keyboardType="numeric"
          placeholder="1"
        />
        <CustomInput
          label={t('syllabus_remarks')}
          value={remarks}
          onChangeText={setRemarks}
          multiline
          placeholder={t('syllabus_remarks')}
        />
        <Spacer size={theme.spacing.md} />
        <CustomButton
          title={t('common_submit')}
          onPress={handleSubmitProgress}
          loading={progressMutation.isPending}
        />
      </CustomBottomSheet>
    </Screen>
  );
}
