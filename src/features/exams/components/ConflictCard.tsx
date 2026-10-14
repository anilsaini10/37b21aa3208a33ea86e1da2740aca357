/** "Clashes with …" card built from a backend error's `details.conflictWith`. */
import React from 'react';
import {View} from 'react-native';
import {useTheme, useThemedStyles} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {AppText, Icon, Row} from '../../../shared/components';
import {formatPaperDate} from '../examSchedule.utils';
import type {ExamPaperConflict} from '../../../shared/types';

export function ConflictCard({
  conflict,
  currentExamId,
}: {
  conflict: ExamPaperConflict;
  /** When the clash is in a different exam, its title is shown too. */
  currentExamId?: string;
}): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const styles = useThemedStyles(t2 => ({
    card: {
      borderWidth: 1,
      borderColor: t2.colors.error,
      borderRadius: t2.radius.md,
      padding: t2.spacing.sm,
      marginBottom: t2.spacing.md,
      rowGap: 2,
    },
  }));

  const extras = [
    conflict.examId !== currentExamId ? conflict.examTitle : undefined,
    conflict.roomNo ? t('dateSheet_roomValue', {room: conflict.roomNo}) : undefined,
    conflict.invigilatorName ? t('dateSheet_invigilatorValue', {name: conflict.invigilatorName}) : undefined,
  ].filter(Boolean);

  return (
    <View style={styles.card}>
      <Row gap={6} align="center">
        <Icon name="warning" size={14} color={theme.colors.error} />
        <AppText variant="label" color="error">
          {t('dateSheet_clashesWith')}
        </AppText>
      </Row>
      <AppText variant="bodyBold">
        {conflict.className} · {conflict.subjectName}
      </AppText>
      <AppText variant="caption" color="textSecondary">
        {formatPaperDate(conflict.date)}, {conflict.startTime}–{conflict.endTime}
      </AppText>
      {extras.length > 0 ? (
        <AppText variant="caption" color="textMuted">
          {extras.join(' · ')}
        </AppText>
      ) : null}
    </View>
  );
}
