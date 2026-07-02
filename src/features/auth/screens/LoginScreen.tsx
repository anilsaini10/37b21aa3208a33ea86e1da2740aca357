/** Admin / Teacher login (email or mobile + password). */
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
import type {AuthScreenProps} from '../../../navigation/types';

export function LoginScreen({route, navigation}: AuthScreenProps<'Login'>): React.JSX.Element {
  const {theme} = useTheme();
  const {role} = route.params;
  const {loginWithPassword, isLoading, error, clearError} = useAuthStore();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  const title = role === 'admin' ? 'Admin Login' : 'Teacher Login';

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
        <AppText variant="h2">Welcome back 👋</AppText>
        <AppText variant="caption" color="textSecondary">
          Sign in to continue to your dashboard.
        </AppText>
        <Spacer size={24} />

        <CustomInput
          label="Email or Mobile"
          placeholder="you@school.edu"
          iconLeft="email"
          autoCapitalize="none"
          value={identifier}
          onChangeText={t => {
            setIdentifier(t);
            if (error) {
              clearError();
            }
          }}
          required
        />
        <CustomInput
          label="Password"
          placeholder="••••••••"
          iconLeft="lock"
          secure
          value={password}
          onChangeText={t => {
            setPassword(t);
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
        <CustomButton title="Sign In" onPress={onSubmit} loading={isLoading} />
        <Spacer size={12} />
        <CustomButton
          title="Forgot Password?"
          variant="ghost"
          onPress={() => navigation.navigate('ForgotPassword')}
        />

        <View style={{marginTop: 'auto', padding: theme.spacing.md, backgroundColor: theme.colors.surfaceVariant, borderRadius: theme.radius.md}}>
          <AppText variant="label" color="textSecondary" center>
            Demo: any email + password of 6+ characters works.
          </AppText>
        </View>
      </View>
    </Screen>
  );
}
