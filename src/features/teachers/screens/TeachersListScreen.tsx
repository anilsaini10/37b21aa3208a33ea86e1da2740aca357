/** Teachers list — searchable, paginated roster, filterable by subject and class. */
import React, {useEffect, useState} from 'react';
import {FlatList, RefreshControl, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useThemedStyles} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {
  Screen,
  CustomHeader,
  SearchBar,
  Select,
  Pagination,
  EmptyState,
  Loader,
  Row,
  Spacer,
} from '../../../shared/components';
import {TeacherCard} from '../components/TeacherCard';
import {useTeachers} from '../teachers.service';
import {useSubjects} from '../../subjects/subjects.service';
import {useClasses} from '../../classes/classes.service';
import {useIsTodayStaffAttendanceMarked} from '../../attendance/adminTeacherAttendance.service';
import type {AdminStackParamList} from '../../../navigation/types';
import {ScreenNames} from '../../../navigation/ScreenNames';
import type {Teacher} from '../../../shared/types';

type Nav = NativeStackNavigationProp<AdminStackParamList>;

const ALL_SUBJECTS_VALUE = '';
const ALL_CLASSES_VALUE = '';
const SEARCH_DEBOUNCE_MS = 350;

export function TeachersListScreen(): React.JSX.Element {
  const styles = useThemedStyles(theme => ({
    searchBarWrap: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.md,
    },
    filterWrap: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.md,
    },
    filterItem: {
      flex: 1,
    },
    filterSelectBorder: {
      borderColor: theme.colors.primary + '40',
      borderWidth: 1,
    },
    listContent: {
      padding: theme.spacing.lg,
      paddingTop: theme.spacing.sm,
      flexGrow: 1,
    },
  }));
  const {t} = useLanguage();
  const navigation = useNavigation<Nav>();

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState(ALL_SUBJECTS_VALUE);
  const [classFilter, setClassFilter] = useState(ALL_CLASSES_VALUE);
  const [page, setPage] = useState(1);

  const {data: subjects} = useSubjects();
  const {data: classes} = useClasses();
  const {isMarked: isTodayMarked} = useIsTodayStaffAttendanceMarked();

  // Debounce the search box so we don't refetch on every keystroke.
  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(handle);
  }, [search]);

  const {data, isLoading, isRefetching, isError, error, refetch} = useTeachers({
    page,
    pageSize: 15,
    search: debouncedSearch || undefined,
    subject: subjectFilter || undefined,
    classId: classFilter || undefined,
  });

  const subjectOptions = [
    {label: t('teachersList_allSubjects'), value: ALL_SUBJECTS_VALUE},
    ...(subjects ?? []).map(s => ({label: s.name, value: s.name})),
  ];
  const classOptions = [
    {label: t('teachersList_allClasses'), value: ALL_CLASSES_VALUE},
    ...(classes ?? []).map(c => ({label: c.name, value: c.id})),
  ];

  const onFilterChange = (setter: (value: string) => void) => (value: string): void => {
    setter(value);
    setPage(1);
  };

  return (
    <Screen padded={false}>
      <CustomHeader
        title={t('teachersList_headerTitle')}
        actions={[
          ...(isTodayMarked
            ? []
            : [{icon: 'attendance', onPress: () => navigation.navigate(ScreenNames.MarkStaffAttendance)}]),
          {icon: 'calendar', onPress: () => navigation.navigate(ScreenNames.StaffAttendanceRegister)},
          {icon: 'add', onPress: () => navigation.navigate(ScreenNames.TeacherForm), circle: true},
        ]}
      />
      <View style={styles.searchBarWrap}>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder={t('teachersList_searchPlaceholder')}
        />
      </View>
      <View style={styles.filterWrap}>
        <Row gap={12} align="flex-start">
          <View style={styles.filterItem}>
            <Select
              label={t('teachersList_filterBySubject')}
              value={subjectFilter}
              options={subjectOptions}
              onChange={onFilterChange(setSubjectFilter)}
              style={styles.filterSelectBorder}
            />
          </View>
          <View style={styles.filterItem}>
            <Select
              label={t('teachersList_filterByClass')}
              value={classFilter}
              options={classOptions}
              onChange={onFilterChange(setClassFilter)}
              style={styles.filterSelectBorder}
            />
          </View>
        </Row>
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
        <Loader message={t('teachersList_loadingTeachers')} />
      ) : (
        <FlatList
          data={data.items}
          keyExtractor={(item: Teacher) => item.id}
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
          renderItem={({item, index}) => (
            <TeacherCard
              teacher={item}
              index={index}
              subtitle={t('teachersList_rowSubtitle', {
                subjects: item.subjectsTaught.join(', '),
              })}
              experienceLabel={t('teacherDetail_experienceValue', {
                years: item.experienceYears,
                months: item.experienceMonths,
              })}
              onPress={() => navigation.navigate(ScreenNames.TeacherDetail, {teacherId: item.id, initial: item})}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              icon="teacher"
              title={t('teachersList_emptyTitle')}
              message={t('teachersList_emptyMessage')}
              actionLabel={t('teachersList_addTeacher')}
              onAction={() => navigation.navigate(ScreenNames.TeacherForm)}
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
