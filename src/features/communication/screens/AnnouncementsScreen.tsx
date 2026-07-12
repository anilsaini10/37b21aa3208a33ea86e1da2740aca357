/**
 * Announcements — common screen reused across Admin/Teacher/Parent stacks.
 *
 * Role decides everything: which endpoint the feed hits (`useAnnouncementsFeed`
 * already branches internally), and whether create/edit/delete controls show
 * at all. Teacher and Parent only ever get a read-only feed — admin manages.
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
import {timeAgo, formatDate, formatDateTime} from '../../../core/utils/format';
import {useAnnouncementsFeed, useDeleteAnnouncement} from '../announcements.service';
import {useAuthStore} from '../../auth/authStore';
import {ScreenNames} from '../../../navigation/ScreenNames';
import type {AdminAnnouncement, AnnouncementAudience, AnnouncementStatus} from '../../../shared/types';

/** Loosely typed on purpose — this screen is registered in three differently-typed
 * stacks (Admin/Teacher/Parent); only Admin's stack actually has `AnnouncementForm`. */
type LooseNav = {navigate: (route: string, params?: object) => void; goBack: () => void};

const ALL_FILTER_VALUE = '';
const SEARCH_DEBOUNCE_MS = 350;
const READ_MORE_THRESHOLD = 140;

const AUDIENCE_TONE: Record<AnnouncementAudience, BadgeTone> = {
  ALL: 'info',
  TEACHER: 'success',
  PARENT: 'warning',
};

const STATUS_TONE: Record<AnnouncementStatus, BadgeTone> = {
  SCHEDULED: 'warning',
  ACTIVE: 'success',
  EXPIRED: 'neutral',
};

function AnnouncementMessage({message}: {message: string}): React.JSX.Element {
  const {t} = useLanguage();
  const [expanded, setExpanded] = useState(false);
  const isLong = message.length > READ_MORE_THRESHOLD;
  return (
    <>
      <AppText variant="caption" color="textSecondary" numberOfLines={expanded ? undefined : 2}>
        {message}
      </AppText>
      {isLong ? (
        <Pressable onPress={() => setExpanded(v => !v)} hitSlop={4}>
          <AppText variant="caption" color="primary" style={{fontWeight: '700', marginTop: 2}}>
            {expanded ? t('announcementsManage_readLess') : t('announcementsManage_readMore')}
          </AppText>
        </Pressable>
      ) : null}
    </>
  );
}

export function AnnouncementsScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const navigation = useNavigation<LooseNav>();
  const role = useAuthStore(s => s.user?.role) ?? 'parent';
  const isAdmin = role === 'admin';

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [audienceFilter, setAudienceFilter] = useState<'' | AnnouncementAudience>(ALL_FILTER_VALUE);
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<AdminAnnouncement | null>(null);

  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(handle);
  }, [search]);

  const {data, isLoading, isRefetching, isError, error, refetch} = useAnnouncementsFeed(role, {
    page,
    pageSize: 15,
    search: debouncedSearch || undefined,
    // Only admin's endpoint supports filtering by audience — teacher/parent feeds are already server-scoped.
    audience: isAdmin ? audienceFilter || undefined : undefined,
  });
  const deleteMutation = useDeleteAnnouncement();

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

  const AUDIENCE_TABS: {label: string; value: '' | AnnouncementAudience}[] = [
    {label: t('announcementsManage_tabAll'), value: ALL_FILTER_VALUE},
    {label: t('announcementsManage_tabTeachers'), value: 'TEACHER'},
    {label: t('announcementsManage_tabParents'), value: 'PARENT'},
  ];

  const AUDIENCE_LABEL: Record<AnnouncementAudience, string> = {
    ALL: t('announcementsManage_audienceAll'),
    TEACHER: t('announcementsManage_audienceTeachers'),
    PARENT: t('announcementsManage_audienceParents'),
  };

  const selectTab = (value: '' | AnnouncementAudience): void => {
    setAudienceFilter(value);
    setPage(1);
  };

  const statusLabel = (item: AdminAnnouncement): string | undefined => {
    if (!item.status) {
      return undefined;
    }
    if (item.status === 'SCHEDULED' && item.publishAt) {
      return t('announcementsManage_statusScheduledFor', {time: formatDateTime(item.publishAt)});
    }
    if (item.status === 'ACTIVE') {
      return t('announcementsManage_statusActive');
    }
    if (item.status === 'EXPIRED') {
      return t('announcementsManage_statusExpired');
    }
    return undefined;
  };

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
        title={t('announcementsManage_headerTitle')}
        onBack={() => navigation.goBack()}
        actions={isAdmin ? [{icon: 'add', onPress: () => navigation.navigate(ScreenNames.AnnouncementForm, {})}] : []}
      />
      <View style={styles.searchBarWrap}>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder={t('announcementsManage_searchPlaceholder')}
        />
      </View>
      {isAdmin ? (
        <View style={styles.tabsRow}>
          {AUDIENCE_TABS.map(tab => (
            <Pressable key={tab.value} onPress={() => selectTab(tab.value)}>
              <Badge label={tab.label} tone={audienceFilter === tab.value ? 'primary' : 'neutral'} />
            </Pressable>
          ))}
        </View>
      ) : null}

      {isError ? (
        <EmptyState
          icon="warning"
          title={t('common_somethingWentWrong')}
          message={(error as {message?: string} | null)?.message ?? t('common_checkConnection')}
          actionLabel={t('common_retry')}
          onAction={() => refetch()}
        />
      ) : isLoading || !data ? (
        <Loader message={t('announcementsManage_loading')} />
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
                isAdmin
                  ? () => navigation.navigate(ScreenNames.AnnouncementForm, {id: item.id, initial: item})
                  : undefined
              }>
              <Row justify="space-between" align="flex-start">
                <Row gap={theme.spacing.xs} wrap>
                  <Badge label={AUDIENCE_LABEL[item.audience]} tone={AUDIENCE_TONE[item.audience]} />
                  {isAdmin && item.status ? (
                    <Badge label={statusLabel(item) ?? ''} tone={STATUS_TONE[item.status]} />
                  ) : null}
                </Row>
                {isAdmin ? (
                  <Pressable onPress={() => setDeleteTarget(item)} hitSlop={8}>
                    <Icon name="delete" size={18} color={theme.colors.error} />
                  </Pressable>
                ) : null}
              </Row>
              <Spacer size={theme.spacing.sm} />
              <AppText variant="bodyBold">{item.title}</AppText>
              {item.eventDate ? (
                <Row gap={4} style={{marginTop: 2}}>
                  <Icon name="calendar" size={13} color={theme.colors.textMuted} />
                  <AppText variant="label" color="textMuted">
                    {formatDate(item.eventDate)}
                  </AppText>
                </Row>
              ) : null}
              <Spacer size={theme.spacing.xs} />
              <AnnouncementMessage message={item.message} />
              <Spacer size={theme.spacing.xs} />
              <AppText variant="label" color="textMuted">
                {t('announcementsManage_metaLine', {time: timeAgo(item.createdAt), name: item.createdBy.name})}
              </AppText>
            </CustomCard>
          )}
          ListEmptyComponent={
            <EmptyState
              icon="announcement"
              title={t('announcementsManage_emptyTitle')}
              message={t('announcementsManage_emptyMessage')}
              actionLabel={isAdmin ? t('announcementsManage_addAnnouncement') : undefined}
              onAction={isAdmin ? () => navigation.navigate(ScreenNames.AnnouncementForm, {}) : undefined}
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
          title={t('announcementsManage_deleteTitle')}>
          <AppText variant="body" color="textSecondary">
            {t('announcementsManage_deleteConfirm', {title: deleteTarget?.title ?? ''})}
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
