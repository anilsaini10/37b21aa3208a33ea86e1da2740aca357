/** Teacher — quick-reference list of assigned classes & subjects. */
import React from 'react';
import {FlatList, RefreshControl} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useTheme, useThemedStyles} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {
  Screen,
  CustomHeader,
  CustomCard,
  EmptyState,
  AppText,
} from '../../../shared/components';
import {useTeacherClassesSubjects} from '../teacherSyllabus.service';
import type {TeacherSyllabusAssignment as TeacherCS} from '../../../shared/types/syllabus';

export function TeacherClassesSubjectsScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const navigation = useNavigation();
  const {data, isLoading, refetch} = useTeacherClassesSubjects();

  const styles = useThemedStyles(t2 => ({
    list: {paddingHorizontal: t2.spacing.lg, paddingBottom: t2.spacing.xxl},
    card: {marginBottom: t2.spacing.md},
  }));

  const renderItem = ({item}: {item: TeacherCS}) => (
    <CustomCard style={styles.card}>
      <AppText variant="bodyBold">{item.className} - {item.sectionName}</AppText>
      <AppText color="textSecondary">{item.subjectName}</AppText>
    </CustomCard>
  );

  return (
    <Screen padded={false}>
      <CustomHeader title={t('syllabus_myClassesSubjects')} onBack={() => navigation.goBack()} />
      <FlatList
        data={data ?? []}
        keyExtractor={(item, i) => `${item.classId}-${item.sectionId}-${item.subjectId}-${i}`}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState
              title={t('syllabus_noSubjects')}
              message={t('syllabus_noSubjectsMessage')}
              icon="empty"
            />
          ) : null
        }
      />
    </Screen>
  );
}
