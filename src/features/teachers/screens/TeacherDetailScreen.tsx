/** Teacher detail — gradient hero profile, floating contact card, employment info, and subject/class assignments. */
import React, {useState} from 'react';
import {Pressable, RefreshControl, ScrollView, View, StyleSheet, type StyleProp, type ViewStyle} from 'react-native';
import Svg, {Defs, LinearGradient, Rect, Stop} from 'react-native-svg';
import {useNavigation, useRoute, type RouteProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme, useThemedStyles} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {
  Screen,
  AppText,
  CustomHeader,
  CustomModal,
  CustomButton,
  Select,
  Avatar,
  Badge,
  Icon,
  Row,
  Spacer,
  SectionTitle,
  Loader,
  EmptyState,
} from '../../../shared/components';
import {statusTone, capitalize} from '../../../shared/helpers';
import {formatDate, formatCurrency} from '../../../core/utils/format';
import {useTeacher, useAssignTeacherSubject, useRemoveTeacherSubject, useDeleteTeacher, useUpdateTeacher} from '../teachers.service';
import {useClasses} from '../../classes/classes.service';
import {ScreenNames} from '../../../navigation/ScreenNames';
import type {AdminStackParamList} from '../../../navigation/types';
import type {Teacher, TeacherSubjectAssignment} from '../../../shared/types';

type Nav = NativeStackNavigationProp<AdminStackParamList>;

const infoRowStyles = StyleSheet.create({
  row: {
    paddingVertical: 4,
  },
});

function InfoRow({label, value}: {label: string; value: string}): React.JSX.Element {
  const {theme} = useTheme();
  return (
    <Row justify="space-between" align="flex-start" style={infoRowStyles.row}>
      <AppText variant="body" color="textSecondary" style={{flex: 1, paddingRight: theme.spacing.sm}}>
        {label}
      </AppText>
      <AppText variant="body" style={{flexShrink: 1, textAlign: 'right', fontWeight: '600'}}>
        {value}
      </AppText>
    </Row>
  );
}

function ContactItem({icon, value}: {icon: string; value: string}): React.JSX.Element {
  const {theme} = useTheme();
  const styles = useThemedStyles(t => ({
    wrap: {flex: 1, alignItems: 'center'},
    iconCircle: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: theme.colors.primary + '14',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: t.spacing.xs,
    },
  }));

  return (
    <View style={styles.wrap}>
      <View style={styles.iconCircle}>
        <Icon name={icon} size={16} color={theme.colors.primary} />
      </View>
      <AppText variant="caption" color="textSecondary" numberOfLines={1} ellipsizeMode="tail">
        {value}
      </AppText>
    </View>
  );
}

/**
 * Level-2 card — a near-flat surface with an optional barely-visible
 * primary-tinted wash, shared by Contact/Employment/Subjects Taught/Subject
 * cards so they read as one consistent family, distinct from the hero's
 * bolder gradient.
 *
 * Split into two layers on purpose: Android's `elevation` renders as an ugly
 * rectangular grey block when combined with `overflow: 'hidden'` + rounded
 * corners on the SAME view, so the shadow lives on an unclipped OUTER
 * wrapper and the clipping/gradient/border live on an INNER view with no
 * shadow of its own.
 */
function SubtleGradientCard({
  children,
  style,
  variant = 'subtleGradient',
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** 'surface' renders a plain theme.colors.card surface (no gradient) — for content that must stay maximally clean/readable, e.g. the floating contact card. */
  variant?: 'surface' | 'subtleGradient';
}): React.JSX.Element {
  const {theme} = useTheme();
  const gradientId = React.useId();
  const styles = useThemedStyles(t => ({
    shadowWrapper: {
      borderRadius: t.radius.lg,
      backgroundColor: theme.colors.card,
      shadowColor: theme.colors.shadow,
      shadowOpacity: theme.dark ? 0.16 : 0.06,
      shadowRadius: 6,
      shadowOffset: {width: 0, height: 2},
      elevation: 2,
    },
    innerCard: {
      borderRadius: t.radius.lg,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: t.components.card.padding,
      backgroundColor: theme.colors.card,
    },
  }));

  return (
    <View style={[styles.shadowWrapper, style]}>
      <View style={styles.innerCard}>
        {variant === 'subtleGradient' ? (
          <Svg pointerEvents="none" style={StyleSheet.absoluteFill} width="100%" height="100%">
            <Defs>
              <LinearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0%" stopColor={theme.colors.card} stopOpacity={1} />
                <Stop offset="100%" stopColor={theme.colors.primary} stopOpacity={theme.dark ? 0.08 : 0.03} />
              </LinearGradient>
            </Defs>
            <Rect x={0} y={0} width="100%" height="100%" fill={`url(#${gradientId})`} />
          </Svg>
        ) : null}
        {children}
      </View>
    </View>
  );
}

/** Level-1 gradient — the visually prominent identity hero, primary → primaryVariant (a tonal shift of the SAME theme hue, so it never introduces an off-theme colour). */
function TeacherHero({teacher}: {teacher: Teacher}): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const gradientId = React.useId();
  const styles = useThemedStyles(t2 => ({
    hero: {
      marginHorizontal: t2.spacing.lg,
      marginTop: t2.spacing.md,
      borderRadius: 22,
      overflow: 'hidden',
      paddingHorizontal: t2.spacing.lg,
      paddingTop: t2.spacing.lg,
      paddingBottom: 52,
      backgroundColor: theme.colors.primary,
    },
    blobOne: {position: 'absolute', width: 140, height: 140, borderRadius: 70, top: -40, right: -30},
    blobTwo: {position: 'absolute', width: 90, height: 90, borderRadius: 45, bottom: -20, left: -20},
    nameBlock: {flex: 1},
  }));
  const blobColor = {backgroundColor: theme.colors.onPrimary, opacity: theme.dark ? 0.05 : 0.08};

  return (
    <View style={styles.hero}>
      <Svg pointerEvents="none" style={StyleSheet.absoluteFill} width="100%" height="100%">
        <Defs>
          <LinearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor={theme.colors.primary} stopOpacity={1} />
            <Stop offset="100%" stopColor={theme.colors.primaryVariant} stopOpacity={1} />
          </LinearGradient>
        </Defs>
        <Rect x={0} y={0} width="100%" height="100%" fill={`url(#${gradientId})`} />
      </Svg>
      <View style={[styles.blobOne, blobColor]} pointerEvents="none" />
      <View style={[styles.blobTwo, blobColor]} pointerEvents="none" />
      <Row gap={theme.spacing.md} align="center">
        <Avatar name={teacher.name} uri={teacher.avatarUrl} size={76} color={theme.colors.onPrimary} />
        <View style={styles.nameBlock}>
          <AppText variant="h2" color="onPrimary" numberOfLines={1}>
            {teacher.name}
          </AppText>
          <AppText variant="caption" color="onPrimary" style={{opacity: 0.85}}>
            {t('teacherDetail_employeeId')} · {teacher.employeeId}
          </AppText>
          <Spacer size={6} />
          <Badge label={capitalize(teacher.status)} tone={statusTone(teacher.status)} />
        </View>
      </Row>
    </View>
  );
}

/** Floats over the hero's lower edge via a negative marginTop — same overlap technique as ProfileHero's avatar. */
function ContactInfoCard({teacher}: {teacher: Teacher}): React.JSX.Element {
  const styles = useThemedStyles(t => ({
    card: {
      marginHorizontal: 20,
      marginTop: -40,
      marginBottom: t.spacing.md
    },
  }));

  return (
    <SubtleGradientCard style={styles.card} variant="surface">
      <Row justify="space-between">
        <ContactItem icon="email" value={teacher.email} />
        <ContactItem icon="phone" value={teacher.phone ?? '—'} />
        <ContactItem icon="profile" value={capitalize(teacher.gender)} />
      </Row>
    </SubtleGradientCard>
  );
}

function SubjectCard({
  subject,
  onDelete,
}: {
  subject: TeacherSubjectAssignment;
  onDelete: () => void;
}): React.JSX.Element {
  const {theme} = useTheme();
  const styles = useThemedStyles(t => ({card: {marginBottom: t.spacing.sm}}));

  return (
    <SubtleGradientCard style={styles.card}>
      <Row justify="space-between" align="center">
        <View style={{flex: 1}}>
          <AppText variant="body">{subject.name}</AppText>
          <AppText variant="caption" color="textSecondary">
            {subject.className}
          </AppText>
        </View>
        <Pressable onPress={onDelete} hitSlop={8}>
          <Icon name="delete" size={18} color={theme.colors.error} />
        </Pressable>
      </Row>
    </SubtleGradientCard>
  );
}

export function TeacherDetailScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<AdminStackParamList, 'TeacherDetail'>>();
  const {teacherId, initial} = route.params;

  const {data: teacher, isLoading, isRefetching, isError, error, refetch} = useTeacher(teacherId, initial);
  const {data: classes} = useClasses();
  const assignMutation = useAssignTeacherSubject();
  const removeMutation = useRemoveTeacherSubject();
  const deleteMutation = useDeleteTeacher();
  const restoreMutation = useUpdateTeacher();
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignSubjectName, setAssignSubjectName] = useState('');
  const [assignClassId, setAssignClassId] = useState('');
  const [assignError, setAssignError] = useState<string | undefined>();
  const [removeTarget, setRemoveTarget] = useState<TeacherSubjectAssignment | null>(null);
  const [removeError, setRemoveError] = useState<string | undefined>();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | undefined>();
  const styles = useThemedStyles(t2 => ({
    scrollContent: {
      paddingBottom: t2.spacing.lg,
    },
    contentWrap: {
      marginHorizontal: t2.spacing.lg,
    },
    modalButtonWrap: {
      flex: 1,
    },
  }));

  if (isError) {
    return (
      <EmptyState
        icon="warning"
        title={t('common_somethingWentWrong')}
        message={(error as {message?: string} | null)?.message ?? t('common_checkConnection')}
        actionLabel={t('common_retry')}
        onAction={() => refetch()}
      />
    );
  }
  if (isLoading || !teacher) {
    return <Loader message={t('teacherDetail_loadingTeacher')} />;
  }

  const subjectOptions = teacher.subjectsTaught.map(s => ({label: s, value: s}));
  const classOptions = (classes ?? []).map(c => ({label: c.name, value: c.id}));

  const openAssignModal = (): void => {
    setAssignError(undefined);
    setAssignSubjectName(teacher.subjectsTaught[0] ?? '');
    setAssignClassId('');
    setAssignModalOpen(true);
  };

  const submitAssign = (): void => {
    if (!assignSubjectName || !assignClassId) {
      return;
    }
    setAssignError(undefined);
    assignMutation.mutate(
      {teacherId, input: {subject: assignSubjectName, classId: assignClassId}},
      {
        onSuccess: () => setAssignModalOpen(false),
        onError: (e: Error) => setAssignError(e.message),
      },
    );
  };

  const submitRemove = (): void => {
    if (!removeTarget) {
      return;
    }
    setRemoveError(undefined);
    removeMutation.mutate(
      {teacherId, subjectId: removeTarget.subjectId, classId: removeTarget.classId},
      {
        onSuccess: () => setRemoveTarget(null),
        onError: (e: Error) => setRemoveError(e.message),
      },
    );
  };

  const onDelete = (): void => {
    setDeleteError(undefined);
    deleteMutation.mutate(teacherId, {
      onSuccess: () => setDeleteConfirmOpen(false),
      onError: (e: Error) => setDeleteError(e.message),
    });
  };

  const onRestore = (): void => {
    restoreMutation.mutate({id: teacherId, input: {status: 'active'}});
  };

  return (
    <Screen padded={false}>
      <CustomHeader
        title={t('teacherDetail_headerTitle')}
        onBack={() => navigation.goBack()}
        actions={[{icon: 'edit', onPress: () => navigation.navigate(ScreenNames.TeacherEdit, {teacherId, initial: teacher})}]}
      />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />}>
        <TeacherHero teacher={teacher} />
        <ContactInfoCard teacher={teacher} />

        <View style={styles.contentWrap}>
          <SectionTitle title={t('teacherDetail_employmentSection')} icon="reports" />
          <SubtleGradientCard>
            <InfoRow label={t('teacherForm_joiningDateLabel')} value={formatDate(teacher.joiningDate)} />
            <InfoRow label={t('teacherForm_salaryLabel')} value={formatCurrency(teacher.salary)} />
            <InfoRow label={t('teacherDetail_qualification')} value={teacher.qualification} />
            <InfoRow
              label={t('teacherDetail_experience')}
              value={t('teacherDetail_experienceValue', {years: teacher.experienceYears, months: teacher.experienceMonths})}
            />
            <InfoRow label={t('teacherDetail_performanceScore')} value={String(teacher.performanceScore)} />
          </SubtleGradientCard>
          <Spacer size={theme.spacing.sm} />
          <CustomButton
            title={t('staffAttendance_viewHistoryButton')}
            iconLeft="attendance"
            onPress={() =>
              navigation.navigate(ScreenNames.StaffAttendanceRegister, {teacherId, teacherName: teacher.name})
            }
          />

          <SectionTitle title={t('teacherDetail_subjectsTaughtSection')} icon="book" />
          <SubtleGradientCard>
            {teacher.subjectsTaught.length === 0 ? (
              <AppText variant="caption" color="textMuted">
                {t('teacherDetail_noSubjectsTaught')}
              </AppText>
            ) : (
              <Row gap={theme.spacing.xs} wrap>
                {teacher.subjectsTaught.map(s => (
                  <Badge key={s} label={s} tone="primary" />
                ))}
              </Row>
            )}
          </SubtleGradientCard>

          <SectionTitle
            title={t('teacherDetail_subjectsSection')}
            actionLabel={t('teacherDetail_assignSubject')}
            onAction={openAssignModal}
          />
          {teacher.subjects.length === 0 ? (
            <SubtleGradientCard>
              <AppText variant="caption" color="textMuted">
                {t('teacherDetail_noSubjects')}
              </AppText>
            </SubtleGradientCard>
          ) : (
            teacher.subjects.map(s => (
              <SubjectCard key={`${s.subjectId}_${s.classId}`} subject={s} onDelete={() => setRemoveTarget(s)} />
            ))
          )}

          <Spacer size={theme.spacing.md} />
          {teacher.status === 'inactive' ? (
            <CustomButton
              title={t('teacherDetail_restoreTeacher')}
              iconLeft="check"
              loading={restoreMutation.isPending}
              onPress={onRestore}
            />
          ) : (
            <CustomButton
              title={t('teacherDetail_deleteTeacher')}
              variant="danger"
              iconLeft="delete"
              onPress={() => {
                setDeleteError(undefined);
                setDeleteConfirmOpen(true);
              }}
            />
          )}
        </View>

        <Spacer size={24} />
      </ScrollView>

      <CustomModal
        visible={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title={t('teacherDetail_assignSubject')}>
        <Select
          label={t('teacherDetail_subjectLabel')}
          value={assignSubjectName}
          options={subjectOptions}
          onChange={val => {
            setAssignSubjectName(val);
            setAssignError(undefined);
          }}
          required
        />
        <Select
          label={t('studentForm_classLabel')}
          value={assignClassId}
          options={classOptions}
          onChange={val => {
            setAssignClassId(val);
            setAssignError(undefined);
          }}
          required
        />
        {assignError ? (
          <AppText variant="caption" color="error" style={{marginBottom: theme.spacing.sm}}>
            {assignError}
          </AppText>
        ) : null}
        <Row gap={theme.spacing.md}>
          <View style={styles.modalButtonWrap}>
            <CustomButton title={t('common_cancel')} variant="outline" onPress={() => setAssignModalOpen(false)} />
          </View>
          <View style={styles.modalButtonWrap}>
            <CustomButton
              title={t('teacherForm_assignButton')}
              loading={assignMutation.isPending}
              disabled={!assignSubjectName || !assignClassId}
              onPress={submitAssign}
            />
          </View>
        </Row>
      </CustomModal>

      <CustomModal
        visible={!!removeTarget}
        onClose={() => setRemoveTarget(null)}
        title={t('teacherDetail_removeSubjectTitle')}>
        <AppText variant="body" color="textSecondary">
          {t('teacherDetail_removeSubjectConfirm', {
            subject: removeTarget?.name ?? '',
            className: removeTarget?.className ?? '',
          })}
        </AppText>
        {removeError ? (
          <AppText variant="caption" color="error" style={{marginTop: theme.spacing.sm}}>
            {removeError}
          </AppText>
        ) : null}
        <Spacer size={16} />
        <Row gap={theme.spacing.md}>
          <View style={styles.modalButtonWrap}>
            <CustomButton title={t('common_cancel')} variant="outline" onPress={() => setRemoveTarget(null)} />
          </View>
          <View style={styles.modalButtonWrap}>
            <CustomButton
              title={t('common_remove')}
              variant="danger"
              loading={removeMutation.isPending}
              onPress={submitRemove}
            />
          </View>
        </Row>
      </CustomModal>

      <CustomModal
        visible={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title={t('teacherDetail_deleteTeacher')}>
        <AppText variant="body" color="textSecondary">
          {t('teacherDetail_deleteConfirmMessage')}
        </AppText>
        {deleteError ? (
          <AppText variant="caption" color="error" style={{marginTop: theme.spacing.sm}}>
            {deleteError}
          </AppText>
        ) : null}
        <Spacer size={16} />
        <Row gap={theme.spacing.md}>
          <View style={styles.modalButtonWrap}>
            <CustomButton title={t('common_cancel')} variant="outline" onPress={() => setDeleteConfirmOpen(false)} />
          </View>
          <View style={styles.modalButtonWrap}>
            <CustomButton
              title={t('common_delete')}
              variant="danger"
              loading={deleteMutation.isPending}
              onPress={onDelete}
            />
          </View>
        </Row>
      </CustomModal>
    </Screen>
  );
}
