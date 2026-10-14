/**
 * Teacher → one paper: marks entry for the students of the teacher's own sections.
 *
 * Section tabs come only from the paper's `mySections`. Before the paper date the
 * grid is read-only. An invigilator-only paper (`canEnterMarks: false`) shows the
 * whole class as a read-only roster (attendance sheet), with no marks inputs.
 */
import React, {useEffect, useMemo, useState} from 'react';
import {FlatList, RefreshControl, View} from 'react-native';
import {useNavigation, useRoute, type RouteProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useQueryClient} from '@tanstack/react-query';
import {useTheme, useThemedStyles} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {
  Screen,
  CustomHeader,
  CustomButton,
  ResultModal,
  SearchBar,
  AppText,
  Badge,
  Icon,
  Row,
  Loader,
  EmptyState,
} from '../../../shared/components';
import {extractErrorCode, extractErrorDetails} from '../../../core/api/apiError';
import {useSaveTeacherMarks, useTeacherExams, useTeacherPaperStudents} from '../teacherExams.service';
import {MARKS_MAX_ENTRIES, formatPaperDate, isPaperHeld} from '../examSchedule.utils';
import {useMarkDrafts, useUnsavedChangesGuard} from '../useMarkDrafts';
import {Chip, dayLabel} from '../components/examUi';
import {MarkEntryRow, UnsavedChangesModal} from '../components/MarkEntryRow';
import type {TeacherStackParamList} from '../../../navigation/types';
import type {ExamResultStatus, PaperMarksResponse, PaperStudentRow} from '../../../shared/types';

type Nav = NativeStackNavigationProp<TeacherStackParamList>;

const SEARCH_DEBOUNCE_MS = 350;
const STATUSES: ExamResultStatus[] = ['GRADED', 'ABSENT'];
/** The paper is gone / ids are stale — nothing to do here but go back to the list. */
const LEAVE_CODES = new Set(['EXAM_SCHEDULE_NOT_FOUND', 'SECTION_NOT_FOUND', 'SUBJECT_NOT_ASSIGNED']);

export function TeacherPaperMarksScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const navigation = useNavigation<Nav>();
  const qc = useQueryClient();
  const route = useRoute<RouteProp<TeacherStackParamList, 'TeacherPaperMarks'>>();
  const {scheduleId, paper: paramPaper} = route.params;

  // `canEnterMarks` / `mySections` only come from the list — use the passed paper, else find it in the list.
  const exams = useTeacherExams();
  const listPaper = useMemo(
    () => paramPaper ?? exams.data?.flatMap(e => e.papers).find(p => p.id === scheduleId),
    [paramPaper, exams.data, scheduleId],
  );
  const mySections = listPaper?.mySections ?? [];
  const canEnterMarks = listPaper?.canEnterMarks ?? false;

  const [sectionId, setSectionId] = useState('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [saveError, setSaveError] = useState<string | undefined>();
  const [notHeldFrom, setNotHeldFrom] = useState<string | undefined>();
  const [savedCount, setSavedCount] = useState<number | undefined>();
  const [fatalError, setFatalError] = useState<string | undefined>();

  useEffect(() => {
    const handle = setTimeout(() => setDebouncedSearch(search.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(handle);
  }, [search]);

  const params = useMemo(
    () => ({sectionId: sectionId || undefined, search: debouncedSearch || undefined}),
    [sectionId, debouncedSearch],
  );
  const {data, isLoading, isRefetching, isError, error, refetch} = useTeacherPaperStudents(scheduleId, params);
  const saveMutation = useSaveTeacherMarks();

  const paper = data?.paper ?? listPaper;
  const maxMarks = paper?.maxMarks ?? 0;
  const availableFrom = notHeldFrom ?? (paper && !isPaperHeld(paper.date) ? paper.date : undefined);
  const readOnly = !canEnterMarks || !!availableFrom;

  const marks = useMarkDrafts(maxMarks, t);
  const guard = useUnsavedChangesGuard(navigation, marks.hasUnsaved, saveMutation.isPending);

  // Load errors: a stale/deleted paper → explain and go back; a section that isn't ours → show all of ours.
  const loadErrorCode = isError ? extractErrorCode(error) : undefined;
  useEffect(() => {
    if (loadErrorCode === 'NOT_YOUR_SECTION') {
      setSectionId('');
    } else if (loadErrorCode && LEAVE_CODES.has(loadErrorCode)) {
      setFatalError(
        loadErrorCode === 'SUBJECT_NOT_ASSIGNED'
          ? t('teacherPaperMarks_notAllowed')
          : (error as {message?: string} | null)?.message ?? t('common_somethingWentWrong'),
      );
    }
  }, [loadErrorCode, error, t]);

  const styles = useThemedStyles(t2 => ({
    filters: {paddingHorizontal: t2.spacing.lg, paddingTop: t2.spacing.md},
    chipsRow: {flexDirection: 'row', flexWrap: 'wrap', gap: t2.spacing.sm, marginTop: t2.spacing.sm},
    listContent: {padding: t2.spacing.lg, paddingTop: t2.spacing.sm, flexGrow: 1},
    headerCard: {
      padding: t2.spacing.md,
      borderRadius: t2.radius.md,
      backgroundColor: t2.colors.surface,
      borderWidth: 1,
      borderColor: t2.colors.border,
      marginBottom: t2.spacing.md,
      rowGap: t2.spacing.xs,
    },
    banner: {
      flexDirection: 'row',
      columnGap: t2.spacing.sm,
      padding: t2.spacing.md,
      borderRadius: t2.radius.md,
      backgroundColor: t2.colors.surfaceVariant,
      marginBottom: t2.spacing.md,
    },
    footer: {
      padding: t2.spacing.lg,
      paddingTop: t2.spacing.sm,
      borderTopWidth: 1,
      borderTopColor: t2.colors.divider,
      backgroundColor: t2.colors.surface,
    },
  }));

  const onSave = async (): Promise<void> => {
    setSaveError(undefined);
    if (marks.invalidIds.length > 0) {
      setSaveError(t('paperMarks_fixErrors', {count: marks.invalidIds.length}));
      return;
    }
    const entries = marks.buildEntries();
    let saved = 0;
    let last: PaperMarksResponse | undefined;
    try {
      // The backend takes at most MARKS_MAX_ENTRIES per request.
      for (let i = 0; i < entries.length; i += MARKS_MAX_ENTRIES) {
        const chunk = entries.slice(i, i + MARKS_MAX_ENTRIES);
        const res = await saveMutation.mutateAsync({scheduleId, marks: chunk});
        saved += res.savedCount;
        last = res;
        marks.clearDrafts(chunk.map(m => m.studentId));
      }
    } catch (e) {
      const code = extractErrorCode(e);
      const details = extractErrorDetails(e);
      const message = (e as {message?: string}).message ?? t('common_somethingWentWrong');
      if (saved > 0) {
        refetch();
      }
      if (code === 'SUBJECT_NOT_ASSIGNED') {
        setFatalError(t('teacherPaperMarks_notAllowed'));
        return;
      }
      if (code && LEAVE_CODES.has(code)) {
        setFatalError(message);
        return;
      }
      if (code === 'INVALID_MARKS') {
        marks.highlightRows(details?.studentIds, t('examResult_invalidMarksError', {max: Number(details?.maxMarks ?? maxMarks)}));
      } else if (code === 'STUDENT_NOT_IN_YOUR_SECTION' || code === 'STUDENT_NOT_IN_CLASS') {
        marks.highlightRows(details?.studentIds, message);
        refetch();
      } else if (code === 'EXAM_NOT_HELD_YET') {
        setNotHeldFrom(typeof details?.date === 'string' ? details.date : paper?.date);
      } else if (code === 'NOT_YOUR_SECTION') {
        setSectionId('');
      }
      setSaveError(message);
      return;
    }

    // Re-render from the response. It isn't filtered, so only reuse it as-is for the unfiltered view.
    if (last && !params.sectionId && !params.search) {
      qc.setQueryData(['teacherPaperMarks', scheduleId, params], last);
    } else {
      refetch();
    }
    qc.invalidateQueries({queryKey: ['teacherPaperMarks', scheduleId], refetchType: 'none'});
    setSavedCount(saved);
  };

  const renderRow = ({item}: {item: PaperStudentRow}): React.JSX.Element => (
    <MarkEntryRow
      row={item}
      values={marks.valuesFor(item)}
      statuses={STATUSES}
      maxMarks={maxMarks}
      readOnly={readOnly}
      changed={marks.isRowChanged(item.studentId)}
      error={marks.errorFor(item.studentId)}
      onEdit={patch => {
        marks.editRow(item, patch);
        setSaveError(undefined);
      }}
      collapsibleExtras
      hideInputs={!canEnterMarks}
    />
  );

  const summary = data?.summary;
  const title = paper ? `${paper.className} · ${paper.subjectName}` : t('paperMarks_title');

  const banner = !canEnterMarks
    ? {icon: 'info', color: theme.colors.info, text: t('teacherPaperMarks_invigilatorOnly')}
    : availableFrom
      ? {icon: 'lock', color: theme.colors.warning, text: t('teacherPaperMarks_opensOn', {date: formatPaperDate(availableFrom)})}
      : null;

  return (
    <Screen padded={false}>
      <CustomHeader title={title} onBack={() => navigation.goBack()} />
      <View style={styles.filters}>
        <SearchBar value={search} onChangeText={setSearch} placeholder={t('paperMarks_searchPlaceholder')} />
        {canEnterMarks && mySections.length > 1 ? (
          <View style={styles.chipsRow}>
            <Chip label={t('common_all')} active={!sectionId} onPress={() => setSectionId('')} />
            {mySections.map(s => (
              <Chip
                key={s.id}
                label={t('common_sectionOptionLabel', {name: s.name})}
                active={sectionId === s.id}
                onPress={() => setSectionId(s.id)}
              />
            ))}
          </View>
        ) : null}
      </View>

      {isError && !(loadErrorCode && LEAVE_CODES.has(loadErrorCode)) ? (
        <EmptyState
          icon="warning"
          title={t('common_somethingWentWrong')}
          message={(error as {message?: string} | null)?.message ?? t('common_checkConnection')}
          actionLabel={t('common_retry')}
          onAction={() => refetch()}
        />
      ) : isLoading || !data ? (
        <Loader message={t('examReport_loadingMarks')} />
      ) : (
        <FlatList
          data={data.items}
          keyExtractor={item => item.studentId}
          renderItem={renderRow}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />}
          ListHeaderComponent={
            <>
              <View style={styles.headerCard}>
                {paper ? (
                  <AppText variant="label" color="textMuted">
                    {dayLabel(paper.date, t)} · {paper.startTime}–{paper.endTime}
                    {paper.roomNo ? ` · ${t('dateSheet_roomValue', {room: paper.roomNo})}` : ''}
                  </AppText>
                ) : null}
                <AppText variant="bodyBold">{t('teacherPaperMarks_maxMarks', {max: maxMarks})}</AppText>
                {summary && canEnterMarks ? (
                  <Row gap={theme.spacing.sm} wrap style={{rowGap: theme.spacing.xs}}>
                    <Badge label={t('paperMarks_total', {count: summary.totalStudents})} tone="neutral" />
                    <Badge label={t('paperMarks_graded', {count: summary.graded})} tone="success" />
                    <Badge label={t('paperMarks_absent', {count: summary.absent})} tone="error" />
                    <Badge label={t('paperMarks_pending', {count: summary.pending})} tone="warning" />
                  </Row>
                ) : summary ? (
                  <Badge label={t('paperMarks_total', {count: summary.totalStudents})} tone="neutral" />
                ) : null}
              </View>
              {banner ? (
                <View style={styles.banner}>
                  <Icon name={banner.icon} size={16} color={banner.color} />
                  <AppText variant="caption" color="textSecondary" style={{flex: 1}}>
                    {banner.text}
                  </AppText>
                </View>
              ) : null}
            </>
          }
          ListEmptyComponent={
            <EmptyState icon="students" title={t('paperMarks_noStudents')} message={t('paperMarks_noStudentsMessage')} />
          }
        />
      )}

      {!readOnly && data ? (
        <View style={styles.footer}>
          {saveError ? (
            <AppText variant="caption" color="error" style={{marginBottom: theme.spacing.sm}}>
              {saveError}
            </AppText>
          ) : null}
          <CustomButton
            title={marks.hasUnsaved ? t('paperMarks_saveCount', {count: marks.changedIds.length}) : t('common_save')}
            onPress={onSave}
            disabled={!marks.hasUnsaved || marks.invalidIds.length > 0}
            loading={saveMutation.isPending}
          />
        </View>
      ) : null}

      <ResultModal
        visible={savedCount !== undefined}
        variant="success"
        title={t('paperMarks_savedTitle')}
        message={t('teacherPaperMarks_savedMessage', {count: savedCount ?? 0})}
        onClose={() => setSavedCount(undefined)}
      />
      <ResultModal
        visible={!!fatalError}
        variant="error"
        title={t('common_error')}
        message={fatalError}
        onClose={() => {
          setFatalError(undefined);
          qc.invalidateQueries({queryKey: ['teacherExams']});
          guard.forceLeave();
        }}
      />
      <UnsavedChangesModal
        visible={guard.pendingLeave}
        count={marks.changedIds.length}
        onKeepEditing={guard.cancelLeave}
        onDiscard={guard.confirmLeave}
      />
    </Screen>
  );
}
