/**
 * Reset password — step 2 of 2. OTP (6 digits, emailed in step 1) + new
 * password. Public (no auth token). On success the backend revokes every
 * existing session/refresh token for this user, so we always land back on
 * Login rather than trying to keep the device signed in — `navigation.pop(2)`
 * drops both ForgotPassword and this screen, returning to the exact Login
 * instance (with its original role param intact) the user started from.
 */
import React, {useState} from 'react';
import {View} from 'react-native';
import {useThemedStyles} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {Screen, AppText, CustomInput, CustomButton, CustomHeader, Spacer} from '../../../shared/components';
import {authApi} from '../authApi';
import type {AuthScreenProps} from '../../../navigation/types';

const OTP_LENGTH = 6;
const MIN_PASSWORD_LENGTH = 6;
const NAVIGATE_LOGIN_DELAY_MS = 1200;

export function ResetPasswordScreen({navigation, route}: AuthScreenProps<'ResetPassword'>): React.JSX.Element {
  const {t} = useLanguage();
  const {email} = route.params;
  const styles = useThemedStyles(theme => ({
    container: {
      flex: 1,
      padding: theme.spacing.lg,
    },
  }));

  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpError, setOtpError] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [resendMessage, setResendMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const submit = async (): Promise<void> => {
    setOtpError('');
    setNewPasswordError('');
    setConfirmError('');
    setGeneralError('');
    setSuccessMessage('');
    setResendMessage('');

    if (!/^\d{6}$/.test(otp)) {
      setOtpError(t('resetPasswordScreen_otpInvalidLength'));
      return;
    }
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setNewPasswordError(t('resetPasswordScreen_newPasswordTooShort', {min: MIN_PASSWORD_LENGTH}));
      return;
    }
    if (newPassword !== confirmPassword) {
      setConfirmError(t('resetPasswordScreen_passwordMismatch'));
      return;
    }

    setLoading(true);
    try {
      await authApi.resetPasswordConfirm(email, otp, newPassword);
      setSuccessMessage(t('resetPasswordScreen_successMessage'));
      setTimeout(() => navigation.pop(2), NAVIGATE_LOGIN_DELAY_MS);
    } catch (e) {
      const err = e as Error & {code?: string};
      if (err.code === 'INVALID_OTP') {
        setOtpError(t('resetPasswordScreen_invalidOtp'));
      } else {
        setGeneralError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async (): Promise<void> => {
    setResendMessage('');
    setGeneralError('');
    setResending(true);
    try {
      await authApi.forgotPassword(email);
      setResendMessage(t('resetPasswordScreen_codeResent'));
    } catch (e) {
      setGeneralError((e as Error).message);
    } finally {
      setResending(false);
    }
  };

  return (
    <Screen padded={false}>
      <CustomHeader title={t('resetPasswordScreen_title')} onBack={() => navigation.goBack()} />
      <View style={styles.container}>
        <Spacer size={12} />
        <AppText variant="caption" color="textSecondary">
          {t('resetPasswordScreen_instructions')}
        </AppText>
        <Spacer size={20} />
        <CustomInput
          label={t('resetPasswordScreen_otpLabel')}
          placeholder={t('resetPasswordScreen_otpPlaceholder')}
          iconLeft="lock"
          keyboardType="number-pad"
          maxLength={OTP_LENGTH}
          value={otp}
          onChangeText={val => {
            setOtp(val.replace(/\D/g, ''));
            setOtpError('');
          }}
          error={otpError}
          required
        />
        <CustomInput
          label={t('resetPasswordScreen_newPasswordLabel')}
          secure
          iconLeft="lock"
          value={newPassword}
          onChangeText={val => {
            setNewPassword(val);
            setNewPasswordError('');
          }}
          error={newPasswordError}
          required
        />
        <CustomInput
          label={t('resetPasswordScreen_confirmNewPasswordLabel')}
          secure
          iconLeft="lock"
          value={confirmPassword}
          onChangeText={val => {
            setConfirmPassword(val);
            setConfirmError('');
          }}
          error={confirmError}
          required
        />
        {generalError ? (
          <AppText variant="caption" color="error">
            {generalError}
          </AppText>
        ) : null}
        {successMessage ? (
          <AppText variant="caption" color="success">
            {successMessage}
          </AppText>
        ) : null}
        {resendMessage ? (
          <AppText variant="caption" color="success">
            {resendMessage}
          </AppText>
        ) : null}
        <Spacer size={8} />
        <CustomButton title={t('resetPasswordScreen_resetButton')} onPress={submit} loading={loading} />
        <Spacer size={12} />
        <CustomButton
          title={t('resetPasswordScreen_resendCode')}
          variant="ghost"
          onPress={resendOtp}
          loading={resending}
        />
      </View>
    </Screen>
  );
}
