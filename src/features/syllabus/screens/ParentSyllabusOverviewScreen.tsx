/** Parent syllabus overview — child selector, session year, subject cards with progress. */
import React, {useEffect, useMemo, useState} from 'react';
import {FlatList, RefreshControl, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme, useThemedStyles} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {
  Screen,
  CustomHeader,
  CustomCard,
  Badge,
  Select,
  EmptyState,
  AppText,
  Row,
  Spacer,
} from '../../../shared/components';
import {
  progressBarColor,
  formatSessionYear,
  scheduleStatusTone,
} from '../../../shared/helpers';
import {useParentProfile} from '../../parent/parentStudents.service';
import {useParentSyllabusOverview} from '../parentSyllabus.service';
import type {ParentStackParamList} from '../../../navigation/types';
import type {ParentSubjectSyllabus} from '../../../shared/types';
import {ScreenNames} from '../../../navigation/ScreenNames';

type Nav = NativeStackNavigationProp<ParentStackParamList>;

const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({length: 7}, (_, i) => {
  const y = 2024 + i;
  return {label: formatSessionYear(y), value: String(y)};
});

export function ParentSyllabusOverviewScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const navigation = useNavigation<Nav>();

  const {data: profile} = useParentProfile();
  const children = profile?.children ?? [];
  const childOptions = useMemo(
    () => children.map(c => ({label: c.name, value: c.id})),
    [children],
  );

  const [studentId, setStudentId] = useState<string | undefined>();
  const [sessionYear, setSessionYear] = useState(String(currentYear));

  useEffect(() => {
    if (!studentId && children.length > 0) {
      setStudentId(children[0].id);
    }
  }, [children, studentId]);

  const {data, isLoading, refetch} = useParentSyllabusOverview(
    studentId,
    Number(sessionYear),
  );

  const styles = useThemedStyles(t2 => ({
    filters: {
      flexDirection: 'row',
      columnGap: t2.spacing.sm,
      paddingHorizontal: t2.spacing.lg,
    },
    filterItem: {flex: 1},
    list: {paddingHorizontal: t2.spacing.lg, paddingBottom: t2.spacing.xl},
    progressBar: {
      height: 6,
      borderRadius: 3,
      backgroundColor: t2.colors.border,
      marginTop: t2.spacing.xs,
    },
    progressFill: {height: 6, borderRadius: 3},
    row: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  }));

  const renderSubject = ({item}: {item: ParentSubjectSyllabus}) => {
    const pct = Math.round(item.avgCompletion);
    return (
      <CustomCard
        onPress={() =>
          navigation.navigate(ScreenNames.ParentSubjectProgress as any, {
            subjectId: item.subjectId,
            studentId: studentId!,
          })
        }
        style={{marginBottom: theme.spacing.md}}>
        <Row justify="space-between" align="flex-start">
          <View style={{flex: 1}}>
            <AppText variant="bodyBold">{item.subjectName}</AppText>
            {item.teacherName ? (
              <AppText variant="caption" color="textSecondary">
                {item.teacherName}
              </AppText>
            ) : null}
          </View>
          {item.scheduleStatus ? (
            <Badge
              label={t(`syllabus_${item.scheduleStatus.toLowerCase()}` as any)}
              tone={scheduleStatusTone(item.scheduleStatus)}
            />
          ) : null}
        </Row>
        <Spacer size={theme.spacing.sm} />
        <View style={styles.row}>
          <AppText variant="caption" color="textSecondary">
            {item.completedChapters}/{item.totalChapters} {t('syllabus_chapters')}
          </AppText>
          <AppText variant="caption" color="textSecondary">
            {pct}%
          </AppText>
        </View>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {width: `${pct}%`, backgroundColor: progressBarColor(pct)},
            ]}
          />
        </View>
      </CustomCard>
    );
  };

  return (
    <Screen padded={false}>
      <CustomHeader
        title={t('syllabus_childSyllabus')}
        onBack={() => navigation.goBack()}
      />
      <Spacer size={theme.spacing.md} />
      <View style={styles.filters}>
        <View style={styles.filterItem}>
          <Select
            label={t('syllabus_selectChild')}
            value={studentId}
            options={childOptions}
            onChange={setStudentId}
          />
        </View>
        <View style={styles.filterItem}>
          <Select
            label={t('syllabus_sessionYear')}
            value={sessionYear}
            options={YEAR_OPTIONS}
            onChange={setSessionYear}
          />
        </View>
      </View>
      <FlatList
        data={data ?? []}
        keyExtractor={item => item.subjectId}
        renderItem={renderSubject}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
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
