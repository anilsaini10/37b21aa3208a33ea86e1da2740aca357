/** Homework detail — a teacher's own homework (view-only here; edit via the existing form), with quick access to submission tracking and a status control. */
import React, {useState} from 'react';
import {Pressable, View} from 'react-native';
import {useNavigation, useRoute, type RouteProp} from '@react-navigation/native';
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
  Row,
  Spacer,
  Badge,
  Loader,
  EmptyState,
} from '../../../shared/components';
import type {BadgeTone} from '../../../shared/components';
import {formatDate} from '../../../core/utils/format';
import {capitalize, homeworkStatusTone} from '../../../shared/helpers';
import {useTeacherHomeworkItem, useUpdateTeacherHomework} from '../teacherHomework.service';
import {ScreenNames} from '../../../navigation/ScreenNames';
import type {TeacherStackParamList} from '../../../navigation/types';
import type {HomeworkStatus, HomeworkType} from '../../../shared/types';

type Nav = NativeStackNavigationProp<TeacherStackParamList>;
type EditableStatus = Extract<HomeworkStatus, 'ACTIVE' | 'IN_PROGRESS' | 'COMPLETED'>;

const TYPE_TONE: Record<HomeworkType, BadgeTone> = {
  ASSIGNMENT: 'primary',
  PROJECT: 'info',
  READING: 'success',
  PRACTICE: 'warning',
  OTHER: 'neutral',
};

const EDITABLE_STATUSES: EditableStatus[] = ['ACTIVE', 'IN_PROGRESS', 'COMPLETED'];

export function HomeworkDetailScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<TeacherStackParamList, 'HomeworkDetail'>>();
  const {homeworkId, initial} = route.params;
  const {data: homework, isLoading, isError, error, refetch} = useTeacherHomeworkItem(homeworkId, initial);
  const updateMutation = useUpdateTeacherHomework();
  const [statusError, setStatusError] = useState<string | undefined>();
  const [pendingStatus, setPendingStatus] = useState<EditableStatus | null>(null);

  const styles = useThemedStyles(t2 => ({
    content: {padding: t2.spacing.lg},
    card: {marginBottom: t2.spacing.md},
    titleBlock: {flex: 1},
    statusPill: {
      paddingHorizontal: t2.spacing.lg,
      paddingVertical: t2.spacing.sm,
      borderRadius: t2.radius.pill,
    },
    modalButtonWrap: {flex: 1},
  }));

  const STATUS_LABEL: Record<HomeworkStatus, string> = {
    SCHEDULED: t('homeworkDetail_statusScheduled'),
    ACTIVE: t('homeworkDetail_statusActive'),
    IN_PROGRESS: t('homeworkDetail_statusInProgress'),
    COMPLETED: t('homeworkDetail_statusCompleted'),
  };

  if (isError) {
    return (
      <Screen padded={false}>
        <CustomHeader title={t('homeworkDetail_title')} onBack={() => navigation.goBack()} />
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

  if (isLoading || !homework) {
    return <Loader message={t('homeworkDetail_loading')} />;
  }

  const openStatusConfirm = (status: EditableStatus): void => {
    if (status === homework.status) {
      return;
    }
    setStatusError(undefined);
    setPendingStatus(status);
  };

  const confirmStatusChange = (): void => {
    if (!pendingStatus) {
      return;
    }
    setStatusError(undefined);
    updateMutation.mutate(
      {homeworkId, input: {status: pendingStatus}},
      {
        onSuccess: () => setPendingStatus(null),
        onError: (e: Error) => setStatusError(e.message),
      },
    );
  };

  return (
    <Screen padded={false}>
      <CustomHeader
        title={t('homeworkDetail_title')}
        onBack={() => navigation.goBack()}
        actions={[
          {icon: 'edit', onPress: () => navigation.navigate(ScreenNames.HomeworkForm, {homeworkId, initial: homework})},
        ]}
      />
      <View style={styles.content}>
        <CustomCard style={styles.card}>
          <Row justify="space-between" align="flex-start">
            <AppText variant="h3" style={styles.titleBlock}>
              {homework.title}
            </AppText>
            <Badge label={capitalize(homework.type.toLowerCase())} tone={TYPE_TONE[homework.type]} />
          </Row>
          <Spacer size={theme.spacing.sm} />
          <AppText variant="caption" color="textSecondary">
            {t('mySchedule_classSection', {className: homework.className, sectionName: homework.sectionName})} ·{' '}
            {homework.subjectName}
          </AppText>
          <Spacer size={theme.spacing.xs} />
          {homework.fromDate ? (
            <>
              <AppText variant="caption" color="textSecondary">
                {t('homeworkDetail_availableFrom', {date: formatDate(homework.fromDate)})}
              </AppText>
              <Spacer size={theme.spacing.xs} />
            </>
          ) : null}
          <AppText variant="caption" color="textSecondary">
            {t('homeworkDetail_dueOn', {date: formatDate(homework.dueDate)})}
          </AppText>
          {homework.description ? (
            <>
              <Spacer size={theme.spacing.md} />
              <AppText variant="body">{homework.description}</AppText>
            </>
          ) : null}
        </CustomCard>

        <CustomCard style={styles.card}>
          <Row justify="space-between" align="center">
            <AppText variant="label" color="textSecondary">
              {t('homeworkDetail_statusSection')}
            </AppText>
            <Badge label={STATUS_LABEL[homework.status]} tone={homeworkStatusTone(homework.status)} />
          </Row>
          {homework.status === 'SCHEDULED' ? (
            <>
              <Spacer size={theme.spacing.sm} />
              <AppText variant="caption" color="textMuted">
                {t('homeworkDetail_scheduledNote', {date: formatDate(homework.fromDate ?? '')})}
              </AppText>
            </>
          ) : (
            <>
              <Spacer size={theme.spacing.sm} />
              <Row gap={theme.spacing.sm} wrap>
                {EDITABLE_STATUSES.map(s => {
                  const active = homework.status === s;
                  return (
                    <Pressable
                      key={s}
                      onPress={() => openStatusConfirm(s)}
                      disabled={updateMutation.isPending}
                      style={[styles.statusPill, {backgroundColor: active ? theme.colors.primary : theme.colors.surfaceVariant}]}>
                      <AppText variant="label" style={{color: active ? theme.colors.onPrimary : theme.colors.textSecondary}}>
                        {STATUS_LABEL[s]}
                      </AppText>
                    </Pressable>
                  );
                })}
              </Row>
            </>
          )}
        </CustomCard>
      </View>

      <CustomModal
        visible={!!pendingStatus}
        onClose={() => setPendingStatus(null)}
        title={t('homeworkDetail_confirmStatusTitle')}>
        <AppText variant="body" color="textSecondary">
          {t('homeworkDetail_confirmStatusMessage', {status: pendingStatus ? STATUS_LABEL[pendingStatus] : ''})}
        </AppText>
        {statusError ? (
          <AppText variant="caption" color="error" style={{marginTop: theme.spacing.sm}}>
            {statusError}
          </AppText>
        ) : null}
        <Spacer size={16} />
        <Row gap={theme.spacing.md}>
          <View style={styles.modalButtonWrap}>
            <CustomButton title={t('common_cancel')} variant="outline" onPress={() => setPendingStatus(null)} />
          </View>
          <View style={styles.modalButtonWrap}>
            <CustomButton
              title={t('common_confirm')}
              loading={updateMutation.isPending}
              onPress={confirmStatusChange}
            />
          </View>
        </Row>
      </CustomModal>
    </Screen>
  );
}
