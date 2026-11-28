/** Parent profile — navigation menu and logout. */
import React from 'react';
import {View, ScrollView} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useThemedStyles} from '../../../core/theme';
import {useLanguage, type TranslationKey} from '../../../core/i18n';
import {
  Screen,
  CustomButton,
  CustomHeader,
  MoreMenuTile,
  moreMenuAccentForIndex,
  Spacer,
} from '../../../shared/components';
import {useAuthStore} from '../../auth/authStore';
import {P, type PermissionKey} from '../../../core/config/permissions';
import {usePermissionGate} from '../../auth/usePermissionGate';
import {TestPaymentButton} from '../../subscription/components/TestPaymentButton';
import {StudentIcon, ExamIcon, TimetableIcon, HomeworkIcon, NotificationIcon, CalendarIcon, LockIcon, WalletIcon, MessageIcon} from '../../../assets/svg/svgIcons';
import type {ParentStackParamList} from '../../../navigation/types';
import {ScreenNames} from '../../../navigation/ScreenNames';

const SVG_ICON: Record<string, React.ReactNode> = {
  student: <StudentIcon size={28} />,
  exam: <ExamIcon size={28} />,
  timetable: <TimetableIcon size={28} />,
  homework: <HomeworkIcon size={28} />,
  announcement: <NotificationIcon size={28} />,
  event: <CalendarIcon size={28} />,
  calendar: <CalendarIcon size={28} />,
  query: <MessageIcon size={28} />,
  card: <WalletIcon size={28} />,
  lock: <LockIcon size={28} />,
};

type Nav = NativeStackNavigationProp<ParentStackParamList>;

type MenuRoute = 'ChildProfile' | 'ChildTimetable' | 'Results' | 'Fees' | 'Announcements' | 'Events' | 'Chat' | 'Leave' | 'AcademicCalendar' | 'SubscriptionPlans' | 'ChangePassword' | 'ParentSyllabusOverview' | 'ParentQueries';

const MENU: {labelKey: TranslationKey; icon: string; route: MenuRoute; permission?: PermissionKey}[] = [
  {labelKey: 'parentProfile_childProfile', icon: 'student', route: ScreenNames.ChildProfile},
  {labelKey: 'results_title', icon: 'exam', route: ScreenNames.Results, permission: P.EXAMS_VIEW},
  {labelKey: 'teacherProfile_timetable', icon: 'timetable', route: ScreenNames.ChildTimetable, permission: P.TIMETABLE_VIEW},
  {labelKey: 'syllabus_childSyllabus', icon: 'homework', route: ScreenNames.ParentSyllabusOverview, permission: P.SYLLABUS_VIEW},
  // {labelKey: 'parentFees_headerTitle', icon: 'fee', route: ScreenNames.Fees, permission: P.FEES_MODULE},
  {labelKey: 'teacherProfile_announcements', icon: 'announcement', route: ScreenNames.Announcements, permission: P.ANNOUNCEMENTS_VIEW},
  {labelKey: 'eventsManage_headerTitle', icon: 'event', route: ScreenNames.Events, permission: P.EVENTS_VIEW},
  {labelKey: 'calendar_title', icon: 'calendar', route: ScreenNames.AcademicCalendar, permission: P.CALENDAR_VIEW},
  // {labelKey: 'parentProfile_chatWithTeacher', icon: 'chat', route: ScreenNames.Chat},
  {labelKey: 'parentProfile_leaveApplication', icon: 'calendar', route: ScreenNames.Leave, permission: P.LEAVE_VIEW},
  {labelKey: 'parentQuery_title', icon: 'query', route: ScreenNames.ParentQueries},
  {labelKey: 'subscription_title', icon: 'card', route: ScreenNames.SubscriptionPlans, permission: P.SUBSCRIPTION_VIEW},
  {labelKey: 'teacherProfile_changePassword', icon: 'lock', route: ScreenNames.ChangePassword},
];

export function ParentProfileScreen(): React.JSX.Element {
  const navigation = useNavigation<Nav>();
  const {t} = useLanguage();
  const logout = useAuthStore(s => s.logout);
  const {gate, PermissionModal} = usePermissionGate();

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

        <View style={styles.content}>
          <Spacer size={4} />
          <View style={styles.grid}>
            {MENU.map((item, index) => (
              <View key={item.route} style={styles.gridItem}>
                <MoreMenuTile
                  icon={item.icon}
                  title={t(item.labelKey)}
                  accentColor={moreMenuAccentForIndex(index)}
                  onPress={gate(item.permission, () => navigation.navigate(item.route))}
                  svgIcon={SVG_ICON[item.icon]}
                />
              </View>
            ))}
          </View>

          <Spacer size={16} />
          <TestPaymentButton />
          <Spacer size={12} />
          <CustomButton title={t('common_logout')} variant="danger" iconLeft="logout" onPress={() => logout()} />
          <Spacer size={24} />
        </View>
      </ScrollView>
      <PermissionModal />
    </Screen>
  );
}
