/** Homework list — homework assigned to a specific class/section with status badges. */
import React from 'react';
import {FlatList, View} from 'react-native';
import {useNavigation, useRoute, type RouteProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useThemedStyles} from '../../../core/theme';
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
import {ScreenNames} from '../../../navigation/ScreenNames';
import type {Homework} from '../../../shared/types';

type Nav = NativeStackNavigationProp<TeacherStackParamList>;

export function HomeworkListScreen(): React.JSX.Element {
  const {t} = useLanguage();
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<TeacherStackParamList, 'HomeworkList'>>();
  const {classId, className, sectionId, sectionName} = route.params;
  const {data, isLoading} = useHomework({classId, sectionId});
  const styles = useThemedStyles(theme => ({
    listContent: {
      padding: theme.spacing.lg,
      flexGrow: 1,
    },
    separator: {
      height: 1,
      backgroundColor: theme.colors.divider,
    },
  }));

  const headerTitle = sectionName
    ? t('homeworkList_headerTitleWithSection', {className, sectionName})
    : t('homeworkList_headerTitleNoSection', {className});

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
      onPress={() => navigation.navigate(ScreenNames.HomeworkDetail, {id: item.id})}
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
        title={headerTitle}
        onBack={navigation.canGoBack() ? () => navigation.goBack() : undefined}
        actions={[{icon: 'add', onPress: () => navigation.navigate(ScreenNames.CreateHomework)}]}
      />
      <FlatList
        data={data}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <EmptyState
            icon="homework"
            title={t('homeworkList_noHomeworkYet')}
            message={t('homeworkList_noHomeworkMessage')}
            actionLabel={t('homeworkList_createHomeworkAction')}
            onAction={() => navigation.navigate(ScreenNames.CreateHomework)}
          />
        }
      />
    </Screen>
  );
}
