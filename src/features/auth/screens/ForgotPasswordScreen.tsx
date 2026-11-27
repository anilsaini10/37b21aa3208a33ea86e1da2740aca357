/**
 * Forgot password — step 1 of 2. Email-only, public (no auth token, no
 * role/schoolId — works identically for admin/teacher/parent). The backend
 * always responds success (even for an unregistered email) so this screen
 * must never surface "unknown email" as an error — on success it just moves
 * on to the OTP + new-password step.
 */
import React, {useState} from 'react';
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
import {AppText, BackButton, CustomInput, Icon, Spacer} from '../../../shared/components';
import {authApi} from '../authApi';
import {isValidEmail} from '../../../shared/utils/validators';
import {ScreenNames} from '../../../navigation/ScreenNames';
import type {AuthScreenProps} from '../../../navigation/types';

export function ForgotPasswordScreen({navigation}: AuthScreenProps<'ForgotPassword'>): React.JSX.Element {
  const themeCtx = useTheme();
  const theme = lightTheme;
  const insets = useSafeAreaInsets();
  const {t} = useLanguage();

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
              {t('forgotPasswordScreen_title')}
            </AppText>
            <Spacer size={6} />
            <AppText variant="body" color="textSecondary">
              {t('forgotPasswordScreen_enterEmail')}
            </AppText>
          </View>

          {/* Form Card */}
          <View style={styles.formWrap}>
            <View style={styles.formCard}>
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
                <AppText variant="caption" color="error" style={{marginTop: 4}}>
                  {error}
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
                  <Icon name="email" size={20} color="#fff" />
                  <AppText variant="button" style={styles.btnText}>
                    {t('forgotPasswordScreen_sendCode')}
                  </AppText>
                </View>
              )}
            </TouchableOpacity>

            <Spacer size={16} />
            <Pressable
              onPress={() => navigation.goBack()}
              hitSlop={8}
              style={styles.linkRow}>
              <AppText variant="caption" color="textSecondary">
                {t('forgotPasswordScreen_backToLogin') ?? 'Back to Login'}
              </AppText>
            </Pressable>
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
  linkRow: {
    alignItems: 'center',
  },
  bgWave: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});
