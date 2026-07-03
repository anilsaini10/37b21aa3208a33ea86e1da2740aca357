/** Forgot password — request a reset link/OTP. */
import React, {useState} from 'react';
import {View} from 'react-native';
import {useTheme} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
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
  const {t} = useLanguage();
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
      <CustomHeader title={t('forgotPasswordScreen_title')} onBack={() => navigation.goBack()} />
      <View style={{flex: 1, padding: theme.spacing.lg}}>
        {sent ? (
          <View style={{alignItems: 'center', marginTop: theme.spacing.xxl, rowGap: theme.spacing.sm}}>
            <Icon name="success" size={56} />
            <AppText variant="h3" center>
              {t('forgotPasswordScreen_resetLinkSent')}
            </AppText>
            <AppText variant="caption" color="textSecondary" center>
              {t('forgotPasswordScreen_resetInstructions')}
            </AppText>
            <Spacer size={16} />
            <CustomButton title={t('forgotPasswordScreen_backToLogin')} onPress={() => navigation.goBack()} fullWidth={false} />
          </View>
        ) : (
          <>
            <Spacer size={12} />
            <AppText variant="caption" color="textSecondary">
              {t('forgotPasswordScreen_enterIdentifier')}
            </AppText>
            <Spacer size={20} />
            <CustomInput
              label={t('forgotPasswordScreen_emailOrMobileLabel')}
              placeholder={t('forgotPasswordScreen_emailPlaceholder')}
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
            <CustomButton title={t('forgotPasswordScreen_sendResetLink')} onPress={submit} loading={loading} />
          </>
        )}
      </View>
    </Screen>
  );
}
