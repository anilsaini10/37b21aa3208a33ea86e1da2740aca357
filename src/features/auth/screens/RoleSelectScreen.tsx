/** Entry screen — choose which portal to log into. */
import React from 'react';
import {ScrollView, StatusBar, StyleSheet, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Svg, {Defs, LinearGradient, Path, Rect, Stop} from 'react-native-svg';
import {lightTheme, ThemeContext, useTheme} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {AppText, CustomCard, Icon, LanguageSwitcher, Spacer, Row} from '../../../shared/components';
import type {AuthScreenProps} from '../../../navigation/types';
import {ScreenNames} from '../../../navigation/ScreenNames';
import type {UserRole} from '../../../shared/types';
import { Constants } from '../util/constants';

export function RoleSelectScreen({navigation}: AuthScreenProps<'RoleSelect'>): React.JSX.Element {
  const themeCtx = useTheme();
  const theme = lightTheme;
  const insets = useSafeAreaInsets();
  const {t} = useLanguage();

  const onSelect = (role: UserRole) => {
    if (role === 'admin') {
      // Admins own a school already (or sign up to create one) — no school picker needed.
      navigation.navigate(ScreenNames.Login, {role});
    } else {
      navigation.navigate(ScreenNames.SelectSchool, {role});
    }
  };

  return (
    <ThemeContext.Provider value={{...themeCtx, theme: lightTheme}}>
      <View style={[styles.root, {backgroundColor: theme.colors.background}]}>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

        <LanguageSwitcher
          iconColor="#fff"
          style={[
            styles.languageSwitcher,
            {top: insets.top + theme.spacing.sm, right: theme.spacing.lg},
          ]}
        />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={{paddingBottom: insets.bottom + theme.spacing.xl}}
          showsVerticalScrollIndicator={false}>
         <View style={styles.hero}>
  <Svg
    width="100%"
    height="100%"
    viewBox="0 0 100 100"
    preserveAspectRatio="none"
    style={StyleSheet.absoluteFill}>
    <Defs>
      {/* Top: theme color -> Bottom: white */}
      <LinearGradient id="heroGradient" x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0" stopColor={theme.colors.primary} stopOpacity={1} />
        <Stop offset="1" stopColor="#FFFFFF" stopOpacity={1} />
      </LinearGradient>
    </Defs>

    <Path
      d="M0,0 H100 V75 C72,100 22,80 0,0 Z"
      fill="url(#heroGradient)"
    />
  </Svg>
</View>

          <View style={styles.brand}>
            <View
              style={[
                styles.logoCircle,
                {backgroundColor: theme.colors.surface, borderColor: theme.colors.surface},
              ]}>
              <Icon name="class" size={38} color={theme.colors.primary} />
            </View>
            <Spacer size={14} />
            <AppText variant="h1" center>
              Greenwood School
            </AppText>
            <AppText variant="caption" color="textSecondary" center>
              {/* {t('schoolManagementSystem')} */}
            </AppText>
          </View>

          <View style={{paddingHorizontal: theme.spacing.lg, marginTop: theme.spacing.xl}}>
            <AppText variant="h3" style={{marginBottom: theme.spacing.md}}>
              {t('continueAs')}
            </AppText>

            {Constants.ROLES.map(item => (
              <CustomCard
                key={item.role}
                onPress={() => onSelect(item.role)}
                style={{marginBottom: theme.spacing.md}}>
                <Row gap={theme.spacing.md}>
                  <View
                    style={[
                      styles.roleIconCircle,
                      {backgroundColor: theme.colors.surfaceVariant},
                    ]}>
                    <Icon name={item.icon} size={24} />
                  </View>
                  <View style={styles.roleTextBlock}>
                    <AppText variant="bodyBold">{t(item.titleKey)}</AppText>
                    <AppText variant="caption" color="textSecondary">
                      {t(item.descKey)}
                    </AppText>
                  </View>
                  <Icon name="forward" size={22} color={theme.colors.textMuted} />
                </Row>
              </CustomCard>
            ))}
          </View>
        </ScrollView>
      </View>
    </ThemeContext.Provider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  hero: {
    height: Constants.HERO_HEIGHT,
    overflow: 'hidden'
    },
  brand: {
    alignItems: 'center',
    marginTop: -Constants.LOGO_SIZE,
    paddingHorizontal: 24,
  },
  logoCircle: {
    width: Constants.LOGO_SIZE,
    height: Constants.LOGO_SIZE,
    borderRadius: Constants.LOGO_SIZE / 2,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 4},
    elevation: 4,
  },
  roleIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  languageSwitcher: {
    position: 'absolute',
    zIndex: 10,
  },
  scroll: {
    flex: 1,
  },
  roleTextBlock: {
    flex: 1,
  },
});
