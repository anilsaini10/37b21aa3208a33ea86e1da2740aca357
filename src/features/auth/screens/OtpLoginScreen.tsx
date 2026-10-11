/**
 * Mobile OTP login — step 2. Reached from the "Mobile OTP" tab on LoginScreen
 * after an OTP has been sent. Verifying logs the user in exactly like
 * password login (same `AuthSession` shape) — the root navigator then swaps
 * to the role stack automatically.
 */
import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import {useThemedStyles} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {formatCountdown} from '../../../core/utils/format';
import {Screen, AppText, CustomHeader, CustomButton, OtpInput, Spacer} from '../../../shared/components';
import {authApi} from '../authApi';
import {useAuthStore} from '../authStore';
import {interpretOtpError} from '../otpErrorHandling';
import {ScreenNames} from '../../../navigation/ScreenNames';
import type {AuthScreenProps} from '../../../navigation/types';

const OTP_LENGTH = 6;

export function OtpLoginScreen({navigation, route}: AuthScreenProps<'OtpLogin'>): React.JSX.Element {
  const {t} = useLanguage();
  const {role, schoolId, schoolName, phone, message, resendAfterSeconds, expiresInSeconds} = route.params;
  const {loginWithOtp, isLoading, clearError} = useAuthStore();

  const styles = useThemedStyles(t2 => ({
    container: {
      flex: 1,
      padding: t2.spacing.lg,
    },
  }));

  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [locked, setLocked] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [resending, setResending] = useState(false);
  const [resendIn, setResendIn] = useState(resendAfterSeconds);
  const [expiresIn, setExpiresIn] = useState(expiresInSeconds);

  useEffect(() => {
    clearError();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handle = setInterval(() => {
      setResendIn(prev => (prev > 0 ? prev - 1 : prev));
      setExpiresIn(prev => (prev > 0 ? prev - 1 : prev));
    }, 1000);
    return () => clearInterval(handle);
  }, []);

  const submit = async (code: string): Promise<void> => {
    setOtpError('');
    setResendMessage('');
    if (!/^\d{6}$/.test(code)) {
      setOtpError(t('otpLoginScreen_otpInvalidLength'));
      return;
    }
    const ok = await loginWithOtp(role, phone, code, schoolId);
    if (ok) {
      return;
    }
    const latest = useAuthStore.getState();
    const action = interpretOtpError({message: latest.error, code: latest.errorCode, details: latest.errorDetails});
    switch (action.kind) {
      case 'invalid_otp':
        setOtpError(
          action.attemptsLeft !== undefined
            ? t('otpLoginScreen_invalidOtpAttempts', {count: action.attemptsLeft})
            : action.message,
        );
        setOtp('');
        break;
      case 'attempts_exceeded':
        setOtpError(action.message);
        setOtp('');
        setLocked(true);
        setResendIn(0);
        break;
      case 'not_registered_or_inactive':
        navigation.navigate(ScreenNames.Login, {role, schoolId, schoolName, otpError: action.message});
        break;
      case 'field_error':
      case 'cooldown':
      case 'limit_reached':
      case 'retryable':
      default:
        setOtpError(action.message);
        break;
    }
  };

  const resend = async (): Promise<void> => {
    setResendMessage('');
    setOtpError('');
    clearError();
    setResending(true);
    try {
      const result = await authApi.sendLoginOtp(phone, role, schoolId);
      setOtp('');
      setLocked(false);
      setResendIn(result.resendAfterSeconds);
      setExpiresIn(result.expiresInSeconds);
      setResendMessage(t('otpLoginScreen_resent'));
    } catch (e) {
      const action = interpretOtpError(e);
      switch (action.kind) {
        case 'cooldown':
          // A still-valid OTP already exists — just restart the countdown, stay put.
          setResendIn(action.retryAfterSeconds);
          break;
        case 'limit_reached':
          setOtpError(action.message);
          setResendIn(action.retryAfterSeconds);
          break;
        case 'not_registered_or_inactive':
          navigation.navigate(ScreenNames.Login, {role, schoolId, schoolName, otpError: action.message});
          break;
        case 'invalid_otp':
        case 'attempts_exceeded':
        case 'field_error':
        case 'retryable':
        default:
          setOtpError(action.message);
          break;
      }
    } finally {
      setResending(false);
    }
  };

  return (
    <Screen padded={false}>
      <CustomHeader title={t('otpLoginScreen_title')} onBack={() => navigation.goBack()} />
      <View style={styles.container}>
        <Spacer size={12} />
        <AppText variant="body" color="textSecondary">
          {t('otpLoginScreen_subtitle', {phone})}
        </AppText>
        {message ? (
          <>
            <Spacer size={4} />
            <AppText variant="caption" color="textMuted">
              {message}
            </AppText>
          </>
        ) : null}
        {schoolName ? (
          <>
            <Spacer size={4} />
            <AppText variant="caption" color="primary" style={{fontWeight: '700'}}>
              {schoolName}
            </AppText>
          </>
        ) : null}
        <Spacer size={4} />
        <CustomButton
          title={t('otpLoginScreen_editNumber')}
          variant="ghost"
          size="sm"
          fullWidth={false}
          onPress={() => navigation.goBack()}
        />

        <Spacer size={16} />
        <OtpInput
          length={OTP_LENGTH}
          value={otp}
          onChangeText={setOtp}
          onComplete={submit}
          error={otpError}
          disabled={locked}
          autoFocus
        />

        {resendMessage ? (
          <>
            <Spacer size={12} />
            <AppText variant="caption" color="success" center>
              {resendMessage}
            </AppText>
          </>
        ) : null}
        {expiresIn > 0 ? (
          <>
            <Spacer size={12} />
            <AppText variant="caption" color="textMuted" center>
              {t('otpLoginScreen_expiresIn', {time: formatCountdown(expiresIn)})}
            </AppText>
          </>
        ) : null}

        <Spacer size={20} />
        <CustomButton title={t('otpLoginScreen_verify')} onPress={() => submit(otp)} loading={isLoading} disabled={locked} />
        <Spacer size={12} />
        {resendIn > 0 ? (
          <AppText variant="caption" color="textMuted" center>
            {t('otpLoginScreen_resendIn', {time: formatCountdown(resendIn)})}
          </AppText>
        ) : (
          <CustomButton
            title={t('otpLoginScreen_resend')}
            variant={locked ? 'primary' : 'ghost'}
            onPress={resend}
            loading={resending}
          />
        )}
      </View>
    </Screen>
  );
}
