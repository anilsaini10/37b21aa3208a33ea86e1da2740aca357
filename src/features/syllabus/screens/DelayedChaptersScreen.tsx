/** Delayed Chapters — sorted list with variance color coding. */
import React, {useState} from 'react';
import {FlatList, RefreshControl, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useThemedStyles} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {
  Screen,
  CustomHeader,
  CustomCard,
  Select,
  Badge,
  AppText,
  Row,
  Loader,
  EmptyState,
} from '../../../shared/components';
import {formatSessionYear, progressBarColor} from '../../../shared/helpers';
import {useDelayedChapters} from '../adminSyllabus.service';
import type {DelayedChapterItem} from '../../../shared/types';
import type {AdminStackParamList} from '../../../navigation/types';

type Nav = NativeStackNavigationProp<AdminStackParamList>;

const YEARS = Array.from({length: 7}, (_, i) => {
  const y = 2024 + i;
  return {label: formatSessionYear(y), value: String(y)};
});

function varianceColor(v: number): string {
  if (v > 10) return '#EF4444';
  if (v > 5) return '#F59E0B';
  return '#9CA3AF';
}

export function DelayedChaptersScreen(): React.JSX.Element {
  const {t} = useLanguage();
  const navigation = useNavigation<Nav>();
  const currentYear = new Date().getFullYear();
  const [sessionYear, setSessionYear] = useState(String(currentYear));

  const {data, isLoading, refetch, isRefetching} = useDelayedChapters({sessionYear: Number(sessionYear)});

  const styles = useThemedStyles(t2 => ({
    content: {paddingHorizontal: t2.spacing.lg, paddingBottom: t2.spacing.xl},
    filter: {paddingHorizontal: t2.spacing.lg, paddingTop: t2.spacing.sm},
    card: {marginBottom: t2.spacing.md},
    progressBar: {height: 6, borderRadius: 3, marginTop: t2.spacing.xs},
    progressFill: {height: 6, borderRadius: 3},
    varianceBadge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 12,
    },
  }));

  const renderItem = ({item}: {item: DelayedChapterItem}) => {
    const pct = item.completionPercentage ?? 0;
    const vColor = varianceColor(Math.abs(item.variance));
    return (
      <CustomCard style={styles.card}>
        <Row justify="space-between" align="flex-start">
          <View style={{flex: 1}}>
            <AppText variant="bodyBold">Ch {item.chapterNumber}: {item.chapterName}</AppText>
            <AppText variant="caption" color="textSecondary">{item.className} - {item.sectionName}</AppText>
            <AppText variant="caption" color="textSecondary">{item.subjectName}</AppText>
            <AppText variant="caption" color="textSecondary">{item.teacherName}</AppText>
          </View>
          <View style={[styles.varianceBadge, {backgroundColor: vColor + '22'}]}>
            <AppText variant="label" style={{color: vColor}}>
              {item.variance > 0 ? '+' : ''}{item.variance}d
            </AppText>
          </View>
        </Row>
        <Row justify="space-between">
          <AppText variant="caption" color="textSecondary">
            {t('syllabus_expectedDays')}: {item.expectedWorkingDays}
          </AppText>
          <AppText variant="caption" color="textSecondary">
            {t('syllabus_actualDays')}: {item.actualWorkingDays}
          </AppText>
          <AppText variant="caption" color="textSecondary">{Math.round(pct)}%</AppText>
        </Row>
        <View style={[styles.progressBar, {backgroundColor: progressBarColor(pct) + '22'}]}>
          <View style={[styles.progressFill, {width: `${Math.min(pct, 100)}%`, backgroundColor: progressBarColor(pct)}]} />
        </View>
      </CustomCard>
    );
  };

  return (
    <Screen padded={false}>
      <CustomHeader title={t('syllabus_delayedChapters')} onBack={() => navigation.goBack()} />
      <View style={styles.filter}>
        <Select label={t('syllabus_sessionYear')} value={sessionYear} options={YEARS} onChange={setSessionYear} />
      </View>

      {isLoading ? (
        <Loader />
      ) : !data?.length ? (
        <EmptyState title={t('syllabus_noDelayed')} message={t('syllabus_noDelayedMessage')} icon="check" />
      ) : (
        <FlatList
          data={data}
          keyExtractor={item => item.planChapterId}
          renderItem={renderItem}
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />}
        />
      )}
    </Screen>
  );
}
