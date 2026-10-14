/** One student's row in a paper's marks grid — shared by the admin and teacher marks screens. */
import React, {useState} from 'react';
import {Pressable, View} from 'react-native';
import {useTheme, useThemedStyles} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {AppText, Badge, CustomButton, CustomInput, CustomModal, Icon, Row, Spacer} from '../../../shared/components';
import {GRADE_MAX_LENGTH, REMARKS_MAX_LENGTH} from '../examSchedule.utils';
import type {MarkValues} from '../useMarkDrafts';
import type {ExamResultStatus, PaperStudentRow} from '../../../shared/types';

export function MarkEntryRow({
  row,
  values,
  statuses,
  maxMarks,
  readOnly,
  changed,
  error,
  onEdit,
  collapsibleExtras,
  hideInputs,
}: {
  row: PaperStudentRow;
  values: MarkValues;
  /** Status choices offered — e.g. all three for admin, GRADED / ABSENT for teachers. */
  statuses: ExamResultStatus[];
  maxMarks: number;
  readOnly: boolean;
  changed: boolean;
  error?: string;
  onEdit: (patch: Partial<MarkValues>) => void;
  /** Grade + remarks behind a "More" toggle (opened automatically when they hold a value). */
  collapsibleExtras?: boolean;
  /** Plain roster row — no status/marks inputs (e.g. invigilator-only view). */
  hideInputs?: boolean;
}): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const [extrasOpen, setExtrasOpen] = useState(false);

  const styles = useThemedStyles(t2 => ({
    row: {
      padding: t2.spacing.md,
      borderRadius: t2.radius.md,
      backgroundColor: t2.colors.surface,
      borderWidth: 1,
      borderColor: t2.colors.border,
      marginBottom: t2.spacing.sm,
      rowGap: t2.spacing.sm,
    },
    rowChanged: {borderColor: t2.colors.primary},
    rowError: {borderColor: t2.colors.error},
    statusChip: {
      paddingHorizontal: t2.spacing.md,
      paddingVertical: t2.spacing.xs,
      borderRadius: 999,
      borderWidth: 1,
    },
    inputsRow: {flexDirection: 'row', columnGap: t2.spacing.sm},
    flex: {flex: 1},
  }));

  const STATUS_LABEL: Record<ExamResultStatus, string> = {
    GRADED: t('examResult_statusGraded'),
    ABSENT: t('examResult_statusAbsent'),
    PENDING: t('examResult_statusPending'),
  };
  const STATUS_COLOR: Record<ExamResultStatus, string> = {
    GRADED: theme.colors.success,
    ABSENT: theme.colors.error,
    PENDING: theme.colors.warning,
  };

  const marksDisabled = readOnly || values.status !== 'GRADED';
  const showExtras = !collapsibleExtras || extrasOpen || !!values.grade || !!values.remarks;
  const marksInvalid = !!error && values.status === 'GRADED';

  return (
    <View style={[styles.row, error ? styles.rowError : changed ? styles.rowChanged : null]}>
      <Row justify="space-between" align="flex-start">
        <View style={styles.flex}>
          <AppText variant="bodyBold">
            {row.rollNo ? `${row.rollNo}. ` : ''}
            {row.name}
          </AppText>
          <AppText variant="label" color="textMuted">
            {row.admissionNo}
            {!hideInputs && !row.mark && !changed ? ` · ${t('paperMarks_notEntered')}` : ''}
          </AppText>
        </View>
        <Row gap={theme.spacing.xs}>
          {hideInputs && row.mark ? (
            <Badge label={STATUS_LABEL[row.mark.status]} tone={row.mark.status === 'ABSENT' ? 'error' : 'neutral'} />
          ) : null}
          <Badge label={t('common_sectionOptionLabel', {name: row.sectionName})} tone="neutral" />
        </Row>
      </Row>

      {hideInputs ? null : (
        <>
          <Row gap={theme.spacing.sm} wrap style={{rowGap: theme.spacing.xs}}>
            {/* A current status outside `statuses` (e.g. PENDING set by admin) is still shown. */}
            {(statuses.includes(values.status) ? statuses : [...statuses, values.status]).map(s => {
              const active = values.status === s;
              return (
                <Pressable
                  key={s}
                  disabled={readOnly}
                  onPress={() => onEdit({status: s})}
                  style={[
                    styles.statusChip,
                    {
                      borderColor: active ? STATUS_COLOR[s] : theme.colors.border,
                      backgroundColor: active ? STATUS_COLOR[s] : 'transparent',
                      opacity: readOnly && !active ? 0.5 : 1,
                    },
                  ]}>
                  <AppText variant="label" style={{color: active ? theme.colors.onPrimary : theme.colors.textSecondary}}>
                    {STATUS_LABEL[s]}
                  </AppText>
                </Pressable>
              );
            })}
          </Row>

          <View style={styles.inputsRow}>
            <View style={styles.flex}>
              <CustomInput
                placeholder={values.status !== 'GRADED' ? '—' : t('examResult_marksPlaceholder', {max: maxMarks})}
                keyboardType="decimal-pad"
                value={values.marks}
                editable={!marksDisabled}
                error={marksInvalid ? ' ' : undefined}
                onChangeText={val => onEdit({marks: val})}
                containerStyle={{marginBottom: 0, opacity: marksDisabled ? 0.6 : 1}}
              />
            </View>
            {collapsibleExtras && !showExtras ? (
              <Pressable onPress={() => setExtrasOpen(true)} hitSlop={8} style={{justifyContent: 'center'}} disabled={readOnly}>
                <Row gap={4}>
                  <Icon name="add" size={14} color={readOnly ? theme.colors.textMuted : theme.colors.primary} />
                  <AppText variant="label" color={readOnly ? 'textMuted' : 'primary'}>
                    {t('paperMarks_gradeRemarks')}
                  </AppText>
                </Row>
              </Pressable>
            ) : (
              <View style={styles.flex}>
                <CustomInput
                  placeholder={t('examResult_grade')}
                  value={values.grade}
                  editable={!readOnly}
                  maxLength={GRADE_MAX_LENGTH}
                  autoCapitalize="characters"
                  onChangeText={val => onEdit({grade: val})}
                  containerStyle={{marginBottom: 0, opacity: readOnly ? 0.6 : 1}}
                />
              </View>
            )}
          </View>
          {showExtras ? (
            <CustomInput
              placeholder={t('examResult_remarksPlaceholder')}
              value={values.remarks}
              editable={!readOnly}
              maxLength={REMARKS_MAX_LENGTH}
              onChangeText={val => onEdit({remarks: val})}
              containerStyle={{marginBottom: 0, opacity: readOnly ? 0.6 : 1}}
            />
          ) : null}
          {error ? (
            <AppText variant="caption" color="error">
              {error}
            </AppText>
          ) : null}
        </>
      )}
    </View>
  );
}

/** "You have N unsaved changes. Leave without saving?" */
export function UnsavedChangesModal({
  visible,
  count,
  onKeepEditing,
  onDiscard,
}: {
  visible: boolean;
  count: number;
  onKeepEditing: () => void;
  onDiscard: () => void;
}): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  return (
    <CustomModal visible={visible} onClose={onKeepEditing} title={t('paperMarks_unsavedTitle')}>
      <AppText variant="body" color="textSecondary">
        {t('paperMarks_unsavedMessage', {count})}
      </AppText>
      <Spacer size={16} />
      <Row gap={theme.spacing.md}>
        <View style={{flex: 1}}>
          <CustomButton title={t('paperMarks_keepEditing')} variant="outline" onPress={onKeepEditing} />
        </View>
        <View style={{flex: 1}}>
          <CustomButton title={t('paperMarks_discard')} variant="danger" onPress={onDiscard} />
        </View>
      </Row>
    </CustomModal>
  );
}
