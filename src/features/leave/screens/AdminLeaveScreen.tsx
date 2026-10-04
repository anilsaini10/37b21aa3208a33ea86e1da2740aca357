/**
 * Admin — Leave Requests: one screen for both audiences — a Students tab (every
 * section's leave, class/section filterable) and a Teachers tab (every teacher's
 * own leave, school-wide) — each with its own Pending/Approved/Rejected/All view
 * and review modal, since the two are backed by separate endpoints/entities.
 */
import React, {useState} from 'react';
import {Pressable, ScrollView, View, type StyleProp, type ViewStyle} from 'react-native';
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
  Select,
  AppText,
  Badge,
  Row,
  Spacer,
  Loader,
  EmptyState,
} from '../../../shared/components';
import type {BadgeTone} from '../../../shared/components';
import {formatDate} from '../../../core/utils/format';
import {useClasses} from '../../classes/classes.service';
import {useAdminLeaves, useReviewAdminLeave} from '../adminLeave.service';
import {useAdminTeacherLeaves, useReviewTeacherLeaveAsAdmin} from '../adminTeacherLeave.service';
import type {Leave, LeaveStatus, TeacherLeave} from '../../../shared/types';

type StatusTab = LeaveStatus | 'ALL';
type Audience = 'STUDENT' | 'TEACHER';

const STATUS_TABS: StatusTab[] = ['ALL', 'PENDING', 'APPROVED', 'REJECTED'];

const STATUS_TONE: Record<LeaveStatus, BadgeTone> = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'error',
};

/**
 * One card layout shared by both the Students and Teachers tabs — only the data differs
 * (student leave carries a class/section line, teacher leave doesn't). Pending requests get
 * a bottom-right "Take Action" button instead of the whole card being tappable, so the action
 * is explicit rather than relying on an undiscoverable full-card tap.
 */
function LeaveRequestCard({
  name,
  meta,
  status,
  fromDate,
  toDate,
  reason,
  reviewedByName,
  reviewRemarks,
  onTakeAction,
  style,
}: {
  name: string;
  /** e.g. "Class 5 - A" for a student's leave; omitted for a teacher's own leave. */
  meta?: string;
  status: LeaveStatus;
  fromDate: string;
  toDate: string;
  reason: string;
  reviewedByName?: string;
  reviewRemarks?: string | null;
  onTakeAction: () => void;
  style?: StyleProp<ViewStyle>;
}): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const STATUS_LABEL: Record<LeaveStatus, string> = {
    PENDING: t('leave_pending'),
    APPROVED: t('leave_approved'),
    REJECTED: t('leave_rejected'),
  };

  return (
    <CustomCard style={style}>
      <Row justify="space-between" align="center">
        <AppText variant="bodyBold">{name}</AppText>
        <Badge label={STATUS_LABEL[status]} tone={STATUS_TONE[status]} />
      </Row>
      {meta ? (
        <AppText variant="caption" color="textSecondary">
          {meta}
        </AppText>
      ) : null}
      <Spacer size={6} />
      <AppText variant="caption" color="textSecondary">
        {formatDate(fromDate)} - {formatDate(toDate)}
      </AppText>
      <Spacer size={6} />
      <AppText variant="body">{reason}</AppText>

      {status === 'PENDING' ? (
        <>
          <Spacer size={theme.spacing.sm} />
          <Row justify="flex-end">
            <CustomButton
              title={t('leave_takeAction')}
              size="sm"
              variant="outline"
              fullWidth={false}
              onPress={onTakeAction}
            />
          </Row>
        </>
      ) : (
        <>
          <Spacer size={6} />
          <AppText variant="label" color="textMuted">
            {t('leave_reviewedBy', {name: reviewedByName ?? ''})}
          </AppText>
          {reviewRemarks ? (
            <AppText variant="label" color="textMuted">
              {t('examResult_remarks')}: {reviewRemarks}
            </AppText>
          ) : null}
        </>
      )}
    </CustomCard>
  );
}

function useStatusTabStyles() {
  return useThemedStyles(t2 => ({
    tabsWrap: {
      alignItems: 'center',
       paddingTop: t2.spacing.md
      },
    tabsContent: {columnGap: t2.spacing.sm,
       paddingHorizontal: t2.spacing.lg
      },
    tabPill: {
      paddingHorizontal: t2.spacing.lg,
      paddingVertical: t2.spacing.sm,
      borderRadius: t2.radius.pill,
    },
    filterRow: {
      paddingHorizontal: t2.spacing.lg,
      paddingTop: t2.spacing.md
    },
    pickerWrap: {
      flex: 1
    },
    scrollContent: {
      padding: t2.spacing.lg
    },
    leaveCard: {
      marginBottom: t2.spacing.md
    },
    modalButtonWrap: {
      flex: 1
    },
  }));
}

function StudentLeaveTab(): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const [tab, setTab] = useState<StatusTab>('ALL');
  const [classId, setClassId] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [reviewTarget, setReviewTarget] = useState<Leave | null>(null);
  const [remarks, setRemarks] = useState('');
  const [reviewError, setReviewError] = useState<string | undefined>();

  const {data: classes} = useClasses();
  const {data: leaves, isLoading, isError, error, refetch} = useAdminLeaves({
    status: tab === 'ALL' ? undefined : tab,
    classId: classId || undefined,
    sectionId: sectionId || undefined,
  });
  const {data: pendingLeaves} = useAdminLeaves({status: 'PENDING'});
  const reviewMutation = useReviewAdminLeave();

  const STATUS_LABEL: Record<LeaveStatus, string> = {
    PENDING: t('leave_pending'),
    APPROVED: t('leave_approved'),
    REJECTED: t('leave_rejected'),
  };

  const styles = useStatusTabStyles();

  const selectedClass = (classes ?? []).find(c => c.id === classId);
  const classOptions = [
    {label: t('common_all'), value: ''},
    ...(classes ?? []).map(c => ({label: c.name, value: c.id})),
  ];
  const sectionOptions = [
    {label: t('common_all'), value: ''},
    ...(selectedClass?.sections ?? []).map(s => ({label: s.name, value: s.id})),
  ];

  const onChangeClass = (val: string): void => {
    setClassId(val);
    setSectionId('');
  };

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
    <>
      <View style={styles.tabsWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsContent}>
          {STATUS_TABS.map(value => {
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

      <Row gap={theme.spacing.sm} align="flex-start" style={styles.filterRow}>
        <View style={styles.pickerWrap}>
          <Select label={t('classSchedule_class')} value={classId} options={classOptions} onChange={onChangeClass} />
        </View>
        <View style={styles.pickerWrap}>
          <Select
            label={t('classSchedule_section')}
            value={sectionId}
            options={sectionOptions}
            onChange={setSectionId}
            disabled={!classId}
          />
        </View>
      </Row>

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
            <LeaveRequestCard
              key={item.id}
              style={styles.leaveCard}
              name={item.studentName}
              meta={t('mySchedule_classSection', {className: item.className, sectionName: item.sectionName})}
              status={item.status}
              fromDate={item.fromDate}
              toDate={item.toDate}
              reason={item.reason}
              reviewedByName={item.reviewedBy?.name}
              reviewRemarks={item.reviewRemarks}
              onTakeAction={() => openReview(item)}
            />
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
    </>
  );
}

function TeacherLeaveTab(): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const [tab, setTab] = useState<StatusTab>('ALL');
  const [reviewTarget, setReviewTarget] = useState<TeacherLeave | null>(null);
  const [remarks, setRemarks] = useState('');
  const [reviewError, setReviewError] = useState<string | undefined>();

  const {data: leaves, isLoading, isError, error, refetch} = useAdminTeacherLeaves(tab === 'ALL' ? undefined : tab);
  const {data: pendingLeaves} = useAdminTeacherLeaves('PENDING');
  const reviewMutation = useReviewTeacherLeaveAsAdmin();

  const STATUS_LABEL: Record<LeaveStatus, string> = {
    PENDING: t('leave_pending'),
    APPROVED: t('leave_approved'),
    REJECTED: t('leave_rejected'),
  };

  const styles = useStatusTabStyles();

  const openReview = (leave: TeacherLeave): void => {
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
    <>
      <View style={styles.tabsWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsContent}>
          {STATUS_TABS.map(value => {
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
            <LeaveRequestCard
              key={item.id}
              style={styles.leaveCard}
              name={item.teacherName}
              status={item.status}
              fromDate={item.fromDate}
              toDate={item.toDate}
              reason={item.reason}
              reviewedByName={item.reviewedBy?.name}
              reviewRemarks={item.reviewRemarks}
              onTakeAction={() => openReview(item)}
            />
          ))
        )}
        <Spacer size={24} />
      </ScrollView>

      <CustomModal visible={!!reviewTarget} onClose={() => setReviewTarget(null)} title={t('leave_reviewTitle')}>
        {reviewTarget ? (
          <>
            <AppText variant="bodyBold">{reviewTarget.teacherName}</AppText>
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
    </>
  );
}

export function AdminLeaveScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const navigation = useNavigation();
  const [audience, setAudience] = useState<Audience>('STUDENT');

  const styles = useThemedStyles(t2 => ({
    audienceWrap: {paddingHorizontal: t2.spacing.lg, paddingTop: t2.spacing.md},
    audiencePill: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: t2.spacing.sm,
      borderRadius: t2.radius.pill,
    },
  }));

  return (
    <Screen padded={false}>
      <CustomHeader title={t('leave_title')} onBack={() => navigation.goBack()} />
      <Row gap={theme.spacing.sm} style={styles.audienceWrap}>
        {(['STUDENT', 'TEACHER'] as Audience[]).map(value => {
          const active = value === audience;
          return (
            <Pressable
              key={value}
              onPress={() => setAudience(value)}
              style={[styles.audiencePill, {backgroundColor: active ? theme.colors.primary : theme.colors.surfaceVariant}]}>
              <AppText variant="label" style={{color: active ? theme.colors.onPrimary : theme.colors.textSecondary}}>
                {value === 'STUDENT' ? t('leave_studentsTab') : t('leave_teachersTab')}
              </AppText>
            </Pressable>
          );
        })}
      </Row>
      {audience === 'STUDENT' ? <StudentLeaveTab /> : <TeacherLeaveTab />}
    </Screen>
  );
}
