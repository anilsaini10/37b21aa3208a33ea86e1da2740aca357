import React, {useState} from 'react';
import {ActivityIndicator, Pressable, ScrollView, StatusBar, StyleSheet, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Svg, {Defs, LinearGradient, Rect, Stop} from 'react-native-svg';
import {lightTheme, ThemeContext, useTheme} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {AppText, CustomCard, CustomInput, CustomButton, Icon, Spacer} from '../../../shared/components';
import {useAuthStore} from '../authStore';
import type {AuthScreenProps} from '../../../navigation/types';

const LOGO_SIZE = 88;

export function LoginScreen({route, navigation}: AuthScreenProps<'Login'>): React.JSX.Element {
  const themeCtx = useTheme();
  const theme = lightTheme;
  const insets = useSafeAreaInsets();
  const {t} = useLanguage();
  const {role} = route.params;
  const {loginWithPassword, isLoading, error, clearError} = useAuthStore();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  const title = role === 'admin' ? t('loginScreen_adminTitle') : t('loginScreen_teacherTitle');
  const roleIcon = role === 'admin' ? 'settings' : 'teacher';

  const onSubmit = async () => {
    clearError();
    await loginWithPassword(role, identifier, password);
    // On success the root navigator swaps to the role stack automatically.
  };

  return (
    <ThemeContext.Provider value={{...themeCtx, theme: lightTheme}}>
      <View style={[styles.root, {backgroundColor: '#F6F5FC'}]}>
        <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

        {/* Soft decorative blobs — trending airy gradient-mesh backdrop */}
        <View
          pointerEvents="none"
          style={[styles.blob, styles.blobTopRight, {backgroundColor: theme.colors.primary}]}
        />
        <View
          pointerEvents="none"
          style={[styles.blob, styles.blobBottomLeft, {backgroundColor: theme.colors.secondary}]}
        />

        <ScrollView
          style={{flex: 1}}
          contentContainerStyle={{paddingBottom: insets.bottom + theme.spacing.xl}}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={{paddingTop: insets.top + theme.spacing.sm, paddingHorizontal: theme.spacing.lg}}>
            <Row>
              <Pressable onPress={() => navigation.goBack()} hitSlop={10} style={styles.backButton}>
                <Icon name="back" size={20} color={theme.colors.text} />
              </Pressable>
              <AppText variant="bodyBold" style={{marginLeft: 12}}>
                {title}
              </AppText>
            </Row>
          </View>

          <View style={styles.brand}>
            <View style={styles.logoRing}>
              <View style={[styles.logoCircle, {backgroundColor: theme.colors.surface}]}>
                <Icon name={roleIcon} size={36} color={theme.colors.primary} />
              </View>
            </View>
            <Spacer size={18} />
            <AppText variant="h1" center>
              {t('loginScreen_welcomeBack')}
            </AppText>
            <Spacer size={6} />
            <AppText variant="body" color="textSecondary" center>
              {t('loginScreen_signInSubtitle')}
            </AppText>
          </View>

          <View style={{paddingHorizontal: theme.spacing.lg, marginTop: theme.spacing.xl}}>
            <CustomCard
              style={{
                borderWidth: 0,
                borderRadius: 28,
                shadowOpacity: 0.08,
                shadowRadius: 24,
                shadowOffset: {width: 0, height: 12},
                elevation: 3,
              }}>
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
                containerStyle={{marginBottom: 0}}
                required
              />

              {error ? (
                <AppText variant="caption" color="error" style={{marginTop: theme.spacing.sm}}>
                  {error}
                </AppText>
              ) : null}
            </CustomCard>

            <Spacer size={22} />
            <GradientButton title={t('loginScreen_signIn')} onPress={onSubmit} loading={isLoading} />
            <Spacer size={6} />
            <CustomButton
              title={t('loginScreen_forgotPassword')}
              variant="ghost"
              onPress={() => navigation.navigate('ForgotPassword')}
            />

            <Spacer size={22} />
          
          </View>
        </ScrollView>
      </View>
    </ThemeContext.Provider>
  );
}

function Row({children, style}: {children: React.ReactNode; style?: object | object[]}): React.JSX.Element {
  return <View style={[{flexDirection: 'row', alignItems: 'center'}, style]}>{children}</View>;
}

function GradientButton({
  title,
  onPress,
  loading,
}: {
  title: string;
  onPress: () => void;
  loading?: boolean;
}): React.JSX.Element {
  const {theme} = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      style={({pressed}) => [styles.gradientButton, {opacity: pressed ? 0.9 : loading ? 0.7 : 1}]}>
      <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
        <Defs>
          <LinearGradient id="ctaGradient" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0%" stopColor={theme.colors.primary} />
            <Stop offset="100%" stopColor={theme.colors.primaryVariant} />
          </LinearGradient>
        </Defs>
        <Rect x={0} y={0} width="100%" height="100%" fill="url(#ctaGradient)" />
      </Svg>
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <AppText variant="button" style={{color: '#fff'}}>
          {title}
        </AppText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  blob: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.1,
  },
  blobTopRight: {
    width: 220,
    height: 220,
    top: -80,
    right: -60,
  },
  blobBottomLeft: {
    width: 180,
    height: 180,
    top: 260,
    left: -80,
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
  brand: {
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 18,
  },
  logoRing: {
    width: LOGO_SIZE + 16,
    height: LOGO_SIZE + 16,
    borderRadius: (LOGO_SIZE + 16) / 2,
    backgroundColor: 'rgba(99,102,241,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoCircle: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    borderRadius: LOGO_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: {width: 0, height: 6},
    elevation: 4,
  },
  demoHint: {
    padding: 14,
    borderRadius: 16,
  },
  gradientButton: {
    height: 56,
    borderRadius: 18,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4F46E5',
    shadowOpacity: 0.3,
    shadowRadius: 14,
    shadowOffset: {width: 0, height: 8},
    elevation: 5,
  },
});
