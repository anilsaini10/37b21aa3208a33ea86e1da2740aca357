/** Settings — theme, appearance, font scaling, school info & logout. */
import React from 'react';
import {ScrollView, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme, ThemeService} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {
  Screen,
  AppText,
  CustomHeader,
  CustomCard,
  CustomButton,
  Icon,
  Row,
  Spacer,
  SectionTitle,
} from '../../../shared/components';
import {AppConfig} from '../../../core/config/appConfig';
import {useAuthStore} from '../../auth/authStore';
import type {AdminStackParamList} from '../../../navigation/types';
import type {ThemeMode} from '../../../core/theme';

type Nav = NativeStackNavigationProp<AdminStackParamList>;

export function SettingsScreen(): React.JSX.Element {
  const {theme, mode, fontScale, setThemeKey, setMode, setFontScale} = useTheme();
  const navigation = useNavigation<Nav>();
  const logout = useAuthStore(s => s.logout);
  const {t} = useLanguage();

  const themes = ThemeService.available();
  const modes: {labelKey: 'settingsScreen_light' | 'settingsScreen_dark' | 'settingsScreen_system'; value: ThemeMode}[] = [
    {labelKey: 'settingsScreen_light', value: 'light'},
    {labelKey: 'settingsScreen_dark', value: 'dark'},
    {labelKey: 'settingsScreen_system', value: 'system'},
  ];

  return (
    <Screen padded={false}>
      <CustomHeader title={t('settingsScreen_title')} onBack={() => navigation.goBack()} />
      <ScrollView
        contentContainerStyle={{padding: theme.spacing.lg}}
        showsVerticalScrollIndicator={false}>
        <SectionTitle title={t('settingsScreen_theme')} />
        {themes.map(themeItem => {
          const active = themeItem.name === theme.name;
          return (
            <CustomCard
              key={themeItem.key}
              onPress={() => setThemeKey(themeItem.key)}
              style={{
                marginBottom: theme.spacing.sm,
                borderColor: active ? theme.colors.primary : theme.colors.border,
                borderWidth: active ? 2 : 1,
              }}>
              <Row justify="space-between">
                <Row gap={theme.spacing.md}>
                  <View
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 11,
                      backgroundColor: themeItem.colors.primary,
                    }}
                  />
                  <AppText variant="body">{themeItem.name}</AppText>
                </Row>
                {active ? <Icon name="check" size={20} color={theme.colors.primary} /> : null}
              </Row>
            </CustomCard>
          );
        })}

        <SectionTitle title={t('settingsScreen_appearance')} />
        <Row gap={theme.spacing.md}>
          {modes.map(m => (
            <View key={m.value} style={{flex: 1}}>
              <CustomButton
                title={t(m.labelKey)}
                size="sm"
                variant={mode === m.value ? 'primary' : 'outline'}
                onPress={() => setMode(m.value)}
              />
            </View>
          ))}
        </Row>

        <SectionTitle title={t('settingsScreen_fontSize')} />
        <CustomCard>
          <Row justify="space-between">
            <CustomButton
              title="–"
              size="sm"
              variant="outline"
              fullWidth={false}
              onPress={() => setFontScale(fontScale - 0.1)}
            />
            <AppText variant="h3">{`${Math.round(fontScale * 100)}%`}</AppText>
            <CustomButton
              title="+"
              size="sm"
              variant="outline"
              fullWidth={false}
              onPress={() => setFontScale(fontScale + 0.1)}
            />
          </Row>
        </CustomCard>

        <SectionTitle title={t('settingsScreen_school')} />
        <CustomCard>
          <Row justify="space-between" style={{paddingVertical: 4}}>
            <AppText variant="body" color="textSecondary">
              {t('settingsScreen_appName')}
            </AppText>
            <AppText variant="body">{AppConfig.appName}</AppText>
          </Row>
          <Row justify="space-between" style={{paddingVertical: 4}}>
            <AppText variant="body" color="textSecondary">
              {t('settingsScreen_academicYear')}
            </AppText>
            <AppText variant="body">{AppConfig.academicYear}</AppText>
          </Row>
        </CustomCard>

        <Spacer size={20} />
        <CustomButton
          title={t('common_logout')}
          variant="danger"
          iconLeft="logout"
          onPress={() => {
            void logout();
          }}
        />
        <Spacer size={24} />
      </ScrollView>
    </Screen>
  );
}
