/** Settings — theme, appearance, font scaling, school info & logout. */
import React from 'react';
import {ScrollView, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme, ThemeService} from '../../../core/theme';
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

  const themes = ThemeService.available();
  const modes: {label: string; value: ThemeMode}[] = [
    {label: 'Light', value: 'light'},
    {label: 'Dark', value: 'dark'},
    {label: 'System', value: 'system'},
  ];

  return (
    <Screen padded={false}>
      <CustomHeader title="Settings" onBack={() => navigation.goBack()} />
      <ScrollView
        contentContainerStyle={{padding: theme.spacing.lg}}
        showsVerticalScrollIndicator={false}>
        <SectionTitle title="Theme" />
        {themes.map(t => {
          const active = t.name === theme.name;
          return (
            <CustomCard
              key={t.key}
              onPress={() => setThemeKey(t.key)}
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
                      backgroundColor: t.colors.primary,
                    }}
                  />
                  <AppText variant="body">{t.name}</AppText>
                </Row>
                {active ? <Icon name="check" size={20} color={theme.colors.primary} /> : null}
              </Row>
            </CustomCard>
          );
        })}

        <SectionTitle title="Appearance" />
        <Row gap={theme.spacing.md}>
          {modes.map(m => (
            <View key={m.value} style={{flex: 1}}>
              <CustomButton
                title={m.label}
                size="sm"
                variant={mode === m.value ? 'primary' : 'outline'}
                onPress={() => setMode(m.value)}
              />
            </View>
          ))}
        </Row>

        <SectionTitle title="Font Size" />
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

        <SectionTitle title="School" />
        <CustomCard>
          <Row justify="space-between" style={{paddingVertical: 4}}>
            <AppText variant="body" color="textSecondary">
              App Name
            </AppText>
            <AppText variant="body">{AppConfig.appName}</AppText>
          </Row>
          <Row justify="space-between" style={{paddingVertical: 4}}>
            <AppText variant="body" color="textSecondary">
              Academic Year
            </AppText>
            <AppText variant="body">{AppConfig.academicYear}</AppText>
          </Row>
        </CustomCard>

        <Spacer size={20} />
        <CustomButton
          title="Logout"
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
