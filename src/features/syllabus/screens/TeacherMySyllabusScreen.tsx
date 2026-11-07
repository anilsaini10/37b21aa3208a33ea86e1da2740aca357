/** Teacher — assigned syllabus plans list with filters. */
import React, {useMemo, useState} from 'react';
import {Alert, FlatList, RefreshControl, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme, useThemedStyles} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {
  Screen,
  Row,
  Spacer,
  CustomHeader,
  CustomCard,
  Badge,
  Select,
  EmptyState,
  AppText,
} from '../../../shared/components';
import {
  progressBarColor,
  formatSessionYear,
  planStatusTone,
} from '../../../shared/helpers';
import {useTeacherSyllabusList, useTeacherClassesSubjects} from '../teacherSyllabus.service';
import type {TeacherPlan, SelectOption} from '../../../shared/types';
import type {TeacherStackParamList} from '../../../navigation/types';
import {ScreenNames} from '../../../navigation/ScreenNames';

type Nav = NativeStackNavigationProp<TeacherStackParamList>;

const currentYear = new Date().getFullYear();
const YEAR_OPTIONS: SelectOption[] = Array.from({length: 7}, (_, i) => {
  const y = 2024 + i;
  return {label: formatSessionYear(y), value: String(y)};
});

export function TeacherMySyllabusScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const navigation = useNavigation<Nav>();

  const [sessionYear, setSessionYear] = useState(String(currentYear));
  const [classId, setClassId] = useState<string | undefined>();
  const [subjectId, setSubjectId] = useState<string | undefined>();

  const {data: plans, isLoading, refetch} = useTeacherSyllabusList({
    sessionYear: Number(sessionYear),
    classId,
    subjectId,
  });
  const {data: classesSubjects} = useTeacherClassesSubjects();

  const classOptions = useMemo(() => {
    if (!classesSubjects) return [];
    const seen = new Map<string, string>();
    classesSubjects.forEach(cs => {
      const key = `${cs.classId}-${cs.sectionId}`;
      if (!seen.has(key)) seen.set(key, `${cs.className} - ${cs.sectionName}`);
    });
    return Array.from(seen, ([value, label]) => ({label, value: value.split('-')[0]}));
  }, [classesSubjects]);

  const subjectOptions = useMemo(() => {
    if (!classesSubjects) return [];
    const seen = new Map<string, string>();
    classesSubjects.forEach(cs => {
      if (!seen.has(cs.subjectId)) seen.set(cs.subjectId, cs.subjectName);
    });
    return Array.from(seen, ([value, label]) => ({label, value}));
  }, [classesSubjects]);

  const styles = useThemedStyles(t2 => ({
    filters: {paddingHorizontal: t2.spacing.lg, paddingBottom: t2.spacing.sm},
    list: {paddingHorizontal: t2.spacing.lg, paddingBottom: t2.spacing.xxl},
    progressBar: {
      height: 6,
      borderRadius: 3,
      backgroundColor: t2.colors.border,
      marginTop: t2.spacing.xs,
    },
    progressFill: {
      height: 6,
      borderRadius: 3,
    },
  }));

  const renderPlan = ({item}: {item: TeacherPlan}) => {
    const pct = item.avgCompletion ?? 0;
    return (
      <CustomCard
        onPress={() => navigation.navigate(ScreenNames.TeacherSyllabusPlanDetail as any, {planId: item.id})}
        style={{marginBottom: theme.spacing.md}}>
        <Row justify="space-between" align="flex-start">
          <View style={{flex: 1}}>
            <AppText variant="bodyBold">{item.className} - {item.sectionName}</AppText>
            <AppText color="textSecondary">{item.subjectName}</AppText>
          </View>
          <Badge label={item.status} tone={planStatusTone(item.status)} />
        </Row>
        <Spacer size={theme.spacing.sm} />
        <Row justify="space-between">
          <AppText variant="caption" color="textSecondary">
            {t('syllabus_completion')}: {pct}%
          </AppText>
          <AppText variant="caption" color="textSecondary">
            {item.completedChapters ?? 0}/{item.totalChapters ?? 0} {t('syllabus_chapters')}
          </AppText>
        </Row>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, {width: `${pct}%`, backgroundColor: progressBarColor(pct)}]} />
        </View>
      </CustomCard>
    );
  };

  return (
    <Screen padded={false}>
      <CustomHeader title={t('syllabus_mySyllabus')} onBack={() => navigation.goBack()} />
      <View style={styles.filters}>
        <Select
          label={t('syllabus_sessionYear')}
          value={sessionYear}
          options={YEAR_OPTIONS}
          onChange={setSessionYear}
        />
        <Row gap={theme.spacing.sm}>
          <View style={{flex: 1}}>
            <Select
              label={t('class')}
              value={classId}
              options={classOptions}
              onChange={v => { setClassId(v); setSubjectId(undefined); }}
              placeholder={t('common_all')}
            />
          </View>
          <View style={{flex: 1}}>
            <Select
              label={t('syllabus_subject')}
              value={subjectId}
              options={subjectOptions}
              onChange={setSubjectId}
              placeholder={t('common_all')}
            />
          </View>
        </Row>
      </View>

      <FlatList
        data={plans ?? []}
        keyExtractor={item => item.id}
        renderItem={renderPlan}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState
              title={t('syllabus_noAssignedPlans')}
              message={t('syllabus_noAssignedPlansMessage')}
              icon="empty"
            />
          ) : null
        }
      />
    </Screen>
  );
}
