/** Exam detail → Marks tab (admin) — papers with marking progress; tap one to view / override its marks. */
import React, {useState} from 'react';
import {RefreshControl, ScrollView, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme, useThemedStyles} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {AppText, Badge, CustomCard, EmptyState, Icon, Loader, Row, Spacer} from '../../../shared/components';
import {formatPaperDate, isPaperHeld} from '../examSchedule.utils';
import {useExamClasses} from '../adminExams.service';
import {useExamSchedule} from '../examSchedule.service';
import {Chip, dayLabel} from './examUi';
import {ScreenNames} from '../../../navigation/ScreenNames';
import type {AdminStackParamList} from '../../../navigation/types';

type Nav = NativeStackNavigationProp<AdminStackParamList>;

export function MarksTab({examId}: {examId: string}): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const navigation = useNavigation<Nav>();
  const [classFilter, setClassFilter] = useState('');

  const {data, isLoading, isRefetching, isError, error, refetch} = useExamSchedule(examId, classFilter || undefined);
  const {data: examClasses} = useExamClasses(examId);

  const styles = useThemedStyles(t2 => ({
    content: {padding: t2.spacing.lg, flexGrow: 1},
    chipsRow: {columnGap: t2.spacing.sm, paddingRight: t2.spacing.lg},
    card: {marginBottom: t2.spacing.sm},
    track: {height: 6, borderRadius: 3, backgroundColor: t2.colors.surfaceVariant, overflow: 'hidden'},
    fill: {height: '100%', borderRadius: 3, backgroundColor: t2.colors.primary},
    note: {
      flexDirection: 'row',
      columnGap: t2.spacing.sm,
      padding: t2.spacing.md,
      borderRadius: t2.radius.md,
      backgroundColor: t2.colors.surfaceVariant,
      marginBottom: t2.spacing.md,
    },
  }));

  const studentCountByClass = new Map((examClasses ?? []).map(c => [c.classId, c.studentCount]));

  if (isError) {
    return (
      <EmptyState
        icon="warning"
        title={t('common_somethingWentWrong')}
        message={(error as {message?: string} | null)?.message ?? t('common_checkConnection')}
        actionLabel={t('common_retry')}
        onAction={() => refetch()}
      />
    );
  }
  if (isLoading || !data) {
    return <Loader message={t('dateSheet_loading')} />;
  }

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />}>
      <View style={styles.note}>
        <Icon name="info" size={16} color={theme.colors.info} />
        <AppText variant="caption" color="textSecondary" style={{flex: 1}}>
          {t('paperMarks_overrideNote')}
        </AppText>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
        <Chip label={t('common_all')} active={!classFilter} onPress={() => setClassFilter('')} />
        {(examClasses ?? []).map(c => (
          <Chip
            key={c.classId}
            label={c.className}
            active={classFilter === c.classId}
            onPress={() => setClassFilter(c.classId)}
          />
        ))}
      </ScrollView>
      <Spacer size={theme.spacing.md} />

      {data.items.length === 0 ? (
        <EmptyState icon="exam" title={t('dateSheet_empty')} message={t('paperMarks_noPapersMessage')} />
      ) : (
        data.items.map(p => {
          const total = studentCountByClass.get(p.classId);
          const held = isPaperHeld(p.date);
          return (
            <CustomCard
              key={p.id}
              style={styles.card}
              onPress={() => navigation.navigate(ScreenNames.PaperMarks, {examId, scheduleId: p.id, paper: p})}>
              <Row justify="space-between" align="flex-start">
                <View style={{flex: 1}}>
                  <AppText variant="bodyBold">
                    {p.className} · {p.subjectName}
                  </AppText>
                  <AppText variant="label" color="textMuted">
                    {dayLabel(p.date, t)}, {p.startTime}–{p.endTime} · {t('dateSheet_maxMarksValue', {max: p.maxMarks})}
                  </AppText>
                </View>
                {!held ? (
                  <Badge label={t('paperMarks_availableFrom', {date: formatPaperDate(p.date)})} tone="warning" />
                ) : null}
              </Row>
              <Spacer size={theme.spacing.sm} />
              <View style={styles.track}>
                <View
                  style={[styles.fill, {width: `${total ? Math.min(1, p.markedCount / total) * 100 : 0}%`}]}
                />
              </View>
              <Spacer size={theme.spacing.xs} />
              <AppText variant="caption" color="textSecondary">
                {total !== undefined
                  ? t('paperMarks_progress', {marked: p.markedCount, total})
                  : t('dateSheet_markedValue', {count: p.markedCount})}
              </AppText>
            </CustomCard>
          );
        })
      )}
      <Spacer size={24} />
    </ScrollView>
  );
}
