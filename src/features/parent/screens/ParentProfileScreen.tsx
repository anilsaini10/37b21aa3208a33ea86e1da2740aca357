/** Parent profile — photo hero identity, navigation menu, logout. */
import React from 'react';
import {View, ScrollView} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import {useThemedStyles} from '../../../core/theme';
import {useLanguage, type TranslationKey} from '../../../core/i18n';
import {
  Screen,
  CustomButton,
  ProfileHero,
  MoreMenuTile,
  moreMenuAccentForIndex,
  Spacer,
} from '../../../shared/components';
import {useAuthStore} from '../../auth/authStore';
import type {ParentStackParamList, ParentTabParamList} from '../../../navigation/types';
import {ScreenNames} from '../../../navigation/ScreenNames';

type Nav = NativeStackNavigationProp<ParentStackParamList>;

type MenuRoute = 'ChildProfile' | 'ChildTimetable' | 'Results' | 'Fees' | 'Announcements' | 'Events' | 'Chat' | 'Leave' | 'ChangePassword';

const MENU: {labelKey: TranslationKey; icon: string; route: MenuRoute}[] = [
  {labelKey: 'parentProfile_childProfile', icon: 'student', route: ScreenNames.ChildProfile},
  {labelKey: 'parentProfile_results', icon: 'grade', route: ScreenNames.Results},
  {labelKey: 'teacherProfile_timetable', icon: 'timetable', route: ScreenNames.ChildTimetable},
  // {labelKey: 'parentFees_headerTitle', icon: 'fee', route: ScreenNames.Fees},
  {labelKey: 'teacherProfile_announcements', icon: 'announcement', route: ScreenNames.Announcements},
  {labelKey: 'eventsManage_headerTitle', icon: 'event', route: ScreenNames.Events},
  // {labelKey: 'parentProfile_chatWithTeacher', icon: 'chat', route: ScreenNames.Chat},
  {labelKey: 'parentProfile_leaveApplication', icon: 'calendar', route: ScreenNames.Leave},
  {labelKey: 'teacherProfile_changePassword', icon: 'lock', route: ScreenNames.ChangePassword},
];

export function ParentProfileScreen(): React.JSX.Element {
  const navigation = useNavigation<Nav>();
  const tabNavigation = useNavigation<BottomTabNavigationProp<ParentTabParamList>>();
  const {t} = useLanguage();
  const user = useAuthStore(s => s.user);
  const logout = useAuthStore(s => s.logout);
  const styles = useThemedStyles(t2 => ({
    content: {
      padding: t2.spacing.lg,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginHorizontal: -t2.spacing.xs,
    },
    gridItem: {
      width: '33.333%',
      paddingHorizontal: t2.spacing.xs,
      marginBottom: t2.spacing.sm,
    },
  }));

  return (
    <Screen padded={false}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ProfileHero
          name={user?.name ?? t('parentProfile_parent')}
          avatarUri={user?.avatarUrl}
          lines={[user?.phone, user?.email]}
          badgeLabel={t('parentProfile_parent')}
          onBack={() => tabNavigation.navigate(ScreenNames.Dashboard)}
          title={t('parentProfile_profile')}
        />

        <View style={styles.content}>
          <Spacer size={4} />
          <View style={styles.grid}>
            {MENU.map((item, index) => (
              <View key={item.route} style={styles.gridItem}>
                <MoreMenuTile
                  icon={item.icon}
                  title={t(item.labelKey)}
                  accentColor={moreMenuAccentForIndex(index)}
                  onPress={() => navigation.navigate(item.route)}
                />
              </View>
            ))}
          </View>

          <Spacer size={16} />
          <CustomButton title={t('common_logout')} variant="danger" iconLeft="logout" onPress={() => logout()} />
          <Spacer size={24} />
        </View>
      </ScrollView>
    </Screen>
  );
}
