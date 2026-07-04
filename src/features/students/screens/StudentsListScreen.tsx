/** Students list — searchable, paginated roster for a specific class/section. */
import React, {useState} from 'react';
import {FlatList, View} from 'react-native';
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

export function StudentsListScreen(): React.JSX.Element {
  const {t} = useLanguage();
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<AdminStackParamList, 'StudentsList'>>();
  const {classId, className, sectionId, sectionName} = route.params;
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const {data, isLoading} = useStudents({classId, sectionId, page, search, pageSize: 15});
  const styles = useThemedStyles(t2 => ({
    searchBarWrap: {
      paddingHorizontal: t2.spacing.lg,
      paddingTop: t2.spacing.md,
    },
    listContent: {
      padding: t2.spacing.lg,
      paddingTop: t2.spacing.sm,
      flexGrow: 1,
    },
  }));

  const headerTitle = sectionName
    ? t('studentsList_headerTitleWithSection', {className, sectionName})
    : t('studentsList_headerTitleNoSection', {className});

  const onSearch = (text: string): void => {
    setSearch(text);
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
      {isLoading || !data ? (
        <Loader message={t('studentsList_loadingStudents')} />
      ) : (
        <FlatList
          data={data.items}
          keyExtractor={(item: Student) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
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
              onPress={() => navigation.navigate(ScreenNames.StudentDetail, {id: item.id})}
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
