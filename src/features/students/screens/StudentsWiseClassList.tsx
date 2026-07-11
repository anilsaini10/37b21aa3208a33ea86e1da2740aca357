/** Students-wise class list — every class as a card, sections as tappable chips. */
import React from 'react';
import {Pressable, ScrollView} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useThemedStyles} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {
  Screen,
  CustomHeader,
  CustomCard,
  AppText,
  Badge,
  Row,
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
    card: {
      marginBottom: theme.spacing.md,
      padding: theme.spacing.md,
      borderWidth: 0,
      shadowOpacity: theme.dark ? 0.4 : 0.12,
      shadowRadius: 10,
      shadowOffset: {width: 0, height: 4},
      elevation: 6,
    },
    chipsRow: {rowGap: theme.spacing.sm, marginTop: theme.spacing.sm},
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
        <CustomHeader title={t('studentsWiseClassList_headerTitle')} />
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
      <CustomHeader title={t('studentsWiseClassList_headerTitle')} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {classes.length === 0 ? (
          <EmptyState icon="class" title={t('classList_emptyTitle')} message={t('classList_emptyMessage')} />
        ) : (
          classes.map(cls => (
            <CustomCard key={cls.id} style={styles.card} onPress={() => openClass(cls)}>
              <AppText variant="h3">{cls.name}</AppText>
              <AppText variant="caption" color="textSecondary">
                {t('classList_studentCount', {count: cls.totalStudents})}
              </AppText>
              {cls.sections.length > 0 ? (
                <Row wrap style={styles.chipsRow}>
                  {cls.sections.map(section => (
                    <Pressable key={section.id} onPress={() => openSection(cls, section)}>
                      <Badge label={`${section.name} (${section.studentCount})`} tone="primary" />
                    </Pressable>
                  ))}
                </Row>
              ) : null}
            </CustomCard>
          ))
        )}
      </ScrollView>
    </Screen>
  );
}
