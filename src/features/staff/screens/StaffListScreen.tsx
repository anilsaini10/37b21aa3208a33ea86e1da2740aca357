/** Staff (non-teaching) — searchable, paginated directory with designation + status filters; tap a row for detail, "+" to add. */
import React, {useEffect, useState} from 'react';
import {FlatList, Pressable, ScrollView, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme, useThemedStyles} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {
  Screen,
  CustomHeader,
  SearchBar,
  ListRow,
  Badge,
  AppText,
  Pagination,
  EmptyState,
  Loader,
  Spacer,
} from '../../../shared/components';
import {statusTone, capitalize} from '../../../shared/helpers';
import {useStaffList} from '../adminStaff.service';
import type {AdminStackParamList} from '../../../navigation/types';
import {ScreenNames} from '../../../navigation/ScreenNames';
import type {Staff, Status} from '../../../shared/types';

type Nav = NativeStackNavigationProp<AdminStackParamList>;
type StatusFilter = Extract<Status, 'active' | 'inactive'> | 'all';

const SEARCH_DEBOUNCE_MS = 350;
const ALL_DESIGNATIONS = '';
const DESIGNATIONS = ['Accountant', 'Librarian', 'Driver', 'Peon', 'Receptionist'];

export function StaffListScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const styles = useThemedStyles(t2 => ({
    searchBarWrap: {
      paddingHorizontal: t2.spacing.lg,
      paddingTop: t2.spacing.md,
    },
    pillsWrap: {
      paddingTop: t2.spacing.sm,
    },
    pillsContent: {
      columnGap: t2.spacing.sm,
      paddingHorizontal: t2.spacing.lg,
    },
    pill: {
      paddingHorizontal: t2.spacing.md,
      paddingVertical: t2.spacing.xs,
      borderRadius: t2.radius.pill,
    },
    listContent: {
      padding: t2.spacing.lg,
      paddingTop: t2.spacing.sm,
      flexGrow: 1,
    },
  }));
  const {t} = useLanguage();
  const navigation = useNavigation<Nav>();

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [designationFilter, setDesignationFilter] = useState(ALL_DESIGNATIONS);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(handle);
  }, [search]);

  const {data, isLoading, isError, error, refetch} = useStaffList({
    page,
    pageSize: 15,
    search: debouncedSearch || undefined,
    designation: designationFilter || undefined,
    status: statusFilter === 'all' ? undefined : statusFilter,
  });

  const STATUS_FILTERS: {label: string; value: StatusFilter}[] = [
    {label: t('common_all'), value: 'all'},
    {label: t('teacherEdit_active'), value: 'active'},
    {label: t('teacherEdit_inactive'), value: 'inactive'},
  ];

  const renderPill = (label: string, active: boolean, onPress: () => void, key: string): React.JSX.Element => (
    <Pressable
      key={key}
      onPress={onPress}
      style={[styles.pill, {backgroundColor: active ? theme.colors.primary : theme.colors.surfaceVariant}]}>
      <AppText variant="label" style={{color: active ? theme.colors.onPrimary : theme.colors.textSecondary}}>
        {label}
      </AppText>
    </Pressable>
  );

  return (
    <Screen padded={false}>
      <CustomHeader
        title={t('staffList_headerTitle')}
        actions={[{icon: 'add', onPress: () => navigation.navigate(ScreenNames.StaffForm, {})}]}
      />
      <View style={styles.searchBarWrap}>
        <SearchBar value={search} onChangeText={setSearch} placeholder={t('staffList_searchPlaceholder')} />
      </View>

      <View style={styles.pillsWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillsContent}>
          {renderPill(t('common_all'), designationFilter === ALL_DESIGNATIONS, () => {
            setDesignationFilter(ALL_DESIGNATIONS);
            setPage(1);
          }, 'all')}
          {DESIGNATIONS.map(d =>
            renderPill(
              d,
              designationFilter === d,
              () => {
                setDesignationFilter(d);
                setPage(1);
              },
              d,
            ),
          )}
        </ScrollView>
      </View>

      <View style={styles.pillsWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillsContent}>
          {STATUS_FILTERS.map(f =>
            renderPill(
              f.label,
              statusFilter === f.value,
              () => {
                setStatusFilter(f.value);
                setPage(1);
              },
              f.value,
            ),
          )}
        </ScrollView>
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
        <Loader message={t('staffList_loadingStaff')} />
      ) : (
        <FlatList
          data={data.items}
          keyExtractor={(item: Staff) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({item}) => (
            <ListRow
              avatarName={item.name}
              title={item.name}
              subtitle={t('staffList_rowSubtitle', {employeeId: item.employeeId, designation: item.designation})}
              right={<Badge label={capitalize(item.status)} tone={statusTone(item.status)} />}
              onPress={() => navigation.navigate(ScreenNames.StaffDetail, {staffId: item.id, initial: item})}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              icon="staff"
              title={t('staffList_emptyTitle')}
              message={t('staffList_emptyMessage')}
              actionLabel={t('staffList_addStaff')}
              onAction={() => navigation.navigate(ScreenNames.StaffForm, {})}
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
    </Screen>
  );
}
