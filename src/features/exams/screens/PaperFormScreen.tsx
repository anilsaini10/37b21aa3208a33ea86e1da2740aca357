/**
 * Add / edit one date sheet paper (admin).
 *
 * Class: only the exam's classes. Subject: only that class's subjects not yet
 * scheduled in this exam. Date: limited to the exam's range. Conflicts from the
 * backend stay on the form, under the field they belong to, with a "Clashes with …" card.
 */
import React, {useEffect, useMemo, useState} from 'react';
import {Pressable, ScrollView, View} from 'react-native';
import {useNavigation, useRoute, type RouteProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme, useThemedStyles} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {
  Screen,
  CustomHeader,
  CustomInput,
  CustomButton,
  DatePicker,
  TimePicker,
  Select,
  AppText,
  Icon,
  Row,
  Spacer,
  Loader,
  EmptyState,
} from '../../../shared/components';
import {useExamClasses} from '../adminExams.service';
import {useClasses} from '../../classes/classes.service';
import {
  useCreatePaper,
  useExamSchedule,
  useUpdatePaper,
  type CreatePaperInput,
  type UpdatePaperInput,
} from '../examSchedule.service';
import {
  STALE_ID_CODES,
  parseMarks,
  toPaperSaveError,
  validatePaperDraft,
  type PaperDraft,
  type PaperField,
  type PaperFieldErrors,
  type PaperSaveError,
} from '../examSchedule.utils';
import {ConflictCard} from '../components/ConflictCard';
import {InvigilatorSelect} from '../components/InvigilatorSelect';
import {ScreenNames} from '../../../navigation/ScreenNames';
import type {AdminStackParamList} from '../../../navigation/types';
import type {ExamPaperListItem} from '../../../shared/types';

type Nav = NativeStackNavigationProp<AdminStackParamList>;

function draftFromPaper(paper: ExamPaperListItem): PaperDraft {
  return {
    classId: paper.classId,
    subjectId: paper.subjectId,
    date: paper.date.slice(0, 10),
    startTime: paper.startTime,
    endTime: paper.endTime,
    maxMarks: String(paper.maxMarks),
    roomNo: paper.roomNo ?? '',
    invigilatorId: paper.invigilator?.id,
    invigilatorName: paper.invigilator?.name,
  };
}

export function PaperFormScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<AdminStackParamList, 'PaperForm'>>();
  const {examId, paper, classId: presetClassId} = route.params;
  const isEdit = !!paper;
  /** Once any student is graded/absent, the backend refuses class/subject changes. */
  const hasMarks = (paper?.markedCount ?? 0) > 0;

  const schedule = useExamSchedule(examId);
  const examClasses = useExamClasses(examId);
  const allClasses = useClasses();
  const createMutation = useCreatePaper();
  const updateMutation = useUpdatePaper();

  const [draft, setDraft] = useState<PaperDraft>(() =>
    paper
      ? draftFromPaper(paper)
      : {classId: presetClassId ?? '', subjectId: '', maxMarks: '', roomNo: ''},
  );
  const [errors, setErrors] = useState<PaperFieldErrors>({});
  const [saveError, setSaveError] = useState<PaperSaveError | undefined>();

  const exam = schedule.data?.exam;
  const examClassList = examClasses.data ?? [];

  // Prefill max marks from the class's exam default (create only, until the user types their own).
  const classDefaultMaxMarks = examClassList.find(c => c.classId === draft.classId)?.maxMarks;
  useEffect(() => {
    if (!isEdit && classDefaultMaxMarks !== undefined && !draft.maxMarks) {
      setDraft(d => ({...d, maxMarks: String(classDefaultMaxMarks)}));
    }
  }, [isEdit, classDefaultMaxMarks, draft.maxMarks]);

  const classOptions = examClassList.map(c => ({label: c.className, value: c.classId}));

  const subjectOptions = useMemo(() => {
    const curriculum = (allClasses.data ?? []).find(c => c.id === draft.classId)?.subjects ?? [];
    const scheduled = new Set(
      (schedule.data?.items ?? [])
        .filter(p => p.classId === draft.classId && p.id !== paper?.id)
        .map(p => p.subjectId),
    );
    return curriculum.filter(s => !scheduled.has(s.id)).map(s => ({label: s.name, value: s.id}));
  }, [allClasses.data, schedule.data, draft.classId, paper?.id]);

  const styles = useThemedStyles(t2 => ({
    content: {padding: t2.spacing.lg},
    timeRow: {flexDirection: 'row', columnGap: t2.spacing.md},
    timeCol: {flex: 1},
    notice: {
      flexDirection: 'row',
      columnGap: t2.spacing.sm,
      padding: t2.spacing.md,
      borderRadius: t2.radius.md,
      backgroundColor: t2.colors.surfaceVariant,
      marginBottom: t2.spacing.md,
    },
    rules: {
      marginTop: t2.spacing.lg,
      padding: t2.spacing.md,
      borderRadius: t2.radius.md,
      backgroundColor: t2.colors.surfaceVariant,
      rowGap: t2.spacing.xs,
    },
  }));

  const update = (patch: Partial<PaperDraft>, clears: PaperField[]): void => {
    setDraft(d => ({...d, ...patch}));
    setErrors(e => {
      const next = {...e};
      clears.forEach(f => delete next[f]);
      return next;
    });
    if (saveError?.field && clears.includes(saveError.field)) {
      setSaveError(undefined);
    }
  };

  const onSubmit = (): void => {
    setSaveError(undefined);
    const fieldErrors = validatePaperDraft(draft, {startDate: exam?.startDate, endDate: exam?.endDate}, t);
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) {
      return;
    }

    const maxMarks = draft.maxMarks.trim() ? parseMarks(draft.maxMarks) : undefined;
    const roomNo = draft.roomNo.trim();
    const onError = (e: unknown): void => {
      const err = toPaperSaveError(e, t('common_somethingWentWrong'));
      setSaveError(err);
      if (err.code && STALE_ID_CODES.has(err.code)) {
        schedule.refetch();
        allClasses.refetch();
      }
    };
    const onSuccess = (): void => navigation.goBack();

    if (paper) {
      const before = draftFromPaper(paper);
      const input: UpdatePaperInput = {};
      if (draft.classId !== before.classId) {
        input.classId = draft.classId;
      }
      if (draft.subjectId !== before.subjectId) {
        input.subjectId = draft.subjectId;
      }
      if (draft.date !== before.date) {
        input.date = draft.date;
      }
      if (draft.startTime !== before.startTime) {
        input.startTime = draft.startTime;
      }
      if (draft.endTime !== before.endTime) {
        input.endTime = draft.endTime;
      }
      if (maxMarks !== undefined && maxMarks !== paper.maxMarks) {
        input.maxMarks = maxMarks;
      }
      if (roomNo !== before.roomNo) {
        input.roomNo = roomNo || null;
      }
      if (draft.invigilatorId !== before.invigilatorId) {
        input.invigilatorId = draft.invigilatorId ?? null;
      }
      if (Object.keys(input).length === 0) {
        navigation.goBack();
        return;
      }
      updateMutation.mutate({examId, scheduleId: paper.id, input}, {onSuccess, onError});
    } else {
      const input: CreatePaperInput = {
        classId: draft.classId,
        subjectId: draft.subjectId,
        date: draft.date as string,
        startTime: draft.startTime as string,
        endTime: draft.endTime as string,
        maxMarks,
        roomNo: roomNo || undefined,
        invigilatorId: draft.invigilatorId,
      };
      createMutation.mutate({examId, input}, {onSuccess, onError});
    }
  };

  /** Backend error for this field (takes precedence over the client check — it's the newer one). */
  const fieldError = (field: PaperField): string | undefined =>
    saveError?.field === field ? saveError.message : errors[field];

  const conflictFor = (field: PaperField): React.ReactNode =>
    saveError?.field === field && saveError.conflict ? (
      <ConflictCard conflict={saveError.conflict} currentExamId={examId} />
    ) : null;

  const existingPaper =
    saveError?.code === 'SUBJECT_ALREADY_SCHEDULED' && saveError.conflict
      ? (schedule.data?.items ?? []).find(p => p.id === saveError.conflict?.scheduleId)
      : undefined;

  if (schedule.isError || examClasses.isError) {
    return (
      <Screen padded={false}>
        <CustomHeader title={isEdit ? t('dateSheet_editPaper') : t('dateSheet_addPaper')} onBack={() => navigation.goBack()} />
        <EmptyState
          icon="warning"
          title={t('common_somethingWentWrong')}
          message={((schedule.error ?? examClasses.error) as {message?: string} | null)?.message ?? t('common_checkConnection')}
          actionLabel={t('common_retry')}
          onAction={() => {
            schedule.refetch();
            examClasses.refetch();
          }}
        />
      </Screen>
    );
  }
  if (!schedule.data || !examClasses.data) {
    return <Loader message={t('dateSheet_loading')} />;
  }

  return (
    <Screen padded={false}>
      <CustomHeader title={isEdit ? t('dateSheet_editPaper') : t('dateSheet_addPaper')} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {hasMarks ? (
          <View style={styles.notice}>
            <Icon name="info" size={16} color={theme.colors.warning} />
            <AppText variant="caption" color="textSecondary" style={{flex: 1}}>
              {t('dateSheet_hasMarksNotice', {count: paper?.markedCount ?? 0})}
            </AppText>
          </View>
        ) : null}

        <Select
          label={t('dateSheet_class')}
          value={draft.classId}
          options={classOptions}
          onChange={v => update({classId: v, subjectId: '', maxMarks: isEdit ? draft.maxMarks : ''}, ['classId', 'subjectId'])}
          error={fieldError('classId')}
          disabled={hasMarks}
          required
        />
        <Select
          label={t('dateSheet_subject')}
          value={draft.subjectId}
          options={subjectOptions}
          placeholder={
            !draft.classId
              ? t('dateSheet_selectClassFirst')
              : subjectOptions.length === 0
                ? t('dateSheet_allSubjectsScheduled')
                : undefined
          }
          onChange={v => update({subjectId: v}, ['subjectId'])}
          error={fieldError('subjectId')}
          disabled={hasMarks || !draft.classId || subjectOptions.length === 0}
          required
        />
        {conflictFor('subjectId')}
        {existingPaper ? (
          <>
            <CustomButton
              title={t('dateSheet_editExistingPaper')}
              variant="outline"
              size="sm"
              onPress={() => navigation.replace(ScreenNames.PaperForm, {examId, paper: existingPaper})}
            />
            <Spacer size={theme.spacing.md} />
          </>
        ) : null}

        <DatePicker
          label={t('common_date')}
          value={draft.date}
          onChange={v => update({date: v}, ['date'])}
          minDate={exam?.startDate ?? undefined}
          maxDate={exam?.endDate ?? undefined}
          error={fieldError('date')}
          required
        />
        <View style={styles.timeRow}>
          <View style={styles.timeCol}>
            <TimePicker
              label={t('dateSheet_startTime')}
              value={draft.startTime}
              onChange={v => update({startTime: v}, ['time'])}
              error={fieldError('time') ? ' ' : undefined}
              required
            />
          </View>
          <View style={styles.timeCol}>
            <TimePicker
              label={t('dateSheet_endTime')}
              value={draft.endTime}
              onChange={v => update({endTime: v}, ['time'])}
              error={fieldError('time') ? ' ' : undefined}
              required
            />
          </View>
        </View>
        {fieldError('time') ? (
          <AppText variant="caption" color="error" style={{marginTop: -theme.spacing.sm, marginBottom: theme.spacing.md}}>
            {fieldError('time')}
          </AppText>
        ) : null}
        {conflictFor('time')}
        {conflictFor('date')}

        <CustomInput
          label={t('dateSheet_maxMarks')}
          keyboardType="decimal-pad"
          value={draft.maxMarks}
          onChangeText={v => update({maxMarks: v}, ['maxMarks'])}
          error={fieldError('maxMarks')}
        />
        {hasMarks && !fieldError('maxMarks') ? (
          <AppText variant="caption" color="textMuted" style={{marginTop: -theme.spacing.sm, marginBottom: theme.spacing.md}}>
            {t('dateSheet_maxMarksLockedHint')}
          </AppText>
        ) : null}

        <CustomInput
          label={t('dateSheet_room')}
          placeholder={t('dateSheet_roomPlaceholder')}
          value={draft.roomNo}
          onChangeText={v => update({roomNo: v}, ['roomNo'])}
          error={fieldError('roomNo')}
        />
        {conflictFor('roomNo')}

        <InvigilatorSelect
          label={t('dateSheet_invigilator')}
          value={draft.invigilatorId ? {id: draft.invigilatorId, name: draft.invigilatorName ?? ''} : undefined}
          onChange={v => update({invigilatorId: v?.id, invigilatorName: v?.name}, ['invigilatorId'])}
          error={fieldError('invigilatorId')}
        />
        {conflictFor('invigilatorId')}
        {/* Find a substitute / free invigilator for this paper's slot. */}
        {draft.date && draft.startTime && draft.endTime ? (
          <Pressable
            hitSlop={8}
            style={{alignSelf: 'flex-start', marginTop: -theme.spacing.sm, marginBottom: theme.spacing.md}}
            onPress={() =>
              navigation.navigate(ScreenNames.TeacherAvailability, {
                date: draft.date,
                startTime: draft.startTime,
                endTime: draft.endTime,
              })
            }>
            <AppText variant="label" color="primary">
              {t('availability_findFreeTeacher')}
            </AppText>
          </Pressable>
        ) : null}

        {saveError && !saveError.field ? (
          <AppText variant="caption" color="error" style={{marginBottom: theme.spacing.sm}}>
            {saveError.message}
          </AppText>
        ) : null}

        <CustomButton
          title={isEdit ? t('common_save') : t('dateSheet_addPaper')}
          onPress={onSubmit}
          loading={createMutation.isPending || updateMutation.isPending}
        />

        <View style={styles.rules}>
          <Row gap={6}>
            <Icon name="info" size={14} color={theme.colors.textMuted} />
            <AppText variant="label" color="textSecondary">
              {t('dateSheet_rulesTitle')}
            </AppText>
          </Row>
          {[t('dateSheet_ruleClass'), t('dateSheet_ruleInvigilator'), t('dateSheet_ruleRoom'), t('dateSheet_ruleSubject')].map(rule => (
            <AppText key={rule} variant="caption" color="textMuted">
              • {rule}
            </AppText>
          ))}
        </View>
        <Spacer size={24} />
      </ScrollView>
    </Screen>
  );
}
