/** Parent login — mobile number + OTP verification. */
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
import {authApi} from '../authApi';
import type {AuthScreenProps} from '../../../navigation/types';

export function ParentLoginScreen({route, navigation}: AuthScreenProps<'ParentLogin'>): React.JSX.Element {
  const {schoolId, schoolName} = route.params;
  const {t} = useLanguage();
  const styles = useThemedStyles(theme => ({
    container: {
      flex: 1,
      padding: theme.spacing.lg,
    },
  }));
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
    await verifyOtp(phone, otp, schoolId, schoolName);
  };

  return (
    <Screen padded={false}>
      <CustomHeader title={t('parentLoginScreen_title')} onBack={() => navigation.goBack()} />
      <View style={styles.container}>
        <Spacer size={12} />
        <AppText variant="caption" color="primary" style={{fontWeight: '700'}}>
          {schoolName}
        </AppText>
        <Spacer size={4} />
        <AppText variant="h2">
          {step === 'phone' ? t('parentLoginScreen_enterMobile') : t('parentLoginScreen_verifyOtp')}
        </AppText>
        <AppText variant="caption" color="textSecondary">
          {step === 'phone'
            ? t('parentLoginScreen_otpSubtitle')
            : t('parentLoginScreen_otpSentTo', {phone})}
        </AppText>
        <Spacer size={24} />

        {step === 'phone' ? (
          <>
            <CustomInput
              label={t('parentLoginScreen_mobileNumberLabel')}
              placeholder={t('parentLoginScreen_mobileNumberPlaceholder')}
              iconLeft="phone"
              keyboardType="phone-pad"
              maxLength={10}
              value={phone}
              onChangeText={val => {
                setPhone(val.replace(/[^0-9]/g, ''));
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
            <CustomButton title={t('parentLoginScreen_sendOtp')} onPress={requestOtp} />
          </>
        ) : (
          <>
            <CustomInput
              label={t('parentLoginScreen_otpLabel')}
              placeholder={t('parentLoginScreen_otpPlaceholder')}
              iconLeft="lock"
              keyboardType="number-pad"
              maxLength={4}
              value={otp}
              onChangeText={val => {
                setOtp(val.replace(/[^0-9]/g, ''));
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
            <CustomButton title={t('parentLoginScreen_verifyAndContinue')} onPress={submitOtp} loading={isLoading} />
            <Spacer size={12} />
            <CustomButton title={t('parentLoginScreen_changeNumber')} variant="ghost" onPress={() => setStep('phone')} />
          </>
        )}
      </View>
    </Screen>
  );
}
