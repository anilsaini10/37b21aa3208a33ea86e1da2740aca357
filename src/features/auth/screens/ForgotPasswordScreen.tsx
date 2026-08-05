/**
 * Forgot password — step 1 of 2. Email-only, public (no auth token, no
 * role/schoolId — works identically for admin/teacher/parent). The backend
 * always responds success (even for an unregistered email) so this screen
 * must never surface "unknown email" as an error — on success it just moves
 * on to the OTP + new-password step.
 */
import React, {useState} from 'react';
import {View} from 'react-native';
import {useThemedStyles} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {Screen, AppText, CustomInput, CustomButton, CustomHeader, Spacer} from '../../../shared/components';
import {authApi} from '../authApi';
import {isValidEmail} from '../../../shared/utils/validators';
import {ScreenNames} from '../../../navigation/ScreenNames';
import type {AuthScreenProps} from '../../../navigation/types';

export function ForgotPasswordScreen({navigation}: AuthScreenProps<'ForgotPassword'>): React.JSX.Element {
  const {t} = useLanguage();
  const styles = useThemedStyles(theme => ({
    container: {
      flex: 1,
      padding: theme.spacing.lg,
    },
  }));
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (): Promise<void> => {
    setError('');
    const trimmed = email.trim();
    if (!trimmed) {
      setEmailError(t('common_fieldRequired', {field: t('forgotPasswordScreen_emailLabel')}));
      return;
    }
    if (!isValidEmail(trimmed)) {
      setEmailError(t('forgotPasswordScreen_emailInvalid'));
      return;
    }
    setEmailError('');
    setLoading(true);
    try {
      await authApi.forgotPassword(trimmed);
      navigation.navigate(ScreenNames.ResetPassword, {email: trimmed});
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen padded={false}>
      <CustomHeader title={t('forgotPasswordScreen_title')} onBack={() => navigation.goBack()} />
      <View style={styles.container}>
        <Spacer size={12} />
        <AppText variant="caption" color="textSecondary">
          {t('forgotPasswordScreen_enterEmail')}
        </AppText>
        <Spacer size={20} />
        <CustomInput
          label={t('forgotPasswordScreen_emailLabel')}
          placeholder={t('forgotPasswordScreen_emailPlaceholder')}
          iconLeft="email"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={val => {
            setEmail(val);
            setEmailError('');
          }}
          error={emailError}
          required
        />
        {error ? (
          <AppText variant="caption" color="error">
            {error}
          </AppText>
        ) : null}
        <Spacer size={8} />
        <CustomButton title={t('forgotPasswordScreen_sendCode')} onPress={submit} loading={loading} />
      </View>
    </Screen>
  );
}
