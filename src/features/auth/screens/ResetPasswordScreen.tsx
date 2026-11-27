/**
 * Reset password — step 2 of 2. OTP (6 digits, emailed in step 1) + new
 * password. Public (no auth token). On success the backend revokes every
 * existing session/refresh token for this user, so we always land back on
 * Login rather than trying to keep the device signed in — `navigation.pop(2)`
 * drops both ForgotPassword and this screen, returning to the exact Login
 * instance (with its original role param intact) the user started from.
 */
import React, {useState} from 'react';
import {
  ActivityIndicator,
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
import {AppText, BackButton, CustomButton, CustomInput, Icon, Spacer} from '../../../shared/components';
import {authApi} from '../authApi';
import type {AuthScreenProps} from '../../../navigation/types';

const OTP_LENGTH = 6;
const MIN_PASSWORD_LENGTH = 6;
const NAVIGATE_LOGIN_DELAY_MS = 1200;

export function ResetPasswordScreen({navigation, route}: AuthScreenProps<'ResetPassword'>): React.JSX.Element {
  const themeCtx = useTheme();
  const theme = lightTheme;
  const insets = useSafeAreaInsets();
  const {t} = useLanguage();
  const {email} = route.params;

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
              {t('resetPasswordScreen_title')}
            </AppText>
            <Spacer size={6} />
            <AppText variant="body" color="textSecondary">
              {t('resetPasswordScreen_instructions')}
            </AppText>
          </View>

          {/* Form Card */}
          <View style={styles.formWrap}>
            <View style={styles.formCard}>
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
                <AppText variant="caption" color="error" style={{marginTop: 4}}>
                  {generalError}
                </AppText>
              ) : null}
              {successMessage ? (
                <AppText variant="caption" color="success" style={{marginTop: 4}}>
                  {successMessage}
                </AppText>
              ) : null}
              {resendMessage ? (
                <AppText variant="caption" color="success" style={{marginTop: 4}}>
                  {resendMessage}
                </AppText>
              ) : null}
            </View>

            <Spacer size={22} />

            <TouchableOpacity
              style={[styles.submitBtn, {opacity: loading ? 0.6 : 1}]}
              onPress={submit}
              disabled={loading}
              activeOpacity={0.8}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <View style={styles.btnContent}>
                  <Icon name="lock" size={20} color="#fff" />
                  <AppText variant="button" style={styles.btnText}>
                    {t('resetPasswordScreen_resetButton')}
                  </AppText>
                </View>
              )}
            </TouchableOpacity>

            <Spacer size={12} />
            <CustomButton
              title={t('resetPasswordScreen_resendCode')}
              variant="ghost"
              onPress={resendOtp}
              loading={resending}
            />
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
