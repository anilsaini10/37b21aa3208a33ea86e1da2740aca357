/**
 * Email OTP login — step 2. Reached from the "Email OTP" tab on LoginScreen
 * after an OTP has been sent. Verifying logs the user in exactly like
 * password login (same `AuthSession` shape) — the root navigator then swaps
 * to the role stack automatically.
 */
import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Svg, {Path} from 'react-native-svg';
import {lightTheme, ThemeContext, useTheme} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {formatCountdown} from '../../../core/utils/format';
import {AppText, BackButton, CustomButton, Icon, OtpInput, Spacer} from '../../../shared/components';
import {authApi} from '../authApi';
import {useAuthStore} from '../authStore';
import {interpretOtpError} from '../otpErrorHandling';
import {ScreenNames} from '../../../navigation/ScreenNames';
import type {AuthScreenProps} from '../../../navigation/types';

const OTP_LENGTH = 6;

export function OtpLoginScreen({navigation, route}: AuthScreenProps<'OtpLogin'>): React.JSX.Element {
  const themeCtx = useTheme();
  const theme = lightTheme;
  const insets = useSafeAreaInsets();
  const {t} = useLanguage();
  const {role, schoolId, schoolName, email, message, resendAfterSeconds, expiresInSeconds} = route.params;
  const {loginWithEmailOtp, isLoading, clearError} = useAuthStore();

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
    const ok = await loginWithEmailOtp(role, email!, code, schoolId);
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
      const result = await authApi.sendEmailLoginOtp(email!, role, schoolId);
      setOtp('');
      setLocked(false);
      setResendIn(result.resendAfterSeconds);
      setExpiresIn(result.expiresInSeconds);
      setResendMessage(t('otpLoginScreen_resent'));
    } catch (e) {
      const action = interpretOtpError(e);
      switch (action.kind) {
        case 'cooldown':
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
    <ThemeContext.Provider value={{...themeCtx, theme: lightTheme}}>
      <View style={styles.root}>
        <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

        <ScrollView
          style={{flex: 1}}
          contentContainerStyle={{paddingBottom: insets.bottom + theme.spacing.xl}}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {/* Back button */}
          <View style={{paddingTop: insets.top + theme.spacing.sm, paddingHorizontal: 24}}>
            <BackButton onPress={() => navigation.goBack()} style={styles.backButton} />
          </View>

          {/* Hero */}
          <View style={styles.heroSection}>
            <AppText variant="h1" style={styles.heading}>
              {t('otpLoginScreen_title')}
            </AppText>
            <Spacer size={6} />
            <AppText variant="body" color="textSecondary">
              {t('otpLoginScreen_emailSubtitle', {email: email ?? ''})}
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
            <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
              <AppText variant="caption" color="primary" style={{fontWeight: '600'}}>
                {t('otpLoginScreen_editEmail')}
              </AppText>
            </Pressable>
          </View>

          {/* Form Card */}
          <View style={styles.formWrap}>
            <View style={styles.formCard}>
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
            </View>

            <Spacer size={22} />

            {/* Verify button */}
            <TouchableOpacity
              style={[styles.submitBtn, {opacity: isLoading || locked ? 0.6 : 1}]}
              onPress={() => submit(otp)}
              disabled={isLoading || locked}
              activeOpacity={0.8}>
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <View style={styles.btnContent}>
                  <Icon name="check" size={20} color="#fff" />
                  <AppText variant="button" style={styles.btnText}>
                    {t('otpLoginScreen_verify')}
                  </AppText>
                </View>
              )}
            </TouchableOpacity>

            <Spacer size={12} />

            {/* Resend */}
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
        </ScrollView>

        {/* Background wave */}
        <View style={styles.bgWave} pointerEvents="none">
          <Svg width="100%" height={140} viewBox="0 0 400 140" preserveAspectRatio="none">
            <Path d="M0,70 C60,30 140,90 220,55 C300,20 360,75 400,50 L400,140 L0,140Z" fill="#4F46E5" opacity={0.06} />
            <Path d="M0,95 C80,60 180,110 260,80 C340,50 390,85 400,70 L400,140 L0,140Z" fill="#4F46E5" opacity={0.04} />
          </Svg>
        </View>
      </View>
    </ThemeContext.Provider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#EEF2FF',
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 2},
    elevation: 2,
  },
  heroSection: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 24,
  },
  heading: {
    fontSize: 28,
    fontWeight: '800',
  },
  formWrap: {
    paddingHorizontal: 20,
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#4F46E5',
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: {width: 0, height: 10},
    elevation: 4,
  },
  submitBtn: {
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4F46E5',
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: {width: 0, height: 8},
    elevation: 6,
  },
  btnContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontSize: 17,
    marginLeft: 8,
  },
  bgWave: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});
