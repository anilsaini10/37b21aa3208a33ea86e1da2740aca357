/** Admin — Class Schedule: pick a class+section, manage its weekly periods (class periods + breaks). */
import React, {useState} from 'react';
import {Pressable, ScrollView, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme, useThemedStyles} from '../../../core/theme';
import {useLanguage, type TranslationKey} from '../../../core/i18n';
import {
  Screen,
  CustomHeader,
  CustomCard,
  CustomModal,
  CustomButton,
  Select,
  AppText,
  Icon,
  Row,
  Spacer,
  EmptyState,
  Loader,
} from '../../../shared/components';
import {useAdminTimetable, useDeletePeriod} from '../adminTimetable.service';
import {useClasses} from '../../classes/classes.service';
import {ScreenNames} from '../../../navigation/ScreenNames';
import type {AdminStackParamList} from '../../../navigation/types';
import type {TimetablePeriod, WeekDay} from '../../../shared/types';

type Nav = NativeStackNavigationProp<AdminStackParamList>;

const DAYS: WeekDay[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

const DAY_LABEL_KEYS: Record<WeekDay, TranslationKey> = {
  monday: 'common_dayMon',
  tuesday: 'common_dayTue',
  wednesday: 'common_dayWed',
  thursday: 'common_dayThu',
  friday: 'common_dayFri',
  saturday: 'common_daySat',
};

export function AdminTimetableScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const navigation = useNavigation<Nav>();

  const {data: classes} = useClasses();
  const [classId, setClassId] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [day, setDay] = useState<WeekDay>('monday');
  const [deleteTarget, setDeleteTarget] = useState<TimetablePeriod | null>(null);

  const {data: periods, isLoading} = useAdminTimetable(classId, sectionId);
  const deleteMutation = useDeletePeriod();

  const styles = useThemedStyles(t2 => ({
    scrollContent: {padding: t2.spacing.lg, flexGrow: 1},
    pickerWrap: {flex: 1},
    daySelectorWrap: {alignItems: 'center', marginBottom: t2.spacing.sm},
    dayScrollContent: {columnGap: t2.spacing.sm},
    dayPill: {
      paddingHorizontal: t2.spacing.lg,
      paddingVertical: t2.spacing.sm,
      borderRadius: t2.radius.pill,
    },
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
    modalButtonWrap: {flex: 1},
  }));

  const selectedClass = (classes ?? []).find(c => c.id === classId);
  const classOptions = (classes ?? []).map(c => ({label: c.name, value: c.id}));
  const sectionOptions = (selectedClass?.sections ?? []).map(s => ({label: s.name, value: s.id}));

  const onChangeClass = (val: string): void => {
    setClassId(val);
    setSectionId('');
  };

  const dayPeriods = (periods ?? []).filter(p => p.day === day);

  const openCreate = (): void => {
    navigation.navigate(ScreenNames.PeriodForm, {classId, sectionId, day});
  };

  const openEdit = (period: TimetablePeriod): void => {
    navigation.navigate(ScreenNames.PeriodForm, {classId, sectionId, day, periodId: period.id, initial: period});
  };

  const confirmDelete = (): void => {
    if (!deleteTarget) {
      return;
    }
    deleteMutation.mutate(
      {id: deleteTarget.id, classId, sectionId},
      {onSuccess: () => setDeleteTarget(null)},
    );
  };

  return (
    <Screen padded={false}>
      <CustomHeader
        title={t('classSchedule_title')}
        onBack={() => navigation.goBack()}
        actions={classId && sectionId ? [{icon: 'add', onPress: openCreate}] : []}
      />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Row gap={theme.spacing.sm} align="flex-start">
          <View style={styles.pickerWrap}>
            <Select
              label={t('classSchedule_class')}
              value={classId}
              options={classOptions}
              onChange={onChangeClass}
            />
          </View>
          <View style={styles.pickerWrap}>
            <Select
              label={t('classSchedule_section')}
              value={sectionId}
              options={sectionOptions}
              onChange={setSectionId}
            />
          </View>
        </Row>

        {!classId || !sectionId ? (
          <EmptyState
            icon="timetable"
            title={t('classSchedule_selectClassTitle')}
            message={t('classSchedule_selectClassMessage')}
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

            {isLoading || !periods ? (
              <Loader message={t('classSchedule_loading')} />
            ) : dayPeriods.length === 0 ? (
              <EmptyState
                icon="timetable"
                title={t('classSchedule_noPeriods')}
                message={t('classSchedule_noPeriodsMessage')}
                actionLabel={t('classSchedule_addPeriod')}
                onAction={openCreate}
              />
            ) : (
              dayPeriods.map(period =>
                period.type === 'break' ? (
                  <CustomCard key={period.id} style={[styles.periodCard, styles.breakCard]}>
                    <Row justify="space-between" align="center">
                      <Row gap={theme.spacing.sm} align="center">
                        <Icon name="clock" size={16} color={theme.colors.warning} />
                        <View>
                          <AppText variant="bodyBold" color="warning">
                            {period.label}
                          </AppText>
                          <AppText variant="caption" color="textSecondary">
                            {period.startTime} - {period.endTime}
                          </AppText>
                        </View>
                      </Row>
                      <Row gap={theme.spacing.md} align="center">
                        <Pressable onPress={() => openEdit(period)} hitSlop={8}>
                          <Icon name="edit" size={18} color={theme.colors.textMuted} />
                        </Pressable>
                        <Pressable onPress={() => setDeleteTarget(period)} hitSlop={8}>
                          <Icon name="delete" size={18} color={theme.colors.error} />
                        </Pressable>
                      </Row>
                    </Row>
                  </CustomCard>
                ) : (
                  <CustomCard key={period.id} style={styles.periodCard}>
                    <Row justify="space-between">
                      <Row gap={theme.spacing.md} style={{flex: 1}}>
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
                            {t('timetable_teacherRoom', {teacher: period.teacherName ?? '', room: period.room ?? ''})}
                          </AppText>
                        </View>
                      </Row>
                      <Row gap={theme.spacing.md} align="center">
                        <Pressable onPress={() => openEdit(period)} hitSlop={8}>
                          <Icon name="edit" size={18} color={theme.colors.textMuted} />
                        </Pressable>
                        <Pressable onPress={() => setDeleteTarget(period)} hitSlop={8}>
                          <Icon name="delete" size={18} color={theme.colors.error} />
                        </Pressable>
                      </Row>
                    </Row>
                  </CustomCard>
                ),
              )
            )}
          </>
        )}
        <Spacer size={24} />
      </ScrollView>

      <CustomModal
        visible={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title={t('classSchedule_deleteTitle')}>
        <AppText variant="body" color="textSecondary">
          {t('classSchedule_deleteConfirm', {
            name: deleteTarget?.type === 'break' ? deleteTarget?.label ?? '' : deleteTarget?.subjectName ?? '',
          })}
        </AppText>
        <Spacer size={16} />
        <Row gap={theme.spacing.md}>
          <View style={styles.modalButtonWrap}>
            <CustomButton title={t('common_cancel')} variant="outline" onPress={() => setDeleteTarget(null)} />
          </View>
          <View style={styles.modalButtonWrap}>
            <CustomButton
              title={t('common_delete')}
              variant="danger"
              loading={deleteMutation.isPending}
              onPress={confirmDelete}
            />
          </View>
        </Row>
      </CustomModal>
    </Screen>
  );
}
