/**
 * One teacher-day as a horizontal timeline over the day's window: busy blocks coloured by type
 * (class / exam duty / leave / absent) and free gaps in green, with the free gaps listed below
 * ("10:00–14:00 · 4h"). Leave / absent / school-closed days show a single label instead.
 */
import React from 'react';
import {View} from 'react-native';
import {useTheme, useThemedStyles} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {AppText, Row} from '../../../shared/components';
import {formatDuration} from '../../../core/utils/format';
import {EVENT_TYPE_COLOR} from '../../events/eventTypes';
import type {BusySlot, BusyType, FreeGap} from '../../../shared/types';

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

export function useBusyColors(): Record<BusyType, string> {
  const {theme} = useTheme();
  return {
    CLASS: theme.colors.primary,
    INVIGILATION: EVENT_TYPE_COLOR.EXAM,
    LEAVE: theme.colors.info,
    ABSENT: theme.colors.error,
  };
}

export function DayTimeline({
  from,
  to,
  busy,
  free,
  blockedLabel,
}: {
  /** Window "HH:MM" */
  from: string;
  to: string;
  busy: BusySlot[];
  free: FreeGap[];
  /** Whole day unavailable (leave / absent / school closed) — shown across the row instead of blocks. */
  blockedLabel?: string;
}): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const BUSY_COLOR = useBusyColors();
  const start = toMinutes(from);
  const span = Math.max(1, toMinutes(to) - start);
  const pct = (hhmm: string): number => Math.min(100, Math.max(0, ((toMinutes(hhmm) - start) / span) * 100));

  const styles = useThemedStyles(t2 => ({
    track: {
      height: 18,
      borderRadius: 4,
      backgroundColor: t2.colors.surfaceVariant,
      overflow: 'hidden',
      position: 'relative',
    },
    block: {position: 'absolute', top: 0, bottom: 0},
    blocked: {
      height: 18,
      borderRadius: 4,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: t2.colors.error + '1A',
    },
    gaps: {flexDirection: 'row', flexWrap: 'wrap', columnGap: t2.spacing.sm, rowGap: 2, marginTop: 4},
  }));

  if (blockedLabel) {
    return (
      <View style={styles.blocked}>
        <AppText variant="label" color="error">
          {blockedLabel}
        </AppText>
      </View>
    );
  }

  return (
    <View>
      <View style={styles.track}>
        {free.map(g => (
          <View
            key={`f-${g.startTime}`}
            style={[
              styles.block,
              {left: `${pct(g.startTime)}%`, width: `${pct(g.endTime) - pct(g.startTime)}%`, backgroundColor: theme.colors.success + '55'},
            ]}
          />
        ))}
        {busy.map((b, i) => (
          <View
            key={`b-${i}-${b.startTime}`}
            style={[
              styles.block,
              {left: `${pct(b.startTime)}%`, width: `${pct(b.endTime) - pct(b.startTime)}%`, backgroundColor: BUSY_COLOR[b.type]},
            ]}
          />
        ))}
      </View>
      <Row justify="space-between">
        <AppText variant="label" color="textMuted">
          {from}
        </AppText>
        <AppText variant="label" color="textMuted">
          {to}
        </AppText>
      </Row>
      <View style={styles.gaps}>
        {free.length === 0 ? (
          <AppText variant="label" color="textMuted">
            {t('availability_noFreeTime')}
          </AppText>
        ) : (
          free.map(g => (
            <AppText key={`l-${g.startTime}`} variant="label" color="success">
              {g.startTime}–{g.endTime} · {formatDuration(g.minutes)}
            </AppText>
          ))
        )}
      </View>
    </View>
  );
}
