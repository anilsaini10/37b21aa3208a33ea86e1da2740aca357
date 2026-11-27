/**
 * Change password — one form reused across Admin/Teacher/Parent profile stacks,
 * pointed at that role's own endpoint (never a shared hardcoded URL):
 *   admin   -> POST /api/auth/reset-password
 *   teacher -> POST /api/teacher/reset-password
 *   parent  -> POST /api/students/reset-password
 *
 * All three revoke every OTHER session's refresh token on success — this
 * device stays logged in — and return a wrong current password as a 401 with
 * `code: "INVALID_CURRENT_PASSWORD"`, which is what the field-level error below
 * branches on.
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
import {AppText, BackButton, CustomInput, Icon, Spacer} from '../../../shared/components';
import {useAuthStore} from '../authStore';
import {useChangeAdminPassword} from '../../admin/adminAuth.service';
import {useChangeTeacherPassword} from '../../teacher/teacherAuth.service';
import {useChangeParentPassword} from '../../parent/parentAuth.service';

const MIN_PASSWORD_LENGTH = 6;
const NAVIGATE_BACK_DELAY_MS = 1200;

export function ChangePasswordScreen({navigation}: {navigation: {goBack: () => void}}): React.JSX.Element {
  const themeCtx = useTheme();
  const theme = lightTheme;
  const insets = useSafeAreaInsets();
  const {t} = useLanguage();
  const role = useAuthStore(s => s.user?.role);

  const adminMutation = useChangeAdminPassword();
  const teacherMutation = useChangeTeacherPassword();
  const parentMutation = useChangeParentPassword();
  const mutation = role === 'admin' ? adminMutation : role === 'teacher' ? teacherMutation : parentMutation;

  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [currentError, setCurrentError] = useState('');
  const [newError, setNewError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const submit = (): void => {
    setCurrentError('');
    setNewError('');
    setConfirmError('');
    setGeneralError('');
    setSuccessMessage('');

    if (!current) {
      setCurrentError(t('common_fieldRequired', {field: t('changePasswordScreen_currentPasswordLabel')}));
      return;
    }
    if (next.length < MIN_PASSWORD_LENGTH) {
      setNewError(t('changePasswordScreen_newPasswordTooShort', {min: MIN_PASSWORD_LENGTH}));
      return;
    }
    if (next !== confirm) {
      setConfirmError(t('changePasswordScreen_passwordMismatch'));
      return;
    }

    mutation.mutate(
      {currentPassword: current, newPassword: next},
      {
        onSuccess: () => {
          setSuccessMessage(t('changePasswordScreen_devicesLoggedOutMessage'));
          setTimeout(() => navigation.goBack(), NAVIGATE_BACK_DELAY_MS);
        },
        onError: (e: Error & {code?: string}) => {
          if (e.code === 'INVALID_CURRENT_PASSWORD') {
            setCurrentError(t('changePasswordScreen_currentPasswordIncorrect'));
          } else {
            setGeneralError(e.message);
          }
        },
      },
    );
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
              {t('changePasswordScreen_title')}
            </AppText>
            <Spacer size={6} />
            <AppText variant="body" color="textSecondary">
              {t('changePasswordScreen_subtitle') ?? 'Enter your current password and choose a new one'}
            </AppText>
          </View>

          {/* Form Card */}
          <View style={styles.formWrap}>
            <View style={styles.formCard}>
              <CustomInput
                label={t('changePasswordScreen_currentPasswordLabel')}
                secure
                iconLeft="lock"
                value={current}
                onChangeText={val => {
                  setCurrent(val);
                  setCurrentError('');
                }}
                error={currentError}
                required
              />
              <CustomInput
                label={t('changePasswordScreen_newPasswordLabel')}
                secure
                iconLeft="lock"
                value={next}
                onChangeText={val => {
                  setNext(val);
                  setNewError('');
                }}
                error={newError}
                required
              />
              <CustomInput
                label={t('changePasswordScreen_confirmNewPasswordLabel')}
                secure
                iconLeft="lock"
                value={confirm}
                onChangeText={val => {
                  setConfirm(val);
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
            </View>

            <Spacer size={22} />

            <TouchableOpacity
              style={[styles.submitBtn, {opacity: mutation.isPending ? 0.6 : 1}]}
              onPress={submit}
              disabled={mutation.isPending}
              activeOpacity={0.8}>
              {mutation.isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <View style={styles.btnContent}>
                  <Icon name="lock" size={20} color="#fff" />
                  <AppText variant="button" style={styles.btnText}>
                    {t('changePasswordScreen_updatePassword')}
                  </AppText>
                </View>
              )}
            </TouchableOpacity>
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
