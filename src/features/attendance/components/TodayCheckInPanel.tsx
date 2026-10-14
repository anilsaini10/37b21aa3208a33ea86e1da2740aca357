/**
 * Teacher self attendance — "Today's attendance" panel (dashboard profile card + My Attendance).
 *
 *   Today · Mon, 13 Oct                     [final status]
 *   You    In 08:16 AM 📍 · Out 03:16 PM 📍 · 7h 0m   (or "Not checked in")
 *   [ Mark Attendance ] / [ Check Out ] / blocked message
 *
 * State comes only from `GET /my-attendance/today` (never cached across days — the date
 * rolls over at IST midnight). Check-in / check-out each: confirm → read GPS (best effort)
 * → POST with `{latitude, longitude}` or `{}`. A 409 just refreshes the state; a network
 * error keeps the button usable; a VALIDATION_ERROR (bad coords) retries once without location.
 */
import React, {useRef, useState} from 'react';
import {ActivityIndicator, Pressable, View} from 'react-native';
import {useQueryClient} from '@tanstack/react-query';
import {useTheme, useThemedStyles} from '../../../core/theme';
import {useLanguage, type TranslationKey} from '../../../core/i18n';
import {AppText, Badge, CustomBottomSheet, CustomButton, Icon, ResultModal, Row} from '../../../shared/components';
import {formatTime12h, formatTimeHms} from '../../../core/utils/format';
import {extractErrorCode, extractErrorDetails} from '../../../core/api/apiError';
import {ATTENDANCE_STATUS_TONE, useAttendanceStatusLabels} from './attendanceStatus';
import {MY_ATTENDANCE_TODAY_KEY, useCheckIn, useCheckOut, useMyAttendanceToday} from '../myStaffAttendance.service';
import {getCurrentCoordinates, type Coordinates} from '../../../core/location/locationService';
import type {MyAttendanceToday, MyStaffAttendanceRecord} from '../../../shared/types';

type Action = 'in' | 'out';

const DAY_KEYS: TranslationKey[] = [
  'common_daySun', 'common_dayMon', 'common_dayTue', 'common_dayWed',
  'common_dayThu', 'common_dayFri', 'common_daySat',
];
const MONTH_KEYS: TranslationKey[] = [
  'common_monthJan', 'common_monthFeb', 'common_monthMar', 'common_monthApr',
  'common_monthMay', 'common_monthJun', 'common_monthJul', 'common_monthAug',
  'common_monthSep', 'common_monthOct', 'common_monthNov', 'common_monthDec',
];

/** 409 / 403 codes that just mean "the state changed" — refresh, don't alarm. */
const REFRESH_CODES = new Set([
  'ALREADY_CHECKED_IN',
  'ON_LEAVE_TODAY',
  'HOLIDAY_TODAY',
  'TEACHER_INACTIVE',
  'NOT_CHECKED_IN',
  'ALREADY_CHECKED_OUT',
]);

/** Today-state fields that come straight off a record (the refetch that follows confirms the rest). */
function todayFromRecord(prev: MyAttendanceToday, record: MyStaffAttendanceRecord): MyAttendanceToday {
  const checkedIn = record.teacherStatus != null;
  const checkedOut = !!record.teacherCheckOutAt;
  return {
    ...prev,
    teacherStatus: record.teacherStatus,
    teacherMarkedAt: record.teacherMarkedAt,
    teacherLatitude: record.teacherLatitude,
    teacherLongitude: record.teacherLongitude,
    teacherCheckOutAt: record.teacherCheckOutAt,
    adminStatus: record.adminStatus,
    status: record.status,
    checkedIn,
    canCheckIn: false,
    checkedOut,
    canCheckOut: checkedIn && !checkedOut,
    record,
  };
}

export function TodayCheckInPanel(): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const qc = useQueryClient();
  const {data, isLoading, isError, refetch, isRefetching} = useMyAttendanceToday();
  const checkIn = useCheckIn();
  const checkOut = useCheckOut();
  const STATUS_LABEL = useAttendanceStatusLabels();
  const [confirm, setConfirm] = useState<Action | null>(null);
  const [actionError, setActionError] = useState<string | undefined>();
  const [success, setSuccess] = useState<{action: Action; at: string | null; locationNote?: string} | undefined>();
  const [locating, setLocating] = useState(false);
  /** Guards the whole locate → POST flow, so a double tap can't start a second request. */
  const busyRef = useRef(false);
  const busy = locating || checkIn.isPending || checkOut.isPending;

  const styles = useThemedStyles(t2 => ({
    wrap: {marginTop: t2.spacing.sm},
    line: {flexDirection: 'row', alignItems: 'center', columnGap: t2.spacing.sm, marginTop: t2.spacing.xs},
    lineLabel: {width: 52},
    dot: {width: 8, height: 8, borderRadius: 4},
    flex: {flex: 1},
    inOut: {flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', columnGap: 4, rowGap: 2},
    note: {
      flexDirection: 'row',
      columnGap: t2.spacing.xs,
      marginTop: t2.spacing.sm,
      padding: t2.spacing.sm,
      borderRadius: t2.radius.md,
      backgroundColor: t2.colors.warning + '18',
    },
    sheetButtons: {flexDirection: 'row', columnGap: t2.spacing.md, marginTop: t2.spacing.lg},
    actionRow: {flexDirection: 'row', alignItems: 'center', columnGap: t2.spacing.sm, marginTop: t2.spacing.sm},
    actionButton: {width: '25%', minWidth: 100, paddingHorizontal: t2.spacing.sm,
      height:35
    },
    // 14 scaled by the user's font-size setting (the theme has no 14 token: sm = 13, md = 15).
    actionButtonText: {fontSize: 14 * t2.typography.scale, lineHeight: 20 * t2.typography.scale},
  }));


  /** "Mon, 13 Oct" from the server's IST date — split, not `new Date(str)` (UTC would shift the day). */
  const dateLabel = (date: string): string => {
    const [y, m, d] = date.slice(0, 10).split('-').map(Number);
    return `${t(DAY_KEYS[new Date(y, m - 1, d).getDay()])}, ${d} ${t(MONTH_KEYS[m - 1])}`;
  };

  const submit = (action: Action, coords: Coordinates | null, locationNote?: string): void => {
    const mutation = action === 'in' ? checkIn : checkOut;
    mutation.mutate(coords, {
      onSuccess: res => {
        busyRef.current = false;
        // Render from the returned record right away; the invalidation refetch confirms it.
        qc.setQueryData<MyAttendanceToday>(MY_ATTENDANCE_TODAY_KEY, prev =>
          prev ? {...todayFromRecord(prev, res.record), reason: null, checkOutReason: null} : prev,
        );
        setSuccess({
          action,
          at: action === 'in' ? res.record.teacherMarkedAt : res.record.teacherCheckOutAt ?? null,
          locationNote: locationNote ?? (coords ? undefined : t('checkIn_locationNotCaptured')),
        });
      },
      onError: e => {
        const code = extractErrorCode(e);
        // Bad coordinates — the server rejected the location, not the action. Retry once without it.
        if (code === 'VALIDATION_ERROR' && coords) {
          submit(action, null, t('checkIn_locationNotCaptured'));
          return;
        }
        busyRef.current = false;
        if (code && REFRESH_CODES.has(code)) {
          const record = extractErrorDetails(e)?.record as MyStaffAttendanceRecord | undefined;
          if (record) {
            qc.setQueryData<MyAttendanceToday>(MY_ATTENDANCE_TODAY_KEY, prev =>
              prev ? todayFromRecord(prev, record) : prev,
            );
          }
          refetch();
          return;
        }
        // Network / 5xx — keep the button enabled so they can just try again.
        setActionError(t('checkIn_updateFailed'));
      },
    });
  };

  const onConfirm = async (): Promise<void> => {
    const action = confirm;
    setConfirm(null);
    setActionError(undefined);
    if (!action || busyRef.current) {
      return;
    }
    busyRef.current = true;
    setLocating(true);
    // Never throws — null when permission is denied / GPS is off / it times out.
    const coords = await getCurrentCoordinates();
    setLocating(false);
    submit(action, coords);
  };

  if (isLoading || (!data && !isError)) {
    return (
      <Row gap={theme.spacing.sm} style={styles.wrap}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
        <AppText variant="caption" color="textSecondary">
          {t('checkIn_loading')}
        </AppText>
      </Row>
    );
  }
  if (isError || !data) {
    return (
      <Row justify="space-between" style={styles.wrap}>
        <AppText variant="caption" color="error" style={styles.flex}>
          {t('checkIn_loadFailed')}
        </AppText>
        <Pressable onPress={() => refetch()} hitSlop={8} disabled={isRefetching}>
          <AppText variant="label" color="primary">
            {t('common_retry')}
          </AppText>
        </Pressable>
      </Row>
    );
  }

  const mismatch = data.teacherStatus != null && data.adminStatus != null && data.teacherStatus !== data.adminStatus;

  // Which action (if any) the card offers, and the message when neither is available.
  const nextAction: Action | null = data.canCheckIn ? 'in' : data.checkedIn && data.canCheckOut ? 'out' : null;
  const blockMessage = !nextAction
    ? !data.checkedIn
      ? data.reason?.message // leave / holiday / inactive
      : !data.checkedOut && data.checkOutReason?.code !== 'ALREADY_CHECKED_OUT'
        ? data.checkOutReason?.message
        : undefined
    : undefined;

  return (
    <View style={styles.wrap}>
      <Row justify="space-between">
        {/* Check-in time (HH:MM:SS, device local time) once checked in; nothing before that. */}
        {data.teacherMarkedAt ? (
          // Theme green once checked in (stays green after check-out too).
          <AppText variant="label" color="success">
            {t('checkIn_checkInTime', {time: formatTimeHms(data.teacherMarkedAt)})}
          </AppText>
        ) : (
          <View />
        )}
        {data.status ? <Badge label={STATUS_LABEL[data.status]} tone={ATTENDANCE_STATUS_TONE[data.status]} /> : null}
      </Row>

      {mismatch && data.adminStatus ? (
        <View style={styles.note}>
          <Icon name="info" size={14} color={theme.colors.warning} />
          <AppText variant="caption" color="textSecondary" style={styles.flex}>
            {t('checkIn_mismatchNote', {status: STATUS_LABEL[data.adminStatus]})}
          </AppText>
        </View>
      ) : null}

      {nextAction ? (
        // Hint (or "getting location…" / error) on the left, compact button on the right.
        <View style={styles.actionRow}>
          <AppText variant="caption" color={actionError ? 'error' : 'textMuted'} style={styles.flex}>
            {locating
              ? t('checkIn_gettingLocation')
              : actionError ?? (nextAction === 'in' ? t('checkIn_hint') : t('checkIn_checkOutHint'))}
          </AppText>
          {/* Compact button (25% width) rather than full width. No icon — it wouldn't fit next to the label. */}
          <CustomButton
            title={nextAction === 'in' ? t('checkIn_markAttendance') : t('checkIn_checkOut')}
            variant={nextAction === 'in' ? 'outline' : 'dangerOutline'}
            size="sm"
            fullWidth={false}
            style={styles.actionButton}
            textStyle={styles.actionButtonText}
            loading={busy}
            disabled={busy}
            onPress={() => setConfirm(nextAction)}
          />
        </View>
      ) : blockMessage ? (
        <View style={[styles.note, {backgroundColor: theme.colors.surfaceVariant}]}>
          <Icon
            name={data.reason?.code === 'ON_LEAVE_TODAY' || data.reason?.code === 'HOLIDAY_TODAY' ? 'calendar' : 'info'}
            size={14}
            color={theme.colors.textSecondary}
          />
          <AppText variant="caption" color="textSecondary" style={styles.flex}>
            {blockMessage}
          </AppText>
        </View>
      ) : null}

      <CustomBottomSheet
        visible={!!confirm}
        onClose={() => setConfirm(null)}
        title={confirm === 'out' ? t('checkIn_checkOut') : t('checkIn_markAttendance')}>
        <AppText variant="body" color="textSecondary">
          {confirm === 'out' ? t('checkIn_confirmCheckOut') : t('checkIn_confirmMessage')}
        </AppText>
        <AppText variant="bodyBold" style={{marginTop: theme.spacing.xs}}>
          {dateLabel(data.date)}
        </AppText>
        <Row gap={4} style={{marginTop: theme.spacing.sm}}>
          <Icon name="globe" size={13} color={theme.colors.textMuted} />
          <AppText variant="caption" color="textMuted" style={styles.flex}>
            {t('checkIn_locationInfo')}
          </AppText>
        </Row>
        <View style={styles.sheetButtons}>
          <View style={styles.flex}>
            <CustomButton title={t('common_cancel')} variant="outline" onPress={() => setConfirm(null)} />
          </View>
          <View style={styles.flex}>
            <CustomButton title={t('common_confirm')} onPress={onConfirm} disabled={busy} />
          </View>
        </View>
      </CustomBottomSheet>

      <ResultModal
        visible={success !== undefined}
        variant="success"
        title={success?.action === 'out' ? t('checkIn_checkOutSuccessTitle') : t('checkIn_successTitle')}
        message={
          [
            success?.at
              ? t(success.action === 'out' ? 'checkIn_checkedOutAt' : 'checkIn_checkedInAt', {
                  time: formatTime12h(success.at),
                })
              : undefined,
            success?.locationNote,
          ]
            .filter(Boolean)
            .join('\n') || undefined
        }
        onClose={() => setSuccess(undefined)}
      />
    </View>
  );
}
