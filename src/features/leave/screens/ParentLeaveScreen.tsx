/** Parent — Leave: pick a child (when there's more than one), then apply for / review that child's leave history. */
import React, {useState} from 'react';
import {Pressable, ScrollView, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme, useThemedStyles} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {
  Screen,
  CustomHeader,
  CustomCard,
  CustomModal,
  CustomButton,
  DatePicker,
  ListRow,
  Badge,
  AppText,
  Row,
  Spacer,
  Divider,
  Loader,
  EmptyState,
} from '../../../shared/components';
import type {BadgeTone} from '../../../shared/components';
import {formatDate} from '../../../core/utils/format';
import {attendancePercentageTone} from '../../../shared/helpers';
import {useParentProfile} from '../../parent/parentStudents.service';
import {useParentLeaves, useCancelLeave} from '../parentLeave.service';
import {ScreenNames} from '../../../navigation/ScreenNames';
import type {ParentStackParamList} from '../../../navigation/types';
import type {Leave, LeaveStatus, ParentChild} from '../../../shared/types';

type Nav = NativeStackNavigationProp<ParentStackParamList>;

const STATUS_TONE: Record<LeaveStatus, BadgeTone> = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'error',
};

export function ParentLeaveScreen(): React.JSX.Element {
  const {t} = useLanguage();
  const {data: profile, isLoading, isError, error, refetch} = useParentProfile();
  const [activeChildId, setActiveChildId] = useState<string | null>(null);

  if (isLoading || !profile) {
    if (isError) {
      return (
        <Screen padded={false}>
          <CustomHeader title={t('leave_history')} />
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
    return <Loader message={t('leave_loading')} />;
  }

  const {children} = profile;

  if (children.length === 0) {
    return (
      <Screen padded={false}>
        <CustomHeader title={t('leave_history')} />
        <EmptyState
          icon="calendar"
          title={t('childProfile_noChildrenTitle')}
          message={t('childProfile_noChildrenMessage')}
        />
      </Screen>
    );
  }

  if (children.length === 1) {
    return <ChildLeaveHistory child={children[0]} />;
  }

  const activeChild = children.find(c => c.id === activeChildId);
  if (!activeChild) {
    return <ChildrenList children={children} onSelect={setActiveChildId} />;
  }
  return <ChildLeaveHistory child={activeChild} onBack={() => setActiveChildId(null)} />;
}

function ChildrenList({
  children,
  onSelect,
}: {
  children: ParentChild[];
  onSelect: (id: string) => void;
}): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const styles = useThemedStyles(t2 => ({
    scrollContent: {padding: t2.spacing.lg},
    card: {paddingHorizontal: t2.spacing.lg},
  }));

  return (
    <Screen padded={false}>
      <CustomHeader title={t('leave_history')} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <AppText variant="caption" color="textSecondary">
          {t('parentAttendance_selectChild')}
        </AppText>
        <Spacer size={theme.spacing.sm} />
        <CustomCard padded={false} style={styles.card}>
          {children.map((child, i) => (
            <View key={child.id}>
              {i > 0 ? <Divider /> : null}
              <ListRow
                avatarName={child.name}
                title={child.name}
                subtitle={t('mySchedule_classSection', {className: child.className, sectionName: child.sectionName})}
                onPress={() => onSelect(child.id)}
                right={
                  <Badge
                    label={`${child.attendancePercentage}%`}
                    tone={attendancePercentageTone(child.attendancePercentage)}
                  />
                }
              />
            </View>
          ))}
        </CustomCard>
      </ScrollView>
    </Screen>
  );
}

type TabValue = LeaveStatus | 'ALL';

const TABS: TabValue[] = ['ALL', 'PENDING', 'APPROVED', 'REJECTED'];

function ChildLeaveHistory({child, onBack}: {child: ParentChild; onBack?: () => void}): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const navigation = useNavigation<Nav>();
  const [statusFilter, setStatusFilter] = useState<TabValue>('ALL');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const {
    data: leaves,
    isLoading,
    isError,
    error,
    refetch,
  } = useParentLeaves(child.id, statusFilter === 'ALL' ? undefined : statusFilter);
  const cancelMutation = useCancelLeave();
  const [cancelTarget, setCancelTarget] = useState<Leave | null>(null);
  const [cancelError, setCancelError] = useState<string | undefined>();

  const styles = useThemedStyles(t2 => ({
    tabsWrap: {alignItems: 'center', paddingTop: t2.spacing.md},
    tabsContent: {columnGap: t2.spacing.sm, paddingHorizontal: t2.spacing.lg},
    tabPill: {
      paddingHorizontal: t2.spacing.lg,
      paddingVertical: t2.spacing.sm,
      borderRadius: t2.radius.pill,
    },
    dateFilterRow: {paddingHorizontal: t2.spacing.lg, paddingTop: t2.spacing.sm},
    dateFieldWrap: {flex: 1},
    resetButtonWrap: {width: 96, marginTop: 22},
    scrollContent: {padding: t2.spacing.lg},
    leaveCard: {marginBottom: t2.spacing.md},
    modalButtonWrap: {flex: 1},
  }));

  const STATUS_LABEL: Record<LeaveStatus, string> = {
    PENDING: t('leave_pending'),
    APPROVED: t('leave_approved'),
    REJECTED: t('leave_rejected'),
  };

  const hasActiveFilters = statusFilter !== 'ALL' || !!fromDate || !!toDate;

  const resetFilters = (): void => {
    setStatusFilter('ALL');
    setFromDate('');
    setToDate('');
  };

  // Date filter matches any leave whose [fromDate, toDate] range overlaps the selected window.
  const filteredLeaves = (leaves ?? []).filter(item => {
    if (fromDate && item.toDate < fromDate) {
      return false;
    }
    if (toDate && item.fromDate > toDate) {
      return false;
    }
    return true;
  });

  const openApply = (): void => {
    navigation.navigate(ScreenNames.LeaveApply, {studentId: child.id, studentName: child.name});
  };

  const confirmCancel = (): void => {
    if (!cancelTarget) {
      return;
    }
    setCancelError(undefined);
    cancelMutation.mutate(cancelTarget.id, {
      onSuccess: () => setCancelTarget(null),
      onError: (e: Error) => setCancelError(e.message),
    });
  };

  return (
    <Screen padded={false}>
      <CustomHeader title={child.name} onBack={onBack} actions={[{icon: 'add', onPress: openApply}]} />
      <View style={styles.tabsWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsContent}>
          {TABS.map(value => {
            const active = value === statusFilter;
            const label = value === 'ALL' ? t('common_all') : STATUS_LABEL[value];
            return (
              <Pressable
                key={value}
                onPress={() => setStatusFilter(value)}
                style={[styles.tabPill, {backgroundColor: active ? theme.colors.primary : theme.colors.surfaceVariant}]}>
                <AppText variant="label" style={{color: active ? theme.colors.onPrimary : theme.colors.textSecondary}}>
                  {label}
                </AppText>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <Row gap={theme.spacing.sm} align="flex-start" style={styles.dateFilterRow}>
        <View style={styles.dateFieldWrap}>
          <DatePicker label={t('leave_from')} value={fromDate} onChange={setFromDate} />
        </View>
        <View style={styles.dateFieldWrap}>
          <DatePicker label={t('leave_to')} value={toDate} onChange={setToDate} />
        </View>
        <View style={styles.resetButtonWrap}>
          <CustomButton
            title={t('common_reset')}
            variant="outline"
            size="sm"
            onPress={resetFilters}
            disabled={!hasActiveFilters}
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
          <EmptyState icon="calendar" title={t('leave_noHistoryTitle')} message={t('leave_noHistoryMessage')} />
        ) : filteredLeaves.length === 0 ? (
          <EmptyState
            icon="calendar"
            title={t('leave_noFilterResultsTitle')}
            message={t('leave_noFilterResultsMessage')}
            actionLabel={t('common_reset')}
            onAction={resetFilters}
          />
        ) : (
          filteredLeaves.map(item => (
            <CustomCard key={item.id} style={styles.leaveCard}>
              <Row justify="space-between" align="center">
                <AppText variant="bodyBold">
                  {formatDate(item.fromDate)} - {formatDate(item.toDate)}
                </AppText>
                <Badge label={STATUS_LABEL[item.status]} tone={STATUS_TONE[item.status]} />
              </Row>
              <Spacer size={6} />
              <AppText variant="caption" color="textSecondary">
                {item.reason}
              </AppText>

              {item.status === 'APPROVED' ? (
                <>
                  <Spacer size={6} />
                  <AppText variant="label" color="success">
                    {t('leave_autoAttendanceNote')}
                  </AppText>
                </>
              ) : null}

              {item.status === 'REJECTED' && item.reviewRemarks ? (
                <>
                  <Spacer size={6} />
                  <AppText variant="label" color="textMuted">
                    {t('examResult_remarks')}: {item.reviewRemarks}
                  </AppText>
                </>
              ) : null}

              {item.status === 'PENDING' ? (
                <>
                  <Spacer size={theme.spacing.sm} />
                  <CustomButton
                    title={t('common_cancel')}
                    variant="outline"
                    size="sm"
                    onPress={() => {
                      setCancelError(undefined);
                      setCancelTarget(item);
                    }}
                  />
                </>
              ) : null}
            </CustomCard>
          ))
        )}
        <Spacer size={24} />
      </ScrollView>

      <CustomModal visible={!!cancelTarget} onClose={() => setCancelTarget(null)} title={t('leave_cancelConfirmTitle')}>
        <AppText variant="body" color="textSecondary">
          {t('leave_cancelConfirmMessage')}
        </AppText>
        {cancelError ? (
          <AppText variant="caption" color="error" style={{marginTop: theme.spacing.sm}}>
            {cancelError}
          </AppText>
        ) : null}
        <Spacer size={16} />
        <Row gap={theme.spacing.md}>
          <View style={styles.modalButtonWrap}>
            <CustomButton title={t('common_cancel')} variant="outline" onPress={() => setCancelTarget(null)} />
          </View>
          <View style={styles.modalButtonWrap}>
            <CustomButton
              title={t('leave_cancelConfirmTitle')}
              variant="danger"
              loading={cancelMutation.isPending}
              onPress={confirmCancel}
            />
          </View>
        </Row>
      </CustomModal>
    </Screen>
  );
}
