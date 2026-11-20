/** Submit a new query to school admin — subject + message form with validation and rate-limit handling. */
import React, {useState} from 'react';
import {ScrollView} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {
  Screen,
  CustomHeader,
  CustomCard,
  CustomInput,
  CustomButton,
  AppText,
  Spacer,
} from '../../../shared/components';
import type {ParentStackParamList} from '../../../navigation/types';
import {useSubmitQuery} from '../parentQuery.service';

type Nav = NativeStackNavigationProp<ParentStackParamList>;

export function SubmitQueryScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const navigation = useNavigation<Nav>();

  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [subjectError, setSubjectError] = useState<string | undefined>();
  const [messageError, setMessageError] = useState<string | undefined>();
  const [submitError, setSubmitError] = useState<string | undefined>();

  const submitMutation = useSubmitQuery();

  const validate = (): boolean => {
    let valid = true;
    setSubjectError(undefined);
    setMessageError(undefined);
    setSubmitError(undefined);

    const trimmedSubject = subject.trim();
    if (!trimmedSubject) {
      setSubjectError(t('parentQuery_subjectRequired'));
      valid = false;
    } else if (trimmedSubject.length > 200) {
      setSubjectError(t('parentQuery_subjectMaxLength'));
      valid = false;
    }

    const trimmedMessage = message.trim();
    if (!trimmedMessage) {
      setMessageError(t('parentQuery_messageRequired'));
      valid = false;
    } else if (trimmedMessage.length > 5000) {
      setMessageError(t('parentQuery_messageMaxLength'));
      valid = false;
    }

    return valid;
  };

  const onSubmit = (): void => {
    if (!validate()) return;

    submitMutation.mutate(
      {subject: subject.trim(), message: message.trim()},
      {
        onSuccess: () => navigation.goBack(),
        onError: (e: Error) => {
          if (e.message.startsWith('RATE_LIMITED:')) {
            const minutes = e.message.split(':')[1] || '60';
            setSubmitError(t('parentQuery_rateLimited', {minutes}));
          } else {
            setSubmitError(e.message || t('parentQuery_submitFailed'));
          }
        },
      },
    );
  };

  return (
    <Screen padded={false}>
      <CustomHeader title={t('parentQuery_submitTitle')} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{padding: theme.spacing.lg}} showsVerticalScrollIndicator={false}>
        <CustomCard>
          <CustomInput
            label={t('parentQuery_subject')}
            placeholder={t('parentQuery_subjectPlaceholder')}
            value={subject}
            error={subjectError}
            onChangeText={val => {
              setSubject(val);
              setSubjectError(undefined);
            }}
            maxLength={200}
            required
          />
          <Spacer size={theme.spacing.sm} />
          <CustomInput
            label={t('parentQuery_message')}
            placeholder={t('parentQuery_messagePlaceholder')}
            value={message}
            error={messageError}
            onChangeText={val => {
              setMessage(val);
              setMessageError(undefined);
            }}
            multiline
            numberOfLines={6}
            maxLength={5000}
            required
          />

          {submitError ? (
            <>
              <Spacer size={theme.spacing.sm} />
              <AppText variant="caption" color="error">
                {submitError}
              </AppText>
            </>
          ) : null}

          <Spacer size={theme.spacing.md} />
          <CustomButton
            title={t('parentQuery_submit')}
            onPress={onSubmit}
            loading={submitMutation.isPending}
          />
        </CustomCard>
        <Spacer size={24} />
      </ScrollView>
    </Screen>
  );
}
