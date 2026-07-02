/** Parent login — mobile number + OTP verification. */
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
import {useAuthStore} from '../authStore';
import {authApi} from '../authApi';
import type {AuthScreenProps} from '../../../navigation/types';

export function ParentLoginScreen({navigation}: AuthScreenProps<'ParentLogin'>): React.JSX.Element {
  const {theme} = useTheme();
  const {verifyOtp, isLoading, error, clearError} = useAuthStore();

  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [hint, setHint] = useState('');
  const [localError, setLocalError] = useState('');

  const requestOtp = async () => {
    setLocalError('');
    try {
      const res = await authApi.requestOtp(phone);
      setHint(res.hint);
      setStep('otp');
    } catch (e) {
      setLocalError((e as Error).message);
    }
  };

  const submitOtp = async () => {
    clearError();
    await verifyOtp(phone, otp);
  };

  return (
    <Screen padded={false}>
      <CustomHeader title="Parent Login" onBack={() => navigation.goBack()} />
      <View style={{flex: 1, padding: theme.spacing.lg}}>
        <Spacer size={12} />
        <AppText variant="h2">
          {step === 'phone' ? 'Enter your mobile' : 'Verify OTP'}
        </AppText>
        <AppText variant="caption" color="textSecondary">
          {step === 'phone'
            ? "We'll send a one-time password to your registered number."
            : `Enter the 4-digit code sent to ${phone}.`}
        </AppText>
        <Spacer size={24} />

        {step === 'phone' ? (
          <>
            <CustomInput
              label="Mobile Number"
              placeholder="10-digit number"
              iconLeft="phone"
              keyboardType="phone-pad"
              maxLength={10}
              value={phone}
              onChangeText={t => {
                setPhone(t.replace(/[^0-9]/g, ''));
                setLocalError('');
              }}
              required
            />
            {localError ? (
              <AppText variant="caption" color="error">
                {localError}
              </AppText>
            ) : null}
            <Spacer size={8} />
            <CustomButton title="Send OTP" onPress={requestOtp} />
          </>
        ) : (
          <>
            <CustomInput
              label="OTP"
              placeholder="4-digit code"
              iconLeft="lock"
              keyboardType="number-pad"
              maxLength={4}
              value={otp}
              onChangeText={t => {
                setOtp(t.replace(/[^0-9]/g, ''));
                if (error) {
                  clearError();
                }
              }}
              required
            />
            {hint ? (
              <AppText variant="label" color="success">
                {hint}
              </AppText>
            ) : null}
            {error ? (
              <AppText variant="caption" color="error">
                {error}
              </AppText>
            ) : null}
            <Spacer size={8} />
            <CustomButton title="Verify & Continue" onPress={submitOtp} loading={isLoading} />
            <Spacer size={12} />
            <CustomButton title="Change Number" variant="ghost" onPress={() => setStep('phone')} />
          </>
        )}
      </View>
    </Screen>
  );
}
