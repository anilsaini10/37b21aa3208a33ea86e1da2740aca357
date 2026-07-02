/** Teachers list — staff roster with status badges. */
import React from 'react';
import {FlatList} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme} from '../../../core/theme';
import {
  Screen,
  CustomHeader,
  ListRow,
  Badge,
  EmptyState,
  Loader,
} from '../../../shared/components';
import {statusTone, capitalize} from '../../../shared/helpers';
import {useTeachers} from '../teachers.service';
import type {AdminStackParamList} from '../../../navigation/types';
import type {Teacher} from '../../../shared/types';

type Nav = NativeStackNavigationProp<AdminStackParamList>;

export function TeachersListScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const navigation = useNavigation<Nav>();
  const {data, isLoading} = useTeachers({pageSize: 50});

  if (isLoading || !data) {
    return <Loader message="Loading teachers…" />;
  }

  return (
    <Screen padded={false}>
      <CustomHeader
        title="Teachers"
        onBack={() => navigation.goBack()}
        actions={[{icon: 'add', onPress: () => navigation.navigate('TeacherForm')}]}
      />
      <FlatList
        data={data.items}
        keyExtractor={(item: Teacher) => item.id}
        contentContainerStyle={{padding: theme.spacing.lg, flexGrow: 1}}
        showsVerticalScrollIndicator={false}
        renderItem={({item}) => (
          <ListRow
            avatarName={item.name}
            avatarUri={item.avatarUrl}
            title={item.name}
            subtitle={`${item.subjects.join(', ')} · ${item.employeeId}`}
            right={<Badge label={capitalize(item.status)} tone={statusTone(item.status)} />}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="teacher"
            title="No teachers yet"
            message="Add your first teacher to get started."
            actionLabel="Add Teacher"
            onAction={() => navigation.navigate('TeacherForm')}
          />
        }
      />
    </Screen>
  );
}
