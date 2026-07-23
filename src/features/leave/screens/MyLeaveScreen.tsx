/** Teacher — My Leave: apply for leave and track its status; cancel while still pending. */
import React, {useState} from 'react';
import {ScrollView, View} from 'react-native';
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
  AppText,
  Badge,
  Row,
  Spacer,
  Loader,
  EmptyState,
} from '../../../shared/components';
import type {BadgeTone} from '../../../shared/components';
import {formatDate} from '../../../core/utils/format';
import {useMyLeaves, useCancelMyLeave} from '../teacherOwnLeave.service';
import {ScreenNames} from '../../../navigation/ScreenNames';
import type {TeacherStackParamList} from '../../../navigation/types';
import type {LeaveStatus, MyLeave} from '../../../shared/types';

type Nav = NativeStackNavigationProp<TeacherStackParamList>;

const STATUS_TONE: Record<LeaveStatus, BadgeTone> = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'error',
};

export function MyLeaveScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const navigation = useNavigation<Nav>();
  const {data: leaves, isLoading, isError, error, refetch} = useMyLeaves();
  const cancelMutation = useCancelMyLeave();
  const [cancelTarget, setCancelTarget] = useState<MyLeave | null>(null);
  const [cancelError, setCancelError] = useState<string | undefined>();

  const STATUS_LABEL: Record<LeaveStatus, string> = {
    PENDING: t('leave_pending'),
    APPROVED: t('leave_approved'),
    REJECTED: t('leave_rejected'),
  };

  const styles = useThemedStyles(t2 => ({
    scrollContent: {padding: t2.spacing.lg},
    leaveCard: {marginBottom: t2.spacing.md},
    modalButtonWrap: {flex: 1},
  }));

  const openApply = (): void => {
    navigation.navigate(ScreenNames.MyLeaveApply);
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
      <CustomHeader title={t('teacherProfile_myLeave')} onBack={() => navigation.goBack()} actions={[{icon: 'add', onPress: openApply}]} />
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
        ) : (
          leaves.map(item => (
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
