/**
 * "Create date sheet for a class" — bulk builder (admin).
 *
 * Pick a class → one row per class subject not yet scheduled in this exam →
 * fill date / time / max marks / room / invigilator → "Save all" posts every
 * included row in ONE all-or-nothing request. If the server rejects a row
 * (`details.paperIndex`), nothing was saved: that row is highlighted so the user
 * can fix it and resubmit everything.
 */
import React, {useEffect, useMemo, useRef, useState} from 'react';
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
  ResultModal,
  AppText,
  Icon,
  Row,
  Spacer,
  Loader,
  EmptyState,
} from '../../../shared/components';
import {useExamClasses} from '../adminExams.service';
import {useClasses} from '../../classes/classes.service';
import {useCreatePapersBulk, useExamSchedule, type CreatePaperInput} from '../examSchedule.service';
import {
  BULK_MAX_PAPERS,
  STALE_ID_CODES,
  findRowOverlaps,
  parseMarks,
  toPaperSaveError,
  validatePaperDraft,
  type PaperDraft,
  type PaperFieldErrors,
  type PaperSaveError,
} from '../examSchedule.utils';
import {ConflictCard} from '../components/ConflictCard';
import {InvigilatorSelect} from '../components/InvigilatorSelect';
import type {AdminStackParamList} from '../../../navigation/types';

type Nav = NativeStackNavigationProp<AdminStackParamList>;

interface BuilderRow extends PaperDraft {
  subjectName: string;
  included: boolean;
}

export function DateSheetBuilderScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<AdminStackParamList, 'DateSheetBuilder'>>();
  const {examId, classId: presetClassId} = route.params;

  const schedule = useExamSchedule(examId);
  const examClasses = useExamClasses(examId);
  const allClasses = useClasses();
  const bulkMutation = useCreatePapersBulk();

  const [classId, setClassId] = useState(presetClassId ?? '');
  const [rows, setRows] = useState<BuilderRow[]>([]);
  const [rowErrors, setRowErrors] = useState<Record<number, PaperFieldErrors & {overlap?: string}>>({});
  const [serverError, setServerError] = useState<PaperSaveError | undefined>();
  const [formError, setFormError] = useState<string | undefined>();
  const [defaultStart, setDefaultStart] = useState<string | undefined>();
  const [defaultEnd, setDefaultEnd] = useState<string | undefined>();
  const [savedCount, setSavedCount] = useState<number | undefined>();

  const scrollRef = useRef<ScrollView>(null);
  const rowY = useRef<Record<number, number>>({});

  const exam = schedule.data?.exam;
  const classDefaultMaxMarks = examClasses.data?.find(c => c.classId === classId)?.maxMarks;

  /** Class subjects already on this exam's date sheet — skipped (the server would reject them). */
  const scheduledSubjects = useMemo(
    () => new Set((schedule.data?.items ?? []).filter(p => p.classId === classId).map(p => p.subjectId)),
    [schedule.data, classId],
  );
  const curriculum = useMemo(
    () => (allClasses.data ?? []).find(c => c.id === classId)?.subjects ?? [],
    [allClasses.data, classId],
  );
  const skippedCount = curriculum.filter(s => scheduledSubjects.has(s.id)).length;

  // (Re)build rows when the class — or what's already scheduled for it — changes.
  useEffect(() => {
    if (!classId || !schedule.data || !allClasses.data) {
      setRows([]);
      return;
    }
    setRows(
      curriculum
        .filter(s => !scheduledSubjects.has(s.id))
        .map(s => ({
          classId,
          subjectId: s.id,
          subjectName: s.name,
          included: true,
          maxMarks: classDefaultMaxMarks !== undefined ? String(classDefaultMaxMarks) : '',
          roomNo: '',
        })),
    );
    setRowErrors({});
    setServerError(undefined);
    setFormError(undefined);
  }, [classId, curriculum, scheduledSubjects, classDefaultMaxMarks, schedule.data, allClasses.data]);

  const styles = useThemedStyles(t2 => ({
    content: {padding: t2.spacing.lg},
    card: {
      padding: t2.spacing.md,
      borderRadius: t2.radius.md,
      backgroundColor: t2.colors.surface,
      borderWidth: 1,
      borderColor: t2.colors.border,
      marginBottom: t2.spacing.md,
    },
    cardError: {borderColor: t2.colors.error, borderWidth: 1.5},
    cardExcluded: {opacity: 0.55},
    pairRow: {flexDirection: 'row', columnGap: t2.spacing.sm},
    pairCol: {flex: 1},
    checkbox: {
      width: 20,
      height: 20,
      borderRadius: 4,
      borderWidth: 1.5,
      alignItems: 'center',
      justifyContent: 'center',
    },
    hint: {
      flexDirection: 'row',
      columnGap: t2.spacing.sm,
      padding: t2.spacing.md,
      borderRadius: t2.radius.md,
      backgroundColor: t2.colors.surfaceVariant,
      marginBottom: t2.spacing.md,
    },
  }));

  const updateRow = (index: number, patch: Partial<BuilderRow>): void => {
    setRows(prev => prev.map((r, i) => (i === index ? {...r, ...patch} : r)));
    setRowErrors(prev => {
      if (!prev[index]) {
        return prev;
      }
      const next = {...prev};
      delete next[index];
      return next;
    });
    if (serverError?.paperIndex !== undefined) {
      setServerError(undefined);
    }
    setFormError(undefined);
  };

  const applyDefaultTime = (): void => {
    if (!defaultStart || !defaultEnd) {
      return;
    }
    setRows(prev => prev.map(r => (r.included ? {...r, startTime: defaultStart, endTime: defaultEnd} : r)));
    setRowErrors({});
  };

  const scrollToRow = (index: number): void => {
    const y = rowY.current[index];
    if (y !== undefined) {
      scrollRef.current?.scrollTo({y: Math.max(0, y - 16), animated: true});
    }
  };

  const onSaveAll = (): void => {
    setServerError(undefined);
    setFormError(undefined);
    const included = rows.map((r, i) => ({row: r, index: i})).filter(x => x.row.included);
    if (included.length === 0) {
      setFormError(t('dateSheetBuilder_noRowsSelected'));
      return;
    }
    if (included.length > BULK_MAX_PAPERS) {
      setFormError(t('dateSheetBuilder_tooMany', {max: BULK_MAX_PAPERS}));
      return;
    }

    const errors: Record<number, PaperFieldErrors & {overlap?: string}> = {};
    included.forEach(({row, index}) => {
      const e = validatePaperDraft(row, {startDate: exam?.startDate, endDate: exam?.endDate}, t);
      if (Object.keys(e).length > 0) {
        errors[index] = e;
      }
    });
    // All rows are the same class, so two rows on the same date can't overlap.
    const overlaps = findRowOverlaps(included.map(x => x.row));
    overlaps.forEach((otherPos, pos) => {
      const index = included[pos].index;
      errors[index] = {
        ...errors[index],
        overlap: t('dateSheetBuilder_rowOverlap', {subject: included[otherPos].row.subjectName}),
      };
    });
    setRowErrors(errors);
    const firstBad = Object.keys(errors).map(Number).sort((a, b) => a - b)[0];
    if (firstBad !== undefined) {
      setFormError(t('dateSheetBuilder_fixRows', {count: Object.keys(errors).length}));
      scrollToRow(firstBad);
      return;
    }

    const papers: CreatePaperInput[] = included.map(({row}) => ({
      classId: row.classId,
      subjectId: row.subjectId,
      date: row.date as string,
      startTime: row.startTime as string,
      endTime: row.endTime as string,
      maxMarks: row.maxMarks.trim() ? parseMarks(row.maxMarks) : undefined,
      roomNo: row.roomNo.trim() || undefined,
      invigilatorId: row.invigilatorId,
    }));

    bulkMutation.mutate(
      {examId, papers},
      {
        onSuccess: res => setSavedCount(res.items.length),
        onError: e => {
          const err = toPaperSaveError(e, t('common_somethingWentWrong'));
          // `paperIndex` is the position in the request — map it back to the on-screen row.
          const rowIndex = err.paperIndex !== undefined ? included[err.paperIndex]?.index : undefined;
          setServerError({...err, paperIndex: rowIndex});
          if (rowIndex !== undefined) {
            scrollToRow(rowIndex);
          }
          if (err.code && STALE_ID_CODES.has(err.code)) {
            schedule.refetch();
            allClasses.refetch();
          }
        },
      },
    );
  };

  if (schedule.isError || examClasses.isError || allClasses.isError) {
    return (
      <Screen padded={false}>
        <CustomHeader title={t('dateSheetBuilder_title')} onBack={() => navigation.goBack()} />
        <EmptyState
          icon="warning"
          title={t('common_somethingWentWrong')}
          message={t('common_checkConnection')}
          actionLabel={t('common_retry')}
          onAction={() => {
            schedule.refetch();
            examClasses.refetch();
            allClasses.refetch();
          }}
        />
      </Screen>
    );
  }
  if (!schedule.data || !examClasses.data || !allClasses.data) {
    return <Loader message={t('dateSheet_loading')} />;
  }

  const includedCount = rows.filter(r => r.included).length;

  return (
    <Screen padded={false}>
      <CustomHeader title={t('dateSheetBuilder_title')} onBack={() => navigation.goBack()} />
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <Select
          label={t('dateSheet_class')}
          value={classId}
          options={examClasses.data.map(c => ({label: c.className, value: c.classId}))}
          onChange={setClassId}
          required
        />

        {!classId ? (
          <EmptyState icon="class" title={t('dateSheetBuilder_pickClass')} message={t('dateSheetBuilder_pickClassMessage')} />
        ) : (
          <>
            <View style={styles.hint}>
              <Icon name="info" size={16} color={theme.colors.info} />
              <AppText variant="caption" color="textSecondary" style={{flex: 1}}>
                {t('dateSheetBuilder_allOrNothing')}
                {skippedCount > 0 ? `\n${t('dateSheetBuilder_skipped', {count: skippedCount})}` : ''}
              </AppText>
            </View>

            {rows.length === 0 ? (
              <EmptyState
                icon="success"
                title={curriculum.length === 0 ? t('dateSheetBuilder_noSubjects') : t('dateSheet_allSubjectsScheduled')}
                message={
                  curriculum.length === 0 ? t('dateSheetBuilder_noSubjectsMessage') : t('dateSheetBuilder_allScheduledMessage')
                }
              />
            ) : (
              <>
                <AppText variant="label" color="textSecondary">
                  {t('dateSheetBuilder_defaultTime')}
                </AppText>
                <Spacer size={theme.spacing.xs} />
                <View style={styles.pairRow}>
                  <View style={styles.pairCol}>
                    <TimePicker value={defaultStart} onChange={setDefaultStart} />
                  </View>
                  <View style={styles.pairCol}>
                    <TimePicker value={defaultEnd} onChange={setDefaultEnd} />
                  </View>
                </View>
                <CustomButton
                  title={t('dateSheetBuilder_applyToAll')}
                  variant="outline"
                  size="sm"
                  disabled={!defaultStart || !defaultEnd}
                  onPress={applyDefaultTime}
                />
                <Spacer size={theme.spacing.lg} />

                {rows.map((row, index) => {
                  const errs = rowErrors[index] ?? {};
                  const srv = serverError?.paperIndex === index ? serverError : undefined;
                  const fieldErr = (f: keyof PaperFieldErrors): string | undefined =>
                    srv?.field === f ? srv.message : errs[f];
                  const hasError = Object.keys(errs).length > 0 || !!srv;
                  return (
                    <View
                      key={row.subjectId}
                      onLayout={e => {
                        rowY.current[index] = e.nativeEvent.layout.y;
                      }}
                      style={[styles.card, hasError ? styles.cardError : null, !row.included ? styles.cardExcluded : null]}>
                      <Pressable onPress={() => updateRow(index, {included: !row.included})}>
                        <Row gap={theme.spacing.sm}>
                          <View
                            style={[
                              styles.checkbox,
                              {
                                borderColor: row.included ? theme.colors.primary : theme.colors.border,
                                backgroundColor: row.included ? theme.colors.primary : 'transparent',
                              },
                            ]}>
                            {row.included ? <Icon name="check" size={12} color={theme.colors.onPrimary} /> : null}
                          </View>
                          <AppText variant="bodyBold" style={{flex: 1}}>
                            {index + 1}. {row.subjectName}
                          </AppText>
                        </Row>
                      </Pressable>

                      {row.included ? (
                        <>
                          <Spacer size={theme.spacing.sm} />
                          <DatePicker
                            value={row.date}
                            onChange={v => updateRow(index, {date: v})}
                            minDate={exam?.startDate ?? undefined}
                            maxDate={exam?.endDate ?? undefined}
                            error={fieldErr('date')}
                          />
                          <View style={styles.pairRow}>
                            <View style={styles.pairCol}>
                              <TimePicker
                                value={row.startTime}
                                onChange={v => updateRow(index, {startTime: v})}
                                error={fieldErr('time') || errs.overlap ? ' ' : undefined}
                              />
                            </View>
                            <View style={styles.pairCol}>
                              <TimePicker
                                value={row.endTime}
                                onChange={v => updateRow(index, {endTime: v})}
                                error={fieldErr('time') || errs.overlap ? ' ' : undefined}
                              />
                            </View>
                          </View>
                          {fieldErr('time') || errs.overlap ? (
                            <AppText
                              variant="caption"
                              color="error"
                              style={{marginTop: -theme.spacing.sm, marginBottom: theme.spacing.sm}}>
                              {fieldErr('time') ?? errs.overlap}
                            </AppText>
                          ) : null}
                          <View style={styles.pairRow}>
                            <View style={styles.pairCol}>
                              <CustomInput
                                placeholder={t('dateSheet_maxMarks')}
                                keyboardType="decimal-pad"
                                value={row.maxMarks}
                                onChangeText={v => updateRow(index, {maxMarks: v})}
                                error={fieldErr('maxMarks')}
                              />
                            </View>
                            <View style={styles.pairCol}>
                              <CustomInput
                                placeholder={t('dateSheet_roomPlaceholder')}
                                value={row.roomNo}
                                onChangeText={v => updateRow(index, {roomNo: v})}
                                error={fieldErr('roomNo')}
                              />
                            </View>
                          </View>
                          <InvigilatorSelect
                            compact
                            value={row.invigilatorId ? {id: row.invigilatorId, name: row.invigilatorName ?? ''} : undefined}
                            onChange={v => updateRow(index, {invigilatorId: v?.id, invigilatorName: v?.name})}
                            error={fieldErr('invigilatorId')}
                          />
                          {srv?.conflict ? <ConflictCard conflict={srv.conflict} currentExamId={examId} /> : null}
                          {srv && !srv.field ? (
                            <AppText variant="caption" color="error">
                              {srv.message}
                            </AppText>
                          ) : null}
                        </>
                      ) : null}
                    </View>
                  );
                })}
              </>
            )}

            {serverError && serverError.paperIndex === undefined ? (
              <AppText variant="caption" color="error" style={{marginBottom: theme.spacing.sm}}>
                {serverError.message}
              </AppText>
            ) : null}
            {formError ? (
              <AppText variant="caption" color="error" style={{marginBottom: theme.spacing.sm}}>
                {formError}
              </AppText>
            ) : null}
            {rows.length > 0 ? (
              <CustomButton
                title={t('dateSheetBuilder_saveAll', {count: includedCount})}
                onPress={onSaveAll}
                disabled={includedCount === 0}
                loading={bulkMutation.isPending}
              />
            ) : null}
          </>
        )}
        <Spacer size={24} />
      </ScrollView>

      <ResultModal
        visible={savedCount !== undefined}
        variant="success"
        title={t('dateSheetBuilder_savedTitle')}
        message={t('dateSheetBuilder_savedMessage', {count: savedCount ?? 0})}
        onClose={() => {
          setSavedCount(undefined);
          navigation.goBack();
        }}
      />
    </Screen>
  );
}
