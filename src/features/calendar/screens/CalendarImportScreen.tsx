/**
 * Import a year of calendar entries from Excel (admin).
 *
 * Template download → pick .xlsx/.xls/.csv → preview rows → Validate (dry run: per-row errors,
 * Excel row = index + 2) → fix rows inline or re-upload → Import (enabled only when every row
 * is valid and nothing changed since validating). Import is all-or-nothing; duplicates
 * (same title + type + dates) are rejected, so re-importing the same sheet doesn't double it.
 */
import React, {useState} from 'react';
import {FlatList, Pressable, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {errorCodes, isErrorWithCode, keepLocalCopy, pick, types} from '@react-native-documents/picker';
import {useTheme, useThemedStyles} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {
  Screen,
  CustomHeader,
  CustomButton,
  CustomInput,
  CustomModal,
  ResultModal,
  AppText,
  Badge,
  Icon,
  Row,
  Spacer,
  EmptyState,
} from '../../../shared/components';
import {extractErrorCode, extractErrorDetails} from '../../../core/api/apiError';
import {CALENDAR_IMPORT_MAX_ROWS, useCalendarImport, useValidateCalendarImport} from '../academicCalendar.service';
import {readCalendarSpreadsheet, shareCalendarTemplate} from '../calendarExcel';
import type {AdminStackParamList} from '../../../navigation/types';
import type {CalendarImportRow, CalendarImportRowResult} from '../../../shared/types';

type Nav = NativeStackNavigationProp<AdminStackParamList>;

interface Validation {
  total: number;
  valid: number;
  invalid: number;
  /** Rows were edited after this validation → must validate again before importing. */
  stale: boolean;
}

/** index → error messages, from a dry run or a failed import. */
function errorsByIndex(results: CalendarImportRowResult[] | undefined): Record<number, string[]> {
  const map: Record<number, string[]> = {};
  (results ?? []).forEach(r => {
    if (r.status === 'error') {
      map[r.index] = r.errors ?? [];
    }
  });
  return map;
}

const EDIT_FIELDS: {key: keyof CalendarImportRow; labelKey: 'common_title' | 'common_description' | 'eventForm_eventType' | 'announcementForm_audience' | 'eventForm_startDate' | 'eventForm_endDate'}[] = [
  {key: 'title', labelKey: 'common_title'},
  {key: 'eventType', labelKey: 'eventForm_eventType'},
  {key: 'audience', labelKey: 'announcementForm_audience'},
  {key: 'startDate', labelKey: 'eventForm_startDate'},
  {key: 'endDate', labelKey: 'eventForm_endDate'},
  {key: 'description', labelKey: 'common_description'},
];

export function CalendarImportScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const navigation = useNavigation<Nav>();
  const validateMutation = useValidateCalendarImport();
  const importMutation = useCalendarImport();

  const [fileName, setFileName] = useState<string | undefined>();
  const [rows, setRows] = useState<CalendarImportRow[]>([]);
  const [rowErrors, setRowErrors] = useState<Record<number, string[]>>({});
  const [validation, setValidation] = useState<Validation | null>(null);
  const [message, setMessage] = useState<string | undefined>();
  const [reading, setReading] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [draft, setDraft] = useState<CalendarImportRow | null>(null);
  const [createdCount, setCreatedCount] = useState<number | undefined>();

  const styles = useThemedStyles(t2 => ({
    content: {padding: t2.spacing.lg, flexGrow: 1},
    actions: {flexDirection: 'row', columnGap: t2.spacing.sm},
    flex: {flex: 1},
    row: {
      padding: t2.spacing.md,
      borderRadius: t2.radius.md,
      borderWidth: 1,
      borderColor: t2.colors.border,
      backgroundColor: t2.colors.surface,
      marginBottom: t2.spacing.sm,
      rowGap: 2,
    },
    rowError: {borderColor: t2.colors.error, backgroundColor: t2.colors.error + '0D'},
    hint: {
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
      rowGap: t2.spacing.sm,
    },
    modalButtonWrap: {flex: 1},
  }));

  const resetReport = (): void => {
    setRowErrors({});
    setValidation(null);
    setMessage(undefined);
  };

  const onPickFile = async (): Promise<void> => {
    setMessage(undefined);
    try {
      const [file] = await pick({type: [types.xlsx, types.xls, types.csv]});
      setReading(true);
      const [copy] = await keepLocalCopy({
        files: [{uri: file.uri, fileName: file.name ?? 'calendar.xlsx'}],
        destination: 'cachesDirectory',
      });
      if (copy.status !== 'success') {
        throw new Error('COPY_FAILED');
      }
      const parsed = await readCalendarSpreadsheet(copy.localUri);
      setFileName(file.name ?? undefined);
      setRows(parsed);
      resetReport();
      if (parsed.length === 0) {
        setMessage(t('calendarImport_noRows'));
      } else if (parsed.length > CALENDAR_IMPORT_MAX_ROWS) {
        setMessage(t('calendarImport_tooManyRows', {max: CALENDAR_IMPORT_MAX_ROWS}));
      }
    } catch (e) {
      if (isErrorWithCode(e) && e.code === errorCodes.OPERATION_CANCELED) {
        return;
      }
      console.error('calendar import: read failed', e);
      setMessage((e as Error).message === 'MISSING_COLUMNS' ? t('calendarImport_missingColumns') : t('calendarImport_readFailed'));
    } finally {
      setReading(false);
    }
  };

  const onTemplate = async (): Promise<void> => {
    try {
      await shareCalendarTemplate();
    } catch (e) {
      console.error('calendar import: template failed', e);
      setMessage(t('calendarImport_templateFailed'));
    }
  };

  const onValidate = (): void => {
    setMessage(undefined);
    validateMutation.mutate(rows, {
      onSuccess: res => {
        setRowErrors(errorsByIndex(res.results));
        setValidation({
          total: res.total ?? rows.length,
          valid: res.valid ?? 0,
          invalid: res.invalid ?? 0,
          stale: false,
        });
      },
      onError: e => setMessage((e as Error).message),
    });
  };

  const onImport = (): void => {
    setMessage(undefined);
    importMutation.mutate(rows, {
      onSuccess: res => setCreatedCount(res.created),
      onError: e => {
        // Some row turned invalid since the dry run — nothing was saved; show the per-row report.
        if (extractErrorCode(e) === 'BULK_VALIDATION_FAILED') {
          const results = extractErrorDetails(e)?.results as CalendarImportRowResult[] | undefined;
          const errs = errorsByIndex(results);
          setRowErrors(errs);
          setValidation(v => (v ? {...v, invalid: Object.keys(errs).length, stale: false} : v));
        }
        setMessage((e as Error).message);
      },
    });
  };

  const openEdit = (index: number): void => {
    setEditIndex(index);
    setDraft({...rows[index]});
  };
  const saveEdit = (): void => {
    if (editIndex === null || !draft) {
      return;
    }
    setRows(prev => prev.map((r, i) => (i === editIndex ? draft : r)));
    setRowErrors(prev => {
      const next = {...prev};
      delete next[editIndex];
      return next;
    });
    setValidation(v => (v ? {...v, stale: true} : v));
    setEditIndex(null);
  };
  const removeRow = (): void => {
    if (editIndex === null) {
      return;
    }
    setRows(prev => prev.filter((_, i) => i !== editIndex));
    // Indices shift after a removal — the old report no longer lines up.
    resetReport();
    setEditIndex(null);
  };

  const canImport =
    !!validation && !validation.stale && validation.invalid === 0 && rows.length > 0 && rows.length <= CALENDAR_IMPORT_MAX_ROWS;
  const errorCount = Object.keys(rowErrors).length;

  return (
    <Screen padded={false}>
      <CustomHeader title={t('calendarImport_title')} onBack={() => navigation.goBack()} />
      <FlatList
        data={rows}
        keyExtractor={(_, i) => String(i)}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <>
            <View style={styles.hint}>
              <Icon name="info" size={16} color={theme.colors.info} />
              <AppText variant="caption" color="textSecondary" style={styles.flex}>
                {t('calendarImport_help')}
              </AppText>
            </View>
            <View style={styles.actions}>
              <View style={styles.flex}>
                <CustomButton title={t('calendarImport_template')} variant="outline" size="sm" iconLeft="download" onPress={onTemplate} />
              </View>
              <View style={styles.flex}>
                <CustomButton
                  title={rows.length ? t('calendarImport_reupload') : t('calendarImport_chooseFile')}
                  size="sm"
                  iconLeft="upload"
                  loading={reading}
                  onPress={onPickFile}
                />
              </View>
            </View>
            {fileName ? (
              <AppText variant="label" color="textMuted" style={{marginTop: theme.spacing.sm}}>
                {t('calendarImport_fileRows', {name: fileName, count: rows.length})}
              </AppText>
            ) : null}
            {validation ? (
              <Row gap={theme.spacing.sm} wrap style={{marginTop: theme.spacing.sm, rowGap: 4}}>
                <Badge label={t('calendarImport_total', {count: validation.total})} tone="neutral" />
                <Badge label={t('calendarImport_valid', {count: validation.valid})} tone="success" />
                <Badge label={t('calendarImport_invalid', {count: errorCount || validation.invalid})} tone={errorCount ? 'error' : 'neutral'} />
                {validation.stale ? <Badge label={t('calendarImport_revalidate')} tone="warning" /> : null}
              </Row>
            ) : null}
            <Spacer size={theme.spacing.md} />
          </>
        }
        renderItem={({item, index}) => {
          const errs = rowErrors[index];
          return (
            <Pressable onPress={() => openEdit(index)} style={[styles.row, errs ? styles.rowError : null]}>
              <Row justify="space-between">
                <AppText variant="label" color="textMuted">
                  {t('calendarImport_rowNo', {row: index + 2})}
                </AppText>
                <Icon name="edit" size={14} color={theme.colors.textMuted} />
              </Row>
              <AppText variant="bodyBold">{item.title || '—'}</AppText>
              <AppText variant="caption" color="textSecondary">
                {[item.eventType || '—', item.audience || t('announcementForm_audienceEveryone'), item.endDate ? `${item.startDate} → ${item.endDate}` : item.startDate || '—']
                  .join(' · ')}
              </AppText>
              {errs?.map(err => (
                <AppText key={err} variant="caption" color="error">
                  • {err}
                </AppText>
              ))}
            </Pressable>
          );
        }}
        ListEmptyComponent={
          <EmptyState icon="upload" title={t('calendarImport_emptyTitle')} message={t('calendarImport_emptyMessage')} />
        }
      />

      {rows.length > 0 || message ? (
        <View style={styles.footer}>
          {message ? (
            <AppText variant="caption" color="error">
              {message}
            </AppText>
          ) : null}
          {rows.length > 0 ? (
            <View style={styles.actions}>
              <View style={styles.flex}>
                <CustomButton
                  title={t('calendarImport_validate')}
                  variant="outline"
                  loading={validateMutation.isPending}
                  disabled={rows.length > CALENDAR_IMPORT_MAX_ROWS}
                  onPress={onValidate}
                />
              </View>
              <View style={styles.flex}>
                <CustomButton
                  title={t('calendarImport_import', {count: rows.length})}
                  loading={importMutation.isPending}
                  disabled={!canImport}
                  onPress={onImport}
                />
              </View>
            </View>
          ) : null}
        </View>
      ) : null}

      <CustomModal
        visible={editIndex !== null}
        onClose={() => setEditIndex(null)}
        title={editIndex !== null ? t('calendarImport_rowNo', {row: editIndex + 2}) : undefined}>
        {draft
          ? EDIT_FIELDS.map(f => (
              <CustomInput
                key={f.key}
                label={t(f.labelKey)}
                value={draft[f.key] ?? ''}
                onChangeText={val => setDraft(d => (d ? {...d, [f.key]: val} : d))}
                containerStyle={{marginBottom: theme.spacing.xs}}
              />
            ))
          : null}
        <AppText variant="label" color="textMuted">
          {t('calendarImport_editHint')}
        </AppText>
        <Row gap={theme.spacing.sm}>
          <View style={styles.modalButtonWrap}>
            <CustomButton title={t('common_remove')} variant="dangerOutline" size="sm" onPress={removeRow} />
          </View>
          <View style={styles.modalButtonWrap}>
            <CustomButton title={t('common_save')} size="sm" onPress={saveEdit} />
          </View>
        </Row>
      </CustomModal>

      <ResultModal
        visible={createdCount !== undefined}
        variant="success"
        title={t('calendarImport_doneTitle')}
        message={t('calendarImport_doneMessage', {count: createdCount ?? 0})}
        onClose={() => {
          setCreatedCount(undefined);
          navigation.goBack();
        }}
      />
    </Screen>
  );
}
