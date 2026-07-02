/** Class Students — roster for the teacher's class with attendance badges. */
import React from 'react';
import {FlatList, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme} from '../../../core/theme';
import {
  Screen,
  CustomHeader,
  ListRow,
  Badge,
  Loader,
  EmptyState,
} from '../../../shared/components';
import {useStudents} from '../../students/students.service';
import type {TeacherStackParamList} from '../../../navigation/types';
import type {Student} from '../../../shared/types';

type Nav = NativeStackNavigationProp<TeacherStackParamList>;

export function ClassStudentsScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const navigation = useNavigation<Nav>();
  const {data, isLoading} = useStudents({pageSize: 50});

  if (isLoading || !data) {
    return <Loader message="Loading students…" />;
  }

  const renderItem = ({item}: {item: Student}) => (
    <ListRow
      avatarName={item.name}
      title={item.name}
      subtitle={`${item.className}-${item.sectionName} · Roll ${item.rollNo}`}
      right={
        <Badge
          label={`${item.attendancePercentage}%`}
          tone={
            item.attendancePercentage >= 85
              ? 'success'
              : item.attendancePercentage >= 75
                ? 'warning'
                : 'error'
          }
        />
      }
    />
  );

  return (
    <Screen padded={false}>
      <CustomHeader
        title="My Class"
        onBack={navigation.canGoBack() ? () => navigation.goBack() : undefined}
      />
      <FlatList
        data={data.items}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={{padding: theme.spacing.lg, flexGrow: 1}}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => (
          <View style={{height: 1, backgroundColor: theme.colors.divider}} />
        )}
        ListEmptyComponent={
          <EmptyState icon="students" title="No students" message="No students in your class yet." />
        }
      />
    </Screen>
  );
}
