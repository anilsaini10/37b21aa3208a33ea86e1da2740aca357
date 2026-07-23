/** Class Students — searchable, paginated roster for a class/section this teacher teaches. */
import React, {useEffect, useState} from 'react';
import {FlatList, RefreshControl, View} from 'react-native';
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
  Loader,
  EmptyState,
  Spacer,
} from '../../../shared/components';
import {attendancePercentageTone} from '../../../shared/helpers';
import {useTeacherStudents} from '../teacherStudents.service';
import type {TeacherStackParamList} from '../../../navigation/types';
import {ScreenNames} from '../../../navigation/ScreenNames';
import type {Student} from '../../../shared/types';

type Nav = NativeStackNavigationProp<TeacherStackParamList>;

const SEARCH_DEBOUNCE_MS = 350;

export function ClassStudentsScreen(): React.JSX.Element {
  const styles = useThemedStyles(theme => ({
    searchBarWrap: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.md,
    },
    listContent: {
      padding: theme.spacing.lg,
      paddingTop: theme.spacing.sm,
      flexGrow: 1,
    },
  }));
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<TeacherStackParamList, 'ClassStudents'>>();
  const {t} = useLanguage();
  const {classId, className, sectionId, sectionName} = route.params;

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

  const {data, isLoading, isRefetching, isError, error, refetch} = useTeacherStudents({
    classId,
    sectionId,
    search: debouncedSearch || undefined,
    page,
    pageSize: 15,
  });

  const headerTitle = sectionName
    ? t('classStudents_headerTitleWithSection', {className, sectionName})
    : t('classStudents_headerTitleNoSection', {className});

  const openStudent = (student: Student): void => {
    navigation.navigate(ScreenNames.StudentDetail, {student});
  };

  const renderItem = ({item}: {item: Student}) => (
    <ListRow
      avatarName={item.name}
      title={item.name}
      subtitle={t('studentsList_rowSubtitle', {
        className: item.className,
        sectionName: item.sectionName,
        rollNo: String(item.rollNo),
      })}
      onPress={() => openStudent(item)}
      right={<Badge label={`${item.attendancePercentage}%`} tone={attendancePercentageTone(item.attendancePercentage)} />}
    />
  );

  return (
    <Screen padded={false}>
      <CustomHeader
        title={headerTitle}
        onBack={navigation.canGoBack() ? () => navigation.goBack() : undefined}
      />
      <View style={styles.searchBarWrap}>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder={t('classStudents_searchPlaceholder')}
        />
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
        <Loader message={t('classStudents_loadingStudents')} />
      ) : (
        <FlatList
          data={data.items}
          keyExtractor={item => item.id}
          renderItem={renderItem}
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
          ListEmptyComponent={
            <EmptyState
              icon="students"
              title={t('classStudents_noStudents')}
              message={t('classStudents_noStudentsMessage')}
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
