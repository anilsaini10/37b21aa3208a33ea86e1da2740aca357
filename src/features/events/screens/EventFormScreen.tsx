/** Create/Edit school event (admin). */
import React, {useEffect, useState} from 'react';
import {Pressable, ScrollView} from 'react-native';
import {useNavigation, useRoute, type RouteProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {
  Screen,
  CustomHeader,
  CustomInput,
  Select,
  DatePicker,
  CustomButton,
  AppText,
  Row,
  Spacer,
  Loader,
  EmptyState,
} from '../../../shared/components';
import {
  useAdminEvent,
  useCreateEvent,
  useUpdateEvent,
  type CreateEventInput,
  type UpdateEventInput,
} from '../events.service';
import type {AdminStackParamList} from '../../../navigation/types';
import type {AnnouncementAudience, EventType} from '../../../shared/types';

type Nav = NativeStackNavigationProp<AdminStackParamList>;

export function EventFormScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<AdminStackParamList, 'EventForm'>>();
  const {id, initial} = route.params ?? {};

  const {data: event, isLoading, isError, error, refetch} = useAdminEvent(id ?? '', initial);
  const createMutation = useCreateEvent();
  const updateMutation = useUpdateEvent();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventType, setEventType] = useState<EventType>('OTHER');
  const [audience, setAudience] = useState<AnnouncementAudience>('ALL');
  const [startDate, setStartDate] = useState<string | undefined>();
  const [endDate, setEndDate] = useState<string | undefined>();

  const [titleError, setTitleError] = useState<string | undefined>();
  const [dateRangeError, setDateRangeError] = useState<string | undefined>();
  const [submitError, setSubmitError] = useState<string | undefined>();

  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setDescription(event.description ?? '');
      setEventType(event.eventType);
      setAudience(event.audience);
      setStartDate(event.startDate.slice(0, 10));
      setEndDate(event.endDate.slice(0, 10));
    }
  }, [event]);

  const onSubmit = (): void => {
    setSubmitError(undefined);
    setDateRangeError(undefined);
    let hasError = false;

    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();
    if (trimmedTitle.length < 2 || trimmedTitle.length > 200) {
      setTitleError(t('eventForm_titleLengthError'));
      hasError = true;
    } else {
      setTitleError(undefined);
    }
    if (!startDate) {
      hasError = true;
    }
    if (startDate && endDate && new Date(endDate).getTime() < new Date(startDate).getTime()) {
      setDateRangeError(t('eventForm_dateRangeError'));
      hasError = true;
    }
    if (hasError || !startDate) {
      return;
    }

    const onError = (e: Error & {code?: string}): void => {
      if (e.code === 'INVALID_DATE_RANGE') {
        setDateRangeError(t('eventForm_invalidDateRangeServer'));
      } else {
        setSubmitError(e.message);
      }
    };

    if (id) {
      if (!event) {
        return;
      }
      const patch: UpdateEventInput = {};
      if (trimmedTitle !== event.title) {
        patch.title = trimmedTitle;
      }
      if (trimmedDescription !== (event.description ?? '')) {
        patch.description = trimmedDescription;
      }
      if (eventType !== event.eventType) {
        patch.eventType = eventType;
      }
      if (audience !== event.audience) {
        patch.audience = audience;
      }
      if (startDate !== event.startDate.slice(0, 10)) {
        patch.startDate = startDate;
      }
      if (endDate !== event.endDate.slice(0, 10)) {
        patch.endDate = endDate;
      }
      if (Object.keys(patch).length === 0) {
        navigation.goBack();
        return;
      }
      updateMutation.mutate({id, input: patch}, {onSuccess: () => navigation.goBack(), onError});
    } else {
      const input: CreateEventInput = {
        title: trimmedTitle,
        description: trimmedDescription || undefined,
        eventType,
        audience,
        startDate,
        endDate,
      };
      createMutation.mutate(input, {onSuccess: () => navigation.goBack(), onError});
    }
  };

  if (id && isError) {
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
  if (id && (isLoading || !event)) {
    return <Loader message={t('eventForm_loadingEvent')} />;
  }

  return (
    <Screen padded={false}>
      <CustomHeader
        title={id ? t('eventForm_editTitle') : t('eventForm_newEvent')}
        onBack={() => navigation.goBack()}
      />
      <ScrollView
        contentContainerStyle={{padding: theme.spacing.lg}}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <CustomInput
          label={t('common_title')}
          placeholder={t('eventForm_titlePlaceholder')}
          value={title}
          error={titleError}
          onChangeText={val => {
            setTitle(val);
            setTitleError(undefined);
          }}
          required
        />
        <CustomInput
          label={t('eventForm_description')}
          placeholder={t('eventForm_descriptionPlaceholder')}
          value={description}
          onChangeText={setDescription}
          multiline
        />
        <Select
          label={t('eventForm_eventType')}
          value={eventType}
          options={[
            {label: t('eventForm_typeHoliday'), value: 'HOLIDAY'},
            {label: t('eventForm_typeExam'), value: 'EXAM'},
            {label: t('eventForm_typeMeeting'), value: 'MEETING'},
            {label: t('eventForm_typeActivity'), value: 'ACTIVITY'},
            {label: t('eventForm_typeOther'), value: 'OTHER'},
          ]}
          onChange={val => setEventType(val as EventType)}
          required
        />
        <Select
          label={t('announcementForm_audience')}
          value={audience}
          options={[
            {label: t('announcementForm_audienceEveryone'), value: 'ALL'},
            {label: t('announcementForm_audienceTeachers'), value: 'TEACHER'},
            {label: t('announcementForm_audienceParents'), value: 'PARENT'},
          ]}
          onChange={val => setAudience(val as AnnouncementAudience)}
          required
        />

        <DatePicker label={t('eventForm_startDate')} value={startDate} onChange={setStartDate} />

        <Row justify="space-between" align="center">
          <AppText variant="label" color="textSecondary">
            {t('eventForm_endDate')}
          </AppText>
          {endDate ? (
            <Pressable onPress={() => setEndDate(undefined)} hitSlop={8}>
              <AppText variant="caption" color="error">
                {t('common_clear')}
              </AppText>
            </Pressable>
          ) : null}
        </Row>
        <Spacer size={theme.spacing.xs} />
        <DatePicker value={endDate} onChange={setEndDate} />
        <AppText variant="caption" color="textMuted" style={{marginTop: -theme.spacing.sm, marginBottom: theme.spacing.md}}>
          {t('eventForm_endDateHint')}
        </AppText>

        {dateRangeError ? (
          <AppText variant="caption" color="error" style={{marginBottom: theme.spacing.sm}}>
            {dateRangeError}
          </AppText>
        ) : null}
        {submitError ? (
          <AppText variant="caption" color="error" style={{marginBottom: theme.spacing.sm}}>
            {submitError}
          </AppText>
        ) : null}

        <CustomButton
          title={id ? t('common_save') : t('eventForm_create')}
          onPress={onSubmit}
          loading={createMutation.isPending || updateMutation.isPending}
        />
        <Spacer size={24} />
      </ScrollView>
    </Screen>
  );
}
