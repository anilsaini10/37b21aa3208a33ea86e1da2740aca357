/**
 * One academic-calendar entry: date range, title, type badge, audience, days, "School closed".
 * Admin: EVENT entries can be edited / deleted here; EXAM entries are managed in the Exams module.
 * Teacher / parent: no edit callbacks → read-only; `onPress` opens the entry's detail.
 */
import React from 'react';
import {Pressable, View} from 'react-native';
import {useTheme, useThemedStyles} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {AppText, Badge, Icon, Row} from '../../../shared/components';
import {EVENT_TYPE_COLOR, EVENT_TYPE_TONE, useEventTypeLabels} from '../../events/eventTypes';
import {formatRange} from '../calendar.utils';
import type {AnnouncementAudience, CalendarEntry} from '../../../shared/types';

export function CalendarEntryRow({
  entry,
  onEdit,
  onDelete,
  onOpenExams,
  onPress,
}: {
  entry: CalendarEntry;
  onEdit?: (entry: CalendarEntry) => void;
  onDelete?: (entry: CalendarEntry) => void;
  onOpenExams?: () => void;
  onPress?: (entry: CalendarEntry) => void;
}): React.JSX.Element {
  const editable = !!onEdit;
  const {theme} = useTheme();
  const {t} = useLanguage();
  const TYPE_LABEL = useEventTypeLabels();
  const AUDIENCE_LABEL: Record<AnnouncementAudience, string> = {
    ALL: t('announcementForm_audienceEveryone'),
    TEACHER: t('announcementForm_audienceTeachers'),
    PARENT: t('announcementForm_audienceParents'),
  };

  const styles = useThemedStyles(t2 => ({
    row: {
      flexDirection: 'row',
      columnGap: t2.spacing.sm,
      paddingVertical: t2.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: t2.colors.divider,
    },
    stripe: {width: 4, borderRadius: 2},
    body: {flex: 1, rowGap: 2},
  }));

  return (
    <Pressable style={styles.row} disabled={!onPress} onPress={() => onPress?.(entry)}>
      <View style={[styles.stripe, {backgroundColor: EVENT_TYPE_COLOR[entry.type]}]} />
      <View style={styles.body}>
        <Row justify="space-between" align="flex-start" gap={theme.spacing.sm}>
          <AppText variant="bodyBold" style={{flex: 1}}>
            {entry.title}
          </AppText>
          {!editable ? null : entry.source === 'EVENT' ? (
            <Row gap={theme.spacing.md}>
              <Pressable onPress={() => onEdit?.(entry)} hitSlop={8} accessibilityLabel={t('common_edit')}>
                <Icon name="edit" size={16} color={theme.colors.textMuted} />
              </Pressable>
              <Pressable onPress={() => onDelete?.(entry)} hitSlop={8} accessibilityLabel={t('common_delete')}>
                <Icon name="delete" size={16} color={theme.colors.error} />
              </Pressable>
            </Row>
          ) : (
            <Pressable onPress={onOpenExams} hitSlop={8}>
              <AppText variant="label" color="primary">
                {t('calendar_managedInExams')}
              </AppText>
            </Pressable>
          )}
        </Row>
        <AppText variant="label" color="textSecondary">
          {formatRange(entry.startDate, entry.endDate)} · {t('calendar_daysCount', {count: entry.days})}
        </AppText>
        <Row gap={theme.spacing.xs} wrap style={{rowGap: 4}}>
          <Badge label={TYPE_LABEL[entry.type]} tone={EVENT_TYPE_TONE[entry.type]} />
          {editable ? <Badge label={AUDIENCE_LABEL[entry.audience] ?? entry.audience} tone="neutral" /> : null}
          {entry.schoolClosed ? <Badge label={`✓ ${t('calendar_schoolClosed')}`} tone="error" /> : null}
        </Row>
        {entry.classes.length > 0 ? (
          <AppText variant="label" color="textMuted" numberOfLines={2}>
            {entry.classes.join(', ')}
          </AppText>
        ) : null}
        {editable && entry.description ? (
          <AppText variant="caption" color="textSecondary" numberOfLines={3}>
            {entry.description}
          </AppText>
        ) : null}
      </View>
    </Pressable>
  );
}
