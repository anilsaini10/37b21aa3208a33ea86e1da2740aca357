/** Students-wise class list — every class as an accent-colored card, sections as tappable chips. */
import React from 'react';
import {ScrollView} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useThemedStyles} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {
  Screen,
  CustomHeader,
  ClassCard,
  classCardAccent,
  EmptyState,
  Loader,
} from '../../../shared/components';
import {useClasses} from '../../classes/classes.service';
import type {AdminStackParamList} from '../../../navigation/types';
import {ScreenNames} from '../../../navigation/ScreenNames';
import type {SchoolClass, Section} from '../../../shared/types';

type Nav = NativeStackNavigationProp<AdminStackParamList>;

export function StudentsWiseClassListScreen(): React.JSX.Element {
  const styles = useThemedStyles(theme => ({
    scrollContent: {
      padding: theme.spacing.lg,
      flexGrow: 1,
    },
  }));
  const {t} = useLanguage();
  const navigation = useNavigation<Nav>();
  const {data: classes, isLoading, isError, error, refetch} = useClasses();

  const openClass = (cls: SchoolClass): void => {
    navigation.navigate(ScreenNames.StudentsList, {
      classId: cls.id,
      className: cls.name,
      sections: cls.sections.map(s => ({id: s.id, name: s.name, studentCount: s.studentCount})),
    });
  };

  const openSection = (cls: SchoolClass, section: Section): void => {
    navigation.navigate(ScreenNames.StudentsList, {
      classId: cls.id,
      className: cls.name,
      sectionId: section.id,
      sectionName: section.name,
      sections: cls.sections.map(s => ({id: s.id, name: s.name, studentCount: s.studentCount})),
    });
  };

  if (isError) {
    return (
      <Screen padded={false}>
        <CustomHeader title={t('studentsWiseClassList_headerTitle')} subtitle={t('studentsWiseClassList_subtitle')} />
        <EmptyState
          icon="warning"
          title={t('common_somethingWentWrong')}
          message={(error as {message?: string} | null)?.message ?? t('common_checkConnection')}
          actionLabel={t('common_retry')}
          onAction={() => refetch()}
        />
      </Screen>
    );
  }

  if (isLoading || !classes) {
    return <Loader message={t('classesManage_loading')} />;
  }

  return (
    <Screen padded={false}>
      <CustomHeader title={t('studentsWiseClassList_headerTitle')} subtitle={t('studentsWiseClassList_subtitle')} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {classes.length === 0 ? (
          <EmptyState icon="class" title={t('classList_emptyTitle')} message={t('classList_emptyMessage')} />
        ) : (
          classes.map((cls, index) => (
            <ClassCard
              key={cls.id}
              name={cls.name}
              subtitle={t('classList_studentCount', {count: cls.totalStudents})}
              accent={classCardAccent(index)}
              onPress={() => openClass(cls)}
              sections={cls.sections.map(section => ({
                key: section.id,
                label: `${section.name} (${section.studentCount})`,
                onPress: () => openSection(cls, section),
              }))}
            />
          ))
        )}
      </ScrollView>
    </Screen>
  );
}
