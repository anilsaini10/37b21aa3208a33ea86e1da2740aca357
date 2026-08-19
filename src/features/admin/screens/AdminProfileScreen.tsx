/** Admin profile — photo hero identity, quick links, and logout. */
import React from 'react';
import {View, ScrollView} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import {useTheme, useThemedStyles} from '../../../core/theme';
import {useLanguage, type TranslationKey} from '../../../core/i18n';
import {
  Screen,
  CustomCard,
  CustomButton,
  ProfileHero,
  MoreMenuItem,
  moreMenuAccentForIndex,
  SectionTitle,
  Spacer,
} from '../../../shared/components';
import {capitalize} from '../../../shared/helpers';
import {useAuthStore} from '../../auth/authStore';
import type {AdminStackParamList, AdminTabParamList} from '../../../navigation/types';
import {ScreenNames} from '../../../navigation/ScreenNames';

type Nav = NativeStackNavigationProp<AdminStackParamList>;

const MENU: {
  icon: string;
  titleKey: TranslationKey;
  route: 'Settings' | 'Notifications' | 'ChangePassword';
}[] = [
  {icon: 'settings', titleKey: 'moreScreen_settings', route: ScreenNames.Settings},
  {icon: 'notification', titleKey: 'moreScreen_notifications', route: ScreenNames.Notifications},
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
  const tabNavigation = useNavigation<BottomTabNavigationProp<AdminTabParamList>>();
  const {t} = useLanguage();
  const user = useAuthStore(s => s.user);
  const logout = useAuthStore(s => s.logout);

  return (
    <Screen padded={false}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ProfileHero
          name={user?.name ?? t('adminProfile_admin')}
          avatarUri={user?.avatarUrl}
          lines={[user?.email, user?.phone, user?.schoolName]}
          badgeLabel={capitalize(user?.role ?? 'admin')}
          onBack={tabNavigation.goBack}
          title={t('teacherProfile_profile')}
        />

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
              />
            ))}
          </CustomCard>

          <Spacer size={24} />
          <CustomButton title={t('common_logout')} variant="danger" iconLeft="logout" onPress={() => logout()} />
          <Spacer size={24} />
        </View>
      </ScrollView>
    </Screen>
  );
}
