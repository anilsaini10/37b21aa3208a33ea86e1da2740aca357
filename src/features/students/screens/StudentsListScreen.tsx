/** Students list — searchable, paginated roster with quick-add. */
import React, {useState} from 'react';
import {FlatList, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme} from '../../../core/theme';
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
import type {Student} from '../../../shared/types';

type Nav = NativeStackNavigationProp<AdminStackParamList>;

export function StudentsListScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const navigation = useNavigation<Nav>();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const {data, isLoading} = useStudents({page, search, pageSize: 15});

  const onSearch = (text: string): void => {
    setSearch(text);
    setPage(1);
  };

  return (
    <Screen padded={false}>
      <CustomHeader
        title="Students"
        actions={[{icon: 'add', onPress: () => navigation.navigate('StudentForm', {})}]}
      />
      <View style={{paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.md}}>
        <SearchBar
          value={search}
          onChangeText={onSearch}
          placeholder="Search by name, admission no…"
        />
      </View>
      {isLoading || !data ? (
        <Loader message="Loading students…" />
      ) : (
        <FlatList
          data={data.items}
          keyExtractor={(item: Student) => item.id}
          contentContainerStyle={{
            padding: theme.spacing.lg,
            paddingTop: theme.spacing.sm,
            flexGrow: 1,
          }}
          showsVerticalScrollIndicator={false}
          renderItem={({item}) => (
            <ListRow
              avatarName={item.name}
              title={item.name}
              subtitle={`${item.className}-${item.sectionName} · Roll ${item.rollNo}`}
              right={<Badge label={`${item.attendancePercentage}%`} tone="info" />}
              onPress={() => navigation.navigate('StudentDetail', {id: item.id})}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              icon="students"
              title="No students found"
              message="Try a different search or add a new student."
              actionLabel="Add Student"
              onAction={() => navigation.navigate('StudentForm', {})}
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
