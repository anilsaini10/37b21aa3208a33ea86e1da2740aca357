/** Homework list — all assigned homework with status badges. */
import React from 'react';
import {FlatList, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {
  Screen,
  CustomHeader,
  ListRow,
  Badge,
  Loader,
  EmptyState,
} from '../../../shared/components';
import {formatDate} from '../../../core/utils/format';
import {useHomework} from '../homework.service';
import type {TeacherStackParamList} from '../../../navigation/types';
import type {Homework} from '../../../shared/types';

type Nav = NativeStackNavigationProp<TeacherStackParamList>;

export function HomeworkListScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const navigation = useNavigation<Nav>();
  const {data, isLoading} = useHomework();

  const statusLabel = (status: Homework['status']) =>
    status === 'graded'
      ? t('homework_graded')
      : status === 'submitted'
        ? t('homework_submitted')
        : t('homework_pending');

  if (isLoading || !data) {
    return <Loader message={t('homeworkList_loadingHomework')} />;
  }

  const renderItem = ({item}: {item: Homework}) => (
    <ListRow
      icon="homework"
      title={item.title}
      subtitle={t('homeworkList_itemSubtitle', {
        className: item.className,
        subjectName: item.subjectName,
        dueDate: formatDate(item.dueDate),
      })}
      right={
        <Badge
          label={statusLabel(item.status)}
          tone={item.status === 'graded' ? 'success' : item.status === 'submitted' ? 'info' : 'warning'}
        />
      }
    />
  );

  return (
    <Screen padded={false}>
      <CustomHeader
        title={t('homeworkList_title')}
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
            title={t('homeworkList_noHomeworkYet')}
            message={t('homeworkList_noHomeworkMessage')}
            actionLabel={t('homeworkList_createHomeworkAction')}
            onAction={() => navigation.navigate('CreateHomework')}
          />
        }
      />
    </Screen>
  );
}
