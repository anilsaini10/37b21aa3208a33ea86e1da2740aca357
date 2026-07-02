/** Forgot password — request a reset link/OTP. */
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
  Icon,
} from '../../../shared/components';
import {authApi} from '../authApi';
import type {AuthScreenProps} from '../../../navigation/types';

export function ForgotPasswordScreen({
  navigation,
}: AuthScreenProps<'ForgotPassword'>): React.JSX.Element {
  const {theme} = useTheme();
  const [identifier, setIdentifier] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError('');
    setLoading(true);
    try {
      await authApi.forgotPassword(identifier);
      setSent(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen padded={false}>
      <CustomHeader title="Forgot Password" onBack={() => navigation.goBack()} />
      <View style={{flex: 1, padding: theme.spacing.lg}}>
        {sent ? (
          <View style={{alignItems: 'center', marginTop: theme.spacing.xxl, rowGap: theme.spacing.sm}}>
            <Icon name="success" size={56} />
            <AppText variant="h3" center>
              Reset link sent
            </AppText>
            <AppText variant="caption" color="textSecondary" center>
              Check your email / SMS for instructions to reset your password.
            </AppText>
            <Spacer size={16} />
            <CustomButton title="Back to Login" onPress={() => navigation.goBack()} fullWidth={false} />
          </View>
        ) : (
          <>
            <Spacer size={12} />
            <AppText variant="caption" color="textSecondary">
              Enter your registered email or mobile number and we'll send you reset instructions.
            </AppText>
            <Spacer size={20} />
            <CustomInput
              label="Email or Mobile"
              placeholder="you@school.edu"
              iconLeft="email"
              autoCapitalize="none"
              value={identifier}
              onChangeText={setIdentifier}
              required
            />
            {error ? (
              <AppText variant="caption" color="error">
                {error}
              </AppText>
            ) : null}
            <Spacer size={8} />
            <CustomButton title="Send Reset Link" onPress={submit} loading={loading} />
          </>
        )}
      </View>
    </Screen>
  );
}
