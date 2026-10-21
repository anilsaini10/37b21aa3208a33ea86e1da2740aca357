/**
 * "Find a free teacher" (admin) — who is free in a time slot, on a specific date or every week
 * on a weekday. Free teachers first (green); busy ones greyed with why (class / exam duty /
 * leave / absent). A school-closed day shows a banner. Can be opened pre-filled (e.g. from an
 * exam paper: its date + time) to find a substitute.
 */
import React, {useEffect, useMemo, useState} from 'react';
import {Linking, Pressable, ScrollView, View} from 'react-native';
import {useNavigation, useRoute, type RouteProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme, useThemedStyles} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {
  Screen,
  CustomHeader,
  CustomCard,
  DatePicker,
  TimePicker,
  SearchBar,
  SegmentedTabs,
  AppText,
  Badge,
  Icon,
  Row,
  Spacer,
  Loader,
  EmptyState,
} from '../../../shared/components';
import {useTeacherAvailability, type TeacherAvailabilityParams} from '../teacherAvailability.service';
import {WeekdayChips, todayLocalIso} from '../components/WeekdayChips';
import {ScreenNames} from '../../../navigation/ScreenNames';
import type {AdminStackParamList} from '../../../navigation/types';
import type {BusyType, ScheduleDay, TeacherAvailabilityItem} from '../../../shared/types';

type Nav = NativeStackNavigationProp<AdminStackParamList>;
type Mode = 'date' | 'week';

const SEARCH_DEBOUNCE_MS = 350;
export const BUSY_EMOJI: Record<BusyType, string> = {CLASS: '📚', INVIGILATION: '📝', LEAVE: '🌴', ABSENT: '❌'};

export function TeacherAvailabilityScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<AdminStackParamList, 'TeacherAvailability'>>();
  const preset = route.params;

  const [mode, setMode] = useState<Mode>(preset?.day ? 'week' : 'date');
  const [date, setDate] = useState(preset?.date ?? todayLocalIso());
  const [day, setDay] = useState<ScheduleDay>(preset?.day ?? 'MONDAY');
  const [startTime, setStartTime] = useState(preset?.startTime ?? '10:00');
  const [endTime, setEndTime] = useState(preset?.endTime ?? '11:00');
  const [onlyFree, setOnlyFree] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const handle = setTimeout(() => setDebouncedSearch(search.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(handle);
  }, [search]);

  const timeError = startTime >= endTime ? t('availability_endAfterStart') : undefined;
  const params = useMemo<TeacherAvailabilityParams | null>(
    () =>
      timeError
        ? null
        : {
            ...(mode === 'date' ? {date} : {day}),
            startTime,
            endTime,
            onlyFree: onlyFree || undefined,
            search: debouncedSearch || undefined,
          },
    [timeError, mode, date, day, startTime, endTime, onlyFree, debouncedSearch],
  );
  const {data, isLoading, isError, error, refetch, isFetching} = useTeacherAvailability(params);

  const styles = useThemedStyles(t2 => ({
    content: {padding: t2.spacing.lg, flexGrow: 1},
    timeRow: {flexDirection: 'row', columnGap: t2.spacing.md},
    flex: {flex: 1},
    banner: {
      flexDirection: 'row',
      columnGap: t2.spacing.sm,
      padding: t2.spacing.md,
      borderRadius: t2.radius.md,
      backgroundColor: t2.colors.error + '14',
      marginBottom: t2.spacing.md,
    },
    card: {marginBottom: t2.spacing.sm},
    freeCard: {borderColor: t2.colors.success, borderWidth: 1.5},
    busyCard: {opacity: 0.75},
    toggle: {
      paddingHorizontal: t2.spacing.md,
      paddingVertical: 6,
      borderRadius: 999,
      borderWidth: 1,
    },
  }));

  const teacherCard = (item: TeacherAvailabilityItem): React.JSX.Element => (
    <CustomCard key={item.teacherId} style={[styles.card, item.free ? styles.freeCard : styles.busyCard]}>
      <Row justify="space-between" align="flex-start">
        <View style={styles.flex}>
          <AppText variant="bodyBold">{item.name}</AppText>
          <AppText variant="label" color="textMuted">
            {[item.employeeId, (item.subjects ?? []).join(', ')].filter(Boolean).join(' · ')}
          </AppText>
        </View>
        <Badge label={item.free ? t('availability_free') : t('availability_busy')} tone={item.free ? 'success' : 'neutral'} />
      </Row>
      {item.busy.map((b, i) => (
        <AppText key={`${b.type}-${i}`} variant="caption" color="textSecondary" style={{marginTop: 4}}>
          {BUSY_EMOJI[b.type]} {b.startTime}–{b.endTime} · {b.title}
          {b.roomNo ? ` · ${t('dateSheet_roomValue', {room: b.roomNo})}` : ''}
        </AppText>
      ))}
      {item.free && item.phone ? (
        <Pressable onPress={() => Linking.openURL(`tel:${item.phone}`)} hitSlop={8} style={{marginTop: 6}}>
          <Row gap={6}>
            <Icon name="phone" size={14} color={theme.colors.primary} />
            <AppText variant="label" color="primary">
              {item.phone}
            </AppText>
          </Row>
        </Pressable>
      ) : null}
    </CustomCard>
  );

  return (
    <Screen padded={false}>
      <CustomHeader
        title={t('availability_title')}
        onBack={() => navigation.goBack()}
        actions={[
          {
            icon: 'timetable',
            onPress: () => navigation.navigate(ScreenNames.TeacherFreeSlots, mode === 'date' ? {date} : {day}),
          },
        ]}
      />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <SegmentedTabs<Mode>
          value={mode}
          onChange={setMode}
          options={[
            {value: 'date', label: t('availability_specificDate')},
            {value: 'week', label: t('availability_everyWeek')},
          ]}
        />
        <Spacer size={theme.spacing.md} />
        {mode === 'date' ? (
          <DatePicker label={t('common_date')} value={date} onChange={setDate} />
        ) : (
          <WeekdayChips value={day} onChange={setDay} />
        )}
        <View style={styles.timeRow}>
          <View style={styles.flex}>
            <TimePicker label={t('dateSheet_startTime')} value={startTime} onChange={setStartTime} error={timeError ? ' ' : undefined} />
          </View>
          <View style={styles.flex}>
            <TimePicker label={t('dateSheet_endTime')} value={endTime} onChange={setEndTime} error={timeError ? ' ' : undefined} />
          </View>
        </View>
        {timeError ? (
          <AppText variant="caption" color="error" style={{marginTop: -theme.spacing.sm, marginBottom: theme.spacing.md}}>
            {timeError}
          </AppText>
        ) : null}
        <Row gap={theme.spacing.sm} align="center">
          <View style={styles.flex}>
            <SearchBar value={search} onChangeText={setSearch} placeholder={t('dateSheet_searchTeacher')} />
          </View>
          <Pressable
            onPress={() => setOnlyFree(v => !v)}
            style={[
              styles.toggle,
              {
                borderColor: onlyFree ? theme.colors.success : theme.colors.border,
                backgroundColor: onlyFree ? theme.colors.success : theme.colors.surface,
              },
            ]}>
            <AppText variant="label" style={{color: onlyFree ? '#FFFFFF' : theme.colors.textSecondary}}>
              {t('availability_onlyFree')}
            </AppText>
          </Pressable>
        </Row>
        <Spacer size={theme.spacing.md} />

        {!params ? null : isError ? (
          <EmptyState
            icon="warning"
            title={t('common_somethingWentWrong')}
            message={(error as {message?: string} | null)?.message ?? t('common_checkConnection')}
            actionLabel={t('common_retry')}
            onAction={() => refetch()}
          />
        ) : isLoading || !data ? (
          <Loader message={t('availability_loading')} />
        ) : (
          <>
            {data.schoolClosed ? (
              <View style={styles.banner}>
                <Icon name="calendar" size={16} color={theme.colors.error} />
                <AppText variant="caption" color="error" style={styles.flex}>
                  {t('availability_schoolClosed', {title: data.schoolClosed.title ?? data.schoolClosed.reason})}
                </AppText>
              </View>
            ) : null}
            <Row gap={theme.spacing.sm} style={{marginBottom: theme.spacing.sm}}>
              <Badge label={t('availability_freeCount', {count: data.summary.free})} tone="success" />
              <Badge label={t('availability_busyCount', {count: data.summary.busy})} tone="neutral" />
              {isFetching ? (
                <AppText variant="label" color="textMuted">
                  {t('common_loading')}
                </AppText>
              ) : null}
            </Row>
            {data.items.length === 0 ? (
              <EmptyState icon="teacher" title={t('availability_noTeachers')} message={t('availability_noTeachersMessage')} />
            ) : (
              data.items.map(teacherCard)
            )}
          </>
        )}
        <Spacer size={24} />
      </ScrollView>
    </Screen>
  );
}
