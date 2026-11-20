/** Parent queries list — status filter tabs, FlatList, pull-to-refresh, pagination. */
import React, {useCallback, useState} from 'react';
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
} from '../../../shared/components';
import {ScreenNames} from '../../../navigation/ScreenNames';
import {SegmentedTabs, type SegmentedTabOption} from '../../../shared/components/SegmentedTabs';
import type {ParentStackParamList} from '../../../navigation/types';
import {useParentQueries, type QueryStatus, type ParentQuery} from '../parentQuery.service';

type Nav = NativeStackNavigationProp<ParentStackParamList>;

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

function QueryCard({item, onPress}: {item: ParentQuery; onPress: () => void}): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const styles = useThemedStyles(th => ({
    row: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: th.spacing.xs},
    date: {marginTop: th.spacing.xs},
  }));

  const statusLabel = t(
    item.status === 'OPEN' ? 'parentQuery_statusOpen'
      : item.status === 'IN_PROGRESS' ? 'parentQuery_statusInProgress'
      : item.status === 'RESOLVED' ? 'parentQuery_statusResolved'
      : 'parentQuery_statusClosed',
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
        <AppText variant="caption" color="textMuted" style={styles.date}>
          {t('parentQuery_submittedOn', {date: formatDate(item.createdAt)})}
        </AppText>
      </CustomCard>
    </Pressable>
  );
}

export function ParentQueriesScreen(): React.JSX.Element {
  const navigation = useNavigation<Nav>();
  const {t} = useLanguage();
  const {theme} = useTheme();
  const styles = useThemedStyles(th => ({
    tabs: {marginHorizontal: th.spacing.lg, marginVertical: th.spacing.sm},
    listContent: {padding: th.spacing.lg, paddingTop: th.spacing.sm, rowGap: th.spacing.sm},
  }));

  const [filter, setFilter] = useState<FilterValue>('ALL');
  const [page, setPage] = useState(1);

  const apiStatus = filter === 'ALL' ? undefined : filter;
  const {data, isLoading, isRefetching, refetch} = useParentQueries(page, apiStatus);

  const onFilterChange = useCallback((val: FilterValue) => {
    setFilter(val);
    setPage(1);
  }, []);

  const TABS: SegmentedTabOption<FilterValue>[] = [
    {value: 'ALL', label: t('parentQuery_statusAll')},
    {value: 'OPEN', label: t('parentQuery_statusOpen')},
    {value: 'IN_PROGRESS', label: t('parentQuery_statusInProgress')},
    {value: 'RESOLVED', label: t('parentQuery_statusResolved')},
  ];

  const renderItem = useCallback(
    ({item}: {item: ParentQuery}) => (
      <QueryCard
        item={item}
        onPress={() => navigation.navigate(ScreenNames.ParentQueryDetail, {queryId: item.id})}
      />
    ),
    [navigation],
  );

  return (
    <Screen padded={false}>
      <CustomHeader
        title={t('parentQuery_title')}
        onBack={() => navigation.goBack()}
        actions={[{icon: 'add', onPress: () => navigation.navigate(ScreenNames.SubmitQuery), circle: true}]}
      />

      <SegmentedTabs options={TABS} value={filter} onChange={onFilterChange} style={styles.tabs} />

      {isLoading && !isRefetching ? (
        <Loader message={t('common_loading')} />
      ) : !data?.items.length ? (
        <EmptyState
          icon="query"
          title={filter === 'ALL' ? t('parentQuery_emptyTitle') : t('parentQuery_emptyFilterTitle')}
          message={filter === 'ALL' ? t('parentQuery_emptyMessage') : t('parentQuery_emptyFilterMessage')}
        />
      ) : (
        <>
          <FlatList
            data={data.items}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} colors={[theme.colors.primary]} />}
            showsVerticalScrollIndicator={false}
          />
          {data.totalPages > 1 ? (
            <Pagination page={page} totalPages={data.totalPages} onChange={setPage} />
          ) : null}
        </>
      )}
    </Screen>
  );
}
