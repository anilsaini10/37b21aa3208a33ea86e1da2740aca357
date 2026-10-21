/**
 * Academic Calendar (admin) — the school year at a glance.
 *
 * Session selector (?year=), Year | Month | List views, type filter, summary of working /
 * closed days, and a legend. Entries come from events (editable here) and the Exams module
 * (`source: "EXAM"`, managed in Exams). "+" adds an entry, the upload icon imports a year from Excel.
 */
import React, {useEffect, useMemo, useState} from 'react';
import {Pressable, RefreshControl, ScrollView, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme, useThemedStyles} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {
  Screen,
  CustomHeader,
  CustomCard,
  CustomModal,
  CustomButton,
  CustomBottomSheet,
  SegmentedTabs,
  AppText,
  Icon,
  Row,
  Spacer,
  Loader,
  EmptyState,
} from '../../../shared/components';
import {useDeleteEvent} from '../../events/events.service';
import {EVENT_TYPES, EVENT_TYPE_COLOR, useEventTypeLabels} from '../../events/eventTypes';
import {useAcademicCalendar} from '../academicCalendar.service';
import {
  buildDayTypeMap,
  currentSessionYear,
  entriesOnDate,
  formatDmy,
  formatRange,
  parseIsoDate,
  sessionLabel,
  todayIsoDate,
} from '../calendar.utils';
import {MonthGrid} from '../components/MonthGrid';
import {CalendarEntryRow} from '../components/CalendarEntryRow';
import {ScreenNames} from '../../../navigation/ScreenNames';
import type {AdminStackParamList} from '../../../navigation/types';
import type {CalendarEntry, EventType} from '../../../shared/types';

type Nav = NativeStackNavigationProp<AdminStackParamList>;
type ViewMode = 'year' | 'month' | 'list';

export function AcademicCalendarScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const navigation = useNavigation<Nav>();
  const TYPE_LABEL = useEventTypeLabels();

  const [sessionYear, setSessionYear] = useState(() => currentSessionYear());
  const [view, setView] = useState<ViewMode>('month');
  const [typeFilter, setTypeFilter] = useState<EventType | ''>('');
  const [monthIndex, setMonthIndex] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CalendarEntry | null>(null);
  const [deleteError, setDeleteError] = useState<string | undefined>();

  const {data, isLoading, isError, error, refetch, isRefetching} = useAcademicCalendar({
    year: sessionYear,
    eventType: typeFilter || undefined,
  });
  const deleteMutation = useDeleteEvent();

  const months = useMemo(() => data?.months ?? [], [data]);
  const entries = useMemo(() => data?.entries ?? [], [data]);
  const dayTypes = useMemo(() => buildDayTypeMap(entries), [entries]);

  // Month view opens on the current month when it's in this session, else the first month.
  useEffect(() => {
    if (months.length > 0 && monthIndex === null) {
      const current = todayIsoDate().slice(0, 7);
      const idx = months.findIndex(m => m.month === current);
      setMonthIndex(idx >= 0 ? idx : 0);
    }
  }, [months, monthIndex]);

  const styles = useThemedStyles(t2 => ({
    content: {padding: t2.spacing.lg, flexGrow: 1},
    // ScrollView defaults to flexGrow: 1 — in this column it would stretch (and the chips with it)
    // whenever the content below is short, e.g. while the calendar is loading. Keep it content-sized.
    hScroll: {flexGrow: 0},
    chipsRow: {columnGap: t2.spacing.sm, paddingRight: t2.spacing.lg, alignItems: 'center'},
    chip: {height: 32, paddingHorizontal: t2.spacing.md, borderRadius: 5, borderWidth: 1, justifyContent: 'center'},
    statsRow: {columnGap: t2.spacing.sm, paddingRight: t2.spacing.lg, alignItems: 'flex-start'},
    stat: {
      minWidth: 92,
      paddingVertical: t2.spacing.sm,
      paddingHorizontal: t2.spacing.md,
      borderRadius: t2.radius.md,
      alignItems: 'center',
    },
    yearGrid: {flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: t2.spacing.md},
    yearMonth: {width: '48%'},
    legend: {flexDirection: 'row', flexWrap: 'wrap', gap: t2.spacing.sm, marginTop: t2.spacing.sm},
    legendDot: {width: 10, height: 10, borderRadius: 5},
    monthGroupTitle: {marginTop: t2.spacing.md, marginBottom: t2.spacing.xs},
    modalButtonWrap: {flex: 1},
  }));

  const chip = (label: string, active: boolean, onPress: () => void, key: string, color?: string): React.JSX.Element => (
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

  const openEdit = (entry: CalendarEntry): void => {
    setSelectedDate(null);
    navigation.navigate(ScreenNames.EventForm, {id: entry.id});
  };
  const askDelete = (entry: CalendarEntry): void => {
    setSelectedDate(null);
    setDeleteError(undefined);
    setDeleteTarget(entry);
  };
  const openExams = (): void => {
    setSelectedDate(null);
    navigation.navigate(ScreenNames.Exams);
  };
  const confirmDelete = (): void => {
    if (!deleteTarget) {
      return;
    }
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
      onError: (e: Error) => setDeleteError(e.message),
    });
  };

  const entryRow = (entry: CalendarEntry, key?: string): React.JSX.Element => (
    <CalendarEntryRow key={key ?? entry.id} entry={entry} onEdit={openEdit} onDelete={askDelete} onOpenExams={openExams} />
  );

  const sessionOptions = [sessionYear - 1, sessionYear, sessionYear + 1];
  const month = monthIndex !== null ? months[monthIndex] : undefined;

  const renderBody = (): React.ReactNode => {
    if (!data) {
      return null;
    }
    if (view === 'year') {
      return (
        <View style={styles.yearGrid}>
          {months.map(m => {
            const {y, m: mm} = parseIsoDate(m.startDate);
            return (
              <CustomCard key={m.month} style={styles.yearMonth}>
                <MonthGrid
                  compact
                  year={y}
                  month={mm}
                  dayTypes={dayTypes}
                  onDayPress={setSelectedDate}
                  title={m.label}
                />
                <AppText variant="label" color="textMuted" style={{marginTop: 4}}>
                  {t('calendar_monthWorkingShort', {working: m.workingDays, closed: m.schoolClosedDays})}
                </AppText>
              </CustomCard>
            );
          })}
        </View>
      );
    }
    if (view === 'month') {
      if (!month || monthIndex === null) {
        return null;
      }
      const {y, m: mm} = parseIsoDate(month.startDate);
      return (
        <>
          <CustomCard>
            <Row justify="space-between" align="center">
              <Pressable
                disabled={monthIndex === 0}
                onPress={() => setMonthIndex(monthIndex - 1)}
                hitSlop={10}
                style={{opacity: monthIndex === 0 ? 0.3 : 1, transform: [{rotate: '180deg'}]}}>
                <Icon name="forward" size={20} color={theme.colors.text} />
              </Pressable>
              <View style={{alignItems: 'center'}}>
                <AppText variant="bodyBold">{month.label}</AppText>
                <AppText variant="label" color="textMuted">
                  {t('calendar_monthWorking', {working: month.workingDays, closed: month.schoolClosedDays})}
                </AppText>
              </View>
              <Pressable
                disabled={monthIndex >= months.length - 1}
                onPress={() => setMonthIndex(monthIndex + 1)}
                hitSlop={10}
                style={{opacity: monthIndex >= months.length - 1 ? 0.3 : 1}}>
                <Icon name="forward" size={20} color={theme.colors.text} />
              </Pressable>
            </Row>
            <Spacer size={theme.spacing.sm} />
            <MonthGrid year={y} month={mm} dayTypes={dayTypes} onDayPress={setSelectedDate} />
          </CustomCard>
          <Spacer size={theme.spacing.md} />
          {month.entries.length === 0 ? (
            <AppText variant="caption" color="textMuted" center>
              {t('calendar_noEntriesMonth')}
            </AppText>
          ) : (
            <CustomCard>{month.entries.map(e => entryRow(e))}</CustomCard>
          )}
        </>
      );
    }
    // List view — grouped by month (a range spanning months shows under each one).
    const withEntries = months.filter(m => m.entries.length > 0);
    if (withEntries.length === 0) {
      return <EmptyState icon="calendar" title={t('calendar_emptyTitle')} message={t('calendar_emptyMessage')} />;
    }
    return withEntries.map(m => (
      <View key={m.month}>
        <Row justify="space-between" style={styles.monthGroupTitle}>
          <AppText variant="bodyBold">{m.label}</AppText>
          <AppText variant="label" color="textMuted">
            {t('calendar_monthWorkingShort', {working: m.workingDays, closed: m.schoolClosedDays})}
          </AppText>
        </Row>
        <CustomCard>{m.entries.map(e => entryRow(e, `${m.month}-${e.source}-${e.id}`))}</CustomCard>
      </View>
    ));
  };

  const summary = data?.summary;
  const stats = summary
    ? [
        {label: t('calendar_statWorking'), value: summary.workingDays, color: theme.colors.success},
        {label: t('calendar_statClosed'), value: summary.schoolClosedDays, color: theme.colors.error},
        {label: t('calendar_statHolidays'), value: summary.holidayDays, color: EVENT_TYPE_COLOR.HOLIDAY},
        {label: t('calendar_statGovtHolidays'), value: summary.governmentHolidayDays, color: EVENT_TYPE_COLOR.GOVERNMENT_HOLIDAY},
        {label: t('calendar_statVacation'), value: summary.vacationDays, color: EVENT_TYPE_COLOR.VACATION},
        {label: t('calendar_statExam'), value: summary.examDays, color: EVENT_TYPE_COLOR.EXAM},
      ]
    : [];

  const dayEntries = selectedDate ? entriesOnDate(entries, selectedDate) : [];

  return (
    <Screen padded={false}>
      <CustomHeader
        title={t('calendar_title')}
        subtitle={data?.range.session?.label ?? sessionLabel(sessionYear)}
        onBack={() => navigation.goBack()}
        actions={[
          {icon: 'upload', onPress: () => navigation.navigate(ScreenNames.CalendarImport)},
          {icon: 'add', onPress: () => navigation.navigate(ScreenNames.EventForm, {}), circle: true},
        ]}
      />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />}>
        {/* Session */}
        <ScrollView horizontal style={styles.hScroll} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
          {sessionOptions.map(year =>
            chip(
              sessionLabel(year),
              year === sessionYear,
              () => {
                setSessionYear(year);
                setMonthIndex(null);
              },
              `s-${year}`,
            ),
          )}
        </ScrollView>
        <Spacer size={theme.spacing.sm} />
        <SegmentedTabs<ViewMode>
          radius={5}
          value={view}
          onChange={setView}
          options={[
            {value: 'year', label: t('calendar_viewYear')},
            {value: 'month', label: t('calendar_viewMonth')},
            {value: 'list', label: t('calendar_viewList')},
          ]}
        />
        <Spacer size={theme.spacing.sm} />
        {/* Type filter */}
        <ScrollView horizontal style={styles.hScroll} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
          {chip(t('common_all'), !typeFilter, () => setTypeFilter(''), 'all')}
          {EVENT_TYPES.map(type =>
            chip(TYPE_LABEL[type], typeFilter === type, () => setTypeFilter(type), type, EVENT_TYPE_COLOR[type]),
          )}
        </ScrollView>
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
          <Loader message={t('calendar_loading')} />
        ) : (
          <>
            {/* Summary */}
            <ScrollView horizontal style={styles.hScroll} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statsRow}>
              {stats.map(s => (
                <View key={s.label} style={[styles.stat, {backgroundColor: s.color + '18'}]}>
                  <AppText variant="h3" style={{color: s.color}}>
                    {s.value}
                  </AppText>
                  <AppText variant="label" color="textSecondary" center>
                    {s.label}
                  </AppText>
                </View>
              ))}
            </ScrollView>
            {/* Legend — right under the summary so the colours read before the calendar. */}
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
                <AppText variant="label" color="textMuted"
                  style={{
                    marginTop: theme.spacing.xs,
                    fontSize: 15 * theme.typography.scale,
                    fontWeight: theme.typography.fontWeight.bold8,
                    color: theme.colors.primary,
                  }}>
                  {formatRange(data.range.from, data.range.to)} · {t('calendar_sundaysNote', { count: data.summary.sundays })}
                </AppText>
            <Spacer size={theme.spacing.md} />

            {renderBody()}

          </>
        )}
        <Spacer size={24} />
      </ScrollView>

      {/* Entries on a tapped date */}
      <CustomBottomSheet
        visible={!!selectedDate}
        onClose={() => setSelectedDate(null)}
        title={selectedDate ? formatDmy(selectedDate) : undefined}>
        {dayEntries.length === 0 ? (
          <AppText variant="caption" color="textMuted">
            {t('calendar_noEntriesDay')}
          </AppText>
        ) : (
          dayEntries.map(e => entryRow(e, `day-${e.source}-${e.id}`))
        )}
        <Spacer size={theme.spacing.md} />
        <CustomButton
          title={t('calendar_addOnDate')}
          variant="outline"
          onPress={() => {
            const date = selectedDate ?? undefined;
            setSelectedDate(null);
            navigation.navigate(ScreenNames.EventForm, {startDate: date});
          }}
        />
      </CustomBottomSheet>

      <CustomModal visible={!!deleteTarget} onClose={() => setDeleteTarget(null)} title={t('calendar_deleteTitle')}>
        <AppText variant="body" color="textSecondary">
          {t('calendar_deleteConfirm', {
            title: deleteTarget?.title ?? '',
            range: deleteTarget ? formatRange(deleteTarget.startDate, deleteTarget.endDate) : '',
          })}
        </AppText>
        {deleteError ? (
          <AppText variant="caption" color="error">
            {deleteError}
          </AppText>
        ) : null}
        <Row gap={theme.spacing.md}>
          <View style={styles.modalButtonWrap}>
            <CustomButton title={t('common_cancel')} variant="outline" onPress={() => setDeleteTarget(null)} />
          </View>
          <View style={styles.modalButtonWrap}>
            <CustomButton title={t('common_delete')} variant="danger" loading={deleteMutation.isPending} onPress={confirmDelete} />
          </View>
        </Row>
      </CustomModal>
    </Screen>
  );
}
