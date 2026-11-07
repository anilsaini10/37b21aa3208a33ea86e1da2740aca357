/** Class Progress Report — grouped by class, expandable sections. */
import React, {useState, useCallback} from 'react';
import {Pressable, RefreshControl, ScrollView, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme, useThemedStyles} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {
  Screen,
  CustomHeader,
  CustomCard,
  Select,
  Badge,
  AppText,
  Row,
  Spacer,
  Icon,
  Loader,
  EmptyState,
} from '../../../shared/components';
import {formatSessionYear, scheduleStatusTone, progressBarColor} from '../../../shared/helpers';
import {useClassProgress} from '../adminSyllabus.service';
import type {AdminStackParamList} from '../../../navigation/types';

type Nav = NativeStackNavigationProp<AdminStackParamList>;

const YEARS = Array.from({length: 7}, (_, i) => {
  const y = 2024 + i;
  return {label: formatSessionYear(y), value: String(y)};
});

export function ClassProgressScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const navigation = useNavigation<Nav>();
  const currentYear = new Date().getFullYear();
  const [sessionYear, setSessionYear] = useState(String(currentYear));
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const {data, isLoading, refetch, isRefetching} = useClassProgress({sessionYear: Number(sessionYear)});

  const toggleExpand = useCallback((id: string) => {
    setExpanded(prev => ({...prev, [id]: !prev[id]}));
  }, []);

  const styles = useThemedStyles(t2 => ({
    content: {padding: t2.spacing.lg, paddingBottom: t2.spacing.xxl},
    classCard: {marginBottom: t2.spacing.md},
    classHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    sectionRow: {
      paddingVertical: t2.spacing.sm,
      borderTopWidth: 1,
      borderTopColor: t2.colors.divider,
    },
    progressBar: {height: 6, borderRadius: 3, marginTop: t2.spacing.xs},
    progressFill: {height: 6, borderRadius: 3},
  }));

  return (
    <Screen padded={false}>
      <CustomHeader title={t('syllabus_classProgress')} onBack={() => navigation.goBack()} />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />}
        showsVerticalScrollIndicator={false}>
        <Select label={t('syllabus_sessionYear')} value={sessionYear} options={YEARS} onChange={setSessionYear} />

        {isLoading ? (
          <Loader />
        ) : !data?.length ? (
          <EmptyState title={t('syllabus_noPlans')} message={t('syllabus_noPlansMessage')} />
        ) : (
          data.map(cls => {
            const isExpanded = expanded[cls.classId];
            return (
              <CustomCard key={cls.classId} style={styles.classCard}>
                <Pressable onPress={() => toggleExpand(cls.classId)} style={styles.classHeader}>
                  <AppText variant="bodyBold">{cls.className}</AppText>
                  <Icon name={isExpanded ? 'up' : 'down'} size={18} color={theme.colors.textMuted} />
                </Pressable>
                {isExpanded &&
                  cls.sections.map(sec => {
                    const pct = sec.avgCompletion ?? 0;
                    return (
                      <View key={`${sec.sectionId}-${sec.subjectId}`} style={styles.sectionRow}>
                        <Row justify="space-between">
                          <View style={{flex: 1}}>
                            <AppText>{sec.sectionName} · {sec.subjectName}</AppText>
                            <AppText variant="caption" color="textSecondary">
                              {sec.completedChapters}/{sec.totalChapters} {t('syllabus_chapters').toLowerCase()}
                            </AppText>
                          </View>
                          <Badge label={sec.scheduleStatus} tone={scheduleStatusTone(sec.scheduleStatus)} />
                        </Row>
                        <Row justify="space-between">
                          <AppText variant="caption" color="textSecondary">{Math.round(pct)}%</AppText>
                        </Row>
                        <View style={[styles.progressBar, {backgroundColor: progressBarColor(pct) + '22'}]}>
                          <View style={[styles.progressFill, {width: `${Math.min(pct, 100)}%`, backgroundColor: progressBarColor(pct)}]} />
                        </View>
                      </View>
                    );
                  })}
              </CustomCard>
            );
          })
        )}
      </ScrollView>
    </Screen>
  );
}
