/** Admin Plan Detail — info header, summary, chapter list with edit/correction. */
import React, {useState, useCallback} from 'react';
import {Alert, Pressable, RefreshControl, ScrollView, View} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme, useThemedStyles} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {
  Screen,
  CustomHeader,
  CustomCard,
  CustomButton,
  CustomBottomSheet,
  CustomInput,
  CustomModal,
  Select,
  DatePicker,
  Badge,
  AppText,
  Row,
  Spacer,
  Divider,
  Loader,
  EmptyState,
} from '../../../shared/components';
import {
  chapterProgressTone,
  planStatusTone,
  progressBarColor,
  formatSessionYear,
} from '../../../shared/helpers';
import {
  useAdminPlanDetail,
  useUpdatePlan,
  useDeletePlan,
  useUpdatePlanChapter,
  useCorrectProgress,
} from '../adminSyllabus.service';
import type {SyllabusPlanChapter, PlanStatus} from '../../../shared/types';
import type {AdminStackParamList} from '../../../navigation/types';

type Nav = NativeStackNavigationProp<AdminStackParamList>;

const STATUS_OPTIONS = [
  {label: 'Draft', value: 'DRAFT'},
  {label: 'Active', value: 'ACTIVE'},
  {label: 'Completed', value: 'COMPLETED'},
  {label: 'Archived', value: 'ARCHIVED'},
];

export function AdminPlanDetailScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const navigation = useNavigation<Nav>();
  const route = useRoute<any>();
  const planId: string = route.params?.planId;

  const {data: plan, isLoading, refetch, isRefetching} = useAdminPlanDetail(planId);
  const updateMutation = useUpdatePlan();
  const deleteMutation = useDeletePlan();
  const updateChapterMutation = useUpdatePlanChapter();
  const correctMutation = useCorrectProgress();

  const [editChapter, setEditChapter] = useState<SyllabusPlanChapter | null>(null);
  const [editExpectedDays, setEditExpectedDays] = useState('');
  const [editPlannedStart, setEditPlannedStart] = useState<string | undefined>();
  const [editPlannedEnd, setEditPlannedEnd] = useState<string | undefined>();
  const [editAdminRemarks, setEditAdminRemarks] = useState('');

  const [correctChapter, setCorrectChapter] = useState<SyllabusPlanChapter | null>(null);
  const [correctPercentage, setCorrectPercentage] = useState('');
  const [correctRemarks, setCorrectRemarks] = useState('');

  const [showDelete, setShowDelete] = useState(false);

  const styles = useThemedStyles(t2 => ({
    content: {padding: t2.spacing.lg, paddingBottom: t2.spacing.xxl},
    infoCard: {marginBottom: t2.spacing.md},
    summaryRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: t2.spacing.sm,
      marginVertical: t2.spacing.sm,
    },
    chapterCard: {marginBottom: t2.spacing.sm},
    progressBar: {
      height: 8,
      borderRadius: 4,
      marginTop: t2.spacing.xs,
    },
    progressFill: {height: 8, borderRadius: 4},
    chapterMeta: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: t2.spacing.xs,
    },
    chapterActions: {
      flexDirection: 'row',
      gap: t2.spacing.sm,
      marginTop: t2.spacing.sm,
    },
    footer: {marginTop: t2.spacing.lg},
  }));

  const openEditChapter = useCallback((ch: SyllabusPlanChapter) => {
    setEditChapter(ch);
    setEditExpectedDays(String(ch.expectedWorkingDays));
    setEditPlannedStart(ch.plannedStartDate);
    setEditPlannedEnd(ch.plannedEndDate);
    setEditAdminRemarks(ch.adminRemarks ?? '');
  }, []);

  const handleSaveChapter = useCallback(async () => {
    if (!editChapter || !plan) return;
    try {
      await updateChapterMutation.mutateAsync({
        planId: plan.id,
        chapterId: editChapter.id,
        expectedWorkingDays: Number(editExpectedDays) || undefined,
        plannedStartDate: editPlannedStart,
        plannedEndDate: editPlannedEnd,
        adminRemarks: editAdminRemarks.trim() || undefined,
      });
      setEditChapter(null);
      Alert.alert(t('common_success'), t('syllabus_saveSuccess'));
    } catch (e: any) {
      Alert.alert(t('common_error'), e.message);
    }
  }, [editChapter, plan, editExpectedDays, editPlannedStart, editPlannedEnd, editAdminRemarks, updateChapterMutation, t]);

  const openCorrection = useCallback((ch: SyllabusPlanChapter) => {
    setCorrectChapter(ch);
    setCorrectPercentage(String(ch.completionPercentage));
    setCorrectRemarks('');
  }, []);

  const handleCorrection = useCallback(async () => {
    if (!correctChapter || !correctRemarks.trim()) return;
    try {
      await correctMutation.mutateAsync({
        planChapterId: correctChapter.id,
        completionPercentage: Number(correctPercentage),
        correctionRemarks: correctRemarks.trim(),
      });
      setCorrectChapter(null);
      Alert.alert(t('common_success'), t('syllabus_correctionSuccess'));
    } catch (e: any) {
      Alert.alert(t('common_error'), e.message);
    }
  }, [correctChapter, correctPercentage, correctRemarks, correctMutation, t]);

  const handleStatusChange = useCallback(async (newStatus: string) => {
    if (!plan) return;
    try {
      await updateMutation.mutateAsync({planId: plan.id, status: newStatus as PlanStatus});
    } catch (e: any) {
      Alert.alert(t('common_error'), e.message);
    }
  }, [plan, updateMutation, t]);

  const handleDelete = useCallback(async () => {
    if (!plan) return;
    try {
      await deleteMutation.mutateAsync(plan.id);
      setShowDelete(false);
      navigation.goBack();
    } catch (e: any) {
      Alert.alert(t('common_error'), e.message);
    }
  }, [plan, deleteMutation, navigation, t]);

  if (isLoading) return <Screen><Loader /></Screen>;
  if (!plan) return <Screen><EmptyState title={t('syllabus_noPlans')} /></Screen>;

  const summary = plan.summary;

  return (
    <Screen padded={false}>
      <CustomHeader
        title={t('syllabus_planDetail')}
        onBack={() => navigation.goBack()}
        actions={[{icon: 'delete', onPress: () => setShowDelete(true)}]}
      />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />}
        showsVerticalScrollIndicator={false}>
        <CustomCard style={styles.infoCard}>
          <Row justify="space-between">
            <View style={{flex: 1}}>
              <AppText variant="h3">{plan.className} - {plan.sectionName}</AppText>
              <AppText color="textSecondary">{plan.subjectName}</AppText>
              {plan.teacherName ? <AppText color="textSecondary">{plan.teacherName}</AppText> : null}
              <AppText variant="caption" color="textSecondary">{formatSessionYear(plan.sessionYear)}</AppText>
            </View>
            <Badge label={plan.status} tone={planStatusTone(plan.status)} />
          </Row>
          <Spacer size={theme.spacing.sm} />
          <Select label={t('common_status')} value={plan.status} options={STATUS_OPTIONS} onChange={handleStatusChange} />
        </CustomCard>

        {summary && (
          <View style={styles.summaryRow}>
            <Badge label={`${t('syllabus_totalChapters')}: ${summary.totalChapters}`} tone="primary" />
            <Badge label={`${t('syllabus_avgCompletion')}: ${Math.round(summary.avgCompletion)}%`} tone="info" />
            <Badge label={`${t('syllabus_notStarted')}: ${summary.notStarted}`} tone="neutral" />
            <Badge label={`${t('syllabus_inProgress')}: ${summary.inProgress}`} tone="info" />
            <Badge label={`${t('syllabus_completed')}: ${summary.completed}`} tone="success" />
            {summary.delayed > 0 && <Badge label={`${t('syllabus_delayed')}: ${summary.delayed}`} tone="error" />}
          </View>
        )}

        <Divider />

        {plan.chapters?.map(ch => {
          const pct = ch.completionPercentage ?? 0;
          return (
            <CustomCard key={ch.id} style={styles.chapterCard}>
              <Row justify="space-between" align="flex-start">
                <View style={{flex: 1}}>
                  <AppText variant="bodyBold">Ch {ch.chapterNumber}: {ch.chapterName}</AppText>
                </View>
                <Badge label={ch.progressStatus} tone={chapterProgressTone(ch.progressStatus)} />
              </Row>
              <Row justify="space-between">
                <AppText variant="caption" color="textSecondary">{Math.round(pct)}%</AppText>
              </Row>
              <View style={[styles.progressBar, {backgroundColor: progressBarColor(pct) + '22'}]}>
                <View style={[styles.progressFill, {width: `${Math.min(pct, 100)}%`, backgroundColor: progressBarColor(pct)}]} />
              </View>
              <View style={styles.chapterMeta}>
                <AppText variant="caption" color="textSecondary">{t('syllabus_expectedDays')}: {ch.expectedWorkingDays}</AppText>
                <AppText variant="caption" color="textSecondary">{t('syllabus_actualDays')}: {ch.actualWorkingDays}</AppText>
              </View>
              {ch.plannedStartDate || ch.plannedEndDate ? (
                <AppText variant="caption" color="textSecondary">
                  {ch.plannedStartDate ?? '—'} → {ch.plannedEndDate ?? '—'}
                </AppText>
              ) : null}
              {ch.teacherRemarks ? (
                <AppText variant="caption" color="textSecondary">{t('syllabus_teacherRemarks')}: {ch.teacherRemarks}</AppText>
              ) : null}
              <View style={styles.chapterActions}>
                <CustomButton title={t('common_edit')} variant="outline" size="sm" fullWidth={false} onPress={() => openEditChapter(ch)} />
                {plan.approvalEnabled && (
                  <CustomButton title={t('syllabus_correct')} variant="outline" size="sm" fullWidth={false} onPress={() => openCorrection(ch)} />
                )}
              </View>
            </CustomCard>
          );
        })}

        <View style={styles.footer}>
          <CustomButton title={t('common_delete')} variant="danger" onPress={() => setShowDelete(true)} />
        </View>
      </ScrollView>

      <CustomBottomSheet visible={!!editChapter} onClose={() => setEditChapter(null)} title={t('common_edit')}>
        <CustomInput label={t('syllabus_expectedDays')} value={editExpectedDays} onChangeText={setEditExpectedDays} keyboardType="number-pad" />
        <DatePicker label={t('syllabus_plannedStart')} value={editPlannedStart} onChange={setEditPlannedStart} />
        <DatePicker label={t('syllabus_plannedEnd')} value={editPlannedEnd} onChange={setEditPlannedEnd} />
        <CustomInput label={t('syllabus_adminRemarks')} value={editAdminRemarks} onChangeText={setEditAdminRemarks} maxLength={500} multiline />
        <Spacer size={theme.spacing.md} />
        <CustomButton title={t('common_save')} onPress={handleSaveChapter} loading={updateChapterMutation.isPending} />
      </CustomBottomSheet>

      <CustomBottomSheet visible={!!correctChapter} onClose={() => setCorrectChapter(null)} title={t('syllabus_correct')}>
        <CustomInput label={t('syllabus_completionPercentage')} value={correctPercentage} onChangeText={setCorrectPercentage} keyboardType="number-pad" />
        <CustomInput label={t('syllabus_correctionRemarks')} value={correctRemarks} onChangeText={setCorrectRemarks} maxLength={1000} multiline required />
        <Spacer size={theme.spacing.md} />
        <CustomButton title={t('common_save')} onPress={handleCorrection} loading={correctMutation.isPending} />
      </CustomBottomSheet>

      <CustomModal visible={showDelete} onClose={() => setShowDelete(false)} title={t('common_confirm')}>
        <AppText>{t('syllabus_confirmDelete')}</AppText>
        <Spacer size={theme.spacing.md} />
        <Row gap={theme.spacing.sm}>
          <CustomButton title={t('common_cancel')} variant="outline" onPress={() => setShowDelete(false)} />
          <CustomButton title={t('common_delete')} variant="danger" onPress={handleDelete} loading={deleteMutation.isPending} />
        </Row>
      </CustomModal>
    </Screen>
  );
}
