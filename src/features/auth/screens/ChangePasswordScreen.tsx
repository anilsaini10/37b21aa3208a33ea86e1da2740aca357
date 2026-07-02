/** Change password — reused from Teacher & Parent profile stacks. */
import React, {useState} from 'react';
import {View} from 'react-native';
import {useTheme} from '../../../core/theme';
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
  const {theme} = useTheme();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError('');
    if (next !== confirm) {
      setError('New password and confirmation do not match.');
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
      <CustomHeader title="Change Password" onBack={navigation.goBack} />
      <View style={{flex: 1, padding: theme.spacing.lg}}>
        <Spacer size={12} />
        <CustomInput label="Current Password" secure iconLeft="lock" value={current} onChangeText={setCurrent} required />
        <CustomInput label="New Password" secure iconLeft="lock" value={next} onChangeText={setNext} required />
        <CustomInput label="Confirm New Password" secure iconLeft="lock" value={confirm} onChangeText={setConfirm} required />
        {error ? (
          <AppText variant="caption" color="error">
            {error}
          </AppText>
        ) : null}
        {success ? (
          <AppText variant="caption" color="success">
            Password changed successfully.
          </AppText>
        ) : null}
        <Spacer size={8} />
        <CustomButton title="Update Password" onPress={submit} loading={loading} />
      </View>
    </Screen>
  );
}
