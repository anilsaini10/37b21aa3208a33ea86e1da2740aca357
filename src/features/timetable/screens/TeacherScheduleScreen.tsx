/** Admin — Teacher Schedule lookup: pick a teacher, view their weekly schedule across all their classes/sections. */
import React, {useState} from 'react';
import {Pressable, ScrollView, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme, useThemedStyles} from '../../../core/theme';
import {useLanguage, type TranslationKey} from '../../../core/i18n';
import {Screen, CustomHeader, CustomCard, Select, AppText, Icon, Row, EmptyState, Loader} from '../../../shared/components';
import {useTeacherTimetable} from '../adminSchedule.service';
import {useTeachers} from '../../teachers/teachers.service';
import type {AdminStackParamList} from '../../../navigation/types';
import type {ScheduleDay} from '../../../shared/types';

type Nav = NativeStackNavigationProp<AdminStackParamList>;

const DAYS: ScheduleDay[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

const DAY_LABEL_KEYS: Record<ScheduleDay, TranslationKey> = {
  MONDAY: 'common_dayMon',
  TUESDAY: 'common_dayTue',
  WEDNESDAY: 'common_dayWed',
  THURSDAY: 'common_dayThu',
  FRIDAY: 'common_dayFri',
  SATURDAY: 'common_daySat',
  SUNDAY: 'common_daySun',
};

export function TeacherScheduleScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const navigation = useNavigation<Nav>();

  const {data: teachersPage} = useTeachers({pageSize: 100});
  const [teacherId, setTeacherId] = useState('');
  const [day, setDay] = useState<ScheduleDay>('MONDAY');

  const {data: teacherTimetable, isLoading} = useTeacherTimetable(teacherId);

  const styles = useThemedStyles(t2 => ({
    scrollContent: {padding: t2.spacing.lg, flexGrow: 1},
    daySelectorWrap: {alignItems: 'center', marginVertical: t2.spacing.sm},
    dayScrollContent: {columnGap: t2.spacing.sm},
    dayPill: {
      paddingHorizontal: t2.spacing.lg,
      paddingVertical: t2.spacing.sm,
      borderRadius: t2.radius.pill,
    },
    entryCard: {marginBottom: t2.spacing.md},
    periodNoBlock: {
      width: 52,
      alignItems: 'center',
      borderRightWidth: 1,
      borderRightColor: t2.colors.divider,
      paddingRight: t2.spacing.sm,
    },
    entryInfo: {flex: 1},
  }));

  const teacherOptions = (teachersPage?.items ?? []).map(tch => ({label: tch.name, value: tch.id}));
  const dayEntries = teacherTimetable?.timetable[day] ?? [];

  return (
    <Screen padded={false}>
      <CustomHeader title={t('teacherSchedule_title')} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Select
          label={t('teacherSchedule_teacher')}
          value={teacherId}
          options={teacherOptions}
          onChange={setTeacherId}
        />

        {!teacherId ? (
          <EmptyState
            icon="teacher"
            title={t('teacherSchedule_selectTeacherTitle')}
            message={t('teacherSchedule_selectTeacherMessage')}
          />
        ) : (
          <>
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

            {isLoading || !teacherTimetable ? (
              <Loader message={t('teacherSchedule_loading')} />
            ) : dayEntries.length === 0 ? (
              <EmptyState icon="timetable" title={t('teacherSchedule_noPeriods')} message={t('teacherSchedule_noPeriodsMessage')} />
            ) : (
              dayEntries.map(entry => (
                <CustomCard key={entry.id} style={styles.entryCard}>
                  <Row gap={theme.spacing.md}>
                    <View style={styles.periodNoBlock}>
                      <AppText variant="h3" color="primary">
                        {entry.periodNo}
                      </AppText>
                      <AppText variant="label" color="textMuted">
                        {t('timetable_period')}
                      </AppText>
                    </View>
                    <View style={styles.entryInfo}>
                      <AppText variant="bodyBold">{entry.type === 'BREAK' ? entry.title : entry.subjectName}</AppText>
                      <Row gap={theme.spacing.xs}>
                        <Icon name="clock" size={13} color={theme.colors.textMuted} />
                        <AppText variant="caption" color="textSecondary">
                          {entry.startTime} - {entry.endTime}
                        </AppText>
                      </Row>
                      <AppText variant="label" color="textMuted">
                        {t('teacherSchedule_classSection', {
                          className: entry.className,
                          sectionName: entry.sectionName,
                          room: entry.roomNo ?? '',
                        })}
                      </AppText>
                    </View>
                  </Row>
                </CustomCard>
              ))
            )}
          </>
        )}
      </ScrollView>
    </Screen>
  );
}
