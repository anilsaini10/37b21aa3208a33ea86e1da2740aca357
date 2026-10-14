/**
 * Exam detail → Date Sheet tab (admin).
 *
 * Filter by class, toggle "By date" (grouped rows) / "By class" (one printable
 * date sheet per class), add / bulk-build / edit / delete papers. A paper with
 * marks (`markedCount > 0`) can't be deleted.
 */
import React, {useMemo, useState} from 'react';
import {Pressable, RefreshControl, ScrollView, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme, useThemedStyles} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {
  AppText,
  Badge,
  CustomButton,
  CustomCard,
  CustomModal,
  EmptyState,
  Icon,
  Loader,
  Row,
  Spacer,
} from '../../../shared/components';
import {shareHtmlAsPdf} from '../../../core/sharing/shareService';
import {useExamClasses} from '../adminExams.service';
import {useDeletePaper, useExamSchedule} from '../examSchedule.service';
import {STALE_ID_CODES, formatPaperDate} from '../examSchedule.utils';
import {Chip, dayLabel} from './examUi';
import {extractErrorCode} from '../../../core/api/apiError';
import {ScreenNames} from '../../../navigation/ScreenNames';
import type {AdminStackParamList} from '../../../navigation/types';
import type {ExamPaperListItem} from '../../../shared/types';

type Nav = NativeStackNavigationProp<AdminStackParamList>;
type ViewMode = 'date' | 'class';

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, ch => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[ch] ?? ch);
}

export function DateSheetTab({examId, examTitle}: {examId: string; examTitle?: string}): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const navigation = useNavigation<Nav>();

  const [classFilter, setClassFilter] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('date');
  const [deleteTarget, setDeleteTarget] = useState<ExamPaperListItem | null>(null);
  const [deleteError, setDeleteError] = useState<string | undefined>();
  const [exportError, setExportError] = useState<string | undefined>();
  const [exporting, setExporting] = useState(false);

  const {data, isLoading, isRefetching, isError, error, refetch} = useExamSchedule(examId, classFilter || undefined);
  const {data: examClasses} = useExamClasses(examId);
  const deleteMutation = useDeletePaper();

  const styles = useThemedStyles(t2 => ({
    content: {padding: t2.spacing.lg, flexGrow: 1},
    chipsRow: {columnGap: t2.spacing.sm, paddingRight: t2.spacing.lg},
    actionsRow: {flexDirection: 'row', columnGap: t2.spacing.sm},
    actionWrap: {flex: 1},
    groupHeader: {marginTop: t2.spacing.md, marginBottom: t2.spacing.sm},
    card: {marginBottom: t2.spacing.sm},
    classRow: {
      flexDirection: 'row',
      paddingVertical: t2.spacing.sm,
      borderTopWidth: 1,
      borderTopColor: t2.colors.divider,
      columnGap: t2.spacing.sm,
    },
    modalButtonWrap: {flex: 1},
  }));

  const items = useMemo(() => data?.items ?? [], [data]);
  const exam = data?.exam;

  const byDate = useMemo(() => {
    const groups = new Map<string, ExamPaperListItem[]>();
    items.forEach(p => {
      const key = p.date.slice(0, 10);
      groups.set(key, [...(groups.get(key) ?? []), p]);
    });
    return [...groups.entries()];
  }, [items]);

  const byClass = useMemo(() => {
    const groups = new Map<string, {className: string; papers: ExamPaperListItem[]}>();
    items.forEach(p => {
      const g = groups.get(p.classId) ?? {className: p.className, papers: []};
      g.papers.push(p);
      groups.set(p.classId, g);
    });
    return [...groups.entries()];
  }, [items]);

  const openAdd = (): void =>
    navigation.navigate(ScreenNames.PaperForm, {examId, classId: classFilter || undefined});
  const openBulk = (): void =>
    navigation.navigate(ScreenNames.DateSheetBuilder, {examId, classId: classFilter || undefined});
  const openEdit = (paper: ExamPaperListItem): void => navigation.navigate(ScreenNames.PaperForm, {examId, paper});

  const confirmDelete = (): void => {
    if (!deleteTarget) {
      return;
    }
    setDeleteError(undefined);
    deleteMutation.mutate(
      {examId, scheduleId: deleteTarget.id},
      {
        onSuccess: () => setDeleteTarget(null),
        onError: e => {
          setDeleteError(e.message);
          const code = extractErrorCode(e);
          if (code === 'EXAM_SCHEDULE_HAS_MARKS' || (code && STALE_ID_CODES.has(code))) {
            refetch();
          }
        },
      },
    );
  };

  const exportClassSheet = async (className: string, papers: ExamPaperListItem[]): Promise<void> => {
    setExportError(undefined);
    setExporting(true);
    const rows = papers
      .map(
        p => `<tr><td>${escapeHtml(dayLabel(p.date, t))}</td><td>${p.startTime}–${p.endTime}</td>` +
          `<td>${escapeHtml(p.subjectName)}</td><td>${p.maxMarks}</td><td>${escapeHtml(p.roomNo ?? '')}</td></tr>`,
      )
      .join('');
    const title = `${escapeHtml(exam?.title ?? examTitle ?? '')} — ${escapeHtml(className)}`;
    const html = `<html><head><meta charset="utf-8"><style>
      body{font-family:-apple-system,Roboto,sans-serif;padding:24px;color:#111}
      h1{font-size:20px;margin:0 0 4px} p{color:#555;margin:0 0 16px;font-size:12px}
      table{width:100%;border-collapse:collapse;font-size:13px}
      th,td{border:1px solid #ccc;padding:8px;text-align:left} th{background:#f2f2f2}
      </style></head><body><h1>${title}</h1>
      <p>${escapeHtml(t('dateSheet_title'))}</p>
      <table><thead><tr><th>${escapeHtml(t('common_date'))}</th><th>${escapeHtml(t('common_time'))}</th>
      <th>${escapeHtml(t('dateSheet_subject'))}</th><th>${escapeHtml(t('dateSheet_maxMarks'))}</th>
      <th>${escapeHtml(t('dateSheet_room'))}</th></tr></thead><tbody>${rows}</tbody></table></body></html>`;
    try {
      await shareHtmlAsPdf({
        html,
        fileName: `date-sheet-${className}`.replace(/[^a-zA-Z0-9-_]+/g, '-'),
        title: `${exam?.title ?? ''} ${className}`.trim(),
      });
    } catch (e) {
      console.error('exportClassSheet failed', e);
      setExportError(t('dateSheet_exportFailed'));
    } finally {
      setExporting(false);
    }
  };

  const paperCard = (p: ExamPaperListItem, showDate: boolean): React.JSX.Element => {
    const locked = p.markedCount > 0;
    return (
      <CustomCard key={p.id} style={styles.card}>
        <Row justify="space-between" align="flex-start">
          <View style={{flex: 1}}>
            <AppText variant="bodyBold">
              {p.className} · {p.subjectName}
            </AppText>
            <Row gap={4} style={{marginTop: 2}}>
              <Icon name="clock" size={13} color={theme.colors.textMuted} />
              <AppText variant="label" color="textMuted">
                {showDate ? `${dayLabel(p.date, t)}, ` : ''}
                {p.startTime}–{p.endTime}
              </AppText>
            </Row>
          </View>
          <Row gap={theme.spacing.md} align="center">
            <Pressable onPress={() => openEdit(p)} hitSlop={8}>
              <Icon name="edit" size={18} color={theme.colors.textMuted} />
            </Pressable>
            <Pressable
              onPress={() => {
                setDeleteTarget(p);
                setDeleteError(undefined);
              }}
              disabled={locked}
              hitSlop={8}
              style={{opacity: locked ? 0.35 : 1}}>
              <Icon name={locked ? 'lock' : 'delete'} size={18} color={locked ? theme.colors.textMuted : theme.colors.error} />
            </Pressable>
          </Row>
        </Row>
        <Spacer size={theme.spacing.xs} />
        <Row gap={theme.spacing.sm} wrap style={{rowGap: theme.spacing.xs}}>
          <Badge label={t('dateSheet_maxMarksValue', {max: p.maxMarks})} tone="primary" />
          {p.roomNo ? <Badge label={t('dateSheet_roomValue', {room: p.roomNo})} tone="neutral" /> : null}
          <Badge
            label={p.invigilator ? t('dateSheet_invigilatorValue', {name: p.invigilator.name}) : t('dateSheet_noInvigilator')}
            tone={p.invigilator ? 'info' : 'neutral'}
          />
          <Badge label={t('dateSheet_markedValue', {count: p.markedCount})} tone={p.markedCount > 0 ? 'success' : 'neutral'} />
        </Row>
      </CustomCard>
    );
  };

  const classChips = (examClasses ?? []).map(c => ({label: c.className, value: c.classId}));

  return (
    <View style={{flex: 1}}>
      {isError ? (
        <EmptyState
          icon="warning"
          title={t('common_somethingWentWrong')}
          message={(error as {message?: string} | null)?.message ?? t('common_checkConnection')}
          actionLabel={t('common_retry')}
          onAction={() => refetch()}
        />
      ) : isLoading || !data ? (
        <Loader message={t('dateSheet_loading')} />
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />}>
          {exam?.startDate || exam?.endDate ? (
            <Row gap={4} style={{marginBottom: theme.spacing.sm}}>
              <Icon name="calendar" size={13} color={theme.colors.textMuted} />
              <AppText variant="label" color="textMuted">
                {exam.startDate && exam.endDate
                  ? `${formatPaperDate(exam.startDate)} – ${formatPaperDate(exam.endDate)}`
                  : formatPaperDate((exam.startDate ?? exam.endDate) as string)}
              </AppText>
            </Row>
          ) : null}

          <View style={styles.actionsRow}>
            <View style={styles.actionWrap}>
              <CustomButton title={t('dateSheet_addPaper')} size="sm" onPress={openAdd} />
            </View>
            <View style={styles.actionWrap}>
              <CustomButton title={t('dateSheet_buildForClass')} size="sm" variant="outline" onPress={openBulk} />
            </View>
          </View>
          <Spacer size={theme.spacing.md} />

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
            <Chip label={t('common_all')} active={!classFilter} onPress={() => setClassFilter('')} />
            {classChips.map(c => (
              <Chip key={c.value} label={c.label} active={classFilter === c.value} onPress={() => setClassFilter(c.value)} />
            ))}
          </ScrollView>
          <Spacer size={theme.spacing.sm} />
          <Row gap={theme.spacing.sm}>
            <Chip label={t('dateSheet_viewByDate')} active={viewMode === 'date'} onPress={() => setViewMode('date')} />
            <Chip label={t('dateSheet_viewByClass')} active={viewMode === 'class'} onPress={() => setViewMode('class')} />
          </Row>

          {exportError ? (
            <AppText variant="caption" color="error" style={{marginTop: theme.spacing.sm}}>
              {exportError}
            </AppText>
          ) : null}

          {items.length === 0 ? (
            <EmptyState
              icon="calendar"
              title={t('dateSheet_empty')}
              message={t('dateSheet_emptyMessage')}
              actionLabel={t('dateSheet_addPaper')}
              onAction={openAdd}
            />
          ) : viewMode === 'date' ? (
            byDate.map(([date, papers]) => (
              <View key={date}>
                <AppText variant="label" color="textSecondary" style={styles.groupHeader}>
                  {dayLabel(date, t)}
                </AppText>
                {papers.map(p => paperCard(p, false))}
              </View>
            ))
          ) : (
            byClass.map(([classId, group]) => (
              <CustomCard key={classId} style={[styles.card, {marginTop: theme.spacing.md}]}>
                <Row justify="space-between" align="center">
                  <AppText variant="bodyBold">{group.className}</AppText>
                  <Pressable
                    onPress={() => exportClassSheet(group.className, group.papers)}
                    disabled={exporting}
                    hitSlop={8}
                    style={{opacity: exporting ? 0.4 : 1}}>
                    <Row gap={4}>
                      <Icon name="download" size={16} color={theme.colors.primary} />
                      <AppText variant="label" color="primary">
                        {t('dateSheet_export')}
                      </AppText>
                    </Row>
                  </Pressable>
                </Row>
                <Spacer size={theme.spacing.sm} />
                {group.papers.map(p => (
                  <Pressable key={p.id} onPress={() => openEdit(p)} style={styles.classRow}>
                    <View style={{flex: 1.4}}>
                      <AppText variant="label">{dayLabel(p.date, t)}</AppText>
                      <AppText variant="label" color="textMuted">
                        {p.startTime}–{p.endTime}
                      </AppText>
                    </View>
                    <View style={{flex: 1}}>
                      <AppText variant="label">{p.subjectName}</AppText>
                      <AppText variant="label" color="textMuted">
                        {t('dateSheet_maxMarksValue', {max: p.maxMarks})}
                        {p.roomNo ? ` · ${p.roomNo}` : ''}
                      </AppText>
                    </View>
                  </Pressable>
                ))}
              </CustomCard>
            ))
          )}
          <Spacer size={24} />
        </ScrollView>
      )}

      <CustomModal visible={!!deleteTarget} onClose={() => setDeleteTarget(null)} title={t('dateSheet_deletePaper')}>
        <AppText variant="body" color="textSecondary">
          {t('dateSheet_deleteConfirm', {
            className: deleteTarget?.className ?? '',
            subject: deleteTarget?.subjectName ?? '',
            date: deleteTarget ? formatPaperDate(deleteTarget.date) : '',
          })}
        </AppText>
        {deleteError ? (
          <AppText variant="caption" color="error" style={{marginTop: theme.spacing.sm}}>
            {deleteError}
          </AppText>
        ) : null}
        <Spacer size={16} />
        <Row gap={theme.spacing.md}>
          <View style={styles.modalButtonWrap}>
            <CustomButton title={t('common_cancel')} variant="outline" onPress={() => setDeleteTarget(null)} />
          </View>
          <View style={styles.modalButtonWrap}>
            <CustomButton title={t('common_delete')} variant="danger" loading={deleteMutation.isPending} onPress={confirmDelete} />
          </View>
        </Row>
      </CustomModal>
    </View>
  );
}
