import React, {useState} from 'react';
import {ActivityIndicator, Pressable, ScrollView, StatusBar, StyleSheet, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Svg, {Defs, LinearGradient, Rect, Stop} from 'react-native-svg';
import {lightTheme, ThemeContext, useTheme} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {AppText, CustomCard, CustomInput, Icon, Spacer} from '../../../shared/components';
import {useAuthStore} from '../authStore';
import {isValidEmail} from '../../../shared/utils/validators';
import type {AuthScreenProps} from '../../../navigation/types';
import {ScreenNames} from '../../../navigation/ScreenNames';

const LOGO_SIZE = 88;

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

  // Signup is admin-only — it creates the school along with the admin account.
  const {signup, isLoading, error, errorCode, clearError} = useAuthStore();

  const [schoolName, setSchoolName] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const title = t('loginScreen_adminTitle');
  const roleIcon = 'settings';

  const clearFieldError = (field: keyof FieldErrors) => {
    if (error) {
      clearError();
    }
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({...prev, [field]: undefined}));
    }
  };

  /** Mirrors the backend's validation rules so the user gets instant feedback. */
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
    // On success the root navigator swaps to the role stack automatically.
  };

  // Non-field errors (network, unexpected server errors) still show as a banner.
  const bannerError = error && errorCode !== 'EMAIL_TAKEN' ? error : null;

  return (
    <ThemeContext.Provider value={{...themeCtx, theme: lightTheme}}>
      <View style={[styles.root, {backgroundColor: '#F6F5FC'}]}>
        <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

        <View
          pointerEvents="none"
          style={[styles.blob, styles.blobTopRight, {backgroundColor: theme.colors.primary}]}
        />
        <View
          pointerEvents="none"
          style={[styles.blob, styles.blobBottomLeft, {backgroundColor: theme.colors.secondary}]}
        />

        <ScrollView
          style={styles.flex}
          contentContainerStyle={{paddingBottom: insets.bottom + theme.spacing.xl}}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={{paddingTop: insets.top + theme.spacing.sm, paddingHorizontal: theme.spacing.lg}}>
            <Row>
              <Pressable onPress={() => navigation.goBack()} hitSlop={10} style={styles.backButton}>
                <Icon name="back" size={20} color={theme.colors.text} />
              </Pressable>
              <AppText variant="headerTitle" style={styles.headerTitle}>
                {title}
              </AppText>
            </Row>
          </View>

          <View style={styles.brand}>
            <View style={styles.logoRing}>
              <View style={[styles.logoCircle, {backgroundColor: theme.colors.surface}]}>
                <Icon name={roleIcon} size={36} color={theme.colors.primary} />
              </View>
            </View>
            <Spacer size={18} />
            <AppText variant="h1" center>
              {t('signUpScreen_title')}
            </AppText>
            <Spacer size={6} />
            <AppText variant="body" color="textSecondary" center>
              {t('signUpScreen_subtitle')}
            </AppText>
          </View>

          <View style={{paddingHorizontal: theme.spacing.lg, marginTop: theme.spacing.xl}}>
            <CustomCard style={styles.formCard}>
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
                containerStyle={styles.lastInput}
                required
              />

              {bannerError ? (
                <AppText variant="caption" color="error" style={{marginTop: theme.spacing.sm}}>
                  {bannerError}
                </AppText>
              ) : null}
            </CustomCard>

            <Spacer size={22} />
            <GradientButton title={t('signUpScreen_createAccount')} onPress={onSubmit} loading={isLoading} />
            <Spacer size={16} />
            <Row style={styles.center}>
              <AppText variant="caption" color="textSecondary">
                {t('signUpScreen_alreadyHaveAccount')}
              </AppText>
              <Pressable onPress={() => navigation.navigate(ScreenNames.Login, {role: 'admin'})} hitSlop={8}>
                <AppText variant="caption" color="primary" style={styles.loginLink}>
                  {t('loginScreen_signIn')}
                </AppText>
              </Pressable>
            </Row>

            <Spacer size={22} />
          </View>
        </ScrollView>
      </View>
    </ThemeContext.Provider>
  );
}

function Row({children, style}: {children: React.ReactNode; style?: object | object[]}): React.JSX.Element {
  return <View style={[{flexDirection: 'row', alignItems: 'center'}, style]}>{children}</View>;
}

function GradientButton({
  title,
  onPress,
  loading,
}: {
  title: string;
  onPress: () => void;
  loading?: boolean;
}): React.JSX.Element {
  const {theme} = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      style={({pressed}) => [styles.gradientButton, {opacity: pressed ? 0.9 : loading ? 0.7 : 1}]}>
      <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
        <Defs>
          <LinearGradient id="ctaGradient" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0%" stopColor={theme.colors.primary} />
            <Stop offset="100%" stopColor={theme.colors.primaryVariant} />
          </LinearGradient>
        </Defs>
        <Rect x={0} y={0} width="100%" height="100%" fill="url(#ctaGradient)" />
      </Svg>
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <AppText variant="button" style={{color: '#fff'}}>
          {title}
        </AppText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  center: {
    justifyContent: 'center',
  },
  headerTitle: {
    marginLeft: 12,
  },
  loginLink: {
    marginLeft: 6,
    fontWeight: '700',
  },
  lastInput: {
    marginBottom: 0,
  },
  formCard: {
    borderWidth: 0,
    borderRadius: 28,
    shadowOpacity: 0.08,
    shadowRadius: 24,
    shadowOffset: {width: 0, height: 12},
    elevation: 3,
  },
  blob: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.1,
  },
  blobTopRight: {
    width: 220,
    height: 220,
    top: -80,
    right: -60,
  },
  blobBottomLeft: {
    width: 180,
    height: 180,
    top: 260,
    left: -80,
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
  brand: {
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 18,
  },
  logoRing: {
    width: LOGO_SIZE + 16,
    height: LOGO_SIZE + 16,
    borderRadius: (LOGO_SIZE + 16) / 2,
    backgroundColor: 'rgba(99,102,241,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoCircle: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    borderRadius: LOGO_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: {width: 0, height: 6},
    elevation: 4,
  },
  gradientButton: {
    height: 56,
    borderRadius: 18,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4F46E5',
    shadowOpacity: 0.3,
    shadowRadius: 14,
    shadowOffset: {width: 0, height: 8},
    elevation: 5,
  },
});
