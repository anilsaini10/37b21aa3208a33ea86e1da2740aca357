/**
 * Teacher free / busy timelines (admin).
 *
 * With `teacherId` (from Teacher detail): that teacher's week (Mon–Sat, from the weekly timetable),
 * or a specific date — which also shows exam duty, leave and absence.
 * Without: every teacher for one date / weekday, sorted by free time, with a "gaps ≥ N min" filter.
 */
import React, {useMemo, useState} from 'react';
import {Pressable, RefreshControl, ScrollView, View} from 'react-native';
import {useNavigation, useRoute, type RouteProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme, useThemedStyles} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {
  Screen,
  CustomHeader,
  CustomCard,
  DatePicker,
  SegmentedTabs,
  AppText,
  Badge,
  Icon,
  Row,
  Spacer,
  Loader,
  EmptyState,
} from '../../../shared/components';
import {formatDuration} from '../../../core/utils/format';
import {useTeacherFreeSlots, type FreeSlotsParams} from '../teacherAvailability.service';
import {DayTimeline, useBusyColors} from '../components/DayTimeline';
import {SCHOOL_DAYS, WeekdayChips, todayLocalIso} from '../components/WeekdayChips';
import type {AdminStackParamList} from '../../../navigation/types';
import type {BusyType, FreeSlotsDay, ScheduleDay, TeacherDaySlots} from '../../../shared/types';

type Nav = NativeStackNavigationProp<AdminStackParamList>;
type Mode = 'week' | 'date' | 'day';

const MIN_MINUTES_OPTIONS = [1, 30, 60];

export function TeacherFreeSlotsScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<AdminStackParamList, 'TeacherFreeSlots'>>();
  const {teacherId, teacherName, date: presetDate, day: presetDay} = route.params ?? {};
  const single = !!teacherId;
  const BUSY_COLOR = useBusyColors();

  const [mode, setMode] = useState<Mode>(single ? 'week' : presetDay ? 'day' : 'date');
  const [date, setDate] = useState(presetDate ?? todayLocalIso());
  const [day, setDay] = useState<ScheduleDay>(presetDay ?? 'MONDAY');
  const [minMinutes, setMinMinutes] = useState(1);

  const params = useMemo<FreeSlotsParams>(
    () => ({
      teacherId,
      ...(mode === 'date' ? {date} : mode === 'day' ? {day} : {}),
      minMinutes: minMinutes > 1 ? minMinutes : undefined,
    }),
    [teacherId, mode, date, day, minMinutes],
  );
  const {data, isLoading, isError, error, refetch, isRefetching} = useTeacherFreeSlots(params);

  const styles = useThemedStyles(t2 => ({
    content: {padding: t2.spacing.lg, flexGrow: 1},
    card: {marginBottom: t2.spacing.sm},
    banner: {
      flexDirection: 'row',
      columnGap: t2.spacing.sm,
      padding: t2.spacing.md,
      borderRadius: t2.radius.md,
      backgroundColor: t2.colors.error + '14',
      marginBottom: t2.spacing.md,
    },
    chipsRow: {flexDirection: 'row', flexWrap: 'wrap', gap: t2.spacing.sm, marginBottom: t2.spacing.md},
    chip: {paddingHorizontal: t2.spacing.md, paddingVertical: 6, borderRadius: 999, borderWidth: 1},
    legend: {flexDirection: 'row', flexWrap: 'wrap', gap: t2.spacing.sm, marginBottom: t2.spacing.md},
    dot: {width: 10, height: 10, borderRadius: 3},
  }));

  const dayLabel = (d: ScheduleDay): string => {
    const found = SCHOOL_DAYS.find(s => s.day === d);
    return found ? t(found.key) : t('common_daySun');
  };

  const daysByKey = new Map<string, FreeSlotsDay>((data?.days ?? []).map(d => [`${d.day}|${d.date ?? ''}`, d]));
  const dayMeta = (slot: TeacherDaySlots): FreeSlotsDay | undefined => daysByKey.get(`${slot.day}|${slot.date ?? ''}`);

  const blockedLabel = (slot: TeacherDaySlots): string | undefined => {
    const closed = dayMeta(slot)?.schoolClosed;
    if (closed) {
      return t('availability_schoolClosed', {title: closed.title ?? closed.reason});
    }
    if (slot.unavailable) {
      return slot.unavailable.type === 'LEAVE' ? t('availability_onLeave') : t('availability_absent');
    }
    return undefined;
  };

  const timeline = (slot: TeacherDaySlots): React.JSX.Element => {
    const meta = dayMeta(slot);
    return (
      <DayTimeline
        from={meta?.window.from ?? '08:00'}
        to={meta?.window.to ?? '14:00'}
        busy={slot.busy}
        free={slot.free}
        blockedLabel={blockedLabel(slot)}
      />
    );
  };

  // All-teachers mode: most free time first.
  const teachers = useMemo(
    () =>
      single
        ? data?.teachers ?? []
        : [...(data?.teachers ?? [])].sort(
            (a, b) => (b.days[0]?.freeMinutes ?? 0) - (a.days[0]?.freeMinutes ?? 0),
          ),
    [data, single],
  );
  const closedDay = !single ? data?.days[0]?.schoolClosed : null;

  const legend = (
    <View style={styles.legend}>
      {(['CLASS', 'INVIGILATION', 'LEAVE', 'ABSENT'] as BusyType[]).map(type => (
        <Row key={type} gap={4}>
          <View style={[styles.dot, {backgroundColor: BUSY_COLOR[type]}]} />
          <AppText variant="label" color="textSecondary">
            {t(`availability_busy${type}` as 'availability_busyCLASS')}
          </AppText>
        </Row>
      ))}
      <Row gap={4}>
        <View style={[styles.dot, {backgroundColor: theme.colors.success + '55'}]} />
        <AppText variant="label" color="textSecondary">
          {t('availability_free')}
        </AppText>
      </Row>
    </View>
  );

  return (
    <Screen padded={false}>
      <CustomHeader
        title={single ? teacherName ?? t('availability_timelineTitle') : t('availability_freeSlotsTitle')}
        subtitle={single ? t('availability_timelineTitle') : undefined}
        onBack={() => navigation.goBack()}
      />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />}>
        <SegmentedTabs<Mode>
          value={mode}
          onChange={setMode}
          options={
            single
              ? [
                  {value: 'week', label: t('availability_week')},
                  {value: 'date', label: t('availability_specificDate')},
                ]
              : [
                  {value: 'date', label: t('availability_specificDate')},
                  {value: 'day', label: t('availability_everyWeek')},
                ]
          }
        />
        <Spacer size={theme.spacing.md} />
        {mode === 'date' ? <DatePicker label={t('common_date')} value={date} onChange={setDate} /> : null}
        {mode === 'day' ? <WeekdayChips value={day} onChange={setDay} /> : null}

        {!single ? (
          <View style={styles.chipsRow}>
            {MIN_MINUTES_OPTIONS.map(m => {
              const active = minMinutes === m;
              return (
                <Pressable
                  key={m}
                  onPress={() => setMinMinutes(m)}
                  style={[
                    styles.chip,
                    {
                      borderColor: active ? theme.colors.primary : theme.colors.border,
                      backgroundColor: active ? theme.colors.primary : theme.colors.surface,
                    },
                  ]}>
                  <AppText variant="label" color={active ? 'onPrimary' : 'textSecondary'}>
                    {m === 1 ? t('availability_anyGap') : t('availability_gapAtLeast', {minutes: m})}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
        ) : null}

        {legend}

        {isError ? (
          <EmptyState
            icon="warning"
            title={t('common_somethingWentWrong')}
            message={(error as {message?: string} | null)?.message ?? t('common_checkConnection')}
            actionLabel={t('common_retry')}
            onAction={() => refetch()}
          />
        ) : isLoading || !data ? (
          <Loader message={t('availability_loading')} />
        ) : closedDay ? (
          <View style={styles.banner}>
            <Icon name="calendar" size={16} color={theme.colors.error} />
            <AppText variant="caption" color="error" style={{flex: 1}}>
              {t('availability_schoolClosed', {title: closedDay.title ?? closedDay.reason})}
            </AppText>
          </View>
        ) : teachers.length === 0 ? (
          <EmptyState icon="teacher" title={t('availability_noTeachers')} message={t('availability_noTeachersMessage')} />
        ) : single ? (
          // One teacher: a row per day.
          teachers[0].days.map(slot => (
            <CustomCard key={`${slot.day}-${slot.date ?? ''}`} style={styles.card}>
              <Row justify="space-between" style={{marginBottom: 6}}>
                <AppText variant="bodyBold">
                  {dayLabel(slot.day)}
                  {slot.date ? ` · ${slot.date.split('-').reverse().join('/')}` : ''}
                </AppText>
                <Badge label={t('availability_freeMinutes', {time: formatDuration(slot.freeMinutes)})} tone="success" />
              </Row>
              {timeline(slot)}
            </CustomCard>
          ))
        ) : (
          // All teachers: a row per teacher for the chosen day.
          teachers.map(teacher => {
            const slot = teacher.days[0];
            return (
              <CustomCard key={teacher.teacherId} style={styles.card}>
                <Row justify="space-between" style={{marginBottom: 6}}>
                  <View style={{flex: 1}}>
                    <AppText variant="bodyBold">{teacher.name}</AppText>
                    <AppText variant="label" color="textMuted">
                      {[teacher.employeeId, (teacher.subjects ?? []).join(', ')].filter(Boolean).join(' · ')}
                    </AppText>
                  </View>
                  {slot ? (
                    <Badge label={t('availability_freeMinutes', {time: formatDuration(slot.freeMinutes)})} tone="success" />
                  ) : null}
                </Row>
                {slot ? timeline(slot) : null}
              </CustomCard>
            );
          })
        )}
        <Spacer size={24} />
      </ScrollView>
    </Screen>
  );
}
