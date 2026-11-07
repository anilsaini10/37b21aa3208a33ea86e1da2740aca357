/** Teacher Progress Report — grouped by teacher, expandable plans. */
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
  Icon,
  Loader,
  EmptyState,
} from '../../../shared/components';
import {formatSessionYear, scheduleStatusTone, progressBarColor} from '../../../shared/helpers';
import {useTeacherProgress} from '../adminSyllabus.service';
import type {AdminStackParamList} from '../../../navigation/types';

type Nav = NativeStackNavigationProp<AdminStackParamList>;

const YEARS = Array.from({length: 7}, (_, i) => {
  const y = 2024 + i;
  return {label: formatSessionYear(y), value: String(y)};
});

export function TeacherProgressScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const navigation = useNavigation<Nav>();
  const currentYear = new Date().getFullYear();
  const [sessionYear, setSessionYear] = useState(String(currentYear));
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const {data, isLoading, refetch, isRefetching} = useTeacherProgress({sessionYear: Number(sessionYear)});

  const toggleExpand = useCallback((id: string) => {
    setExpanded(prev => ({...prev, [id]: !prev[id]}));
  }, []);

  const styles = useThemedStyles(t2 => ({
    content: {padding: t2.spacing.lg, paddingBottom: t2.spacing.xxl},
    card: {marginBottom: t2.spacing.md},
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    planRow: {
      paddingVertical: t2.spacing.sm,
      borderTopWidth: 1,
      borderTopColor: t2.colors.divider,
    },
    progressBar: {height: 6, borderRadius: 3, marginTop: t2.spacing.xs},
    progressFill: {height: 6, borderRadius: 3},
  }));

  return (
    <Screen padded={false}>
      <CustomHeader title={t('syllabus_teacherProgress')} onBack={() => navigation.goBack()} />
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
          data.map(teacher => {
            const isExpanded = expanded[teacher.teacherId];
            return (
              <CustomCard key={teacher.teacherId} style={styles.card}>
                <Pressable onPress={() => toggleExpand(teacher.teacherId)} style={styles.header}>
                  <AppText variant="bodyBold">{teacher.teacherName}</AppText>
                  <Icon name={isExpanded ? 'up' : 'down'} size={18} color={theme.colors.textMuted} />
                </Pressable>
                {isExpanded &&
                  teacher.plans.map(plan => {
                    const pct = plan.avgCompletion ?? 0;
                    return (
                      <View key={plan.planId} style={styles.planRow}>
                        <Row justify="space-between">
                          <View style={{flex: 1}}>
                            <AppText>{plan.className} - {plan.sectionName}</AppText>
                            <AppText variant="caption" color="textSecondary">{plan.subjectName}</AppText>
                            <AppText variant="caption" color="textSecondary">
                              {plan.completedChapters}/{plan.totalChapters} {t('syllabus_chapters').toLowerCase()}
                            </AppText>
                          </View>
                          <Badge label={plan.scheduleStatus} tone={scheduleStatusTone(plan.scheduleStatus)} />
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
