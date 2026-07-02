/** Homework list — all assigned homework with status badges. */
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
import {capitalize} from '../../../shared/helpers';
import {formatDate} from '../../../core/utils/format';
import {useHomework} from '../homework.service';
import type {TeacherStackParamList} from '../../../navigation/types';
import type {Homework} from '../../../shared/types';

type Nav = NativeStackNavigationProp<TeacherStackParamList>;

export function HomeworkListScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const navigation = useNavigation<Nav>();
  const {data, isLoading} = useHomework();

  if (isLoading || !data) {
    return <Loader message="Loading homework…" />;
  }

  const renderItem = ({item}: {item: Homework}) => (
    <ListRow
      icon="homework"
      title={item.title}
      subtitle={`${item.className} · ${item.subjectName} · Due ${formatDate(item.dueDate)}`}
      right={
        <Badge
          label={capitalize(item.status)}
          tone={item.status === 'graded' ? 'success' : item.status === 'submitted' ? 'info' : 'warning'}
        />
      }
    />
  );

  return (
    <Screen padded={false}>
      <CustomHeader
        title="Homework"
        actions={[{icon: 'add', onPress: () => navigation.navigate('CreateHomework')}]}
      />
      <FlatList
        data={data}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={{padding: theme.spacing.lg, flexGrow: 1}}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => (
          <View style={{height: 1, backgroundColor: theme.colors.divider}} />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="homework"
            title="No homework yet"
            message="Create homework to assign it to your classes."
            actionLabel="Create Homework"
            onAction={() => navigation.navigate('CreateHomework')}
          />
        }
      />
    </Screen>
  );
}
