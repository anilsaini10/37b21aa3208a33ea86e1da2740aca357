/**
 * Create/Edit a schedule entry (admin) — a class period (subject + teacher) or a break.
 *
 * classId/sectionId/type are immutable once created (backend requires delete + recreate
 * to change them) — the Type toggle only shows in create mode; edit mode shows it read-only.
 */
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
  Loader,
  EmptyState,
} from '../../../shared/components';
import {
  useScheduleEntry,
  useCreateSchedule,
  useUpdateSchedule,
  type CreateScheduleInput,
  type UpdateScheduleInput,
} from '../adminSchedule.service';
import {useSubjects} from '../../subjects/subjects.service';
import {useTeachers} from '../../teachers/teachers.service';
import {useClasses} from '../../classes/classes.service';
import type {AdminStackParamList} from '../../../navigation/types';
import type {ScheduleDay, ScheduleEntryType} from '../../../shared/types';

type Nav = NativeStackNavigationProp<AdminStackParamList>;

const DAYS: ScheduleDay[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

/** Strips anything but digits as the user types, so period number / room number can only ever end up as a whole integer. */
function sanitizeIntegerInput(value: string): string {
  return value.replace(/[^0-9]/g, '');
}

const DAY_LABEL_KEYS: Record<ScheduleDay, TranslationKey> = {
  MONDAY: 'common_dayMon',
  TUESDAY: 'common_dayTue',
  WEDNESDAY: 'common_dayWed',
  THURSDAY: 'common_dayThu',
  FRIDAY: 'common_dayFri',
  SATURDAY: 'common_daySat',
  SUNDAY: 'common_daySun',
};

export function PeriodFormScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<AdminStackParamList, 'PeriodForm'>>();
  const {classId: routeClassId, sectionId: routeSectionId, day: initialDay, scheduleId, initial} = route.params;

  const {data: entry, isLoading, isError, error, refetch} = useScheduleEntry(scheduleId ?? '', initial);
  const createMutation = useCreateSchedule();
  const updateMutation = useUpdateSchedule();
  const {data: classes} = useClasses();
  const {data: subjects} = useSubjects();
  const {data: teachersPage} = useTeachers({pageSize: 100});

  const [classId, setClassId] = useState(initial?.classId ?? routeClassId);
  const [sectionId, setSectionId] = useState(initial?.sectionId ?? routeSectionId);
  const [day, setDay] = useState<ScheduleDay>(initial?.day ?? initialDay);
  const [type, setType] = useState<ScheduleEntryType>(initial?.type ?? 'CLASS_PERIOD');
  const [startTime, setStartTime] = useState(initial?.startTime ?? '');
  const [endTime, setEndTime] = useState(initial?.endTime ?? '');
  const [subjectId, setSubjectId] = useState(initial?.subjectId ?? '');
  const [teacherId, setTeacherId] = useState(initial?.teacherId ?? '');
  const [roomNo, setRoomNo] = useState(initial?.roomNo ?? '');
  const [title, setTitle] = useState(initial?.title ?? '');

  const [classError, setClassError] = useState<string | undefined>();
  const [sectionError, setSectionError] = useState<string | undefined>();
  const [timeError, setTimeError] = useState<string | undefined>();
  const [subjectError, setSubjectError] = useState<string | undefined>();
  const [teacherError, setTeacherError] = useState<string | undefined>();
  const [roomError, setRoomError] = useState<string | undefined>();
  const [titleError, setTitleError] = useState<string | undefined>();
  const [submitError, setSubmitError] = useState<string | undefined>();

  useEffect(() => {
    if (entry) {
      setClassId(entry.classId);
      setSectionId(entry.sectionId);
      setDay(entry.day);
      setType(entry.type);
      setStartTime(entry.startTime);
      setEndTime(entry.endTime);
      setSubjectId(entry.subjectId ?? '');
      setTeacherId(entry.teacherId ?? '');
      setRoomNo(entry.roomNo ?? '');
      setTitle(entry.title ?? '');
    }
  }, [entry]);

  const selectedClass = (classes ?? []).find(c => c.id === classId);
  const classOptions = (classes ?? []).map(c => ({label: c.name, value: c.id}));
  const sectionOptions = (selectedClass?.sections ?? []).map(s => ({label: s.name, value: s.id}));

  const onChangeClass = (val: string): void => {
    setClassId(val);
    setSectionId('');
    setClassError(undefined);
  };

  const dayOptions = DAYS.map(d => ({label: t(DAY_LABEL_KEYS[d]), value: d}));
  const subjectOptions = (subjects ?? []).map(s => ({label: s.name, value: s.id}));
  /** Only teachers who actually teach the selected subject (in any class) — matches the backend's SUBJECT_NOT_ASSIGNED rule. */
  const teacherOptions = subjectId
    ? (teachersPage?.items ?? [])
        .filter(tch => tch.subjects.some(s => s.subjectId === subjectId))
        .map(tch => ({label: tch.name, value: tch.id}))
    : [];

  const clearErrors = (): void => {
    setClassError(undefined);
    setSectionError(undefined);
    setTimeError(undefined);
    setSubjectError(undefined);
    setTeacherError(undefined);
    setRoomError(undefined);
    setTitleError(undefined);
    setSubmitError(undefined);
  };

  const onSubmit = (): void => {
    clearErrors();
    let hasError = false;

    if (!scheduleId) {
      if (!classId) {
        setClassError(t('common_fieldRequired', {field: t('classSchedule_class')}));
        hasError = true;
      }
      if (!sectionId) {
        setSectionError(t('common_fieldRequired', {field: t('classSchedule_section')}));
        hasError = true;
      }
    }

    if (!startTime || !endTime || endTime <= startTime) {
      setTimeError(t('periodForm_timeRangeError'));
      hasError = true;
    }
    if (type === 'CLASS_PERIOD') {
      if (!subjectId) {
        setSubjectError(t('common_fieldRequired', {field: t('periodForm_subject')}));
        hasError = true;
      }
      if (!teacherId) {
        setTeacherError(t('common_fieldRequired', {field: t('periodForm_teacher')}));
        hasError = true;
      }
    } else if (!title.trim()) {
      setTitleError(t('common_fieldRequired', {field: t('periodForm_breakLabel')}));
      hasError = true;
    }

    if (hasError) {
      return;
    }

    const onError = (e: Error & {code?: string}): void => {
      switch (e.code) {
        case 'SUBJECT_NOT_ASSIGNED':
          setSubjectError(t('periodForm_errorSubjectNotAssigned'));
          break;
        case 'TIME_OVERLAP_SECTION':
          setTimeError(t('periodForm_errorTimeOverlapSection'));
          break;
        case 'TEACHER_TIME_CONFLICT':
          setTeacherError(t('periodForm_errorTeacherConflict'));
          break;
        case 'ROOM_TIME_CONFLICT':
          setRoomError(t('periodForm_errorRoomConflict'));
          break;
        default:
          setSubmitError(e.message);
      }
    };

    if (scheduleId) {
      if (!entry) {
        return;
      }
      const patch: UpdateScheduleInput = {};
      if (day !== entry.day) {
        patch.day = day;
      }
      if (startTime !== entry.startTime) {
        patch.startTime = startTime;
      }
      if (endTime !== entry.endTime) {
        patch.endTime = endTime;
      }
      if (type === 'CLASS_PERIOD') {
        if (subjectId !== (entry.subjectId ?? '')) {
          patch.subjectId = subjectId;
        }
        if (teacherId !== (entry.teacherId ?? '')) {
          patch.teacherId = teacherId;
        }
        if (roomNo.trim() !== (entry.roomNo ?? '')) {
          patch.roomNo = roomNo.trim();
        }
      } else if (title.trim() !== (entry.title ?? '')) {
        patch.title = title.trim();
      }
      if (Object.keys(patch).length === 0) {
        navigation.goBack();
        return;
      }
      updateMutation.mutate({scheduleId, input: patch}, {onSuccess: () => navigation.goBack(), onError});
    } else {
      const input: CreateScheduleInput = {
        classId,
        sectionId,
        day,
        type,
        startTime,
        endTime,
        subjectId: type === 'CLASS_PERIOD' ? subjectId : undefined,
        teacherId: type === 'CLASS_PERIOD' ? teacherId : undefined,
        roomNo: type === 'CLASS_PERIOD' ? roomNo.trim() || undefined : undefined,
        title: type === 'BREAK' ? title.trim() : undefined,
      };
      createMutation.mutate(input, {onSuccess: () => navigation.goBack(), onError});
    }
  };

  if (scheduleId && isError) {
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
  if (scheduleId && (isLoading || !entry)) {
    return <Loader message={t('periodForm_loadingEntry')} />;
  }

  return (
    <Screen padded={false}>
      <CustomHeader
        title={scheduleId ? t('periodForm_editTitle') : t('periodForm_newTitle')}
        onBack={() => navigation.goBack()}
      />
      <ScrollView
        contentContainerStyle={{padding: theme.spacing.lg}}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        {!scheduleId ? (
          <Row gap={theme.spacing.sm} align="flex-start">
            <View style={{flex: 1}}>
              <Select
                label={t('classSchedule_class')}
                value={classId}
                options={classOptions}
                onChange={onChangeClass}
                error={classError}
                required
              />
            </View>
            <View style={{flex: 1}}>
              <Select
                label={t('classSchedule_section')}
                value={sectionId}
                options={sectionOptions}
                onChange={val => {
                  setSectionId(val);
                  setSectionError(undefined);
                }}
                error={sectionError}
                disabled={!classId}
                onDisabledPress={() => setSectionError(t('periodForm_selectClassFirst'))}
                required
              />
            </View>
          </Row>
        ) : null}

        <Select label={t('periodForm_day')} value={day} options={dayOptions} onChange={val => setDay(val as ScheduleDay)} required />

        <AppText variant="label" color="textSecondary">
          {t('periodForm_type')}
        </AppText>
        <Spacer size={theme.spacing.xs} />
        {scheduleId ? (
          <Badge
            label={type === 'CLASS_PERIOD' ? t('periodForm_typeClass') : t('periodForm_typeBreak')}
            tone={type === 'CLASS_PERIOD' ? 'primary' : 'warning'}
          />
        ) : (
          <Row gap={theme.spacing.sm}>
            <Pressable onPress={() => setType('CLASS_PERIOD')}>
              <Badge label={t('periodForm_typeClass')} tone={type === 'CLASS_PERIOD' ? 'primary' : 'neutral'} />
            </Pressable>
            <Pressable onPress={() => setType('BREAK')}>
              <Badge label={t('periodForm_typeBreak')} tone={type === 'BREAK' ? 'warning' : 'neutral'} />
            </Pressable>
          </Row>
        )}
        <Spacer size={theme.spacing.md} />

        {type === 'CLASS_PERIOD' ? (
          <>
            <Select
              label={t('periodForm_subject')}
              value={subjectId}
              options={subjectOptions}
              onChange={val => {
                setSubjectId(val);
                setSubjectError(undefined);
                setTeacherId('');
                setTeacherError(undefined);
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
              disabled={!subjectId}
              onDisabledPress={() => setTeacherError(t('periodForm_selectSubjectFirst'))}
              required
            />
            <CustomInput
              label={t('periodForm_room')}
              placeholder={t('periodForm_roomPlaceholder')}
              keyboardType="numeric"
              value={roomNo}
              error={roomError}
              onChangeText={val => {
                setRoomNo(sanitizeIntegerInput(val));
                setRoomError(undefined);
              }}
            />
          </>
        ) : (
          <CustomInput
            label={t('periodForm_breakLabel')}
            placeholder={t('periodForm_breakLabelPlaceholder')}
            value={title}
            error={titleError}
            onChangeText={val => {
              setTitle(val);
              setTitleError(undefined);
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
          title={scheduleId ? t('common_save') : t('periodForm_create')}
          onPress={onSubmit}
          loading={createMutation.isPending || updateMutation.isPending}
        />
        <Spacer size={24} />
      </ScrollView>
    </Screen>
  );
}
