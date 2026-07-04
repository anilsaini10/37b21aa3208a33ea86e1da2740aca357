/** Teachers list — staff roster with status badges, filterable by subject. */
import React, {useState} from 'react';
import {FlatList, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useThemedStyles} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {
  Screen,
  CustomHeader,
  ListRow,
  Badge,
  Select,
  EmptyState,
  Loader,
} from '../../../shared/components';
import {statusTone, capitalize} from '../../../shared/helpers';
import {db} from '../../../core/mock/db';
import {useTeachers} from '../teachers.service';
import type {AdminStackParamList} from '../../../navigation/types';
import {ScreenNames} from '../../../navigation/ScreenNames';
import type {Teacher} from '../../../shared/types';

type Nav = NativeStackNavigationProp<AdminStackParamList>;

const ALL_SUBJECTS_VALUE = '';

export function TeachersListScreen(): React.JSX.Element {
  const styles = useThemedStyles(theme => ({
    filterWrap: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.md,
    },
    listContent: {
      padding: theme.spacing.lg,
      paddingTop: theme.spacing.sm,
      flexGrow: 1,
    },
  }));
  const {t} = useLanguage();
  const navigation = useNavigation<Nav>();
  const [subjectFilter, setSubjectFilter] = useState(ALL_SUBJECTS_VALUE);
  const {data, isLoading} = useTeachers({
    pageSize: 50,
    subject: subjectFilter || undefined,
  });

  const subjectOptions = [
    {label: t('teachersList_allSubjects'), value: ALL_SUBJECTS_VALUE},
    ...db.subjects.map(s => ({label: s.name, value: s.name})),
  ];

  return (
    <Screen padded={false}>
      <CustomHeader
        title={t('teachersList_headerTitle')}
        onBack={() => navigation.goBack()}
        actions={[{icon: 'add', onPress: () => navigation.navigate(ScreenNames.TeacherForm)}]}
      />
      <View style={styles.filterWrap}>
        <Select
          label={t('teachersList_filterBySubject')}
          value={subjectFilter}
          options={subjectOptions}
          onChange={setSubjectFilter}
        />
      </View>
      {isLoading || !data ? (
        <Loader message={t('teachersList_loadingTeachers')} />
      ) : (
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
      )}
    </Screen>
  );
}
