/**
 * Academic Calendar (teacher / parent) — read-only. One screen for both roles: the
 * endpoint is picked by role inside `useRoleAcademicCalendar`, and the backend already
 * filters entries (parents only get exams for the selected child's class).
 *
 * Session arrows (?year=), summary cards, a swipeable month grid with per-type dots,
 * client-side type filter chips, the selected day's (or month's) entries, a detail
 * sheet and a legend. Parents with more than one child get a child switcher.
 */
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {PanResponder, Pressable, RefreshControl, ScrollView, View} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {useTheme, useThemedStyles} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {extractErrorCode} from '../../../core/api/apiError';
import {
  Screen,
  CustomHeader,
  CustomCard,
  CustomBottomSheet,
  AppText,
  Badge,
  Icon,
  Row,
  Spacer,
  Loader,
  EmptyState,
} from '../../../shared/components';
import {useAuthStore} from '../../auth/authStore';
import {useParentProfile} from '../../parent/parentStudents.service';
import {
  CALENDAR_FILTER_COLOR,
  CALENDAR_FILTER_TYPES,
  EVENT_TYPES,
  EVENT_TYPE_COLOR,
  EVENT_TYPE_TONE,
  useEventTypeLabels,
  type CalendarFilter,
} from '../../events/eventTypes';
import {useRoleAcademicCalendar} from '../academicCalendar.service';
import {
  buildDayDotsMap,
  buildDayTypeMap,
  entriesOnDate,
  formatDmy,
  formatRange,
  parseIsoDate,
  sessionLabel,
  todayIsoDate,
} from '../calendar.utils';
import {MonthGrid} from '../components/MonthGrid';
import {CalendarEntryRow} from '../components/CalendarEntryRow';
import type {CalendarEntry, ParentChild} from '../../../shared/types';

const SWIPE_DISTANCE = 50;

export function SchoolCalendarScreen(): React.JSX.Element {
  const role = useAuthStore(s => s.user?.role);
  return role === 'parent' ? <ParentCalendarGate /> : <CalendarView />;
}

/** Parents: resolve the child first — no children → no calendar call. */
function ParentCalendarGate(): React.JSX.Element {
  const {t} = useLanguage();
  const navigation = useNavigation();
  const {data: profile, isLoading, isError, error, refetch} = useParentProfile();
  const [activeChildId, setActiveChildId] = useState<string | null>(null);
  // Linked children changed server-side — reload them and fall back to the first.
  const resetToFirstChild = useCallback(async () => {
    setActiveChildId(null);
    await refetch();
  }, [refetch]);

  if (isLoading || !profile) {
    if (isError) {
      return (
        <Screen padded={false}>
          <CustomHeader title={t('calendar_title')} onBack={() => navigation.goBack()} />
          <EmptyState
            icon="warning"
            title={t('common_somethingWentWrong')}
            message={(error as {message?: string} | null)?.message ?? t('common_checkConnection')}
            actionLabel={t('common_retry')}
            onAction={() => refetch()}
          />
        </Screen>
      );
    }
    return <Loader message={t('calendar_loading')} />;
  }

  const {children} = profile;
  if (children.length === 0) {
    return (
      <Screen padded={false}>
        <CustomHeader title={t('calendar_title')} onBack={() => navigation.goBack()} />
        <EmptyState icon="student" title={t('calendar_noStudentLinked')} message={t('childProfile_noChildrenMessage')} />
      </Screen>
    );
  }

  const child = children.find(c => c.id === activeChildId) ?? children[0];
  return (
    <CalendarView
      child={child}
      childOptions={children.length > 1 ? children : undefined}
      onSelectChild={setActiveChildId}
      onNotYourChild={resetToFirstChild}
    />
  );
}

function CalendarView({
  child,
  childOptions,
  onSelectChild,
  onNotYourChild,
}: {
  child?: ParentChild;
  childOptions?: ParentChild[];
  onSelectChild?: (id: string) => void;
  onNotYourChild?: () => Promise<unknown> | void;
}): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const navigation = useNavigation();
  const TYPE_LABEL = useEventTypeLabels();

  const [year, setYear] = useState<number | undefined>(undefined);
  const [filter, setFilter] = useState<CalendarFilter>('ALL');
  const [monthIndex, setMonthIndex] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [detail, setDetail] = useState<CalendarEntry | null>(null);

  const {data, isLoading, isError, error, refetch, isRefetching} = useRoleAcademicCalendar({
    year,
    studentId: child?.id,
  });

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  // Session or child changed → reopen on the current/first month, clear the day.
  useEffect(() => {
    setMonthIndex(null);
    setSelectedDate(null);
  }, [year, child?.id]);

  // NOT_YOUR_CHILD → reset to the first linked child and refetch — once per child, so a
  // first child that is also rejected shows the error instead of looping.
  const errorCode = isError ? extractErrorCode(error) : undefined;
  const notYourChildHandledFor = useRef<string | null>(null);
  useEffect(() => {
    if (errorCode === 'NOT_YOUR_CHILD' && child && notYourChildHandledFor.current !== child.id) {
      notYourChildHandledFor.current = child.id;
      Promise.resolve(onNotYourChild?.()).then(() => refetch());
    }
  }, [errorCode, child, onNotYourChild, refetch]);

  const months = useMemo(() => data?.months ?? [], [data]);
  const matches = useCallback(
    (e: CalendarEntry) => filter === 'ALL' || CALENDAR_FILTER_TYPES[filter].includes(e.type),
    [filter],
  );
  const entries = useMemo(() => (data?.entries ?? []).filter(matches), [data, matches]);
  const dayTypes = useMemo(() => buildDayTypeMap(entries), [entries]);
  const dayDots = useMemo(() => buildDayDotsMap(entries), [entries]);

  // Open on the current month when it's in range, else the first month.
  useEffect(() => {
    if (months.length > 0 && monthIndex === null) {
      const idx = months.findIndex(m => m.month === todayIsoDate().slice(0, 7));
      setMonthIndex(idx >= 0 ? idx : 0);
    }
  }, [months, monthIndex]);

  const goMonth = useCallback(
    (delta: number) => {
      setMonthIndex(i => {
        if (i === null) {
          return i;
        }
        const next = Math.min(Math.max(i + delta, 0), months.length - 1);
        if (next !== i) {
          setSelectedDate(null);
        }
        return next;
      });
    },
    [months.length],
  );

  // Horizontal swipe on the grid changes month; vertical drags still scroll the page.
  const goMonthRef = useRef(goMonth);
  goMonthRef.current = goMonth;
  const swipe = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 20 && Math.abs(g.dx) > Math.abs(g.dy) * 1.5,
      onPanResponderRelease: (_, g) => {
        if (g.dx <= -SWIPE_DISTANCE) {
          goMonthRef.current(1);
        } else if (g.dx >= SWIPE_DISTANCE) {
          goMonthRef.current(-1);
        }
      },
    }),
  ).current;

  const styles = useThemedStyles(t2 => ({
    content: {padding: t2.spacing.lg, flexGrow: 1},
    hScroll: {flexGrow: 0},
    chipsRow: {columnGap: t2.spacing.sm, paddingRight: t2.spacing.lg, alignItems: 'center'},
    chip: {height: 32, paddingHorizontal: t2.spacing.md, borderRadius: t2.radius.pill, borderWidth: 1, justifyContent: 'center'},
    childPill: {paddingHorizontal: t2.spacing.lg, paddingVertical: t2.spacing.sm, borderRadius: t2.radius.pill},
    sessionCard: {paddingVertical: t2.spacing.sm},
    arrowBack: {transform: [{rotate: '180deg'}]},
    statsGrid: {flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: t2.spacing.sm},
    stat: {width: '48.5%', paddingVertical: t2.spacing.sm, paddingHorizontal: t2.spacing.md, borderRadius: t2.radius.md},
    center: {alignItems: 'center'},
    monthStats: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginTop: t2.spacing.sm,
      paddingTop: t2.spacing.sm,
      borderTopWidth: 1,
      borderTopColor: t2.colors.divider,
    },
    legend: {flexDirection: 'row', flexWrap: 'wrap', gap: t2.spacing.sm},
    legendDot: {width: 10, height: 10, borderRadius: 5},
    listHeader: {marginBottom: t2.spacing.xs},
    flex: {flex: 1},
  }));

  const chip = (label: string, active: boolean, onPress: () => void, key: string, color?: string) => (
    <Pressable
      key={key}
      onPress={onPress}
      style={[
        styles.chip,
        {
          borderColor: active ? color ?? theme.colors.primary : theme.colors.border,
          backgroundColor: active ? color ?? theme.colors.primary : theme.colors.surface,
        },
      ]}>
      <AppText variant="label" style={{color: active ? '#FFFFFF' : theme.colors.textSecondary}}>
        {label}
      </AppText>
    </Pressable>
  );

  const FILTER_LABEL: Record<CalendarFilter, string> = {
    ALL: t('common_all'),
    HOLIDAYS: t('calendar_statHolidays'),
    VACATION: t('eventForm_typeVacation'),
    EXAMS: t('calendar_filterExams'),
    EVENTS: t('calendar_filterEvents'),
  };

  const sessionYear = data?.range.session?.year ?? year;
  const month = monthIndex !== null ? months[monthIndex] : undefined;

  const renderSessionSelector = () => (
    <CustomCard style={styles.sessionCard}>
      <Row justify="space-between" align="center">
        <Pressable
          disabled={sessionYear === undefined}
          onPress={() => sessionYear !== undefined && setYear(sessionYear - 1)}
          hitSlop={10}
          style={styles.arrowBack}
          accessibilityLabel={t('calendar_prevSession')}>
          <Icon name="forward" size={20} color={theme.colors.text} />
        </Pressable>
        <View style={styles.center}>
          <AppText variant="label" color="textMuted">
            {t('calendar_session')}
          </AppText>
          <AppText variant="bodyBold">
            {data?.range.session?.label ?? (year !== undefined ? sessionLabel(year) : '—')}
          </AppText>
        </View>
        <Pressable
          disabled={sessionYear === undefined}
          onPress={() => sessionYear !== undefined && setYear(sessionYear + 1)}
          hitSlop={10}
          accessibilityLabel={t('calendar_nextSession')}>
          <Icon name="forward" size={20} color={theme.colors.text} />
        </Pressable>
      </Row>
    </CustomCard>
  );

  const renderBody = () => {
    if (!data) {
      return null;
    }
    const {summary} = data;
    const stats = [
      {label: t('calendar_statWorking'), value: summary.workingDays, color: theme.colors.success},
      {
        label: t('calendar_statHolidays'),
        value: summary.holidayDays + summary.governmentHolidayDays,
        color: EVENT_TYPE_COLOR.HOLIDAY,
      },
      {label: t('calendar_statVacation'), value: summary.vacationDays, color: EVENT_TYPE_COLOR.VACATION},
      {label: t('calendar_statExam'), value: summary.examDays, color: EVENT_TYPE_COLOR.EXAM},
    ];

    const monthEntries = month ? month.entries.filter(matches) : [];
    const listEntries = selectedDate ? entriesOnDate(entries, selectedDate) : monthEntries;

    return (
      <>
        <View style={styles.statsGrid}>
          {stats.map(s => (
            <View key={s.label} style={[styles.stat, {backgroundColor: s.color + '18'}]}>
              <AppText variant="h3" style={{color: s.color}}>
                {s.value}
              </AppText>
              <AppText variant="label" color="textSecondary">
                {s.label}
              </AppText>
            </View>
          ))}
        </View>
        <Spacer size={theme.spacing.md} />

        <ScrollView horizontal style={styles.hScroll} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
          {(['ALL', 'HOLIDAYS', 'VACATION', 'EXAMS', 'EVENTS'] as CalendarFilter[]).map(f =>
            chip(FILTER_LABEL[f], filter === f, () => setFilter(f), f, f === 'ALL' ? undefined : CALENDAR_FILTER_COLOR[f]),
          )}
        </ScrollView>
        <Spacer size={theme.spacing.md} />

        {month && monthIndex !== null ? (
          <CustomCard>
            <Row justify="space-between" align="center">
              <Pressable
                disabled={monthIndex === 0}
                onPress={() => goMonth(-1)}
                hitSlop={10}
                style={[styles.arrowBack, {opacity: monthIndex === 0 ? 0.3 : 1}]}>
                <Icon name="forward" size={20} color={theme.colors.text} />
              </Pressable>
              <AppText variant="bodyBold">{month.label}</AppText>
              <Pressable
                disabled={monthIndex >= months.length - 1}
                onPress={() => goMonth(1)}
                hitSlop={10}
                style={{opacity: monthIndex >= months.length - 1 ? 0.3 : 1}}>
                <Icon name="forward" size={20} color={theme.colors.text} />
              </Pressable>
            </Row>
            <Spacer size={theme.spacing.sm} />
            <View {...swipe.panHandlers}>
              <MonthGrid
                year={parseIsoDate(month.startDate).y}
                month={parseIsoDate(month.startDate).m}
                dayTypes={dayTypes}
                dayDots={dayDots}
                selectedDate={selectedDate}
                onDayPress={date => setSelectedDate(prev => (prev === date ? null : date))}
              />
            </View>
            <View style={styles.monthStats}>
              {[
                {label: t('calendar_statWorking'), value: month.workingDays, color: theme.colors.success},
                {label: t('calendar_statClosed'), value: month.schoolClosedDays, color: EVENT_TYPE_COLOR.HOLIDAY},
                {label: t('calendar_statExam'), value: month.examDays, color: EVENT_TYPE_COLOR.EXAM},
              ].map(s => (
                <View key={s.label} style={styles.center}>
                  <AppText variant="bodyBold" style={{color: s.color}}>
                    {s.value}
                  </AppText>
                  <AppText variant="label" color="textMuted">
                    {s.label}
                  </AppText>
                </View>
              ))}
            </View>
          </CustomCard>
        ) : null}
        <Spacer size={theme.spacing.md} />

        <Row justify="space-between" align="center" style={styles.listHeader}>
          <AppText variant="bodyBold" style={styles.flex}>
            {selectedDate ? formatDmy(selectedDate) : month?.label ?? ''}
          </AppText>
          {selectedDate ? (
            <Pressable onPress={() => setSelectedDate(null)} hitSlop={8}>
              <AppText variant="label" color="primary">
                {t('calendar_showWholeMonth')}
              </AppText>
            </Pressable>
          ) : null}
        </Row>
        {listEntries.length === 0 ? (
          <EmptyState
            icon="calendar"
            title={selectedDate ? t('calendar_noEntriesDay') : t('calendar_noEventsMonth')}
          />
        ) : (
          <CustomCard>
            {listEntries.map(e => (
              <CalendarEntryRow key={`${e.source}-${e.id}`} entry={e} onPress={setDetail} />
            ))}
          </CustomCard>
        )}
        <Spacer size={theme.spacing.md} />

        <View style={styles.legend}>
          {EVENT_TYPES.map(type => (
            <Row key={type} gap={4}>
              <View style={[styles.legendDot, {backgroundColor: EVENT_TYPE_COLOR[type]}]} />
              <AppText variant="label" color="textSecondary">
                {TYPE_LABEL[type]}
              </AppText>
            </Row>
          ))}
          <Row gap={4}>
            <View style={[styles.legendDot, {backgroundColor: theme.colors.surfaceVariant}]} />
            <AppText variant="label" color="textSecondary">
              {t('calendar_sunday')}
            </AppText>
          </Row>
        </View>
      </>
    );
  };

  return (
    <Screen padded={false}>
      <CustomHeader title={t('calendar_title')} onBack={() => navigation.goBack()} />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />}>
        {childOptions && child ? (
          <>
            <ScrollView horizontal style={styles.hScroll} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
              {childOptions.map(c => {
                const active = c.id === child.id;
                return (
                  <Pressable
                    key={c.id}
                    onPress={() => onSelectChild?.(c.id)}
                    style={[styles.childPill, {backgroundColor: active ? theme.colors.primary : theme.colors.surfaceVariant}]}>
                    <AppText variant="label" style={{color: active ? theme.colors.onPrimary : theme.colors.textSecondary}}>
                      {c.name}
                    </AppText>
                  </Pressable>
                );
              })}
            </ScrollView>
            <Spacer size={theme.spacing.md} />
          </>
        ) : null}

        {renderSessionSelector()}
        <Spacer size={theme.spacing.md} />

        {isError ? (
          <EmptyState
            icon="warning"
            title={t('common_somethingWentWrong')}
            message={(error as {message?: string} | null)?.message ?? t('common_checkConnection')}
            actionLabel={t('common_retry')}
            onAction={() => refetch()}
          />
        ) : isLoading || !data ? (
          <Loader message={t('calendar_loading')} fullscreen={false} />
        ) : (
          renderBody()
        )}
        <Spacer size={24} />
      </ScrollView>

      <CustomBottomSheet visible={!!detail} onClose={() => setDetail(null)} title={detail?.title}>
        {detail ? (
          <View>
            <Row gap={theme.spacing.xs} wrap>
              <Badge label={TYPE_LABEL[detail.type]} tone={EVENT_TYPE_TONE[detail.type]} />
              {detail.schoolClosed ? <Badge label={t('calendar_schoolClosed')} tone="error" /> : null}
            </Row>
            <Spacer size={theme.spacing.sm} />
            <AppText variant="body">
              {formatRange(detail.startDate, detail.endDate)} · {t('calendar_daysCount', {count: detail.days})}
            </AppText>
            {detail.classes.length > 0 ? (
              <>
                <Spacer size={theme.spacing.xs} />
                <AppText variant="caption" color="textSecondary">
                  {t('calendar_classes')}: {detail.classes.join(', ')}
                </AppText>
              </>
            ) : null}
            <Spacer size={theme.spacing.sm} />
            <AppText variant="body" color="textSecondary">
              {detail.description || t('calendar_noDescription')}
            </AppText>
            <Spacer size={theme.spacing.md} />
          </View>
        ) : null}
      </CustomBottomSheet>
    </Screen>
  );
}
