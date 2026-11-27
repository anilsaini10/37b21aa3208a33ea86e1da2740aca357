/** Admin profile — quick links and logout. */
import React from 'react';
import {View, ScrollView} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme, useThemedStyles} from '../../../core/theme';
import {useLanguage, type TranslationKey} from '../../../core/i18n';
import {
  Screen,
  CustomCard,
  CustomButton,
  CustomHeader,
  MoreMenuItem,
  moreMenuAccentForIndex,
  SectionTitle,
  Spacer,
} from '../../../shared/components';
import {useAuthStore} from '../../auth/authStore';
import {TestPaymentButton} from '../../subscription/components/TestPaymentButton';
import {SettingsIcon, NotificationIcon, WalletIcon, LockIcon} from '../../../assets/svg/svgIcons';
import type {AdminStackParamList} from '../../../navigation/types';
import {ScreenNames} from '../../../navigation/ScreenNames';

const SVG_ICON: Record<string, React.ReactNode> = {
  settings: <SettingsIcon size={26} />,
  notification: <NotificationIcon size={26} />,
  card: <WalletIcon size={26} />,
  lock: <LockIcon size={26} />,
};

type Nav = NativeStackNavigationProp<AdminStackParamList>;

const MENU: {
  icon: string;
  titleKey: TranslationKey;
  route: 'Settings' | 'Notifications' | 'SubscriptionPlans' | 'ChangePassword';
}[] = [
  {icon: 'settings', titleKey: 'moreScreen_settings', route: ScreenNames.Settings},
  {icon: 'notification', titleKey: 'moreScreen_notifications', route: ScreenNames.Notifications},
  {icon: 'card', titleKey: 'subscription_title', route: ScreenNames.SubscriptionPlans},
  {icon: 'lock', titleKey: 'teacherProfile_changePassword', route: ScreenNames.ChangePassword},
];

export function AdminProfileScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const styles = useThemedStyles(t2 => ({
    content: {
      padding: t2.spacing.lg,
    },
    menuCard: theme.dark
      ? {paddingVertical: t2.spacing.sm}
      : {paddingVertical: t2.spacing.sm, borderRadius: 22, borderColor: 'rgba(100, 100, 150, 0.08)'},
  }));
  const navigation = useNavigation<Nav>();
  const {t} = useLanguage();
  const logout = useAuthStore(s => s.logout);

  return (
    <Screen padded={false}>
      <CustomHeader title={t('teacherProfile_profile')} onBack={() => navigation.goBack()} />
      <ScrollView showsVerticalScrollIndicator={false}>

        <View style={styles.content}>
          <SectionTitle title={t('teacherProfile_manage')} />
          <CustomCard padded={false} style={styles.menuCard}>
            {MENU.map((item, index) => (
              <MoreMenuItem
                key={item.route}
                icon={item.icon}
                title={t(item.titleKey)}
                accentColor={moreMenuAccentForIndex(index)}
                onPress={() => navigation.navigate(item.route)}
                svgIcon={SVG_ICON[item.icon]}
              />
            ))}
          </CustomCard>

          <Spacer size={24} />
          <TestPaymentButton />
          <Spacer size={12} />
          <CustomButton title={t('common_logout')} variant="danger" iconLeft="logout" onPress={() => logout()} />
          <Spacer size={24} />
        </View>
      </ScrollView>
    </Screen>
  );
}
