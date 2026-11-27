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
import {useAuthStore} from '../authStore';
import {isValidEmail} from '../../../shared/utils/validators';
import type {AuthScreenProps} from '../../../navigation/types';
import {ScreenNames} from '../../../navigation/ScreenNames';

interface FieldErrors {
  schoolName?: string;
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
}

export function SignUpScreen({navigation}: AuthScreenProps<'SignUp'>): React.JSX.Element {
  const themeCtx = useTheme();
  const theme = lightTheme;
  const insets = useSafeAreaInsets();
  const {t} = useLanguage();

  const {signup, isLoading, error, errorCode, clearError} = useAuthStore();

  const [schoolName, setSchoolName] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const clearFieldError = (field: keyof FieldErrors) => {
    if (error) {
      clearError();
    }
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({...prev, [field]: undefined}));
    }
  };

  const validate = (): FieldErrors => {
    const errors: FieldErrors = {};
    const trimmedSchool = schoolName.trim();
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (trimmedSchool.length < 2 || trimmedSchool.length > 150) {
      errors.schoolName = t('signUpScreen_schoolNameError');
    }
    if (trimmedName.length < 2 || trimmedName.length > 100) {
      errors.name = t('signUpScreen_nameError');
    }
    if (!isValidEmail(trimmedEmail)) {
      errors.email = t('signUpScreen_emailError');
    }
    if (phone.length < 10 || phone.length > 15) {
      errors.phone = t('signUpScreen_phoneError');
    }
    if (password.length < 8 || password.length > 100) {
      errors.password = t('signUpScreen_passwordError');
    }
    if (confirmPassword !== password) {
      errors.confirmPassword = t('signUpScreen_passwordMismatch');
    }
    return errors;
  };

  const onSubmit = async () => {
    clearError();
    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }
    const ok = await signup({schoolName: schoolName.trim(), name: name.trim(), email: email.trim(), phone, password});
    if (!ok && useAuthStore.getState().errorCode === 'EMAIL_TAKEN') {
      setFieldErrors(prev => ({...prev, email: useAuthStore.getState().error ?? t('signUpScreen_emailTaken')}));
    }
  };

  const bannerError = error && errorCode !== 'EMAIL_TAKEN' ? error : null;

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
              {t('signUpScreen_title')}
            </AppText>
            <Spacer size={6} />
            <AppText variant="body" color="textSecondary">
              {t('signUpScreen_subtitle')}
            </AppText>
          </View>

          {/* Form Card */}
          <View style={styles.formWrap}>
            <View style={styles.formCard}>
              <CustomInput
                label={t('signUpScreen_schoolNameLabel')}
                placeholder={t('signUpScreen_schoolNamePlaceholder')}
                iconLeft="class"
                value={schoolName}
                error={fieldErrors.schoolName}
                onChangeText={val => {
                  setSchoolName(val);
                  clearFieldError('schoolName');
                }}
                required
              />
              <CustomInput
                label={t('signUpScreen_nameLabel')}
                placeholder={t('signUpScreen_namePlaceholder')}
                iconLeft="students"
                value={name}
                error={fieldErrors.name}
                onChangeText={val => {
                  setName(val);
                  clearFieldError('name');
                }}
                required
              />
              <CustomInput
                label={t('signUpScreen_emailLabel')}
                placeholder={t('loginScreen_emailPlaceholder')}
                iconLeft="email"
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                error={fieldErrors.email}
                onChangeText={val => {
                  setEmail(val);
                  clearFieldError('email');
                }}
                required
              />
              <CustomInput
                label={t('signUpScreen_phoneLabel')}
                placeholder={t('signUpScreen_phonePlaceholder')}
                iconLeft="phone"
                keyboardType="phone-pad"
                maxLength={15}
                value={phone}
                error={fieldErrors.phone}
                onChangeText={val => {
                  setPhone(val.replace(/[^0-9]/g, ''));
                  clearFieldError('phone');
                }}
                required
              />
              <CustomInput
                label={t('loginScreen_passwordLabel')}
                placeholder="••••••••"
                iconLeft="lock"
                secure
                value={password}
                error={fieldErrors.password}
                onChangeText={val => {
                  setPassword(val);
                  clearFieldError('password');
                }}
                required
              />
              <CustomInput
                label={t('signUpScreen_confirmPasswordLabel')}
                placeholder="••••••••"
                iconLeft="lock"
                secure
                value={confirmPassword}
                error={fieldErrors.confirmPassword}
                onChangeText={val => {
                  setConfirmPassword(val);
                  clearFieldError('confirmPassword');
                }}
                required
              />

              {bannerError ? (
                <AppText variant="caption" color="error" style={{marginTop: 4}}>
                  {bannerError}
                </AppText>
              ) : null}
            </View>

            <Spacer size={22} />

            <TouchableOpacity
              style={[styles.submitBtn, {opacity: isLoading ? 0.6 : 1}]}
              onPress={onSubmit}
              disabled={isLoading}
              activeOpacity={0.8}>
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <View style={styles.btnContent}>
                  <Icon name="sign-in" size={20} color="#fff" />
                  <AppText variant="button" style={styles.btnText}>
                    {t('signUpScreen_createAccount')}
                  </AppText>
                </View>
              )}
            </TouchableOpacity>

            <Spacer size={16} />
            <View style={styles.linkRow}>
              <AppText variant="caption" color="textSecondary">
                {t('signUpScreen_alreadyHaveAccount')}
              </AppText>
              <Pressable onPress={() => navigation.navigate(ScreenNames.Login, {role: 'admin'})} hitSlop={8}>
                <AppText variant="caption" color="primary" style={styles.loginLink}>
                  {t('loginScreen_signIn')}
                </AppText>
              </Pressable>
            </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginLink: {
    marginLeft: 6,
    fontWeight: '700',
  },
  bgWave: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});
