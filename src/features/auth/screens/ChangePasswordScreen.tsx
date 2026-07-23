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
import {View} from 'react-native';
import {useThemedStyles} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {
  Screen,
  AppText,
  CustomInput,
  CustomButton,
  CustomHeader,
  Spacer,
} from '../../../shared/components';
import {useAuthStore} from '../authStore';
import {useChangeAdminPassword} from '../../admin/adminAuth.service';
import {useChangeTeacherPassword} from '../../teacher/teacherAuth.service';
import {useChangeParentPassword} from '../../parent/parentAuth.service';

const MIN_PASSWORD_LENGTH = 6;
const NAVIGATE_BACK_DELAY_MS = 1200;

export function ChangePasswordScreen({navigation}: {navigation: {goBack: () => void}}): React.JSX.Element {
  const {t} = useLanguage();
  const styles = useThemedStyles(theme => ({
    container: {
      flex: 1,
      padding: theme.spacing.lg,
    },
  }));
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
    <Screen padded={false}>
      <CustomHeader title={t('changePasswordScreen_title')} onBack={navigation.goBack} />
      <View style={styles.container}>
        <Spacer size={12} />
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
          <AppText variant="caption" color="error">
            {generalError}
          </AppText>
        ) : null}
        {successMessage ? (
          <AppText variant="caption" color="success">
            {successMessage}
          </AppText>
        ) : null}
        <Spacer size={8} />
        <CustomButton title={t('changePasswordScreen_updatePassword')} onPress={submit} loading={mutation.isPending} />
      </View>
    </Screen>
  );
}
