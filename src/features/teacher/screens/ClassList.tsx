/** Class list — every class, grouped by section when the class has any. */
import React from 'react';
import {Pressable, ScrollView, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme, useThemedStyles} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {db} from '../../../core/mock/db';
import {
  Screen,
  CustomHeader,
  CustomCard,
  ListRow,
  SectionTitle,
  Icon,
  Divider,
  EmptyState,
} from '../../../shared/components';
import type {TeacherStackParamList} from '../../../navigation/types';
import {ScreenNames} from '../../../navigation/ScreenNames';
import type {SchoolClass} from '../../../shared/types';

type Nav = NativeStackNavigationProp<TeacherStackParamList>;

export function ClassListScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const styles = useThemedStyles(theme2 => ({
    scrollContent: {
      padding: theme2.spacing.lg,
      flexGrow: 1,
    },
    card: {
      marginBottom: theme2.spacing.sm,
      padding: theme2.spacing.sm,
      borderWidth: 0,
      shadowOpacity: theme2.dark ? 0.4 : 0.12,
      shadowRadius: 10,
      shadowOffset: {width: 0, height: 4},
      elevation: 6,
    },
    attendanceButton: {
      padding: theme2.spacing.xs,
    },
  }));
  const {t} = useLanguage();
  const navigation = useNavigation<Nav>();
  const classes: SchoolClass[] = db.classes;

  const openClass = (cls: SchoolClass): void => {
    navigation.navigate(ScreenNames.ClassStudents, {classId: cls.id, className: cls.name});
  };

  const openSection = (cls: SchoolClass, section: SchoolClass['sections'][number]): void => {
    navigation.navigate(ScreenNames.ClassStudents, {
      classId: cls.id,
      className: cls.name,
      sectionId: section.id,
      sectionName: section.name,
    });
  };

  const takeAttendance = (cls: SchoolClass, section: SchoolClass['sections'][number]): void => {
    navigation.navigate(ScreenNames.MarkAttendance, {
      classId: cls.id,
      className: cls.name,
      sectionId: section.id,
      sectionName: section.name,
    });
  };

  return (
    <Screen padded={false}>
      <CustomHeader title={t('classList_headerTitle')} />
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
                        icon="class"
                        title={t('classList_sectionLabel', {name: section.name})}
                        subtitle={t('classList_studentCount', {count: section.studentCount})}
                        onPress={() => openSection(cls, section)}
                        right={
                          <Pressable
                            onPress={() => takeAttendance(cls, section)}
                            hitSlop={8}
                            style={styles.attendanceButton}>
                            <Icon name="attendance" size={22} color={theme.colors.primary} />
                          </Pressable>
                        }
                      />
                    </View>
                  ))}
                </CustomCard>
              ) : (
                <CustomCard style={styles.card}>
                  <ListRow
                    icon="class"
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
