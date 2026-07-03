/** Parent profile — account card, navigation menu, logout. */
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
  Row,
  Spacer,
} from '../../../shared/components';
import {useAuthStore} from '../../auth/authStore';
import type {ParentStackParamList} from '../../../navigation/types';
import {ScreenNames} from '../../../navigation/ScreenNames';

type Nav = NativeStackNavigationProp<ParentStackParamList>;

type MenuRoute = 'ChildProfile' | 'Results' | 'Timetable' | 'Announcements' | 'Chat' | 'Leave' | 'ChangePassword';

const MENU: {labelKey: TranslationKey; icon: string; route: MenuRoute}[] = [
  {labelKey: 'parentProfile_childProfile', icon: 'student', route: ScreenNames.ChildProfile},
  {labelKey: 'parentProfile_results', icon: 'grade', route: ScreenNames.Results},
  {labelKey: 'teacherProfile_timetable', icon: 'timetable', route: ScreenNames.Timetable},
  {labelKey: 'teacherProfile_announcements', icon: 'announcement', route: ScreenNames.Announcements},
  {labelKey: 'parentProfile_chatWithTeacher', icon: 'chat', route: ScreenNames.Chat},
  {labelKey: 'parentProfile_leaveApplication', icon: 'calendar', route: ScreenNames.Leave},
  {labelKey: 'teacherProfile_changePassword', icon: 'lock', route: ScreenNames.ChangePassword},
];

export function ParentProfileScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const navigation = useNavigation<Nav>();
  const {t} = useLanguage();
  const user = useAuthStore(s => s.user);
  const logout = useAuthStore(s => s.logout);
  const styles = useThemedStyles(t2 => ({
    scrollContent: {
      padding: t2.spacing.lg,
    },
    userInfoBlock: {
      flex: 1,
    },
    menuCard: {
      paddingHorizontal: t2.spacing.lg,
    },
  }));

  return (
    <Screen padded={false}>
      <CustomHeader title={t('parentProfile_profile')} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <CustomCard>
          <Row gap={theme.spacing.md}>
            <Avatar name={user?.name ?? t('parentProfile_parent')} size={64} />
            <View style={styles.userInfoBlock}>
              <AppText variant="h2">{user?.name ?? t('parentProfile_parent')}</AppText>
              {user?.phone ? (
                <AppText variant="caption" color="textSecondary">
                  {user.phone}
                </AppText>
              ) : null}
              {user?.email ? (
                <AppText variant="caption" color="textSecondary">
                  {user.email}
                </AppText>
              ) : null}
              <Spacer size={6} />
              <Badge label={t('parentProfile_parent')} tone="primary" />
            </View>
          </Row>
        </CustomCard>

        <Spacer size={theme.spacing.md} />
        <CustomCard padded={false} style={styles.menuCard}>
          {MENU.map(item => (
            <ListRow
              key={item.route}
              icon={item.icon}
              title={t(item.labelKey)}
              onPress={() => navigation.navigate(item.route)}
            />
          ))}
        </CustomCard>

        <Spacer size={theme.spacing.lg} />
        <CustomButton title={t('common_logout')} variant="danger" iconLeft="logout" onPress={() => logout()} />
        <Spacer size={24} />
      </ScrollView>
    </Screen>
  );
}
