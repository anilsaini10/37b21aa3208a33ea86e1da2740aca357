/** Create/Edit announcement (admin) — manual form (not DynamicForm) so the 3 optional date fields can sit below Title/Message/Audience with one submit button at the end. */
import React, {useEffect, useState} from 'react';
import {Pressable, ScrollView, View} from 'react-native';
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
  TimePicker,
  CustomButton,
  AppText,
  Row,
  Spacer,
  Loader,
  EmptyState,
} from '../../../shared/components';
import {
  useAdminAnnouncement,
  useCreateAnnouncement,
  useUpdateAnnouncement,
  type CreateAnnouncementInput,
  type UpdateAnnouncementInput,
} from '../announcements.service';
import type {AdminStackParamList} from '../../../navigation/types';
import type {AnnouncementAudience} from '../../../shared/types';

type Nav = NativeStackNavigationProp<AdminStackParamList>;

function splitIso(iso?: string | null): {date?: string; time?: string} {
  if (!iso) {
    return {};
  }
  const d = new Date(iso);
  if (isNaN(d.getTime())) {
    return {};
  }
  const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  return {date, time};
}

function combineIso(date: string | undefined, time: string | undefined): string | undefined {
  if (!date) {
    return undefined;
  }
  const d = new Date(`${date}T${time ?? '09:00'}:00`);
  return isNaN(d.getTime()) ? undefined : d.toISOString();
}

function FieldLabelRow({
  label,
  clearable,
  onClear,
}: {
  label: string;
  clearable: boolean;
  onClear: () => void;
}): React.JSX.Element {
  const {t} = useLanguage();
  return (
    <Row justify="space-between" align="center">
      <AppText variant="label" color="textSecondary">
        {label}
      </AppText>
      {clearable ? (
        <Pressable onPress={onClear} hitSlop={8}>
          <AppText variant="caption" color="error">
            {t('common_clear')}
          </AppText>
        </Pressable>
      ) : null}
    </Row>
  );
}

function EventDateField({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: string;
  onChange: (v?: string) => void;
}): React.JSX.Element {
  const {theme} = useTheme();
  return (
    <View style={{marginBottom: theme.spacing.md}}>
      <FieldLabelRow label={label} clearable={!!value} onClear={() => onChange(undefined)} />
      <Spacer size={theme.spacing.xs} />
      <DatePicker value={value} onChange={onChange} />
    </View>
  );
}

function DateTimeField({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: string;
  onChange: (iso?: string) => void;
}): React.JSX.Element {
  const {theme} = useTheme();
  const {date, time} = splitIso(value);
  return (
    <View style={{marginBottom: theme.spacing.md}}>
      <FieldLabelRow label={label} clearable={!!value} onClear={() => onChange(undefined)} />
      <Spacer size={theme.spacing.xs} />
      <Row gap={theme.spacing.sm} align="flex-start">
        <View style={{flex: 1}}>
          <DatePicker value={date} onChange={d => onChange(combineIso(d, time))} />
        </View>
        <View style={{flex: 1}}>
          <TimePicker value={time} onChange={tm => onChange(combineIso(date ?? new Date().toISOString().slice(0, 10), tm))} />
        </View>
      </Row>
    </View>
  );
}

export function AnnouncementFormScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<AdminStackParamList, 'AnnouncementForm'>>();
  const {id, initial} = route.params ?? {};

  const {data: announcement, isLoading, isError, error, refetch} = useAdminAnnouncement(id ?? '', initial);
  const createMutation = useCreateAnnouncement();
  const updateMutation = useUpdateAnnouncement();

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [audience, setAudience] = useState<AnnouncementAudience>('ALL');
  const [eventDate, setEventDate] = useState<string | undefined>();
  const [publishAt, setPublishAt] = useState<string | undefined>();
  const [expiresAt, setExpiresAt] = useState<string | undefined>();

  const [titleError, setTitleError] = useState<string | undefined>();
  const [messageError, setMessageError] = useState<string | undefined>();
  const [dateRangeError, setDateRangeError] = useState<string | undefined>();
  const [submitError, setSubmitError] = useState<string | undefined>();

  useEffect(() => {
    if (announcement) {
      setTitle(announcement.title);
      setMessage(announcement.message);
      setAudience(announcement.audience);
      setEventDate(announcement.eventDate ?? undefined);
      setPublishAt(announcement.publishAt ?? undefined);
      setExpiresAt(announcement.expiresAt ?? undefined);
    }
  }, [announcement]);

  const onSubmit = (): void => {
    setSubmitError(undefined);
    setDateRangeError(undefined);
    let hasError = false;

    const trimmedTitle = title.trim();
    const trimmedMessage = message.trim();
    if (trimmedTitle.length < 2 || trimmedTitle.length > 200) {
      setTitleError(t('announcementForm_titleLengthError'));
      hasError = true;
    } else {
      setTitleError(undefined);
    }
    if (trimmedMessage.length < 1 || trimmedMessage.length > 2000) {
      setMessageError(t('announcementForm_messageLengthError'));
      hasError = true;
    } else {
      setMessageError(undefined);
    }
    if (publishAt && expiresAt && new Date(expiresAt).getTime() <= new Date(publishAt).getTime()) {
      setDateRangeError(t('announcementForm_dateRangeError'));
      hasError = true;
    }
    if (hasError) {
      return;
    }

    const onError = (e: Error & {code?: string}): void => {
      if (e.code === 'INVALID_DATE_RANGE') {
        setDateRangeError(t('announcementForm_invalidDateRangeServer'));
      } else {
        setSubmitError(e.message);
      }
    };

    if (id) {
      if (!announcement) {
        return;
      }
      const patch: UpdateAnnouncementInput = {};
      if (trimmedTitle !== announcement.title) {
        patch.title = trimmedTitle;
      }
      if (trimmedMessage !== announcement.message) {
        patch.message = trimmedMessage;
      }
      if (audience !== announcement.audience) {
        patch.audience = audience;
      }
      if (eventDate !== (announcement.eventDate ?? undefined)) {
        patch.eventDate = eventDate ?? null;
      }
      if (publishAt !== (announcement.publishAt ?? undefined)) {
        patch.publishAt = publishAt ?? null;
      }
      if (expiresAt !== (announcement.expiresAt ?? undefined)) {
        patch.expiresAt = expiresAt ?? null;
      }
      if (Object.keys(patch).length === 0) {
        navigation.goBack();
        return;
      }
      updateMutation.mutate({id, input: patch}, {onSuccess: () => navigation.goBack(), onError});
    } else {
      const input: CreateAnnouncementInput = {
        title: trimmedTitle,
        message: trimmedMessage,
        audience,
        eventDate,
        publishAt,
        expiresAt,
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
  if (id && (isLoading || !announcement)) {
    return <Loader message={t('announcementForm_loadingAnnouncement')} />;
  }

  return (
    <Screen padded={false}>
      <CustomHeader
        title={id ? t('announcementForm_editTitle') : t('announcementForm_newAnnouncement')}
        onBack={() => navigation.goBack()}
      />
      <ScrollView
        contentContainerStyle={{padding: theme.spacing.lg}}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <CustomInput
          label={t('common_title')}
          placeholder={t('announcementForm_titlePlaceholder')}
          value={title}
          error={titleError}
          onChangeText={val => {
            setTitle(val);
            setTitleError(undefined);
          }}
          required
        />
        <CustomInput
          label={t('announcementForm_message')}
          placeholder={t('announcementForm_bodyPlaceholder')}
          value={message}
          error={messageError}
          onChangeText={val => {
            setMessage(val);
            setMessageError(undefined);
          }}
          multiline
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

        <EventDateField label={t('announcementForm_eventDate')} value={eventDate} onChange={setEventDate} />
        <DateTimeField label={t('announcementForm_publishAt')} value={publishAt} onChange={setPublishAt} />
        <DateTimeField label={t('announcementForm_expiresAt')} value={expiresAt} onChange={setExpiresAt} />

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
          title={id ? t('common_save') : t('announcementForm_publish')}
          onPress={onSubmit}
          loading={createMutation.isPending || updateMutation.isPending}
        />
        <Spacer size={24} />
      </ScrollView>
    </Screen>
  );
}
