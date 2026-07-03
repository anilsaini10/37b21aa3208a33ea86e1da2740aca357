/** Admin / Teacher login (email or mobile + password). */
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
} from '../../../shared/components';
import {useAuthStore} from '../authStore';
import type {AuthScreenProps} from '../../../navigation/types';

export function LoginScreen({route, navigation}: AuthScreenProps<'Login'>): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const {role} = route.params;
  const {loginWithPassword, isLoading, error, clearError} = useAuthStore();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  const title = role === 'admin' ? t('loginScreen_adminTitle') : t('loginScreen_teacherTitle');

  const onSubmit = async () => {
    clearError();
    await loginWithPassword(role, identifier, password);
    // On success the root navigator swaps to the role stack automatically.
  };

  return (
    <Screen padded={false}>
      <CustomHeader title={title} onBack={() => navigation.goBack()} />
      <View style={{flex: 1, padding: theme.spacing.lg}}>
        <Spacer size={12} />
        <AppText variant="h2">{t('loginScreen_welcomeBack')}</AppText>
        <AppText variant="caption" color="textSecondary">
          {t('loginScreen_signInSubtitle')}
        </AppText>
        <Spacer size={24} />

        <CustomInput
          label={t('loginScreen_emailOrMobileLabel')}
          placeholder={t('loginScreen_emailPlaceholder')}
          iconLeft="email"
          autoCapitalize="none"
          value={identifier}
          onChangeText={val => {
            setIdentifier(val);
            if (error) {
              clearError();
            }
          }}
          required
        />
        <CustomInput
          label={t('loginScreen_passwordLabel')}
          placeholder="••••••••"
          iconLeft="lock"
          secure
          value={password}
          onChangeText={val => {
            setPassword(val);
            if (error) {
              clearError();
            }
          }}
          required
        />

        {error ? (
          <AppText variant="caption" color="error">
            {error}
          </AppText>
        ) : null}

        <Spacer size={8} />
        <CustomButton title={t('loginScreen_signIn')} onPress={onSubmit} loading={isLoading} />
        <Spacer size={12} />
        <CustomButton
          title={t('loginScreen_forgotPassword')}
          variant="ghost"
          onPress={() => navigation.navigate('ForgotPassword')}
        />

        <View style={{marginTop: 'auto', padding: theme.spacing.md, backgroundColor: theme.colors.surfaceVariant, borderRadius: theme.radius.md}}>
          <AppText variant="label" color="textSecondary" center>
            {t('loginScreen_demoHint')}
          </AppText>
        </View>
      </View>
    </Screen>
  );
}
