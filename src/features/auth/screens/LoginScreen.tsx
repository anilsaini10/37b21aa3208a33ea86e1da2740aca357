import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Image,
  type ImageSourcePropType,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Svg, {Circle, Line, Path, Rect} from 'react-native-svg';
import {lightTheme, ThemeContext, useTheme} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {AppText, CustomInput, Icon, Spacer} from '../../../shared/components';
import {useAuthStore} from '../authStore';
import {authApi} from '../authApi';
import {interpretOtpError} from '../otpErrorHandling';
import {isValidEmail} from '../../../shared/utils/validators';
import {formatCountdown} from '../../../core/utils/format';
import type {AuthScreenProps} from '../../../navigation/types';
import {ScreenNames} from '../../../navigation/ScreenNames';

/* ---------- Role config ---------- */

const ACCENT = '#4F46E5';

type RoleKey = 'admin' | 'teacher' | 'parent';

interface RoleConfig {
  descKey: 'loginScreen_adminDesc' | 'loginScreen_teacherDesc' | 'loginScreen_parentDesc';
  image: ImageSourcePropType;
}

const ROLE_CONFIG: Record<RoleKey, RoleConfig> = {
  admin: {
    descKey: 'loginScreen_adminDesc',
    image: require('../../../assets/images/adminLogin.png'),
  },
  teacher: {
    descKey: 'loginScreen_teacherDesc',
    image: require('../../../assets/images/teacherLogin.png'),
  },
  parent: {
    descKey: 'loginScreen_parentDesc',
    image: require('../../../assets/images/parentsRole.png'),
  },
};

const DEFAULT_CONFIG = ROLE_CONFIG.teacher;

/* ---------- Component ---------- */

type LoginMode = 'password' | 'otp';

interface FieldErrors {
  identifier?: string;
  password?: string;
}

export function LoginScreen({route, navigation}: AuthScreenProps<'Login'>): React.JSX.Element {
  const themeCtx = useTheme();
  const theme = lightTheme;
  const insets = useSafeAreaInsets();
  const {t} = useLanguage();

  const {role, schoolId, schoolName} = route.params;
  const {loginWithPassword, isLoading, error, clearError} = useAuthStore();

  const [mode, setMode] = useState<LoginMode>('password');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [rememberMe, setRememberMe] = useState(false);

  const [otpEmail, setOtpEmail] = useState('');
  const [otpEmailError, setOtpEmailError] = useState('');
  const [otpSendError, setOtpSendError] = useState('');
  const [otpSending, setOtpSending] = useState(false);
  const [sendBlockedSeconds, setSendBlockedSeconds] = useState(0);

  useEffect(() => {
    const handle = setInterval(() => {
      setSendBlockedSeconds(prev => (prev > 0 ? prev - 1 : prev));
    }, 1000);
    return () => clearInterval(handle);
  }, []);

  useEffect(() => {
    if (route.params.otpError) {
      setMode('otp');
      setOtpEmailError(route.params.otpError);
      navigation.setParams({otpError: undefined});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route.params.otpError]);

  const cfg = ROLE_CONFIG[role as RoleKey] ?? DEFAULT_CONFIG;
  const accent = ACCENT;

  const fullTitle =
    role === 'admin'
      ? t('loginScreen_adminTitle')
      : role === 'teacher'
        ? t('loginScreen_teacherTitle')
        : t('loginScreen_parentTitle');

  const spaceIdx = fullTitle.lastIndexOf(' ');
  const roleName = spaceIdx > 0 ? fullTitle.substring(0, spaceIdx) : fullTitle;
  const loginWord = (spaceIdx > 0 ? fullTitle.substring(spaceIdx + 1) : '');

  const clearFieldError = (field: keyof FieldErrors) => {
    if (error) clearError();
    if (fieldErrors[field]) setFieldErrors(prev => ({...prev, [field]: undefined}));
  };

  const validate = (): FieldErrors => {
    const errors: FieldErrors = {};
    const trimmed = identifier.trim();
    if (!trimmed) {
      errors.identifier = t('loginScreen_emailRequired');
    } else if (!isValidEmail(trimmed)) {
      errors.identifier = t('loginScreen_emailInvalid');
    }
    if (!password) {
      errors.password = t('loginScreen_passwordRequired');
    }
    return errors;
  };

  const onSubmit = async () => {
    clearError();
    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;
    await loginWithPassword(role, identifier.trim(), password, schoolId);
  };

  const sendOtp = async (): Promise<void> => {
    setOtpSendError('');
    const trimmed = otpEmail.trim();
    if (!trimmed) {
      setOtpEmailError(t('loginScreen_emailRequired'));
      return;
    }
    if (!isValidEmail(trimmed)) {
      setOtpEmailError(t('loginScreen_emailInvalid'));
      return;
    }
    setOtpEmailError('');
    setOtpSending(true);
    try {
      const result = await authApi.sendEmailLoginOtp(trimmed, role, schoolId);
      navigation.navigate(ScreenNames.OtpLogin, {
        role,
        schoolId,
        schoolName,
        email: trimmed,
        message: result.message,
        resendAfterSeconds: result.resendAfterSeconds,
        expiresInSeconds: result.expiresInSeconds,
      });
    } catch (e) {
      const action = interpretOtpError(e);
      switch (action.kind) {
        case 'cooldown':
          navigation.navigate(ScreenNames.OtpLogin, {
            role,
            schoolId,
            schoolName,
            email: trimmed,
            message: action.message,
            resendAfterSeconds: action.retryAfterSeconds,
            expiresInSeconds: 0,
          });
          break;
        case 'limit_reached':
          setOtpEmailError(action.message);
          setSendBlockedSeconds(action.retryAfterSeconds);
          break;
        case 'field_error':
        case 'not_registered_or_inactive':
          setOtpEmailError(action.message);
          break;
        case 'invalid_otp':
        case 'attempts_exceeded':
        case 'retryable':
        default:
          setOtpSendError(action.message);
          break;
      }
    } finally {
      setOtpSending(false);
    }
  };

  const isSubmitDisabled =
    mode === 'password'
      ? isLoading
      : otpSending || !isValidEmail(otpEmail.trim()) || sendBlockedSeconds > 0;
  const submitTitle =
    mode === 'password'
      ? t('loginScreen_signIn')
      : sendBlockedSeconds > 0
        ? t('loginScreen_sendOtp') + ` (${formatCountdown(sendBlockedSeconds)})`
        : t('loginScreen_sendOtp');
  const submitLoading = mode === 'password' ? isLoading : otpSending;

  return (
    <ThemeContext.Provider value={{...themeCtx, theme: lightTheme}}>
      <View style={styles.root}>
        <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

        <ScrollView
          style={{flex: 1}}
          contentContainerStyle={{paddingBottom: insets.bottom + theme.spacing.xl}}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {/* Back Button */}
          <Pressable
            onPress={() => navigation.goBack()}
            style={[styles.backBtn, {top: insets.top + 10}]}
            hitSlop={12}>
            <Icon name="back" size={20} color="#374151" />
          </Pressable>

          {/* Role description at top */}
          <View style={[styles.roleDescTop, {paddingTop: insets.top + 48}]}>
            <AppText variant="caption" color="textSecondary" center style={styles.roleDesc}>
              {/* {t(cfg.descKey)} */}
            </AppText>
          </View>

          <Spacer size={16} />

          {/* Hero — Left-bar Title + Character Image */}
          <View style={styles.heroSection}>
            <View style={styles.heroTextWrap}>
              <View style={styles.titleRow}>
                <View style={[styles.titleBar, {backgroundColor: accent}]} />
                <View style={styles.titleTextCol}>
                  <AppText style={styles.heroTitleBold}>{roleName}</AppText>
                  <AppText style={styles.heroTitleLight}>{loginWord}</AppText>
                </View>
              </View>
              <Spacer size={10} />
              <AppText variant="body" style={[styles.heroDesc, {color: accent}]}>
                {schoolName || ''}
              </AppText>
            </View>
            <Image
              source={cfg.image}
              style={styles.heroImage}
              resizeMode="contain"
            />
          </View>

          {/* Form Card */}
          <View style={styles.formSection}>
            <View style={styles.formCard}>
              {/* Email Input */}
              {mode === 'password' ? (
                <CustomInput
                  label={t('loginScreen_emailLabel')}
                  placeholder={t('loginScreen_emailPlaceholder')}
                  iconLeft="email"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={identifier}
                  error={fieldErrors.identifier}
                  onChangeText={val => {
                    setIdentifier(val);
                    clearFieldError('identifier');
                  }}
                  required
                />
              ) : (
                <CustomInput
                  label={t('loginScreen_emailLabel')}
                  placeholder={t('loginScreen_emailPlaceholder')}
                  iconLeft="email"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={otpEmail}
                  error={otpEmailError}
                  onChangeText={val => {
                    setOtpEmail(val);
                    setOtpEmailError('');
                    setOtpSendError('');
                  }}
                  required
                />
              )}

              {/* Radio Buttons — Password / Email OTP */}
              <View style={styles.radioRow}>
                <Pressable
                  onPress={() => setMode('password')}
                  style={styles.radioOption}>
                  <View
                    style={[
                      styles.radioOuter,
                      mode === 'password' && {borderColor: accent},
                    ]}>
                    {mode === 'password' && (
                      <View
                        style={[styles.radioInner, {backgroundColor: accent}]}
                      />
                    )}
                  </View>
                  <AppText
                    variant="label"
                    style={{
                      marginLeft: 6,
                      color: mode === 'password' ? accent : '#6B7280',
                    }}>
                    {t('loginScreen_tabPassword')}
                  </AppText>
                </Pressable>
                <Pressable
                  onPress={() => setMode('otp')}
                  style={styles.radioOption}>
                  <View
                    style={[
                      styles.radioOuter,
                      mode === 'otp' && {borderColor: accent},
                    ]}>
                    {mode === 'otp' && (
                      <View
                        style={[styles.radioInner, {backgroundColor: accent}]}
                      />
                    )}
                  </View>
                  <AppText
                    variant="label"
                    style={{
                      marginLeft: 6,
                      color: mode === 'otp' ? accent : '#6B7280',
                    }}>
                    {t('loginScreen_tabEmailOtp')}
                  </AppText>
                </Pressable>
              </View>

              {/* Password Input */}
              {mode === 'password' && (
                <CustomInput
                  label={t('loginScreen_passwordLabel')}
                  placeholder={t('loginScreen_enterPassword')}
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
              )}

              {/* Remember Me + Forgot Password */}
              {mode === 'password' && (
                <View style={styles.rememberRow}>
                  <Pressable
                    style={styles.rememberBtn}
                    onPress={() => setRememberMe(prev => !prev)}
                    hitSlop={4}>
                    <View
                      style={[
                        styles.checkbox,
                        rememberMe && [styles.checkboxChecked, {backgroundColor: accent, borderColor: accent}],
                      ]}>
                      {rememberMe && (
                        <Icon name="check" size={12} color="#fff" />
                      )}
                    </View>
                    <AppText variant="caption" style={styles.rememberText}>
                      {t('loginScreen_rememberMe')}
                    </AppText>
                  </Pressable>
                  <Pressable
                    onPress={() => navigation.navigate(ScreenNames.ForgotPassword)}
                    hitSlop={8}>
                    <AppText variant="caption" style={[styles.forgotText, {color: accent}]}>
                      {t('loginScreen_forgotPassword')}
                    </AppText>
                  </Pressable>
                </View>
              )}

              {/* Error Messages */}
              {mode === 'password' && error ? (
                <AppText variant="caption" color="error" style={{marginTop: 8}}>
                  {error}
                </AppText>
              ) : null}
              {mode === 'otp' && otpSendError ? (
                <AppText variant="caption" color="error" style={{marginTop: 8}}>
                  {otpSendError}
                </AppText>
              ) : null}
            </View>

            <Spacer size={22} />

            {/* Sign In / Send OTP Button */}
            <TouchableOpacity
              style={[
                styles.signInBtn,
                {backgroundColor: accent, shadowColor: accent, opacity: isSubmitDisabled ? 0.5 : 1},
              ]}
              onPress={mode === 'password' ? onSubmit : sendOtp}
              disabled={isSubmitDisabled}
              activeOpacity={0.8}>
              {submitLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <View style={styles.signInContent}>
                  <Icon name="sign-in" size={18} color="#fff" />
                  <AppText variant="button" style={styles.signInText}>
                    {submitTitle}
                  </AppText>
                </View>
              )}
            </TouchableOpacity>

            {/* Admin: Sign Up */}
            {role === 'admin' ? (
              <>
                <Spacer size={16} />
                <View style={styles.linkRow}>
                  <AppText variant="caption" color="textSecondary">
                    {t('loginScreen_noAccount')}
                  </AppText>
                  <Pressable
                    onPress={() => navigation.navigate(ScreenNames.SignUp)}
                    hitSlop={8}>
                    <AppText
                      variant="caption"
                      style={{fontWeight: '700', marginLeft: 4, color: accent}}>
                      {t('loginScreen_signUp')}
                    </AppText>
                  </Pressable>
                </View>
              </>
            ) : null}

            {/* Need help? Request Admin */}
            <Spacer size={role === 'admin' ? 10 : 20} />
            <View style={styles.helpRow}>
              <View style={styles.helpLine} />
              <AppText variant="caption" style={styles.helpLabel}>
                {t('loginScreen_needHelp')}
              </AppText>
              <Pressable
                onPress={() => navigation.navigate(ScreenNames.RequestAdmin)}
                hitSlop={8}>
                <AppText variant="caption" style={[styles.helpLink, {color: accent}]}>
                  {t('loginScreen_requestAdminLink')}
                </AppText>
              </Pressable>
              <View style={styles.helpLine} />
            </View>
          </View>

          <Spacer size={32} />

        </ScrollView>
      </View>
    </ThemeContext.Provider>
  );
}

/* ---------- Styles ---------- */

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#EEF2FF',
  },
  backBtn: {
    position: 'absolute',
    left: 16,
    zIndex: 10,
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

  /* Role description top */
  roleDescTop: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  roleDesc: {
    lineHeight: 20,
  },

  /* Hero */
  heroSection: {
    flexDirection: 'row',
    paddingLeft: 24,
    paddingRight: 8,
    alignItems: 'flex-start',
    marginBottom: -4,
  },
  heroTextWrap: {
    flex: 1,
    paddingTop: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  titleBar: {
    width: 5,
    borderRadius: 3,
    marginRight: 12,
  },
  titleTextCol: {},
  heroTitleBold: {
    fontSize: 32,
    lineHeight: 38,
    fontFamily: 'Inter-Bold',
    fontWeight: '800',
    color: '#1E293B',
  },
  heroTitleLight: {
    fontSize: 32,
    lineHeight: 38,
    fontFamily: 'Inter-Regular',
    fontWeight: '400',
    color: '#94A3B8',
  },
  heroDesc: {
    color: '#64748B',
    fontSize: 14,
    lineHeight: 21,
  },
  heroImage: {
    width: 160,
    height: 160,
    marginTop: -20,
    marginRight: -8,
  },

  /* Form */
  formSection: {
    paddingHorizontal: 20,
    marginTop: 25,
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: {width: 0, height: 10},
    elevation: 4,
  },

  /* Radio buttons */
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    marginBottom: 12,
    gap: 24,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },

  /* Remember / Forgot */
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  rememberBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  checkboxChecked: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  rememberText: {
    color: '#475569',
    marginLeft: 8,
  },
  forgotText: {
    fontWeight: '600',
    textDecorationLine: 'underline',
  },

  /* Sign In button */
  signInBtn: {
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: {width: 0, height: 8},
    elevation: 6,
    marginTop: 20
  },
  signInContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  signInText: {
    color: '#fff',
    fontSize: 15,
    marginLeft: 8,
  },

  /* Bottom links */
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  helpLabel: {
    color: '#94A3B8',
    marginHorizontal: 8,
  },
  helpLink: {
    fontWeight: '700',
    marginHorizontal: 8,
  },

  /* Building */
  buildingWrap: {
    alignItems: 'center',
    marginBottom: 8,
  },
});
