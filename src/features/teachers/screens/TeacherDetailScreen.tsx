/** Teacher detail — profile, contact, employment info, and subject/class assignments. */
import React, {useState} from 'react';
import {Pressable, RefreshControl, ScrollView, View, StyleSheet} from 'react-native';
import {useNavigation, useRoute, type RouteProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme, useThemedStyles} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {
  Screen,
  AppText,
  CustomHeader,
  CustomCard,
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
import {useTeacher, useAssignTeacherSubject, useRemoveTeacherSubject} from '../teachers.service';
import {useClasses} from '../../classes/classes.service';
import {ScreenNames} from '../../../navigation/ScreenNames';
import type {AdminStackParamList} from '../../../navigation/types';
import type {TeacherSubjectAssignment} from '../../../shared/types';

type Nav = NativeStackNavigationProp<AdminStackParamList>;

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
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignSubjectName, setAssignSubjectName] = useState('');
  const [assignClassId, setAssignClassId] = useState('');
  const [assignError, setAssignError] = useState<string | undefined>();
  const [removeTarget, setRemoveTarget] = useState<TeacherSubjectAssignment | null>(null);
  const [removeError, setRemoveError] = useState<string | undefined>();
  const styles = useThemedStyles(t2 => ({
    scrollContent: {
      padding: t2.spacing.lg,
    },
    avatarBlock: {
      flex: 1,
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
        <CustomCard>
          <Row gap={theme.spacing.md}>
            <Avatar name={teacher.name} uri={teacher.avatarUrl} size={72} />
            <View style={styles.avatarBlock}>
              <AppText variant="h2">{teacher.name}</AppText>
              <AppText variant="caption" color="textSecondary">
                {t('teacherDetail_employeeId')} · {teacher.employeeId}
              </AppText>
              <Spacer size={6} />
              <Badge label={capitalize(teacher.status)} tone={statusTone(teacher.status)} />
            </View>
          </Row>
        </CustomCard>

        <SectionTitle title={t('teacherDetail_contactSection')} />
        <CustomCard>
          <InfoRow label={t('common_email')} value={teacher.email} />
          <InfoRow label={t('common_phone')} value={teacher.phone ?? '—'} />
          <InfoRow label={t('teacherDetail_gender')} value={capitalize(teacher.gender)} />
        </CustomCard>

        <SectionTitle title={t('teacherDetail_employmentSection')} />
        <CustomCard>
          <InfoRow label={t('teacherForm_joiningDateLabel')} value={formatDate(teacher.joiningDate)} />
          <InfoRow label={t('teacherForm_salaryLabel')} value={formatCurrency(teacher.salary)} />
          <InfoRow label={t('teacherDetail_qualification')} value={teacher.qualification} />
          <InfoRow
            label={t('teacherDetail_experience')}
            value={t('teacherDetail_experienceValue', {years: teacher.experienceYears, months: teacher.experienceMonths})}
          />
          <InfoRow label={t('teacherDetail_performanceScore')} value={String(teacher.performanceScore)} />
        </CustomCard>
        <CustomButton
          title={t('staffAttendance_viewHistoryButton')}
          variant="outline"
          size="sm"
          iconLeft="attendance"
          onPress={() =>
            navigation.navigate(ScreenNames.StaffAttendanceRegister, {teacherId, teacherName: teacher.name})
          }
        />

        <SectionTitle title={t('teacherDetail_subjectsTaughtSection')} />
        <CustomCard>
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
        </CustomCard>

        <SectionTitle
          title={t('teacherDetail_subjectsSection')}
          actionLabel={t('teacherDetail_assignSubject')}
          onAction={openAssignModal}
        />
        <CustomCard>
          {teacher.subjects.length === 0 ? (
            <AppText variant="caption" color="textMuted">
              {t('teacherDetail_noSubjects')}
            </AppText>
          ) : (
            teacher.subjects.map((s, index) => (
              <View key={`${s.subjectId}_${s.classId}`}>
                {index > 0 ? <Spacer size={4} /> : null}
                <Row justify="space-between" align="center" style={infoRowStyles.row}>
                  <AppText variant="body" color="textSecondary">
                    {s.name}
                  </AppText>
                  <Row gap={theme.spacing.sm} align="center">
                    <AppText variant="body">{s.className}</AppText>
                    <Pressable onPress={() => setRemoveTarget(s)} hitSlop={8}>
                      <Icon name="delete" size={16} color={theme.colors.error} />
                    </Pressable>
                  </Row>
                </Row>
              </View>
            ))
          )}
        </CustomCard>

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
    </Screen>
  );
}
