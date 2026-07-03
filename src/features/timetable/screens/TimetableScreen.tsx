/** Weekly timetable — shared (teacher & parent). */
import React, {useState} from 'react';
import {ScrollView, View, Pressable} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useTheme} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import type {TranslationKey} from '../../../core/i18n';
import {
  Screen,
  AppText,
  CustomHeader,
  CustomCard,
  Row,
  Icon,
  Loader,
  EmptyState,
} from '../../../shared/components';
import {db} from '../../../core/mock/db';
import {useTimetable, DAYS} from '../timetable.service';
import type {WeekDay} from '../../../shared/types';

const DAY_LABEL_KEYS: Record<WeekDay, TranslationKey> = {
  monday: 'common_dayMon',
  tuesday: 'common_dayTue',
  wednesday: 'common_dayWed',
  thursday: 'common_dayThu',
  friday: 'common_dayFri',
  saturday: 'common_daySat',
};

export function TimetableScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const navigation = useNavigation();
  const {t} = useLanguage();
  // Default to a representative class/section for the demo.
  const defaultClass = db.classes[5] ?? db.classes[0];
  const defaultSection = defaultClass.sections[0];

  const [day, setDay] = useState<WeekDay>('monday');
  const {data, isLoading} = useTimetable(defaultClass.id, defaultSection.id);

  if (isLoading || !data) {
    return <Loader message={t('timetable_loading')} />;
  }

  const periods = data.periods.filter(p => p.day === day);

  return (
    <Screen padded={false}>
      <CustomHeader
        title={t('timetable_title')}
        subtitle={`${defaultClass.name} - ${defaultSection.name}`}
        onBack={() => navigation.goBack()}
      />
      {/* Day selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.md, columnGap: theme.spacing.sm}}>
        {DAYS.map(d => {
          const active = d === day;
          return (
            <Pressable
              key={d}
              onPress={() => setDay(d)}
              style={{
                paddingHorizontal: theme.spacing.lg,
                paddingVertical: theme.spacing.sm,
                borderRadius: theme.radius.pill,
                backgroundColor: active ? theme.colors.primary : theme.colors.surfaceVariant,
              }}>
              <AppText
                variant="label"
                style={{color: active ? theme.colors.onPrimary : theme.colors.textSecondary}}>
                {t(DAY_LABEL_KEYS[d])}
              </AppText>
            </Pressable>
          );
        })}
      </ScrollView>

      <ScrollView contentContainerStyle={{padding: theme.spacing.lg, flexGrow: 1}}>
        {periods.length === 0 ? (
          <EmptyState title={t('timetable_noClasses')} message={t('timetable_noClassesMessage')} icon="timetable" />
        ) : (
          periods.map(period => (
            <CustomCard key={period.id} style={{marginBottom: theme.spacing.md}}>
              <Row gap={theme.spacing.md}>
                <View
                  style={{
                    width: 52,
                    alignItems: 'center',
                    borderRightWidth: 1,
                    borderRightColor: theme.colors.divider,
                    paddingRight: theme.spacing.sm,
                  }}>
                  <AppText variant="h3" color="primary">
                    {period.periodNo}
                  </AppText>
                  <AppText variant="label" color="textMuted">
                    {t('timetable_period')}
                  </AppText>
                </View>
                <View style={{flex: 1}}>
                  <AppText variant="bodyBold">{period.subjectName}</AppText>
                  <Row gap={theme.spacing.xs}>
                    <Icon name="clock" size={13} color={theme.colors.textMuted} />
                    <AppText variant="caption" color="textSecondary">
                      {period.startTime} - {period.endTime}
                    </AppText>
                  </Row>
                  <AppText variant="label" color="textMuted">
                    {t('timetable_teacherRoom', {teacher: period.teacherName, room: period.room ?? ''})}
                  </AppText>
                </View>
              </Row>
            </CustomCard>
          ))
        )}
      </ScrollView>
    </Screen>
  );
}
