/**
 * Marks for one paper (admin view / override).
 *
 * Editable grid: status (GRADED / ABSENT / PENDING), marks (0..maxMarks, decimals),
 * grade, remarks. Only changed rows are sent. Before the paper's date the grid is
 * read-only. Teachers enter marks for their own sections from the teacher app —
 * saving here overrides theirs.
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
import {useClasses} from '../../classes/classes.service';
import {usePaperStudents, useSavePaperMarks} from '../examSchedule.service';
import {MARKS_MAX_ENTRIES, STALE_ID_CODES, formatPaperDate, isPaperHeld} from '../examSchedule.utils';
import {useMarkDrafts, useUnsavedChangesGuard} from '../useMarkDrafts';
import {Chip} from '../components/examUi';
import {MarkEntryRow, UnsavedChangesModal} from '../components/MarkEntryRow';
import type {AdminStackParamList} from '../../../navigation/types';
import type {ExamResultStatus, PaperMarksResponse, PaperStudentRow} from '../../../shared/types';

type Nav = NativeStackNavigationProp<AdminStackParamList>;

const SEARCH_DEBOUNCE_MS = 350;
const STATUSES: ExamResultStatus[] = ['GRADED', 'ABSENT', 'PENDING'];

export function PaperMarksScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const navigation = useNavigation<Nav>();
  const qc = useQueryClient();
  const route = useRoute<RouteProp<AdminStackParamList, 'PaperMarks'>>();
  const {examId, scheduleId, paper: initialPaper} = route.params;

  const [sectionId, setSectionId] = useState('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [saveError, setSaveError] = useState<string | undefined>();
  const [notHeldFrom, setNotHeldFrom] = useState<string | undefined>();
  const [savedCount, setSavedCount] = useState<number | undefined>();

  useEffect(() => {
    const handle = setTimeout(() => setDebouncedSearch(search.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(handle);
  }, [search]);

  const params = useMemo(
    () => ({sectionId: sectionId || undefined, search: debouncedSearch || undefined}),
    [sectionId, debouncedSearch],
  );
  const {data, isLoading, isRefetching, isError, error, refetch} = usePaperStudents(examId, scheduleId, params);
  const {data: allClasses} = useClasses();
  const saveMutation = useSavePaperMarks();

  const paper = data?.paper ?? initialPaper;
  const maxMarks = paper?.maxMarks ?? 0;
  const availableFrom = notHeldFrom ?? (paper && !isPaperHeld(paper.date) ? paper.date : undefined);
  const readOnly = !!availableFrom;
  const sections = (allClasses ?? []).find(c => c.id === paper?.classId)?.sections ?? [];

  const marks = useMarkDrafts(maxMarks, t);
  const guard = useUnsavedChangesGuard(navigation, marks.hasUnsaved, saveMutation.isPending);

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
        const res = await saveMutation.mutateAsync({examId, scheduleId, marks: chunk});
        saved += res.savedCount;
        last = res;
        marks.clearDrafts(chunk.map(m => m.studentId));
      }
    } catch (e) {
      const code = extractErrorCode(e);
      const details = extractErrorDetails(e);
      const message = (e as {message?: string}).message ?? t('common_somethingWentWrong');
      if (code === 'INVALID_MARKS') {
        marks.highlightRows(details?.studentIds, t('examResult_invalidMarksError', {max: Number(details?.maxMarks ?? maxMarks)}));
      } else if (code === 'STUDENT_NOT_IN_CLASS') {
        marks.highlightRows(details?.studentIds, message);
        refetch();
      } else if (code === 'EXAM_NOT_HELD_YET') {
        setNotHeldFrom(typeof details?.date === 'string' ? details.date : paper?.date);
      } else if (code && STALE_ID_CODES.has(code)) {
        refetch();
      }
      setSaveError(message);
      if (saved > 0) {
        refetch();
      }
      return;
    }

    // Re-render from the response. It isn't filtered, so only reuse it as-is for the unfiltered view.
    if (last && !params.sectionId && !params.search) {
      qc.setQueryData(['paperMarks', examId, scheduleId, params], last);
    } else {
      refetch();
    }
    qc.invalidateQueries({queryKey: ['paperMarks', examId, scheduleId], refetchType: 'none'});
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
    />
  );

  const summary = data?.summary;
  const title = paper ? `${paper.className} · ${paper.subjectName}` : t('paperMarks_title');

  return (
    <Screen padded={false}>
      <CustomHeader title={title} onBack={() => navigation.goBack()} />
      <View style={styles.filters}>
        <SearchBar value={search} onChangeText={setSearch} placeholder={t('paperMarks_searchPlaceholder')} />
        {sections.length > 1 ? (
          <View style={styles.chipsRow}>
            <Chip label={t('common_all')} active={!sectionId} onPress={() => setSectionId('')} />
            {sections.map(s => (
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

      {isError ? (
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
                <Row justify="space-between">
                  <AppText variant="bodyBold">{t('dateSheet_maxMarksValue', {max: maxMarks})}</AppText>
                  {paper ? (
                    <AppText variant="label" color="textMuted">
                      {formatPaperDate(paper.date)}, {paper.startTime}–{paper.endTime}
                    </AppText>
                  ) : null}
                </Row>
                {summary ? (
                  <Row gap={theme.spacing.sm} wrap style={{rowGap: theme.spacing.xs}}>
                    <Badge label={t('paperMarks_total', {count: summary.totalStudents})} tone="neutral" />
                    <Badge label={t('paperMarks_graded', {count: summary.graded})} tone="success" />
                    <Badge label={t('paperMarks_absent', {count: summary.absent})} tone="error" />
                    <Badge label={t('paperMarks_pending', {count: summary.pending})} tone="warning" />
                  </Row>
                ) : null}
              </View>
              {readOnly && availableFrom ? (
                <View style={styles.banner}>
                  <Icon name="lock" size={16} color={theme.colors.warning} />
                  <AppText variant="caption" color="textSecondary" style={{flex: 1}}>
                    {t('paperMarks_notHeldYet', {date: formatPaperDate(availableFrom)})}
                  </AppText>
                </View>
              ) : (
                <View style={styles.banner}>
                  <Icon name="info" size={16} color={theme.colors.info} />
                  <AppText variant="caption" color="textSecondary" style={{flex: 1}}>
                    {t('paperMarks_overrideNote')}
                  </AppText>
                </View>
              )}
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
        message={t('paperMarks_savedMessage', {count: savedCount ?? 0})}
        onClose={() => setSavedCount(undefined)}
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
