/** Teacher — My Schedule: read-only weekly view of this teacher's own periods (Mon-Sat), grouped by day. */
import React, {useState} from 'react';
import {Pressable, ScrollView, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useTheme, useThemedStyles} from '../../../core/theme';
import {useLanguage, type TranslationKey} from '../../../core/i18n';
import {Screen, CustomHeader, CustomCard, AppText, Icon, Row, Loader, EmptyState} from '../../../shared/components';
import {useWeekSchedule} from '../teacherSchedule.service';
import type {TeacherWeekDay} from '../../../shared/types';

const DAYS: TeacherWeekDay[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

const DAY_LABEL_KEYS: Record<TeacherWeekDay, TranslationKey> = {
  MONDAY: 'common_dayMon',
  TUESDAY: 'common_dayTue',
  WEDNESDAY: 'common_dayWed',
  THURSDAY: 'common_dayThu',
  FRIDAY: 'common_dayFri',
  SATURDAY: 'common_daySat',
};

export function MyScheduleScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const navigation = useNavigation();

  const [day, setDay] = useState<TeacherWeekDay>('MONDAY');
  const {data, isLoading} = useWeekSchedule();

  const styles = useThemedStyles(t2 => ({
    daySelectorWrap: {alignItems: 'center', marginTop: 10},
    dayScrollContent: {columnGap: t2.spacing.sm},
    dayPill: {
      paddingHorizontal: t2.spacing.lg,
      paddingVertical: t2.spacing.sm,
      borderRadius: t2.radius.pill,
    },
    periodsScrollContent: {padding: t2.spacing.lg, flexGrow: 1},
    periodCard: {marginBottom: t2.spacing.md},
    breakCard: {
      backgroundColor: t2.colors.warning + '14',
      borderColor: t2.colors.warning + '55',
    },
    periodNoBlock: {
      width: 52,
      alignItems: 'center',
      borderRightWidth: 1,
      borderRightColor: t2.colors.divider,
      paddingRight: t2.spacing.sm,
    },
    periodInfo: {flex: 1},
  }));

  if (isLoading || !data) {
    return <Loader message={t('mySchedule_loading')} />;
  }

  const periods = data.timetable[day];

  return (
    <Screen padded={false}>
      <CustomHeader title={t('mySchedule_title')} onBack={() => navigation.goBack()} />
      <View style={styles.daySelectorWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dayScrollContent}>
          {DAYS.map(d => {
            const active = d === day;
            return (
              <Pressable
                key={d}
                onPress={() => setDay(d)}
                style={[
                  styles.dayPill,
                  {backgroundColor: active ? theme.colors.primary : theme.colors.surfaceVariant},
                ]}>
                <AppText variant="label" style={{color: active ? theme.colors.onPrimary : theme.colors.textSecondary}}>
                  {t(DAY_LABEL_KEYS[d])}
                </AppText>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.periodsScrollContent} showsVerticalScrollIndicator={false}>
        {periods.length === 0 ? (
          <EmptyState icon="timetable" title={t('timetable_noClasses')} message={t('timetable_noClassesMessage')} />
        ) : (
          periods.map(period =>
            period.type === 'BREAK' ? (
              <CustomCard key={period.id} style={[styles.periodCard, styles.breakCard]}>
                <Row gap={theme.spacing.md} align="center">
                  <Icon name="clock" size={16} color={theme.colors.warning} />
                  <View style={{flex: 1}}>
                    <AppText variant="bodyBold" color="warning">
                      {period.title}
                    </AppText>
                    <AppText variant="caption" color="textSecondary">
                      {period.startTime} - {period.endTime}
                    </AppText>
                  </View>
                </Row>
              </CustomCard>
            ) : (
              <CustomCard key={period.id} style={styles.periodCard}>
                <Row gap={theme.spacing.md}>
                  <View style={styles.periodNoBlock}>
                    <AppText variant="h3" color="primary">
                      {period.periodNo}
                    </AppText>
                    <AppText variant="label" color="textMuted">
                      {t('timetable_period')}
                    </AppText>
                  </View>
                  <View style={styles.periodInfo}>
                    <AppText variant="bodyBold">{period.subjectName}</AppText>
                    <Row gap={theme.spacing.xs}>
                      <Icon name="clock" size={13} color={theme.colors.textMuted} />
                      <AppText variant="caption" color="textSecondary">
                        {period.startTime} - {period.endTime}
                      </AppText>
                    </Row>
                    <AppText variant="label" color="textMuted">
                      {period.roomNo
                        ? t('mySchedule_classSectionRoom', {
                            className: period.className,
                            sectionName: period.sectionName,
                            room: period.roomNo,
                          })
                        : t('mySchedule_classSection', {className: period.className, sectionName: period.sectionName})}
                    </AppText>
                  </View>
                </Row>
              </CustomCard>
            ),
          )
        )}
      </ScrollView>
    </Screen>
  );
}
