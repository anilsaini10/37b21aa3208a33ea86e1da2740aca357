/** Teachers list — staff roster with status badges. */
import React from 'react';
import {FlatList} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useThemedStyles} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
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
import {ScreenNames} from '../../../navigation/ScreenNames';
import type {Teacher} from '../../../shared/types';

type Nav = NativeStackNavigationProp<AdminStackParamList>;

export function TeachersListScreen(): React.JSX.Element {
  const styles = useThemedStyles(theme => ({
    listContent: {
      padding: theme.spacing.lg,
      flexGrow: 1,
    },
  }));
  const {t} = useLanguage();
  const navigation = useNavigation<Nav>();
  const {data, isLoading} = useTeachers({pageSize: 50});

  if (isLoading || !data) {
    return <Loader message={t('teachersList_loadingTeachers')} />;
  }

  return (
    <Screen padded={false}>
      <CustomHeader
        title={t('teachersList_headerTitle')}
        onBack={() => navigation.goBack()}
        actions={[{icon: 'add', onPress: () => navigation.navigate(ScreenNames.TeacherForm)}]}
      />
      <FlatList
        data={data.items}
        keyExtractor={(item: Teacher) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({item}) => (
          <ListRow
            avatarName={item.name}
            avatarUri={item.avatarUrl}
            title={item.name}
            subtitle={t('teachersList_rowSubtitle', {
              subjects: item.subjects.join(', '),
              employeeId: item.employeeId,
            })}
            right={<Badge label={capitalize(item.status)} tone={statusTone(item.status)} />}
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
      />
    </Screen>
  );
}
