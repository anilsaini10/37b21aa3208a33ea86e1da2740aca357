/** Students list — searchable, paginated roster for a specific class, with a section filter and pull-to-refresh. */
import React, {useEffect, useState} from 'react';
import {FlatList, Pressable, RefreshControl, ScrollView, View} from 'react-native';
import {useNavigation, useRoute, type RouteProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useThemedStyles} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {
  Screen,
  CustomHeader,
  SearchBar,
  ListRow,
  Badge,
  Pagination,
  EmptyState,
  Loader,
  Spacer,
} from '../../../shared/components';
import {useStudents} from '../students.service';
import type {AdminStackParamList} from '../../../navigation/types';
import {ScreenNames} from '../../../navigation/ScreenNames';
import type {Student} from '../../../shared/types';

type Nav = NativeStackNavigationProp<AdminStackParamList>;

const ALL_SECTIONS_VALUE = '';
const SEARCH_DEBOUNCE_MS = 350;

export function StudentsListScreen(): React.JSX.Element {
  const {t} = useLanguage();
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<AdminStackParamList, 'StudentsList'>>();
  const {classId, className, sectionId, sectionName, sections} = route.params;

  const [activeSectionId, setActiveSectionId] = useState(sectionId ?? ALL_SECTIONS_VALUE);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);

  // Debounce the search box so we don't refetch on every keystroke.
  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(handle);
  }, [search]);

  const {data, isLoading, isRefetching, isError, error, refetch} = useStudents({
    classId,
    sectionId: activeSectionId || undefined,
    page,
    search: debouncedSearch || undefined,
    pageSize: 15,
  });

  const styles = useThemedStyles(t2 => ({
    searchBarWrap: {
      paddingHorizontal: t2.spacing.lg,
      paddingTop: t2.spacing.md,
    },
    chips: {
      flexGrow: 0,
    },
    chipsRow: {
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
  }));

  const activeSection = (sections ?? []).find(s => s.id === activeSectionId);
  const activeSectionName = activeSection?.name ?? (activeSectionId ? sectionName : undefined);
  const headerTitle = activeSectionName
    ? t('studentsList_headerTitleWithSection', {className, sectionName: activeSectionName})
    : t('studentsList_headerTitleNoSection', {className});

  const onSearch = (text: string): void => {
    setSearch(text);
  };

  const selectSection = (id: string): void => {
    setActiveSectionId(id);
    setPage(1);
  };

  return (
    <Screen padded={false}>
      <CustomHeader
        title={headerTitle}
        onBack={navigation.canGoBack() ? () => navigation.goBack() : undefined}
        actions={[{icon: 'add', onPress: () => navigation.navigate(ScreenNames.StudentForm, {})}]}
      />
      <View style={styles.searchBarWrap}>
        <SearchBar
          value={search}
          onChangeText={onSearch}
          placeholder={t('studentsList_searchPlaceholder')}
        />
      </View>
      {sections && sections.length > 0 ? (
        <ScrollView
          horizontal
          style={styles.chips}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}>
          <Pressable onPress={() => selectSection(ALL_SECTIONS_VALUE)}>
            <Badge label={t('common_all')} tone={activeSectionId === ALL_SECTIONS_VALUE ? 'primary' : 'neutral'} />
          </Pressable>
          {sections.map(section => (
            <Pressable key={section.id} onPress={() => selectSection(section.id)}>
              <Badge
                label={`${section.name} (${section.studentCount})`}
                tone={activeSectionId === section.id ? 'primary' : 'neutral'}
              />
            </Pressable>
          ))}
        </ScrollView>
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
        <Loader message={t('studentsList_loadingStudents')} />
      ) : (
        <FlatList
          style={styles.list}
          data={data.items}
          keyExtractor={(item: Student) => item.id}
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
            <ListRow
              avatarName={item.name}
              title={item.name}
              subtitle={t('studentsList_rowSubtitle', {
                className: item.className,
                sectionName: item.sectionName,
                rollNo: String(item.rollNo),
              })}
              right={<Badge label={`${item.attendancePercentage}%`} tone="info" />}
              onPress={() => navigation.navigate(ScreenNames.StudentDetail, {id: item.id, initial: item})}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              icon="students"
              title={t('studentsList_emptyTitle')}
              message={t('studentsList_emptyMessage')}
              actionLabel={t('studentsList_addStudent')}
              onAction={() => navigation.navigate(ScreenNames.StudentForm, {})}
            />
          }
          ListFooterComponent={
            data.items.length > 0 ? (
              <>
                <Spacer size={8} />
                <Pagination
                  page={data.page}
                  totalPages={data.totalPages}
                  onChange={setPage}
                />
              </>
            ) : null
          }
        />
      )}
    </Screen>
  );
}
