/** Homework class list — every class, grouped by section when the class has any. */
import React from 'react';
import {ScrollView, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useThemedStyles} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {db} from '../../../core/mock/db';
import {
  Screen,
  CustomHeader,
  CustomCard,
  ListRow,
  SectionTitle,
  Divider,
  EmptyState,
} from '../../../shared/components';
import type {TeacherStackParamList} from '../../../navigation/types';
import {ScreenNames} from '../../../navigation/ScreenNames';
import type {SchoolClass} from '../../../shared/types';

type Nav = NativeStackNavigationProp<TeacherStackParamList>;

export function HomeWorkClassListScreen(): React.JSX.Element {
  const styles = useThemedStyles(theme => ({
    scrollContent: {
      padding: theme.spacing.lg,
      flexGrow: 1,
    },
    card: {
      marginBottom: theme.spacing.sm,
      padding: theme.spacing.sm,
      borderWidth: 0,
      shadowOpacity: theme.dark ? 0.4 : 0.12,
      shadowRadius: 10,
      shadowOffset: {width: 0, height: 4},
      elevation: 6,
    },
  }));
  const {t} = useLanguage();
  const navigation = useNavigation<Nav>();
  const classes: SchoolClass[] = db.classes;

  const openClass = (cls: SchoolClass): void => {
    navigation.navigate(ScreenNames.HomeworkList, {classId: cls.id, className: cls.name});
  };

  const openSection = (cls: SchoolClass, section: SchoolClass['sections'][number]): void => {
    navigation.navigate(ScreenNames.HomeworkList, {
      classId: cls.id,
      className: cls.name,
      sectionId: section.id,
      sectionName: section.name,
    });
  };

  return (
    <Screen padded={false}>
      <CustomHeader title={t('homeworkClassList_headerTitle')} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {classes.length === 0 ? (
          <EmptyState
            icon="class"
            title={t('classList_emptyTitle')}
            message={t('classList_emptyMessage')}
          />
        ) : (
          classes.map(cls => (
            <View key={cls.id}>
              <SectionTitle title={cls.name} />
              {cls.sections.length > 0 ? (
                <CustomCard style={styles.card}>
                  {cls.sections.map((section, index) => (
                    <View key={section.id}>
                      {index > 0 ? <Divider /> : null}
                      <ListRow
                        icon="homework"
                        title={t('classList_sectionLabel', {name: section.name})}
                        subtitle={t('classList_studentCount', {count: section.studentCount})}
                        onPress={() => openSection(cls, section)}
                      />
                    </View>
                  ))}
                </CustomCard>
              ) : (
                <CustomCard style={styles.card}>
                  <ListRow
                    icon="homework"
                    title={cls.name}
                    subtitle={t('classList_studentCount', {count: cls.totalStudents})}
                    onPress={() => openClass(cls)}
                  />
                </CustomCard>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </Screen>
  );
}
