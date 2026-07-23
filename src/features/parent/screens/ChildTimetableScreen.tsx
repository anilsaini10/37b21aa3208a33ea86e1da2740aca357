/** Parent — Child Timetable: pick a child (when there's more than one), then see that child's weekly timetable (read-only). */
import React, {useState} from 'react';
import {Pressable, ScrollView, View} from 'react-native';
import {useTheme, useThemedStyles} from '../../../core/theme';
import {useLanguage, type TranslationKey} from '../../../core/i18n';
import {
  Screen,
  CustomHeader,
  CustomCard,
  ListRow,
  Badge,
  AppText,
  Icon,
  Row,
  Spacer,
  Divider,
  Loader,
  EmptyState,
} from '../../../shared/components';
import {attendancePercentageTone} from '../../../shared/helpers';
import {useParentProfile} from '../parentStudents.service';
import {useParentTimetable} from '../parentTimetable.service';
import type {ParentChild, TeacherWeekDay} from '../../../shared/types';

const DAYS: TeacherWeekDay[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

const DAY_LABEL_KEYS: Record<TeacherWeekDay, TranslationKey> = {
  MONDAY: 'common_dayMon',
  TUESDAY: 'common_dayTue',
  WEDNESDAY: 'common_dayWed',
  THURSDAY: 'common_dayThu',
  FRIDAY: 'common_dayFri',
  SATURDAY: 'common_daySat',
};

export function ChildTimetableScreen(): React.JSX.Element {
  const {t} = useLanguage();
  const {data: profile, isLoading, isError, error, refetch} = useParentProfile();
  const [activeChildId, setActiveChildId] = useState<string | null>(null);

  if (isLoading || !profile) {
    if (isError) {
      return (
        <Screen padded={false}>
          <CustomHeader title={t('childTimetable_title')} />
          <EmptyState
            icon="warning"
            title={t('common_somethingWentWrong')}
            message={(error as {message?: string} | null)?.message ?? t('common_checkConnection')}
            actionLabel={t('common_retry')}
            onAction={() => refetch()}
          />
        </Screen>
      );
    }
    return <Loader message={t('childTimetable_loading')} />;
  }

  const {children} = profile;

  if (children.length === 0) {
    return (
      <Screen padded={false}>
        <CustomHeader title={t('childTimetable_title')} />
        <EmptyState
          icon="timetable"
          title={t('childProfile_noChildrenTitle')}
          message={t('childProfile_noChildrenMessage')}
        />
      </Screen>
    );
  }

  if (children.length === 1) {
    return <ChildTimetableDetail child={children[0]} />;
  }

  const activeChild = children.find(c => c.id === activeChildId);
  if (!activeChild) {
    return <ChildrenList children={children} onSelect={setActiveChildId} />;
  }
  return <ChildTimetableDetail child={activeChild} onBack={() => setActiveChildId(null)} />;
}

function ChildrenList({
  children,
  onSelect,
}: {
  children: ParentChild[];
  onSelect: (id: string) => void;
}): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const styles = useThemedStyles(t2 => ({
    scrollContent: {padding: t2.spacing.lg},
    card: {paddingHorizontal: t2.spacing.lg},
  }));

  return (
    <Screen padded={false}>
      <CustomHeader title={t('childTimetable_title')} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <AppText variant="caption" color="textSecondary">
          {t('parentAttendance_selectChild')}
        </AppText>
        <Spacer size={theme.spacing.sm} />
        <CustomCard padded={false} style={styles.card}>
          {children.map((child, i) => (
            <View key={child.id}>
              {i > 0 ? <Divider /> : null}
              <ListRow
                avatarName={child.name}
                title={child.name}
                subtitle={t('mySchedule_classSection', {className: child.className, sectionName: child.sectionName})}
                onPress={() => onSelect(child.id)}
                right={
                  <Badge
                    label={`${child.attendancePercentage}%`}
                    tone={attendancePercentageTone(child.attendancePercentage)}
                  />
                }
              />
            </View>
          ))}
        </CustomCard>
      </ScrollView>
    </Screen>
  );
}

function ChildTimetableDetail({child, onBack}: {child: ParentChild; onBack?: () => void}): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const [day, setDay] = useState<TeacherWeekDay>('MONDAY');
  const {data, isLoading, isError, error, refetch} = useParentTimetable(child.id);

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
    if (isError) {
      return (
        <Screen padded={false}>
          <CustomHeader title={child.name} onBack={onBack} />
          <EmptyState
            icon="warning"
            title={t('common_somethingWentWrong')}
            message={(error as {message?: string} | null)?.message ?? t('common_checkConnection')}
            actionLabel={t('common_retry')}
            onAction={() => refetch()}
          />
        </Screen>
      );
    }
    return <Loader message={t('childTimetable_loading')} />;
  }

  const periods = data.timetable[day];

  return (
    <Screen padded={false}>
      <CustomHeader
        title={child.name}
        subtitle={t('mySchedule_classSection', {className: data.className, sectionName: data.sectionName})}
        onBack={onBack}
      />
      <View style={styles.daySelectorWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dayScrollContent}>
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
                <Row gap={theme.spacing.sm} align="center" justify="center">
                  <Icon name="clock" size={16} color={theme.colors.warning} />
                  <AppText variant="bodyBold" color="warning">
                    {period.title}
                  </AppText>
                  <AppText variant="caption" color="textSecondary">
                    {period.startTime} - {period.endTime}
                  </AppText>
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
                        ? t('childTimetable_teacherRoom', {teacher: period.teacherName ?? '', room: period.roomNo})
                        : (period.teacherName ?? '')}
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
