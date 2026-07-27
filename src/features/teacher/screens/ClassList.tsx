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
  ClassCard,
  classCardAccent,
  AppText,
  Icon,
  Row,
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
    attendanceButton: {
      padding: theme2.spacing.xs,
    },
    sectionRow: {
      paddingVertical: theme2.spacing.xs,
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
          classes.map((cls, classIndex) => {
            const subjectsLabel = cls.mySubjects.map(s => s.subjectName).join(', ');
            const singleSection = cls.sections.length === 1 ? cls.sections[0] : null;
            const subtitle = subjectsLabel
              ? `${t('classList_studentCount', {count: cls.totalStudents})} · ${t('classList_subjectsTaught', {subjects: subjectsLabel})}`
              : t('classList_studentCount', {count: cls.totalStudents});

            if (singleSection) {
              return (
                <ClassCard
                  key={cls.classId}
                  name={cls.className}
                  subtitle={subtitle}
                  accent={classCardAccent(classIndex)}
                  onPress={() => openSection(cls, singleSection)}
                  rightSlot={
                    <Pressable
                      onPress={() => takeAttendance(cls, singleSection)}
                      hitSlop={8}
                      style={styles.attendanceButton}>
                      <Icon name="attendance" size={22} color={theme.colors.primary} />
                    </Pressable>
                  }
                />
              );
            }

            return (
              <ClassCard key={cls.classId} name={cls.className} subtitle={subtitle} accent={classCardAccent(classIndex)}>
                <Divider dashed />
                {cls.sections.map((section, index) => (
                  <View key={section.sectionId}>
                    {index > 0 ? <Divider /> : null}
                    <Row justify="space-between" align="center" style={styles.sectionRow}>
                      <Pressable onPress={() => openSection(cls, section)} style={{flex: 1}}>
                        <AppText variant="bodyBold">{t('classList_sectionLabel', {name: section.sectionName})}</AppText>
                        <AppText variant="caption" color="textSecondary">
                          {t('classList_studentCount', {count: section.studentCount})}
                        </AppText>
                      </Pressable>
                      <Pressable
                        onPress={() => takeAttendance(cls, section)}
                        hitSlop={8}
                        style={styles.attendanceButton}>
                        <Icon name="attendance" size={22} color={theme.colors.primary} />
                      </Pressable>
                    </Row>
                  </View>
                ))}
              </ClassCard>
            );
          })
        )}
      </ScrollView>
    </Screen>
  );
}
