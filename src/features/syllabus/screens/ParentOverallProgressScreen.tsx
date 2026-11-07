/** Parent overall progress — overall completion %, per-subject breakdown. */
import React, {useEffect, useMemo, useState} from 'react';
import {FlatList, RefreshControl, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
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
import {useParentSyllabusProgress} from '../parentSyllabus.service';

const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({length: 7}, (_, i) => {
  const y = 2024 + i;
  return {label: formatSessionYear(y), value: String(y)};
});

export function ParentOverallProgressScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const navigation = useNavigation();

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

  const {data, isLoading, refetch} = useParentSyllabusProgress(
    studentId,
    Number(sessionYear),
  );

  const overallPct = data ? Math.round(data.overallCompletion) : 0;
  const subjects = data?.subjects ?? [];

  const styles = useThemedStyles(t2 => ({
    filters: {
      flexDirection: 'row',
      columnGap: t2.spacing.sm,
      paddingHorizontal: t2.spacing.lg,
    },
    filterItem: {flex: 1},
    content: {paddingHorizontal: t2.spacing.lg, paddingBottom: t2.spacing.xl},
    overallCard: {
      alignItems: 'center',
      paddingVertical: t2.spacing.xl,
    },
    bigPct: {
      fontSize: 48,
      fontWeight: '700',
    },
    overallBar: {
      height: 10,
      borderRadius: 5,
      backgroundColor: t2.colors.border,
      width: '100%',
      marginTop: t2.spacing.md,
    },
    overallFill: {height: 10, borderRadius: 5},
    subjectBar: {
      height: 6,
      borderRadius: 3,
      backgroundColor: t2.colors.border,
      marginTop: t2.spacing.xs,
    },
    subjectFill: {height: 6, borderRadius: 3},
  }));

  return (
    <Screen padded={false}>
      <CustomHeader
        title={t('syllabus_overallProgress')}
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
        data={subjects}
        keyExtractor={item => item.subjectId}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
        ListHeaderComponent={
          data ? (
            <>
              <CustomCard style={styles.overallCard}>
                <AppText style={[styles.bigPct, {color: progressBarColor(overallPct)}]}>
                  {overallPct}%
                </AppText>
                <AppText variant="caption" color="textSecondary">
                  {t('syllabus_avgCompletion')}
                </AppText>
                <View style={styles.overallBar}>
                  <View
                    style={[
                      styles.overallFill,
                      {
                        width: `${overallPct}%`,
                        backgroundColor: progressBarColor(overallPct),
                      },
                    ]}
                  />
                </View>
              </CustomCard>
              <Spacer size={theme.spacing.md} />
            </>
          ) : null
        }
        renderItem={({item}) => {
          const pct = Math.round(item.completion);
          return (
            <CustomCard style={{marginBottom: theme.spacing.sm}}>
              <Row justify="space-between" align="center">
                <AppText variant="bodyBold" style={{flex: 1}}>
                  {item.subjectName}
                </AppText>
                <Row gap={theme.spacing.sm}>
                  <AppText variant="caption">{pct}%</AppText>
                  {item.scheduleStatus ? (
                    <Badge
                      label={t(`syllabus_${item.scheduleStatus.toLowerCase()}` as any)}
                      tone={scheduleStatusTone(item.scheduleStatus)}
                    />
                  ) : null}
                </Row>
              </Row>
              <View style={styles.subjectBar}>
                <View
                  style={[
                    styles.subjectFill,
                    {width: `${pct}%`, backgroundColor: progressBarColor(pct)},
                  ]}
                />
              </View>
            </CustomCard>
          );
        }}
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState
              title={t('syllabus_noPlans')}
              message={t('syllabus_noPlansMessage')}
              icon="empty"
            />
          ) : null
        }
      />
    </Screen>
  );
}
