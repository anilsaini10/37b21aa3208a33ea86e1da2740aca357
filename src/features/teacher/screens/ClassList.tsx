/** My Classes — only the classes this teacher actually teaches, grouped by section. */
import React from 'react';
import {Pressable, ScrollView, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme, useThemedStyles} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {
  Screen,
  CustomHeader,
  CustomCard,
  ListRow,
  SectionTitle,
  AppText,
  Icon,
  Divider,
  EmptyState,
  Loader,
} from '../../../shared/components';
import {useTeacherClasses} from '../teacherClasses.service';
import type {TeacherStackParamList} from '../../../navigation/types';
import {ScreenNames} from '../../../navigation/ScreenNames';
import type {TeacherClassSummary, TeacherClassSection} from '../../../shared/types';

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
    subjectsLine: {
      paddingHorizontal: theme2.spacing.sm,
      paddingTop: theme2.spacing.xs,
      paddingBottom: theme2.spacing.sm,
    },
    attendanceButton: {
      padding: theme2.spacing.xs,
    },
  }));
  const {t} = useLanguage();
  const navigation = useNavigation<Nav>();
  const {data: classes, isLoading, isError, error, refetch} = useTeacherClasses();

  const openSection = (cls: TeacherClassSummary, section: TeacherClassSection): void => {
    navigation.navigate(ScreenNames.ClassStudents, {
      classId: cls.classId,
      className: cls.className,
      sectionId: section.sectionId,
      sectionName: section.sectionName,
    });
  };

  const takeAttendance = (cls: TeacherClassSummary, section: TeacherClassSection): void => {
    navigation.navigate(ScreenNames.MarkAttendance, {
      classId: cls.classId,
      className: cls.className,
      sectionId: section.sectionId,
      sectionName: section.sectionName,
    });
  };

  if (isLoading) {
    return <Loader message={t('common_loading')} />;
  }

  if (isError || !classes) {
    return (
      <Screen padded={false}>
        <CustomHeader title={t('classList_headerTitle')} />
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

  return (
    <Screen padded={false}>
      <CustomHeader title={t('classList_headerTitle')} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {classes.length === 0 ? (
          <EmptyState
            icon="class"
            title={t('classList_teacherEmptyTitle')}
            message={t('classList_teacherEmptyMessage')}
          />
        ) : (
          classes.map(cls => {
            const subjectsLabel = cls.mySubjects.map(s => s.subjectName).join(', ');
            const singleSection = cls.sections.length === 1 ? cls.sections[0] : null;
            return (
              <View key={cls.classId}>
                <SectionTitle title={cls.className} />
                <CustomCard style={styles.card}>
                  {subjectsLabel ? (
                    <AppText variant="caption" color="textSecondary" style={styles.subjectsLine}>
                      {t('classList_subjectsTaught', {subjects: subjectsLabel})}
                    </AppText>
                  ) : null}
                  {singleSection ? (
                    <ListRow
                      icon="class"
                      title={cls.className}
                      subtitle={t('classList_studentCount', {count: cls.totalStudents})}
                      onPress={() => openSection(cls, singleSection)}
                      right={
                        <Pressable
                          onPress={() => takeAttendance(cls, singleSection)}
                          hitSlop={8}
                          style={styles.attendanceButton}>
                          <Icon name="attendance" size={22} color={theme.colors.primary} />
                        </Pressable>
                      }
                    />
                  ) : (
                    cls.sections.map((section, index) => (
                      <View key={section.sectionId}>
                        {index > 0 ? <Divider /> : null}
                        <ListRow
                          icon="class"
                          title={t('classList_sectionLabel', {name: section.sectionName})}
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
                    ))
                  )}
                </CustomCard>
              </View>
            );
          })
        )}
      </ScrollView>
    </Screen>
  );
}
