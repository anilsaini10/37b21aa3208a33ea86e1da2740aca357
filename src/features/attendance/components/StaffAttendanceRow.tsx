/**
 * One teacher-day in the admin's staff attendance register:
 *   Self check-in — teacherStatus + time (+ 📍 Google Maps link when coordinates exist)
 *   Admin mark    — adminStatus + who/when, or "Not marked"
 *   Final         — `status` (bold badge); a ⚠️ note when the two markings disagree.
 * `record` is null for a teacher with nothing recorded that day (day view only).
 */
import React from 'react';
import {Linking, Pressable, View} from 'react-native';
import {useTheme, useThemedStyles} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {AppText, Badge, Icon, Row} from '../../../shared/components';
import {formatDate, formatTime12h} from '../../../core/utils/format';
import {ATTENDANCE_STATUS_TONE, useAttendanceStatusLabels} from './attendanceStatus';
import type {AttendanceStatusCode, StaffAttendanceRecord} from '../../../shared/types';

/** Teacher and admin both marked the day, differently. */
export function isAttendanceMismatch(r: StaffAttendanceRecord | null | undefined): boolean {
  return !!r && r.teacherStatus != null && r.adminStatus != null && r.teacherStatus !== r.adminStatus;
}

export function StaffAttendanceRow({
  teacherName,
  employeeId,
  record,
  showDate,
  onPress,
}: {
  teacherName: string;
  employeeId?: string;
  record: StaffAttendanceRecord | null;
  showDate?: boolean;
  onPress?: () => void;
}): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const LABEL = useAttendanceStatusLabels();
  const mismatch = isAttendanceMismatch(record);

  const styles = useThemedStyles(t2 => ({
    card: {
      backgroundColor: t2.colors.card,
      borderRadius: 16,
      padding: 12,
      marginVertical: 6,
      borderWidth: 1,
      borderColor: 'transparent',
      shadowColor: t2.colors.shadow,
      shadowOpacity: theme.dark ? 0.28 : 0.06,
      shadowRadius: 8,
      shadowOffset: {width: 0, height: 2},
      elevation: 2,
      rowGap: 4,
    },
    cardMismatch: {borderColor: t2.colors.warning},
    line: {flexDirection: 'row', alignItems: 'center', columnGap: 6},
    lineLabel: {width: 92},
    dot: {width: 8, height: 8, borderRadius: 4},
    flex: {flex: 1},
    note: {
      flexDirection: 'row',
      columnGap: 6,
      marginTop: 4,
      padding: 8,
      borderRadius: t2.radius.md,
      backgroundColor: t2.colors.warning + '18',
    },
  }));

  const colorOf = (s: AttendanceStatusCode): string => {
    const tone = ATTENDANCE_STATUS_TONE[s];
    return tone === 'neutral' ? theme.colors.textMuted : theme.colors[tone];
  };

  const lat = record?.teacherLatitude;
  const lng = record?.teacherLongitude;
  const hasLocation = lat != null && lng != null;

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      android_ripple={onPress ? {color: theme.colors.divider} : undefined}
      style={({pressed}) => [styles.card, mismatch ? styles.cardMismatch : null, {opacity: pressed ? 0.85 : 1}]}>
      <Row justify="space-between" align="flex-start">
        <View style={styles.flex}>
          <AppText variant="bodyBold" numberOfLines={1}>
            {teacherName}
          </AppText>
          <AppText variant="label" color="textSecondary" numberOfLines={1}>
            {[employeeId, showDate && record ? formatDate(`${record.date.slice(0, 10)}T00:00:00`) : undefined]
              .filter(Boolean)
              .join(' · ')}
          </AppText>
        </View>
        <Row gap={6}>
          {mismatch ? <Icon name="warning" size={16} color={theme.colors.warning} /> : null}
          {record ? (
            <Badge label={LABEL[record.status]} tone={ATTENDANCE_STATUS_TONE[record.status]} textStyle={{fontWeight: '700'}} />
          ) : (
            <Badge label={t('staffAttendance_noRecord')} tone="neutral" />
          )}
        </Row>
      </Row>

      {/* Self check-in */}
      <View style={styles.line}>
        <AppText variant="label" color="textMuted" style={styles.lineLabel}>
          {t('staffAttendance_selfCheckIn')}
        </AppText>
        {record?.teacherStatus ? (
          <>
            <View style={[styles.dot, {backgroundColor: colorOf(record.teacherStatus)}]} />
            <AppText variant="caption" style={styles.flex} numberOfLines={1}>
              {LABEL[record.teacherStatus]}
              {record.teacherMarkedAt ? ` · ${formatTime12h(record.teacherMarkedAt)}` : ''}
            </AppText>
            {hasLocation ? (
              <Pressable
                hitSlop={8}
                accessibilityLabel={t('myAttendance_viewLocation')}
                onPress={() => Linking.openURL(`https://maps.google.com/?q=${lat},${lng}`)}>
                <Row gap={2}>
                  <Icon name="globe" size={13} color={theme.colors.primary} />
                  <AppText variant="label" color="primary">
                    {t('staffAttendance_map')}
                  </AppText>
                </Row>
              </Pressable>
            ) : null}
          </>
        ) : (
          <AppText variant="caption" color="textMuted" style={styles.flex}>
            —
          </AppText>
        )}
      </View>

      {/* Admin mark */}
      <View style={styles.line}>
        <AppText variant="label" color="textMuted" style={styles.lineLabel}>
          {t('staffAttendance_adminMark')}
        </AppText>
        {record?.adminStatus ? (
          <>
            <View style={[styles.dot, {backgroundColor: colorOf(record.adminStatus)}]} />
            <AppText variant="caption" style={styles.flex} numberOfLines={2}>
              {LABEL[record.adminStatus]}
              {record.adminMarkedBy
                ? ` · ${
                    record.adminMarkedAt
                      ? t('staffAttendance_byAt', {name: record.adminMarkedBy.name, time: formatTime12h(record.adminMarkedAt)})
                      : t('checkIn_byName', {name: record.adminMarkedBy.name})
                  }`
                : ''}
            </AppText>
          </>
        ) : (
          <AppText variant="caption" color="textMuted" style={styles.flex}>
            {t('staffAttendance_notMarked')}
          </AppText>
        )}
      </View>

      {mismatch && record?.teacherStatus && record.adminStatus ? (
        <View style={styles.note}>
          <Icon name="warning" size={13} color={theme.colors.warning} />
          <AppText variant="caption" color="textSecondary" style={styles.flex}>
            {record.teacherMarkedAt
              ? t('staffAttendance_mismatchNote', {
                  time: formatTime12h(record.teacherMarkedAt),
                  status: LABEL[record.adminStatus],
                })
              : t('staffAttendance_mismatchNoteNoTime', {
                  teacherStatus: LABEL[record.teacherStatus],
                  status: LABEL[record.adminStatus],
                })}
          </AppText>
        </View>
      ) : null}
    </Pressable>
  );
}
