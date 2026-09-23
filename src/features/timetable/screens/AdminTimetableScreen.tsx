/** Admin — Class Timetable: browse every class's schedule, filterable by class/section/subject/day/search. */
import React, {useEffect, useMemo, useState} from 'react';
import {Pressable, ScrollView, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme, useThemedStyles} from '../../../core/theme';
import {useLanguage, type TranslationKey} from '../../../core/i18n';
import {
  Screen,
  CustomHeader,
  CustomCard,
  CustomModal,
  CustomButton,
  Select,
  SearchBar,
  AppText,
  Badge,
  Icon,
  Row,
  Spacer,
  EmptyState,
  Loader,
} from '../../../shared/components';
import {useSchedules, useDeleteSchedule} from '../adminSchedule.service';
import {useClasses} from '../../classes/classes.service';
import {useSubjects} from '../../subjects/subjects.service';
import {ScreenNames} from '../../../navigation/ScreenNames';
import type {AdminStackParamList} from '../../../navigation/types';
import type {ScheduleDay, ScheduleEntry} from '../../../shared/types';

type Nav = NativeStackNavigationProp<AdminStackParamList>;
type DayFilter = 'ALL' | ScheduleDay;

const DAYS: ScheduleDay[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
const DAY_FILTERS: DayFilter[] = ['ALL', ...DAYS];
const DAY_ORDER: Record<ScheduleDay, number> = DAYS.reduce(
  (acc, d, i) => ({...acc, [d]: i}),
  {} as Record<ScheduleDay, number>,
);

const DAY_LABEL_KEYS: Record<ScheduleDay, TranslationKey> = {
  MONDAY: 'common_dayMon',
  TUESDAY: 'common_dayTue',
  WEDNESDAY: 'common_dayWed',
  THURSDAY: 'common_dayThu',
  FRIDAY: 'common_dayFri',
  SATURDAY: 'common_daySat',
  SUNDAY: 'common_daySun',
};

const SEARCH_DEBOUNCE_MS = 350;

export function AdminTimetableScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const navigation = useNavigation<Nav>();

  const {data: classes} = useClasses();
  const {data: subjects} = useSubjects();
  const {data: schedules, isLoading} = useSchedules();

  const [classId, setClassId] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [dayFilter, setDayFilter] = useState<DayFilter>('ALL');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<ScheduleEntry | null>(null);
  const [deleteError, setDeleteError] = useState<string | undefined>();

  const deleteMutation = useDeleteSchedule();

  // Debounce the search box so we don't re-filter on every keystroke.
  useEffect(() => {
    const handle = setTimeout(() => setDebouncedSearch(search), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(handle);
  }, [search]);

  const styles = useThemedStyles(t2 => ({
    scrollContent: {padding: t2.spacing.lg, flexGrow: 1},
    pickerWrap: {flex: 1},
    filterRow: {marginBottom: t2.spacing.sm},
    resetButtonWrap: {width: 96, marginTop: 22},
    daySelectorWrap: {alignItems: 'center', marginBottom: t2.spacing.sm},
    dayScrollContent: {columnGap: t2.spacing.sm},
    dayPill: {
      paddingHorizontal: t2.spacing.lg,
      paddingVertical: t2.spacing.sm,
      borderRadius: t2.radius.pill,
    },
    periodCard: {marginBottom: t2.spacing.md},
    breakCard: {
      backgroundColor: t2.colors.warning + '14',
      borderColor: t2.colors.warning + '55',
    },
    periodNoBlock: {
      width: 52,
      alignItems: 'center',
      borderRightWidth: 1,
      borderRightColor: t2.colors.divider,
      paddingRight: t2.spacing.sm,
    },
    periodInfo: {flex: 1},
    entryMeta: {marginBottom: t2.spacing.xs},
    highlightText: {fontWeight: t2.typography.fontWeight.bold},
    modalButtonWrap: {flex: 1},
  }));

  const selectedClass = (classes ?? []).find(c => c.id === classId);
  const classOptions = [
    {label: t('common_all'), value: ''},
    ...(classes ?? []).map(c => ({label: c.name, value: c.id})),
  ];
  const sectionOptions = [
    {label: t('common_all'), value: ''},
    ...(selectedClass?.sections ?? []).map(s => ({label: s.name, value: s.id})),
  ];
  const subjectOptions = [
    {label: t('common_all'), value: ''},
    ...(subjects ?? []).map(s => ({label: s.name, value: s.id})),
  ];

  const onChangeClass = (val: string): void => {
    setClassId(val);
    setSectionId('');
  };

  const resetFilters = (): void => {
    setClassId('');
    setSectionId('');
    setSubjectId('');
    setDayFilter('ALL');
    setSearch('');
  };

  const hasActiveFilters = !!(classId || sectionId || subjectId || debouncedSearch || dayFilter !== 'ALL');
  const isPreciseView = !!classId && !!sectionId && dayFilter !== 'ALL';

  const filteredEntries = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();
    const matchesSearch = (entry: ScheduleEntry): boolean => {
      if (!query) {
        return true;
      }
      return [entry.subjectName, entry.teacherName, entry.roomNo, entry.title, entry.className, entry.sectionName]
        .filter(Boolean)
        .some(field => (field as string).toLowerCase().includes(query));
    };

    return (schedules ?? [])
      .filter(
        entry =>
          (!classId || entry.classId === classId) &&
          (!sectionId || entry.sectionId === sectionId) &&
          (!subjectId || entry.subjectId === subjectId) &&
          (dayFilter === 'ALL' || entry.day === dayFilter) &&
          matchesSearch(entry),
      )
      .sort((a, b) => {
        if (a.className !== b.className) {
          return a.className.localeCompare(b.className);
        }
        if (a.sectionName !== b.sectionName) {
          return a.sectionName.localeCompare(b.sectionName);
        }
        if (a.day !== b.day) {
          return DAY_ORDER[a.day] - DAY_ORDER[b.day];
        }
        return a.periodNo - b.periodNo;
      });
  }, [schedules, classId, sectionId, subjectId, dayFilter, debouncedSearch]);

  const openCreate = (): void => {
    navigation.navigate(ScreenNames.PeriodForm, {
      classId,
      sectionId,
      day: dayFilter === 'ALL' ? 'MONDAY' : dayFilter,
    });
  };

  const openEdit = (entry: ScheduleEntry): void => {
    navigation.navigate(ScreenNames.PeriodForm, {
      classId: entry.classId,
      sectionId: entry.sectionId,
      day: entry.day,
      scheduleId: entry.id,
      initial: entry,
    });
  };

  const confirmDelete = (): void => {
    if (!deleteTarget) {
      return;
    }
    setDeleteError(undefined);
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
      onError: (e: Error) => setDeleteError(e.message),
    });
  };

  return (
    <Screen padded={false}>
      <CustomHeader
        title={t('classSchedule_title')}
        onBack={() => navigation.goBack()}
        actions={[{icon: 'add', onPress: openCreate}]}
      />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.filterRow}>
          <SearchBar value={search} onChangeText={setSearch} placeholder={t('classSchedule_searchPlaceholder')} />
        </View>

        <Row gap={theme.spacing.sm} align="flex-start">
          <View style={styles.pickerWrap}>
            <Select
              label={t('classSchedule_class')}
              value={classId}
              options={classOptions}
              onChange={onChangeClass}
            />
          </View>
          <View style={styles.pickerWrap}>
            <Select
              label={t('classSchedule_section')}
              value={sectionId}
              options={sectionOptions}
              onChange={setSectionId}
              disabled={!classId}
            />
          </View>
        </Row>

        <Row gap={theme.spacing.sm} align="flex-start">
          <View style={styles.pickerWrap}>
            <Select
              label={t('classSchedule_subject')}
              value={subjectId}
              options={subjectOptions}
              onChange={setSubjectId}
            />
          </View>
          <View style={styles.resetButtonWrap}>
            <CustomButton
              title={t('common_reset')}
              variant="outline"
              size="sm"
              iconLeft="close"
              onPress={resetFilters}
              disabled={!hasActiveFilters}
            />
          </View>
        </Row>

        <View style={styles.daySelectorWrap}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dayScrollContent}>
            {DAY_FILTERS.map(d => {
              const active = d === dayFilter;
              return (
                <Pressable
                  key={d}
                  onPress={() => setDayFilter(d)}
                  style={[
                    styles.dayPill,
                    {backgroundColor: active ? theme.colors.primary : theme.colors.surfaceVariant},
                  ]}>
                  <AppText variant="label" style={{color: active ? theme.colors.onPrimary : theme.colors.textSecondary}}>
                    {d === 'ALL' ? t('common_all') : t(DAY_LABEL_KEYS[d])}
                  </AppText>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {isLoading || !schedules ? (
          <Loader message={t('classSchedule_loading')} />
        ) : filteredEntries.length === 0 ? (
          isPreciseView ? (
            <EmptyState
              icon="timetable"
              title={t('classSchedule_noPeriods')}
              message={t('classSchedule_noPeriodsMessage')}
              actionLabel={t('classSchedule_addPeriod')}
              onAction={openCreate}
            />
          ) : (
            <EmptyState
              icon="timetable"
              title={t('classSchedule_noResults')}
              message={t('classSchedule_noResultsMessage')}
              actionLabel={hasActiveFilters ? t('common_reset') : undefined}
              onAction={hasActiveFilters ? resetFilters : undefined}
            />
          )
        ) : (
          filteredEntries.map(entry =>
            entry.type === 'BREAK' ? (
              <CustomCard key={entry.id} style={[styles.periodCard, styles.breakCard]}>
                <AppText variant="caption" color="textMuted" style={styles.entryMeta}>
                  {entry.className} - {entry.sectionName} · {t(DAY_LABEL_KEYS[entry.day])}
                </AppText>
                <Row justify="space-between" align="center">
                  <Row gap={theme.spacing.sm} align="center">
                    <Icon name="clock" size={16} color={theme.colors.warning} />
                    <View>
                      <AppText variant="bodyBold" color="warning">
                        {entry.title}
                      </AppText>
                      <AppText variant="caption" color="textSecondary">
                        {entry.startTime} - {entry.endTime}
                      </AppText>
                    </View>
                  </Row>
                  <Row gap={theme.spacing.md} align="center">
                    <Pressable onPress={() => openEdit(entry)} hitSlop={8}>
                      <Icon name="edit" size={18} color={theme.colors.textMuted} />
                    </Pressable>
                    <Pressable onPress={() => setDeleteTarget(entry)} hitSlop={8}>
                      <Icon name="delete" size={18} color={theme.colors.error} />
                    </Pressable>
                  </Row>
                </Row>
              </CustomCard>
            ) : (
              <CustomCard key={entry.id} style={styles.periodCard}>
                <AppText variant="caption" color="text" style={styles.entryMeta}>
                  {entry.className} - {entry.sectionName} · {t(DAY_LABEL_KEYS[entry.day])}
                </AppText>
                <Row justify="space-between">
                  <Row gap={theme.spacing.md} style={{flex: 1}}>
                    <View style={styles.periodNoBlock}>
                      <AppText variant="h3" color="primary">
                        {entry.periodNo}
                      </AppText>
                      <AppText variant="label" color="textMuted">
                        {t('timetable_period')}
                      </AppText>
                    </View>
                    <View style={styles.periodInfo}>
                      <AppText variant="bodyBold">{entry.subjectName}</AppText>
                      <Row gap={theme.spacing.xs}>
                        <Icon name="clock" size={13} color={theme.colors.textMuted} />
                        <AppText variant="caption" color="textSecondary">
                          {entry.startTime} - {entry.endTime}
                        </AppText>
                      </Row>
                      <Spacer size={4} />
                      <Row gap={theme.spacing.sm} align="center" wrap>
                        {entry.teacherName ? (
                          <Row gap={4} align="center">
                            <Icon name="teacher" size={13} color={theme.colors.primary} />
                            <AppText variant="label" color="primary" style={styles.highlightText}>
                              {entry.teacherName}
                            </AppText>
                          </Row>
                        ) : null}
                        {entry.roomNo ? <Badge label={t('timetable_roomLabel', {room: entry.roomNo})} tone="info" /> : null}
                      </Row>
                    </View>
                  </Row>
                  <Row gap={theme.spacing.md} align="center">
                    <Pressable onPress={() => openEdit(entry)} hitSlop={8}>
                      <Icon name="edit" size={18} color={theme.colors.textMuted} />
                    </Pressable>
                    <Pressable onPress={() => setDeleteTarget(entry)} hitSlop={8}>
                      <Icon name="delete" size={18} color={theme.colors.error} />
                    </Pressable>
                  </Row>
                </Row>
              </CustomCard>
            ),
          )
        )}
        <Spacer size={24} />
      </ScrollView>

      <CustomModal
        visible={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title={t('classSchedule_deleteTitle')}>
        <AppText variant="body" color="textSecondary">
          {t('classSchedule_deleteConfirm', {
            name: deleteTarget?.type === 'BREAK' ? deleteTarget?.title ?? '' : deleteTarget?.subjectName ?? '',
          })}
        </AppText>
        {deleteError ? (
          <AppText variant="caption" color="error" style={{marginTop: theme.spacing.sm}}>
            {deleteError}
          </AppText>
        ) : null}
        <Spacer size={16} />
        <Row gap={theme.spacing.md}>
          <View style={styles.modalButtonWrap}>
            <CustomButton title={t('common_cancel')} variant="outline" onPress={() => setDeleteTarget(null)} />
          </View>
          <View style={styles.modalButtonWrap}>
            <CustomButton
              title={t('common_delete')}
              variant="danger"
              loading={deleteMutation.isPending}
              onPress={confirmDelete}
            />
          </View>
        </Row>
      </CustomModal>
    </Screen>
  );
}
