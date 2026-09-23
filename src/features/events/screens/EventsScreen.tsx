/**
 * Events — common screen reused across Admin/Teacher/Parent stacks.
 *
 * Role decides everything: which endpoint the feed hits (`useEventsFeed` already
 * branches internally), and whether create/edit/delete controls show at all.
 * Teacher and Parent only ever get a read-only feed — admin manages.
 */
import React, {useEffect, useState} from 'react';
import {FlatList, Pressable, RefreshControl, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useTheme, useThemedStyles} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {
  Screen,
  CustomHeader,
  CustomCard,
  CustomModal,
  CustomButton,
  SearchBar,
  AppText,
  Badge,
  Icon,
  Row,
  Spacer,
  Pagination,
  EmptyState,
  Loader,
} from '../../../shared/components';
import type {BadgeTone} from '../../../shared/components';
import {formatDate} from '../../../core/utils/format';
import {useEventsFeed, useDeleteEvent} from '../events.service';
import {useAuthStore} from '../../auth/authStore';
import {ScreenNames} from '../../../navigation/ScreenNames';
import type {AdminEvent, AnnouncementAudience, EventType} from '../../../shared/types';

/** Loosely typed on purpose — this screen is registered in three differently-typed
 * stacks (Admin/Teacher/Parent); only Admin's stack actually has `EventForm`. */
type LooseNav = {navigate: (route: string, params?: object) => void; goBack: () => void};

const ALL_FILTER_VALUE = '';
const SEARCH_DEBOUNCE_MS = 350;

const EVENT_TYPE_ICON: Record<EventType, string> = {
  HOLIDAY: 'sun',
  EXAM: 'exam',
  MEETING: 'chat',
  ACTIVITY: 'star',
  OTHER: 'event',
};

const EVENT_TYPE_TONE: Record<EventType, BadgeTone> = {
  HOLIDAY: 'warning',
  EXAM: 'error',
  MEETING: 'info',
  ACTIVITY: 'success',
  OTHER: 'neutral',
};

const AUDIENCE_TONE: Record<AnnouncementAudience, BadgeTone> = {
  ALL: 'info',
  TEACHER: 'success',
  PARENT: 'warning',
};

function isSameDay(a: string, b: string): boolean {
  return a.slice(0, 10) === b.slice(0, 10);
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

type ViewFilter = 'upcoming' | 'past';

export function EventsScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const navigation = useNavigation<LooseNav>();
  const role = useAuthStore(s => s.user?.role) ?? 'parent';
  const isAdmin = role === 'admin';

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'' | EventType>(ALL_FILTER_VALUE);
  const [viewFilter, setViewFilter] = useState<ViewFilter>('upcoming');
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<AdminEvent | null>(null);

  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(handle);
  }, [search]);

  const today = todayIso();
  const {data, isLoading, isRefetching, isError, error, refetch} = useEventsFeed(role, {
    page,
    pageSize: 15,
    search: debouncedSearch || undefined,
    eventType: typeFilter || undefined,
    from: viewFilter === 'upcoming' ? today : undefined,
    to: viewFilter === 'past' ? today : undefined,
  });
  const deleteMutation = useDeleteEvent();

  const styles = useThemedStyles(t2 => ({
    searchBarWrap: {
      paddingHorizontal: t2.spacing.lg,
      paddingTop: t2.spacing.md,
    },
    tabsRow: {
      flexDirection: 'row',
      columnGap: t2.spacing.sm,
      paddingHorizontal: t2.spacing.lg,
      paddingTop: t2.spacing.sm,
      paddingBottom: t2.spacing.sm,
      flexWrap: 'wrap',
      rowGap: t2.spacing.sm,
    },
    list: {
      flex: 1,
    },
    listContent: {
      padding: t2.spacing.lg,
      paddingTop: t2.spacing.sm,
      flexGrow: 1,
    },
    card: {
      marginBottom: t2.spacing.md,
    },
    modalButtonWrap: {
      flex: 1,
    },
  }));

  const TYPE_TABS: {label: string; value: '' | EventType}[] = [
    {label: t('eventsManage_tabAll'), value: ALL_FILTER_VALUE},
    {label: t('eventForm_typeHoliday'), value: 'HOLIDAY'},
    {label: t('eventForm_typeExam'), value: 'EXAM'},
    {label: t('eventForm_typeMeeting'), value: 'MEETING'},
    {label: t('eventForm_typeActivity'), value: 'ACTIVITY'},
    {label: t('eventForm_typeOther'), value: 'OTHER'},
  ];

  const AUDIENCE_LABEL: Record<AnnouncementAudience, string> = {
    ALL: t('announcementForm_audienceEveryone'),
    TEACHER: t('announcementForm_audienceTeachers'),
    PARENT: t('announcementForm_audienceParents'),
  };

  const TYPE_LABEL: Record<EventType, string> = {
    HOLIDAY: t('eventForm_typeHoliday'),
    EXAM: t('eventForm_typeExam'),
    MEETING: t('eventForm_typeMeeting'),
    ACTIVITY: t('eventForm_typeActivity'),
    OTHER: t('eventForm_typeOther'),
  };

  const VIEW_TABS: {label: string; value: ViewFilter}[] = [
    {label: t('eventsManage_viewUpcoming'), value: 'upcoming'},
    {label: t('eventsManage_viewPast'), value: 'past'},
  ];

  const selectTab = (value: '' | EventType): void => {
    setTypeFilter(value);
    setPage(1);
  };

  const selectView = (value: ViewFilter): void => {
    setViewFilter(value);
    setPage(1);
  };

  const dateRangeLabel = (item: AdminEvent): string =>
    isSameDay(item.startDate, item.endDate)
      ? formatDate(item.startDate)
      : `${formatDate(item.startDate)} – ${formatDate(item.endDate)}`;

  const onDelete = (): void => {
    if (!deleteTarget) {
      return;
    }
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
    });
  };

  return (
    <Screen padded={false}>
      <CustomHeader
        title={t('eventsManage_headerTitle')}
        onBack={() => navigation.goBack()}
        actions={isAdmin ? [{icon: 'add', onPress: () => navigation.navigate(ScreenNames.EventForm, {})}] : []}
      />
      <View style={styles.searchBarWrap}>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder={t('eventsManage_searchPlaceholder')}
        />
      </View>
      <View style={styles.tabsRow}>
        {VIEW_TABS.map(tab => (
          <Pressable key={tab.value} onPress={() => selectView(tab.value)}>
            <Badge label={tab.label} tone={viewFilter === tab.value ? 'primary' : 'neutral'} />
          </Pressable>
        ))}
      </View>
      <View style={styles.tabsRow}>
        {TYPE_TABS.map(tab => (
          <Pressable key={tab.value} onPress={() => selectTab(tab.value)}>
            <Badge label={tab.label} tone={typeFilter === tab.value ? 'primary' : 'neutral'} />
          </Pressable>
        ))}
      </View>

      {isError ? (
        <EmptyState
          icon="warning"
          title={t('common_somethingWentWrong')}
          message={(error as {message?: string} | null)?.message ?? t('common_checkConnection')}
          actionLabel={t('common_retry')}
          onAction={() => refetch()}
        />
      ) : isLoading || !data ? (
        <Loader message={t('eventsManage_loading')} />
      ) : (
        <FlatList
          style={styles.list}
          data={data.items}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => {
                setPage(1);
                refetch();
              }}
            />
          }
          renderItem={({item}) => (
            <CustomCard
              style={styles.card}
              onPress={
                isAdmin && viewFilter !== 'past'
                  ? () => navigation.navigate(ScreenNames.EventForm, {id: item.id, initial: item})
                  : // Past events are read-only — no edit navigation on tap.
                    undefined
              }>
              <Row justify="space-between" align="flex-start">
                <Row gap={theme.spacing.xs} wrap>
                  <Badge label={TYPE_LABEL[item.eventType]} tone={EVENT_TYPE_TONE[item.eventType]} />
                  {item.audience !== 'ALL' ? (
                    <Badge label={AUDIENCE_LABEL[item.audience]} tone={AUDIENCE_TONE[item.audience]} />
                  ) : null}
                </Row>
                {isAdmin ? (
                  <Pressable onPress={() => setDeleteTarget(item)} hitSlop={8}>
                    <Icon name="delete" size={18} color={theme.colors.error} />
                  </Pressable>
                ) : null}
              </Row>
              <Spacer size={theme.spacing.sm} />
              <Row gap={theme.spacing.sm} align="center">
                <Icon name={EVENT_TYPE_ICON[item.eventType]} size={16} color={theme.colors.textMuted} />
                <AppText variant="bodyBold">{item.title}</AppText>
              </Row>
              <Row gap={4} style={{marginTop: 2}}>
                <Icon name="calendar" size={13} color={theme.colors.textMuted} />
                <AppText variant="label" color="textMuted">
                  {dateRangeLabel(item)}
                </AppText>
              </Row>
              {item.description ? (
                <>
                  <Spacer size={theme.spacing.xs} />
                  <AppText variant="caption" color="textSecondary" numberOfLines={2}>
                    {item.description}
                  </AppText>
                </>
              ) : null}
            </CustomCard>
          )}
          ListEmptyComponent={
            <EmptyState
              icon="event"
              title={t('eventsManage_emptyTitle')}
              message={t('eventsManage_emptyMessage')}
              actionLabel={isAdmin ? t('eventsManage_addEvent') : undefined}
              onAction={isAdmin ? () => navigation.navigate(ScreenNames.EventForm, {}) : undefined}
            />
          }
          ListFooterComponent={
            data.items.length > 0 ? (
              <>
                <Spacer size={8} />
                <Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} />
              </>
            ) : null
          }
        />
      )}

      {isAdmin ? (
        <CustomModal
          visible={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          title={t('eventsManage_deleteTitle')}>
          <AppText variant="body" color="textSecondary">
            {t('eventsManage_deleteConfirm', {title: deleteTarget?.title ?? ''})}
          </AppText>
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
                onPress={onDelete}
              />
            </View>
          </Row>
        </CustomModal>
      ) : null}
    </Screen>
  );
}
