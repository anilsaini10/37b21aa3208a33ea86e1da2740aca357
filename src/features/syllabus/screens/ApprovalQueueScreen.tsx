/** Approval Queue — pending approval cards with approve/reject/correct actions. */
import React, {useState, useCallback} from 'react';
import {Alert, FlatList, RefreshControl, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
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
  Select,
  Badge,
  AppText,
  Row,
  Spacer,
  Loader,
  EmptyState,
} from '../../../shared/components';
import {formatSessionYear, approvalStatusTone} from '../../../shared/helpers';
import {
  useAdminApprovals,
  useApproveProgress,
  useRejectProgress,
  useCorrectProgress,
} from '../adminSyllabus.service';
import type {SyllabusApproval} from '../../../shared/types';
import type {AdminStackParamList} from '../../../navigation/types';

type Nav = NativeStackNavigationProp<AdminStackParamList>;

const YEARS = Array.from({length: 7}, (_, i) => {
  const y = 2024 + i;
  return {label: formatSessionYear(y), value: String(y)};
});

export function ApprovalQueueScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const navigation = useNavigation<Nav>();
  const currentYear = new Date().getFullYear();
  const [sessionYear, setSessionYear] = useState(String(currentYear));

  const {data, isLoading, refetch, isRefetching} = useAdminApprovals(Number(sessionYear));
  const approveMutation = useApproveProgress();
  const rejectMutation = useRejectProgress();
  const correctMutation = useCorrectProgress();

  const [approveTarget, setApproveTarget] = useState<SyllabusApproval | null>(null);
  const [approvedPct, setApprovedPct] = useState('');

  const [rejectTarget, setRejectTarget] = useState<SyllabusApproval | null>(null);
  const [rejectionRemarks, setRejectionRemarks] = useState('');

  const [correctTarget, setCorrectTarget] = useState<SyllabusApproval | null>(null);
  const [correctPct, setCorrectPct] = useState('');
  const [correctRemarks, setCorrectRemarks] = useState('');

  const styles = useThemedStyles(t2 => ({
    filter: {paddingHorizontal: t2.spacing.lg, paddingTop: t2.spacing.sm},
    list: {paddingHorizontal: t2.spacing.lg, paddingBottom: t2.spacing.xl},
    card: {marginBottom: t2.spacing.md},
    actions: {flexDirection: 'row', gap: t2.spacing.sm, marginTop: t2.spacing.md},
  }));

  const openApprove = useCallback((item: SyllabusApproval) => {
    setApproveTarget(item);
    setApprovedPct(String(item.completionPercentage));
  }, []);

  const handleApprove = useCallback(async () => {
    if (!approveTarget) return;
    try {
      await approveMutation.mutateAsync({
        approvalId: approveTarget.id,
        status: 'APPROVED',
        approvedPercentage: Number(approvedPct),
      });
      setApproveTarget(null);
      Alert.alert(t('common_success'), t('syllabus_approvalSuccess'));
    } catch (e: any) {
      Alert.alert(t('common_error'), e.message);
    }
  }, [approveTarget, approvedPct, approveMutation, t]);

  const openReject = useCallback((item: SyllabusApproval) => {
    setRejectTarget(item);
    setRejectionRemarks('');
  }, []);

  const handleReject = useCallback(async () => {
    if (!rejectTarget || !rejectionRemarks.trim()) return;
    try {
      await rejectMutation.mutateAsync({
        approvalId: rejectTarget.id,
        status: 'REJECTED',
        rejectionRemarks: rejectionRemarks.trim(),
      });
      setRejectTarget(null);
      Alert.alert(t('common_success'), t('syllabus_approvalSuccess'));
    } catch (e: any) {
      Alert.alert(t('common_error'), e.message);
    }
  }, [rejectTarget, rejectionRemarks, rejectMutation, t]);

  const openCorrect = useCallback((item: SyllabusApproval) => {
    setCorrectTarget(item);
    setCorrectPct(String(item.completionPercentage));
    setCorrectRemarks('');
  }, []);

  const handleCorrect = useCallback(async () => {
    if (!correctTarget || !correctRemarks.trim()) return;
    try {
      await correctMutation.mutateAsync({
        planChapterId: correctTarget.planChapterId,
        completionPercentage: Number(correctPct),
        correctionRemarks: correctRemarks.trim(),
      });
      setCorrectTarget(null);
      Alert.alert(t('common_success'), t('syllabus_correctionSuccess'));
    } catch (e: any) {
      Alert.alert(t('common_error'), e.message);
    }
  }, [correctTarget, correctPct, correctRemarks, correctMutation, t]);

  const renderItem = useCallback(({item}: {item: SyllabusApproval}) => (
    <CustomCard style={styles.card}>
      <Row justify="space-between" align="flex-start">
        <View style={{flex: 1}}>
          <AppText variant="bodyBold">Ch {item.chapterNumber}: {item.chapterName}</AppText>
          <AppText variant="caption" color="textSecondary">{item.className} - {item.sectionName}</AppText>
          <AppText variant="caption" color="textSecondary">{item.subjectName}</AppText>
          <AppText variant="caption" color="textSecondary">{item.teacherName}</AppText>
        </View>
        <Badge label={item.status} tone={approvalStatusTone(item.status)} />
      </Row>
      <Spacer size={4} />
      <AppText variant="caption" color="textSecondary">
        {t('syllabus_completion')}: {item.completionPercentage}%
      </AppText>
      {item.remarks ? (
        <AppText variant="caption" color="textSecondary">{t('syllabus_remarks')}: {item.remarks}</AppText>
      ) : null}
      {item.progressDate ? (
        <AppText variant="caption" color="textSecondary">{t('syllabus_progressDate')}: {item.progressDate}</AppText>
      ) : null}
      <View style={styles.actions}>
        <CustomButton title={t('syllabus_approve')} variant="primary" size="sm" fullWidth={false} onPress={() => openApprove(item)} />
        <CustomButton title={t('syllabus_reject')} variant="dangerOutline" size="sm" fullWidth={false} onPress={() => openReject(item)} />
        <CustomButton title={t('syllabus_correct')} variant="outline" size="sm" fullWidth={false} onPress={() => openCorrect(item)} />
      </View>
    </CustomCard>
  ), [styles, t, openApprove, openReject, openCorrect]);

  return (
    <Screen padded={false}>
      <CustomHeader title={t('syllabus_approvals')} onBack={() => navigation.goBack()} />
      <View style={styles.filter}>
        <Select label={t('syllabus_sessionYear')} value={sessionYear} options={YEARS} onChange={setSessionYear} />
      </View>

      {isLoading ? (
        <Loader />
      ) : !data?.length ? (
        <EmptyState title={t('syllabus_noApprovals')} message={t('syllabus_noApprovalsMessage')} icon="check" />
      ) : (
        <FlatList
          data={data}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />}
        />
      )}

      <CustomBottomSheet visible={!!approveTarget} onClose={() => setApproveTarget(null)} title={t('syllabus_approve')}>
        <AppText>{approveTarget?.chapterName}</AppText>
        <Spacer size={theme.spacing.sm} />
        <CustomInput
          label={t('syllabus_approvedPercentage')}
          value={approvedPct}
          onChangeText={setApprovedPct}
          keyboardType="number-pad"
        />
        <Spacer size={theme.spacing.md} />
        <CustomButton title={t('syllabus_approve')} onPress={handleApprove} loading={approveMutation.isPending} />
      </CustomBottomSheet>

      <CustomBottomSheet visible={!!rejectTarget} onClose={() => setRejectTarget(null)} title={t('syllabus_reject')}>
        <AppText>{rejectTarget?.chapterName}</AppText>
        <Spacer size={theme.spacing.sm} />
        <CustomInput
          label={t('syllabus_rejectionRemarks')}
          value={rejectionRemarks}
          onChangeText={setRejectionRemarks}
          maxLength={1000}
          multiline
          required
        />
        <Spacer size={theme.spacing.md} />
        <CustomButton title={t('syllabus_reject')} variant="danger" onPress={handleReject} loading={rejectMutation.isPending} />
      </CustomBottomSheet>

      <CustomBottomSheet visible={!!correctTarget} onClose={() => setCorrectTarget(null)} title={t('syllabus_correct')}>
        <AppText>{correctTarget?.chapterName}</AppText>
        <Spacer size={theme.spacing.sm} />
        <CustomInput
          label={t('syllabus_completionPercentage')}
          value={correctPct}
          onChangeText={setCorrectPct}
          keyboardType="number-pad"
        />
        <CustomInput
          label={t('syllabus_correctionRemarks')}
          value={correctRemarks}
          onChangeText={setCorrectRemarks}
          maxLength={1000}
          multiline
          required
        />
        <Spacer size={theme.spacing.md} />
        <CustomButton title={t('common_save')} onPress={handleCorrect} loading={correctMutation.isPending} />
      </CustomBottomSheet>
    </Screen>
  );
}
