/** Admin parent queries list — status tabs with count badges, search, pagination. */
import React, {useCallback, useEffect, useState} from 'react';
import {FlatList, Pressable, RefreshControl, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme, useThemedStyles} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {
  Screen,
  CustomHeader,
  AppText,
  Badge,
  type BadgeTone,
  Loader,
  EmptyState,
  CustomCard,
  Spacer,
  Pagination,
  SearchBar,
} from '../../../shared/components';
import {ScreenNames} from '../../../navigation/ScreenNames';
import {SegmentedTabs, type SegmentedTabOption} from '../../../shared/components/SegmentedTabs';
import type {AdminStackParamList} from '../../../navigation/types';
import type {TranslationKey} from '../../../core/i18n';
import {
  useAdminParentQueries,
  type QueryStatus,
  type AdminParentQuery,
  type StatusCounts,
} from '../adminParentQuery.service';

type Nav = NativeStackNavigationProp<AdminStackParamList>;

type FilterValue = 'ALL' | QueryStatus;

const STATUS_TONE: Record<QueryStatus, BadgeTone> = {
  OPEN: 'warning',
  IN_PROGRESS: 'info',
  RESOLVED: 'success',
  CLOSED: 'neutral',
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {day: 'numeric', month: 'short', year: 'numeric'});
}

function QueryCard({item, onPress}: {item: AdminParentQuery; onPress: () => void}): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const styles = useThemedStyles(th => ({
    row: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: th.spacing.xs},
    meta: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: th.spacing.xs},
  }));

  const statusLabel = t(
    item.status === 'OPEN' ? 'adminQuery_statusOpen'
      : item.status === 'IN_PROGRESS' ? 'adminQuery_statusInProgress'
      : item.status === 'RESOLVED' ? 'adminQuery_statusResolved'
      : 'adminQuery_statusClosed',
  );

  return (
    <Pressable onPress={onPress}>
      <CustomCard>
        <View style={styles.row}>
          <AppText variant="h3" numberOfLines={1} style={{flex: 1, marginRight: theme.spacing.sm}}>
            {item.subject}
          </AppText>
          <Badge label={statusLabel} tone={STATUS_TONE[item.status]} />
        </View>
        <AppText variant="body" numberOfLines={2} color="textSecondary">
          {item.message}
        </AppText>
        <View style={styles.meta}>
          <AppText variant="caption" color="textMuted">
            {item.createdBy.name}
          </AppText>
          <AppText variant="caption" color="textMuted">
            {formatDate(item.createdAt)}
          </AppText>
        </View>
      </CustomCard>
    </Pressable>
  );
}

function buildTabs(t: (k: TranslationKey, p?: Record<string, string | number>) => string, counts?: StatusCounts): SegmentedTabOption<FilterValue>[] {
  const total = counts ? counts.OPEN + counts.IN_PROGRESS + counts.RESOLVED + counts.CLOSED : 0;
  return [
    {value: 'ALL', label: `${t('adminQuery_statusAll')}${counts ? ` (${total})` : ''}`},
    {value: 'OPEN', label: `${t('adminQuery_statusOpen')}${counts ? ` (${counts.OPEN})` : ''}`},
    {value: 'IN_PROGRESS', label: `${t('adminQuery_statusInProgress')}${counts ? ` (${counts.IN_PROGRESS})` : ''}`},
    {value: 'RESOLVED', label: `${t('adminQuery_statusResolved')}${counts ? ` (${counts.RESOLVED})` : ''}`},
    {value: 'CLOSED', label: `${t('adminQuery_statusClosed')}${counts ? ` (${counts.CLOSED})` : ''}`},
  ];
}

export function AdminParentQueriesScreen(): React.JSX.Element {
  const navigation = useNavigation<Nav>();
  const {t} = useLanguage();
  const {theme} = useTheme();
  const styles = useThemedStyles(th => ({
    tabs: {marginHorizontal: th.spacing.lg, marginVertical: th.spacing.sm},
    searchRow: {paddingHorizontal: th.spacing.lg, marginBottom: th.spacing.sm},
    listContent: {padding: th.spacing.lg, paddingTop: th.spacing.sm, rowGap: th.spacing.sm},
  }));

  const [filter, setFilter] = useState<FilterValue>('ALL');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const apiStatus = filter === 'ALL' ? undefined : filter;
  const {data, isLoading, isRefetching, refetch} = useAdminParentQueries(page, apiStatus, debouncedSearch || undefined);

  const onFilterChange = useCallback((val: FilterValue) => {
    setFilter(val);
    setPage(1);
  }, []);

  const tabs = buildTabs(t, data?.statusCounts);

  const renderItem = useCallback(
    ({item}: {item: AdminParentQuery}) => (
      <QueryCard
        item={item}
        onPress={() => navigation.navigate(ScreenNames.AdminQueryDetail, {queryId: item.id})}
      />
    ),
    [navigation],
  );

  return (
    <Screen padded={false}>
      <CustomHeader title={t('adminQuery_title')} onBack={() => navigation.goBack()} />

      <FlatList
        data={data?.items ?? []}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} colors={[theme.colors.primary]} />}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <SegmentedTabs options={tabs} value={filter} onChange={onFilterChange} style={styles.tabs} />
            <View style={styles.searchRow}>
              <SearchBar
                value={search}
                onChangeText={setSearch}
                placeholder={t('adminQuery_searchPlaceholder')}
                onClear={() => setSearch('')}
              />
            </View>
          </>
        }
        ListEmptyComponent={
          isLoading && !isRefetching ? (
            <Loader message={t('common_loading')} />
          ) : (
            <EmptyState
              icon="query"
              title={t('adminQuery_emptyTitle')}
              message={t('adminQuery_emptyMessage')}
            />
          )
        }
      />
      {data && data.totalPages > 1 ? (
        <Pagination page={page} totalPages={data.totalPages} onChange={setPage} />
      ) : null}
    </Screen>
  );
}
