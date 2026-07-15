/** Create/Edit a timetable period (admin) — a class period (subject + teacher) or a break (lunch/other). */
import React, {useEffect, useState} from 'react';
import {Pressable, ScrollView, View} from 'react-native';
import {useNavigation, useRoute, type RouteProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme} from '../../../core/theme';
import {useLanguage, type TranslationKey} from '../../../core/i18n';
import {
  Screen,
  CustomHeader,
  CustomInput,
  Select,
  TimePicker,
  CustomButton,
  Badge,
  AppText,
  Row,
  Spacer,
} from '../../../shared/components';
import {useCreatePeriod, useUpdatePeriod, type PeriodInput} from '../adminTimetable.service';
import {useSubjects} from '../../subjects/subjects.service';
import {useTeachers} from '../../teachers/teachers.service';
import type {AdminStackParamList} from '../../../navigation/types';
import type {PeriodType, WeekDay} from '../../../shared/types';

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

export function PeriodFormScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<AdminStackParamList, 'PeriodForm'>>();
  const {classId, sectionId, day: initialDay, periodId, initial} = route.params;

  const createMutation = useCreatePeriod();
  const updateMutation = useUpdatePeriod();
  const {data: subjects} = useSubjects();
  const {data: teachersPage} = useTeachers({pageSize: 100});

  const [day, setDay] = useState<WeekDay>(initial?.day ?? initialDay);
  const [type, setType] = useState<PeriodType>(initial?.type ?? 'class');
  const [periodNo, setPeriodNo] = useState(String(initial?.periodNo ?? 1));
  const [startTime, setStartTime] = useState(initial?.startTime ?? '');
  const [endTime, setEndTime] = useState(initial?.endTime ?? '');
  const [subjectId, setSubjectId] = useState(initial?.subjectId ?? '');
  const [teacherId, setTeacherId] = useState(initial?.teacherId ?? '');
  const [room, setRoom] = useState(initial?.room ?? '');
  const [label, setLabel] = useState(initial?.label ?? '');

  const [timeError, setTimeError] = useState<string | undefined>();
  const [subjectError, setSubjectError] = useState<string | undefined>();
  const [teacherError, setTeacherError] = useState<string | undefined>();
  const [labelError, setLabelError] = useState<string | undefined>();
  const [submitError, setSubmitError] = useState<string | undefined>();

  useEffect(() => {
    if (initial) {
      setDay(initial.day);
      setType(initial.type);
      setPeriodNo(String(initial.periodNo));
      setStartTime(initial.startTime);
      setEndTime(initial.endTime);
      setSubjectId(initial.subjectId ?? '');
      setTeacherId(initial.teacherId ?? '');
      setRoom(initial.room ?? '');
      setLabel(initial.label ?? '');
    }
  }, [initial]);

  const dayOptions = DAYS.map(d => ({label: t(DAY_LABEL_KEYS[d]), value: d}));
  const subjectOptions = (subjects ?? []).map(s => ({label: s.name, value: s.id}));
  const teacherOptions = (teachersPage?.items ?? []).map(tch => ({label: tch.name, value: tch.id}));

  const onSubmit = (): void => {
    setSubmitError(undefined);
    let hasError = false;

    if (!startTime || !endTime || endTime <= startTime) {
      setTimeError(t('periodForm_timeRangeError'));
      hasError = true;
    } else {
      setTimeError(undefined);
    }

    if (type === 'class') {
      if (!subjectId) {
        setSubjectError(t('common_fieldRequired', {field: t('periodForm_subject')}));
        hasError = true;
      } else {
        setSubjectError(undefined);
      }
      if (!teacherId) {
        setTeacherError(t('common_fieldRequired', {field: t('periodForm_teacher')}));
        hasError = true;
      } else {
        setTeacherError(undefined);
      }
    } else {
      const trimmedLabel = label.trim();
      if (!trimmedLabel) {
        setLabelError(t('common_fieldRequired', {field: t('periodForm_breakLabel')}));
        hasError = true;
      } else {
        setLabelError(undefined);
      }
    }

    if (hasError) {
      return;
    }

    const input: PeriodInput = {
      classId,
      sectionId,
      day,
      periodNo: type === 'break' ? 100 : Number(periodNo) || 1,
      startTime,
      endTime,
      type,
      subjectId: type === 'class' ? subjectId : undefined,
      teacherId: type === 'class' ? teacherId : undefined,
      room: type === 'class' ? room.trim() || undefined : undefined,
      label: type === 'break' ? label.trim() : undefined,
    };

    const onError = (e: Error): void => setSubmitError(e.message);

    if (periodId) {
      updateMutation.mutate({id: periodId, input}, {onSuccess: () => navigation.goBack(), onError});
    } else {
      createMutation.mutate(input, {onSuccess: () => navigation.goBack(), onError});
    }
  };

  return (
    <Screen padded={false}>
      <CustomHeader
        title={periodId ? t('periodForm_editTitle') : t('periodForm_newTitle')}
        onBack={() => navigation.goBack()}
      />
      <ScrollView
        contentContainerStyle={{padding: theme.spacing.lg}}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <Select label={t('periodForm_day')} value={day} options={dayOptions} onChange={val => setDay(val as WeekDay)} required />

        <AppText variant="label" color="textSecondary">
          {t('periodForm_type')}
        </AppText>
        <Spacer size={theme.spacing.xs} />
        <Row gap={theme.spacing.sm}>
          <Pressable onPress={() => setType('class')}>
            <Badge label={t('periodForm_typeClass')} tone={type === 'class' ? 'primary' : 'neutral'} />
          </Pressable>
          <Pressable onPress={() => setType('break')}>
            <Badge label={t('periodForm_typeBreak')} tone={type === 'break' ? 'warning' : 'neutral'} />
          </Pressable>
        </Row>
        <Spacer size={theme.spacing.md} />

        {type === 'class' ? (
          <>
            <CustomInput
              label={t('periodForm_periodNo')}
              keyboardType="numeric"
              value={periodNo}
              onChangeText={setPeriodNo}
              required
            />
            <Select
              label={t('periodForm_subject')}
              value={subjectId}
              options={subjectOptions}
              onChange={val => {
                setSubjectId(val);
                setSubjectError(undefined);
              }}
              error={subjectError}
              required
            />
            <Select
              label={t('periodForm_teacher')}
              value={teacherId}
              options={teacherOptions}
              onChange={val => {
                setTeacherId(val);
                setTeacherError(undefined);
              }}
              error={teacherError}
              required
            />
            <CustomInput
              label={t('periodForm_room')}
              placeholder={t('periodForm_roomPlaceholder')}
              value={room}
              onChangeText={setRoom}
            />
          </>
        ) : (
          <CustomInput
            label={t('periodForm_breakLabel')}
            placeholder={t('periodForm_breakLabelPlaceholder')}
            value={label}
            error={labelError}
            onChangeText={val => {
              setLabel(val);
              setLabelError(undefined);
            }}
            required
          />
        )}

        <Row gap={theme.spacing.sm} align="flex-start">
          <View style={{flex: 1}}>
            <TimePicker
              label={t('periodForm_startTime')}
              value={startTime}
              onChange={val => {
                setStartTime(val);
                setTimeError(undefined);
              }}
            />
          </View>
          <View style={{flex: 1}}>
            <TimePicker
              label={t('periodForm_endTime')}
              value={endTime}
              onChange={val => {
                setEndTime(val);
                setTimeError(undefined);
              }}
            />
          </View>
        </Row>
        {timeError ? (
          <AppText variant="caption" color="error" style={{marginTop: -theme.spacing.sm, marginBottom: theme.spacing.sm}}>
            {timeError}
          </AppText>
        ) : null}

        {submitError ? (
          <AppText variant="caption" color="error" style={{marginBottom: theme.spacing.sm}}>
            {submitError}
          </AppText>
        ) : null}

        <CustomButton
          title={periodId ? t('common_save') : t('periodForm_create')}
          onPress={onSubmit}
          loading={createMutation.isPending || updateMutation.isPending}
        />
        <Spacer size={24} />
      </ScrollView>
    </Screen>
  );
}
