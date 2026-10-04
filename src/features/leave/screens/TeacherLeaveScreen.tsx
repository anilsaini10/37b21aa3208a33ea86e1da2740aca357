/** Teacher — Leave Requests: review leave for sections this teacher is Class Teacher of. */
import React, {useState} from 'react';
import {Pressable, ScrollView, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useTheme, useThemedStyles} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {
  Screen,
  CustomHeader,
  CustomCard,
  CustomModal,
  CustomInput,
  CustomButton,
  AppText,
  Badge,
  Row,
  Spacer,
  Loader,
  EmptyState,
} from '../../../shared/components';
import type {BadgeTone} from '../../../shared/components';
import {formatDate} from '../../../core/utils/format';
import {useTeacherLeaves, useReviewTeacherLeave} from '../teacherLeave.service';
import type {Leave, LeaveStatus} from '../../../shared/types';

type TabValue = LeaveStatus | 'ALL';

const TABS: TabValue[] = ['ALL', 'PENDING', 'APPROVED', 'REJECTED'];

const STATUS_TONE: Record<LeaveStatus, BadgeTone> = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'error',
};

export function TeacherLeaveScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const navigation = useNavigation();
  const [tab, setTab] = useState<TabValue>('ALL');
  const [reviewTarget, setReviewTarget] = useState<Leave | null>(null);
  const [remarks, setRemarks] = useState('');
  const [reviewError, setReviewError] = useState<string | undefined>();

  const {data: leaves, isLoading, isError, error, refetch} = useTeacherLeaves(tab === 'ALL' ? undefined : tab);
  const {data: pendingLeaves} = useTeacherLeaves('PENDING');
  const reviewMutation = useReviewTeacherLeave();

  const STATUS_LABEL: Record<LeaveStatus, string> = {
    PENDING: t('leave_pending'),
    APPROVED: t('leave_approved'),
    REJECTED: t('leave_rejected'),
  };

  const styles = useThemedStyles(t2 => ({
    tabsWrap: {alignItems: 'center', paddingTop: t2.spacing.md},
    tabsContent: {columnGap: t2.spacing.sm, paddingHorizontal: t2.spacing.lg},
    tabPill: {
      paddingHorizontal: t2.spacing.lg,
      paddingVertical: t2.spacing.sm,
      borderRadius: t2.radius.pill,
    },
    scrollContent: {padding: t2.spacing.lg},
    leaveCard: {marginBottom: t2.spacing.md},
    modalButtonWrap: {flex: 1},
  }));

  const openReview = (leave: Leave): void => {
    setReviewError(undefined);
    setRemarks('');
    setReviewTarget(leave);
  };

  const submitReview = (status: Extract<LeaveStatus, 'APPROVED' | 'REJECTED'>): void => {
    if (!reviewTarget) {
      return;
    }
    setReviewError(undefined);
    reviewMutation.mutate(
      {leaveId: reviewTarget.id, input: {status, reviewRemarks: remarks.trim() || undefined}},
      {
        onSuccess: () => setReviewTarget(null),
        onError: (e: Error) => setReviewError(e.message),
      },
    );
  };

  return (
    <Screen padded={false}>
      <CustomHeader title={t('leave_title')} onBack={() => navigation.goBack()} />
      <View style={styles.tabsWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsContent}>
          {TABS.map(value => {
            const active = value === tab;
            const label =
              value === 'ALL'
                ? t('common_all')
                : value === 'PENDING' && pendingLeaves && pendingLeaves.length > 0
                  ? `${STATUS_LABEL[value]} (${pendingLeaves.length})`
                  : STATUS_LABEL[value];
            return (
              <Pressable
                key={value}
                onPress={() => setTab(value)}
                style={[styles.tabPill, {backgroundColor: active ? theme.colors.primary : theme.colors.surfaceVariant}]}>
                <AppText variant="label" style={{color: active ? theme.colors.onPrimary : theme.colors.textSecondary}}>
                  {label}
                </AppText>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {isError ? (
          <EmptyState
            icon="warning"
            title={t('common_somethingWentWrong')}
            message={(error as {message?: string} | null)?.message ?? t('common_checkConnection')}
            actionLabel={t('common_retry')}
            onAction={() => refetch()}
          />
        ) : isLoading || !leaves ? (
          <Loader message={t('leave_loading')} />
        ) : leaves.length === 0 ? (
          <EmptyState icon="calendar" title={t('leave_noRequestsTitle')} message={t('leave_noRequestsMessage')} />
        ) : (
          leaves.map(item => (
            <CustomCard
              key={item.id}
              style={styles.leaveCard}
              onPress={item.status === 'PENDING' ? () => openReview(item) : undefined}>
              <Row justify="space-between" align="center">
                <AppText variant="bodyBold">{item.studentName}</AppText>
                <Badge label={STATUS_LABEL[item.status]} tone={STATUS_TONE[item.status]} />
              </Row>
              <AppText variant="caption" color="textSecondary">
                {t('mySchedule_classSection', {className: item.className, sectionName: item.sectionName})}
              </AppText>
              <Spacer size={6} />
              <AppText variant="caption" color="textSecondary">
                {formatDate(item.fromDate)} - {formatDate(item.toDate)}
              </AppText>
              <Spacer size={6} />
              <AppText variant="body">{item.reason}</AppText>

              {item.status !== 'PENDING' ? (
                <>
                  <Spacer size={6} />
                  <AppText variant="label" color="textMuted">
                    {t('leave_reviewedBy', {name: item.reviewedBy?.name ?? ''})}
                  </AppText>
                  {item.reviewRemarks ? (
                    <AppText variant="label" color="textMuted">
                      {t('examResult_remarks')}: {item.reviewRemarks}
                    </AppText>
                  ) : null}
                </>
              ) : null}
            </CustomCard>
          ))
        )}
        <Spacer size={24} />
      </ScrollView>

      <CustomModal visible={!!reviewTarget} onClose={() => setReviewTarget(null)} title={t('leave_reviewTitle')}>
        {reviewTarget ? (
          <>
            <AppText variant="bodyBold">{reviewTarget.studentName}</AppText>
            <AppText variant="caption" color="textSecondary">
              {formatDate(reviewTarget.fromDate)} - {formatDate(reviewTarget.toDate)}
            </AppText>
            <Spacer size={8} />
            <AppText variant="body" color="textSecondary">
              {reviewTarget.reason}
            </AppText>
            <Spacer size={12} />
            <CustomInput
              label={t('examResult_remarks')}
              placeholder={t('leave_reviewRemarksPlaceholder')}
              multiline
              value={remarks}
              onChangeText={setRemarks}
            />
            {reviewError ? (
              <AppText variant="caption" color="error" style={{marginBottom: theme.spacing.sm}}>
                {reviewError}
              </AppText>
            ) : null}
            <Row gap={theme.spacing.md}>
              <View style={styles.modalButtonWrap}>
                <CustomButton
                  title={t('leave_reject')}
                  variant="danger"
                  loading={reviewMutation.isPending}
                  onPress={() => submitReview('REJECTED')}
                />
              </View>
              <View style={styles.modalButtonWrap}>
                <CustomButton
                  title={t('leave_approve')}
                  loading={reviewMutation.isPending}
                  onPress={() => submitReview('APPROVED')}
                />
              </View>
            </Row>
          </>
        ) : null}
      </CustomModal>
    </Screen>
  );
}
