import React, {useEffect, useState} from 'react';
import {ActivityIndicator, Pressable, ScrollView, StatusBar, StyleSheet, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Svg, {Defs, LinearGradient, Rect, Stop} from 'react-native-svg';
import {lightTheme, ThemeContext, useTheme} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {AppText, AriseLogo, CustomCard, CustomInput, CustomButton, Icon, Spacer} from '../../../shared/components';
import {useAuthStore} from '../authStore';
import {authApi} from '../authApi';
import {interpretOtpError} from '../otpErrorHandling';
import {isValidEmail, isValidIndianMobile, isValidPhoneDigits} from '../../../shared/utils/validators';
import {formatCountdown} from '../../../core/utils/format';
import type {AuthScreenProps} from '../../../navigation/types';
import {ScreenNames} from '../../../navigation/ScreenNames';

const LOGO_SIZE = 88;

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

  const [mobile, setMobile] = useState('');
  const [mobileError, setMobileError] = useState('');
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
      setMobileError(route.params.otpError);
      navigation.setParams({otpError: undefined});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route.params.otpError]);

  const title =
    role === 'admin'
      ? t('loginScreen_adminTitle')
      : role === 'teacher'
        ? t('loginScreen_teacherTitle')
        : t('loginScreen_parentTitle');
  const clearFieldError = (field: keyof FieldErrors) => {
    if (error) {
      clearError();
    }
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({...prev, [field]: undefined}));
    }
  };

  /** identifier can be email or phone — validated as whichever format it looks like. */
  const validate = (): FieldErrors => {
    const errors: FieldErrors = {};
    const trimmed = identifier.trim();
    if (!trimmed) {
      errors.identifier = t('loginScreen_identifierRequired');
    } else if (trimmed.includes('@') ? !isValidEmail(trimmed) : !isValidPhoneDigits(trimmed)) {
      errors.identifier = t('loginScreen_identifierInvalid');
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
    if (Object.keys(errors).length > 0) {
      return;
    }
    await loginWithPassword(role, identifier.trim(), password, schoolId);
    // On success the root navigator swaps to the role stack automatically.
  };

  const sendOtp = async (): Promise<void> => {
    setOtpSendError('');
    const trimmed = mobile.trim();
    if (!trimmed) {
      setMobileError(t('loginScreen_mobileNumberRequired'));
      return;
    }
    if (!isValidIndianMobile(trimmed)) {
      setMobileError(t('loginScreen_mobileNumberInvalid'));
      return;
    }
    setMobileError('');
    setOtpSending(true);
    try {
      const result = await authApi.sendLoginOtp(trimmed, role, schoolId);
      navigation.navigate(ScreenNames.OtpLogin, {
        role,
        schoolId,
        schoolName,
        phone: trimmed,
        message: result.message,
        resendAfterSeconds: result.resendAfterSeconds,
        expiresInSeconds: result.expiresInSeconds,
      });
    } catch (e) {
      const action = interpretOtpError(e);
      switch (action.kind) {
        case 'cooldown':
          // A still-valid OTP already exists for this number — go straight to the OTP screen.
          navigation.navigate(ScreenNames.OtpLogin, {
            role,
            schoolId,
            schoolName,
            phone: trimmed,
            message: action.message,
            resendAfterSeconds: action.retryAfterSeconds,
            expiresInSeconds: 0,
          });
          break;
        case 'limit_reached':
          setMobileError(action.message);
          setSendBlockedSeconds(action.retryAfterSeconds);
          break;
        case 'field_error':
        case 'not_registered_or_inactive':
          setMobileError(action.message);
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

  return (
    <ThemeContext.Provider value={{...themeCtx, theme: lightTheme}}>
      <View style={[styles.root, {backgroundColor: '#F6F5FC'}]}>
        <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

        {/* Soft decorative blobs — trending airy gradient-mesh backdrop */}
        {/* <View
          pointerEvents="none"
          style={[styles.blob, styles.blobTopRight, {backgroundColor: theme.colors.primary}]}
        />
        <View
          pointerEvents="none"
          style={[styles.blob, styles.blobBottomLeft, {backgroundColor: theme.colors.secondary}]}
        /> */}

        <ScrollView
          style={{flex: 1}}
          contentContainerStyle={{paddingBottom: insets.bottom + theme.spacing.xl}}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={{paddingTop: insets.top + theme.spacing.sm, paddingHorizontal: theme.spacing.lg}}>
            <Row>
              <Pressable onPress={() => navigation.goBack()} hitSlop={10} style={styles.backButton}>
                <Icon name="back" size={20} color={theme.colors.text} />
              </Pressable>
              <AppText variant="headerTitle" style={{marginLeft: 12}}>
                {title}
              </AppText>
            </Row>
          </View>

          <View style={styles.brand}>
            <View style={styles.logoRing}>
              <View style={[styles.logoCircle, {backgroundColor: theme.colors.surface}]}>
                <AriseLogo size={48} />
              </View>
            </View>
            <Spacer size={18} />
            <AppText variant="h1" center>
              {t('loginScreen_welcomeBack')}
            </AppText>
            <Spacer size={6} />
            <AppText variant="body" color="textSecondary" center>
              {t('loginScreen_signInSubtitle')}
            </AppText>
            {schoolName ? (
              <>
                <Spacer size={4} />
                <AppText variant="caption" color="primary" center style={{fontWeight: '700'}}>
                  {schoolName}
                </AppText>
              </>
            ) : null}
          </View>

          <View style={{paddingHorizontal: theme.spacing.lg, marginTop: theme.spacing.xl}}>
            <Row style={styles.tabRow}>
              <Pressable
                style={[styles.tabPill, {backgroundColor: mode === 'password' ? theme.colors.primary : theme.colors.surfaceVariant}]}
                onPress={() => setMode('password')}>
                <AppText variant="label" style={{color: mode === 'password' ? theme.colors.onPrimary : theme.colors.textSecondary}}>
                  {t('loginScreen_tabPassword')}
                </AppText>
              </Pressable>
              <Pressable
                style={[styles.tabPill, {backgroundColor: mode === 'otp' ? theme.colors.primary : theme.colors.surfaceVariant}]}
                onPress={() => setMode('otp')}>
                <AppText variant="label" style={{color: mode === 'otp' ? theme.colors.onPrimary : theme.colors.textSecondary}}>
                  {t('loginScreen_tabMobileOtp')}
                </AppText>
              </Pressable>
            </Row>
            <Spacer size={16} />

            {mode === 'password' ? (
              <CustomCard
                style={{
                  borderWidth: 0,
                  borderRadius: 28,
                  shadowOpacity: 0.08,
                  shadowRadius: 24,
                  shadowOffset: {width: 0, height: 12},
                  elevation: 3,
                }}>
                <CustomInput
                  label={t('loginScreen_emailOrMobileLabel')}
                  placeholder={t('loginScreen_emailPlaceholder')}
                  iconLeft="email"
                  autoCapitalize="none"
                  value={identifier}
                  error={fieldErrors.identifier}
                  onChangeText={val => {
                    setIdentifier(val);
                    clearFieldError('identifier');
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
                  containerStyle={{marginBottom: 0}}
                  required
                />

                {error ? (
                  <AppText variant="caption" color="error" style={{marginTop: theme.spacing.sm}}>
                    {error}
                  </AppText>
                ) : null}
              </CustomCard>
            ) : (
              <CustomCard
                style={{
                  borderWidth: 0,
                  borderRadius: 28,
                  shadowOpacity: 0.08,
                  shadowRadius: 24,
                  shadowOffset: {width: 0, height: 12},
                  elevation: 3,
                }}>
                <CustomInput
                  label={t('loginScreen_mobileNumberLabel')}
                  placeholder={t('loginScreen_mobileNumberPlaceholder')}
                  prefix="+91"
                  keyboardType="number-pad"
                  maxLength={10}
                  value={mobile}
                  error={mobileError}
                  onChangeText={val => {
                    setMobile(val.replace(/\D/g, ''));
                    setMobileError('');
                    setOtpSendError('');
                  }}
                  containerStyle={{marginBottom: 0}}
                  required
                />
                {otpSendError ? (
                  <AppText variant="caption" color="error" style={{marginTop: theme.spacing.sm}}>
                    {otpSendError}
                  </AppText>
                ) : null}
              </CustomCard>
            )}

            <Spacer size={22} />
            {mode === 'password' ? (
              <>
                <GradientButton title={t('loginScreen_signIn')} onPress={onSubmit} loading={isLoading} />
                <Spacer size={6} />
                <CustomButton
                  title={t('loginScreen_forgotPassword')}
                  variant="ghost"
                  onPress={() => navigation.navigate('ForgotPassword')}
                />
              </>
            ) : (
              <>
                <GradientButton
                  title={
                    sendBlockedSeconds > 0
                      ? t('loginScreen_sendOtp') + ` (${formatCountdown(sendBlockedSeconds)})`
                      : t('loginScreen_sendOtp')
                  }
                  onPress={sendOtp}
                  loading={otpSending}
                  disabled={!isValidIndianMobile(mobile) || sendBlockedSeconds > 0}
                />
              </>
            )}

            {role === 'admin' ? (
              <>
                <Spacer size={10} />
                <Row style={{justifyContent: 'center'}}>
                  <AppText variant="caption" color="textSecondary">
                    {t('loginScreen_noAccount')}
                  </AppText>
                  <Pressable onPress={() => navigation.navigate(ScreenNames.SignUp)} hitSlop={8}>
                    <AppText variant="caption" color="primary" style={{fontWeight: '700', marginLeft: 6}}>
                      {t('loginScreen_signUp')}
                    </AppText>
                  </Pressable>
                </Row>
              </>
            ) : null}

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
  disabled,
}: {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}): React.JSX.Element {
  const {theme} = useTheme();
  const isDisabled = loading || disabled;
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({pressed}) => [styles.gradientButton, {opacity: pressed ? 0.9 : isDisabled ? 0.5 : 1}]}>
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
    // backgroundColor: 'rgba(99,102,241,0.12)',
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
  demoHint: {
    padding: 14,
    borderRadius: 16,
  },
  tabRow: {
    backgroundColor: '#EFEEFB',
    borderRadius: 999,
    padding: 4,
  },
  tabPill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 999,
    alignItems: 'center',
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
