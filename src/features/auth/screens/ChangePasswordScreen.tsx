/** Change password — reused from Teacher & Parent profile stacks. */
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
import {authApi} from '../authApi';

export function ChangePasswordScreen({navigation}: {navigation: {goBack: () => void}}): React.JSX.Element {
  const {t} = useLanguage();
  const styles = useThemedStyles(theme => ({
    container: {
      flex: 1,
      padding: theme.spacing.lg,
    },
  }));
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError('');
    if (next !== confirm) {
      setError(t('changePasswordScreen_passwordMismatch'));
      return;
    }
    setLoading(true);
    try {
      await authApi.changePassword(current, next);
      setSuccess(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen padded={false}>
      <CustomHeader title={t('changePasswordScreen_title')} onBack={navigation.goBack} />
      <View style={styles.container}>
        <Spacer size={12} />
        <CustomInput label={t('changePasswordScreen_currentPasswordLabel')} secure iconLeft="lock" value={current} onChangeText={setCurrent} required />
        <CustomInput label={t('changePasswordScreen_newPasswordLabel')} secure iconLeft="lock" value={next} onChangeText={setNext} required />
        <CustomInput label={t('changePasswordScreen_confirmNewPasswordLabel')} secure iconLeft="lock" value={confirm} onChangeText={setConfirm} required />
        {error ? (
          <AppText variant="caption" color="error">
            {error}
          </AppText>
        ) : null}
        {success ? (
          <AppText variant="caption" color="success">
            {t('changePasswordScreen_successMessage')}
          </AppText>
        ) : null}
        <Spacer size={8} />
        <CustomButton title={t('changePasswordScreen_updatePassword')} onPress={submit} loading={loading} />
      </View>
    </Screen>
  );
}
