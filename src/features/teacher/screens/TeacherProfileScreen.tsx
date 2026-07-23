/** Teacher profile — identity card, quick links, and logout. */
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
import type {TeacherStackParamList} from '../../../navigation/types';
import {ScreenNames} from '../../../navigation/ScreenNames';

type Nav = NativeStackNavigationProp<TeacherStackParamList>;

const MENU: {
  icon: string;
  titleKey: TranslationKey;
  route: 'MySchedule' | 'Announcements' | 'Chat' | 'Leave' | 'MyLeave' | 'MyAttendance' | 'ChangePassword';
}[] = [
  {icon: 'timetable', titleKey: 'teacherProfile_timetable', route: ScreenNames.MySchedule},
  {icon: 'attendance', titleKey: 'teacherProfile_myAttendance', route: ScreenNames.MyAttendance},
  {icon: 'announcement', titleKey: 'teacherProfile_announcements', route: ScreenNames.Announcements},
  {icon: 'chat', titleKey: 'teacherProfile_chat', route: ScreenNames.Chat},
  {icon: 'calendar', titleKey: 'teacherProfile_myLeave', route: ScreenNames.MyLeave},
  {icon: 'calendar', titleKey: 'teacherProfile_leaveManagement', route: ScreenNames.Leave},
  {icon: 'lock', titleKey: 'teacherProfile_changePassword', route: ScreenNames.ChangePassword},
];

export function TeacherProfileScreen(): React.JSX.Element {
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
            <Avatar name={user?.name ?? t('teacherProfile_teacher')} size={64} />
            <View style={styles.nameBlock}>
              <AppText variant="h2" numberOfLines={1}>
                {user?.name ?? t('teacherProfile_teacher')}
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
              <Badge label={capitalize(user?.role ?? 'teacher')} tone="primary" />
            </View>
          </Row>
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
