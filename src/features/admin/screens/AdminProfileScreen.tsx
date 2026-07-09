/** Admin profile — identity card, school info, quick links, and logout. */
import React from 'react';
import {View, ScrollView} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme, useThemedStyles} from '../../../core/theme';
import {useLanguage, type TranslationKey} from '../../../core/i18n';
import {
  Screen,
  AppText,
  CustomHeader,
  CustomCard,
  CustomButton,
  Avatar,
  Badge,
  ListRow,
  SectionTitle,
  Row,
  Spacer,
} from '../../../shared/components';
import {capitalize} from '../../../shared/helpers';
import {useAuthStore} from '../../auth/authStore';
import type {AdminStackParamList} from '../../../navigation/types';
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
    scrollContent: {
      padding: t2.spacing.lg,
    },
    nameBlock: {
      flex: 1,
    },
    menuCard: {
      paddingHorizontal: t2.spacing.lg,
    },
  }));
  const navigation = useNavigation<Nav>();
  const {t} = useLanguage();
  const user = useAuthStore(s => s.user);
  const logout = useAuthStore(s => s.logout);

  return (
    <Screen padded={false}>
      <CustomHeader title={t('teacherProfile_profile')} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <CustomCard>
          <Row gap={theme.spacing.md}>
            <Avatar name={user?.name ?? t('adminProfile_admin')} size={64} />
            <View style={styles.nameBlock}>
              <AppText variant="h2" numberOfLines={1}>
                {user?.name ?? t('adminProfile_admin')}
              </AppText>
              {user?.email ? (
                <AppText variant="caption" color="textSecondary" numberOfLines={1}>
                  {user.email}
                </AppText>
              ) : null}
              {user?.phone ? (
                <AppText variant="caption" color="textSecondary" numberOfLines={1}>
                  {user.phone}
                </AppText>
              ) : null}
              <Spacer size={6} />
              <Badge label={capitalize(user?.role ?? 'admin')} tone="primary" />
            </View>
          </Row>
          {user?.schoolName ? (
            <>
              <Spacer size={theme.spacing.md} />
              <Row gap={theme.spacing.sm}>
                <AppText variant="caption" color="textSecondary">
                  {t('adminProfile_school')}
                </AppText>
                <AppText variant="caption" style={{fontWeight: '700'}}>
                  {user.schoolName}
                </AppText>
              </Row>
            </>
          ) : null}
        </CustomCard>

        <SectionTitle title={t('teacherProfile_manage')} />
        <CustomCard padded={false} style={styles.menuCard}>
          {MENU.map(item => (
            <ListRow
              key={item.route}
              icon={item.icon}
              title={t(item.titleKey)}
              right={<AppText color="textMuted">›</AppText>}
              onPress={() => navigation.navigate(item.route)}
            />
          ))}
        </CustomCard>

        <Spacer size={24} />
        <CustomButton title={t('common_logout')} variant="danger" iconLeft="logout" onPress={() => logout()} />
        <Spacer size={24} />
      </ScrollView>
    </Screen>
  );
}
