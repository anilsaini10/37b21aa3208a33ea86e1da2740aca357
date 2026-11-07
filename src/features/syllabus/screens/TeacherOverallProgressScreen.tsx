/** Teacher — overall syllabus progress summary dashboard. */
import React, {useState} from 'react';
import {RefreshControl, ScrollView, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useTheme, useThemedStyles} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {
  Screen,
  Spacer,
  CustomHeader,
  Select,
  StatGrid,
  Badge,
  Row,
  AppText,
} from '../../../shared/components';
import {formatSessionYear} from '../../../shared/helpers';
import {useTeacherSyllabusProgress} from '../teacherSyllabus.service';
import type {SelectOption, StatCard} from '../../../shared/types';

const currentYear = new Date().getFullYear();
const YEAR_OPTIONS: SelectOption[] = Array.from({length: 7}, (_, i) => {
  const y = 2024 + i;
  return {label: formatSessionYear(y), value: String(y)};
});

export function TeacherOverallProgressScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const navigation = useNavigation();

  const [sessionYear, setSessionYear] = useState(String(currentYear));
  const {data, isLoading, refetch} = useTeacherSyllabusProgress(Number(sessionYear));

  const styles = useThemedStyles(t2 => ({
    content: {padding: t2.spacing.lg},
    statusRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: t2.spacing.sm,
      marginTop: t2.spacing.md,
    },
  }));

  const stats: StatCard[] = data
    ? [
        {key: 'plans', label: t('syllabus_totalPlans'), value: data.totalPlans, icon: 'homework', accent: 'primary'},
        {key: 'chapters', label: t('syllabus_totalChapters'), value: data.totalChapters, icon: 'class', accent: 'info'},
        {key: 'completed', label: t('syllabus_completed'), value: data.completedChapters, icon: 'check', accent: 'success'},
        {key: 'avg', label: t('syllabus_avgCompletion'), value: `${data.avgCompletion}%`, icon: 'performance', accent: 'warning'},
      ]
    : [];

  return (
    <Screen padded={false}>
      <CustomHeader title={t('syllabus_overallProgress')} onBack={() => navigation.goBack()} />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
        showsVerticalScrollIndicator={false}>
        <Select
          label={t('syllabus_sessionYear')}
          value={sessionYear}
          options={YEAR_OPTIONS}
          onChange={setSessionYear}
        />

        {data ? (
          <>
            <StatGrid stats={stats} />

            <Spacer size={theme.spacing.lg} />
            <AppText variant="h3">{t('common_status')}</AppText>
            <View style={styles.statusRow}>
              <Badge label={`${t('syllabus_ahead')}: ${data.aheadCount}`} tone="success" />
              <Badge label={`${t('syllabus_onTrack')}: ${data.onTrackCount}`} tone="info" />
              <Badge label={`${t('syllabus_delayed')}: ${data.delayedCount}`} tone="error" />
              <Badge label={`${t('syllabus_inProgress')}: ${data.inProgressChapters}`} tone="info" />
              <Badge label={`${t('syllabus_notStarted')}: ${data.notStartedChapters}`} tone="neutral" />
            </View>
          </>
        ) : null}
      </ScrollView>
    </Screen>
  );
}
