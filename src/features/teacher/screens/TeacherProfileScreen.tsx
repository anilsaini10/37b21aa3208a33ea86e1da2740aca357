/** Teacher profile — quick links and logout. */
import React from 'react';
import {View, ScrollView} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useThemedStyles} from '../../../core/theme';
import {useLanguage, type TranslationKey} from '../../../core/i18n';
import {P, type PermissionKey} from '../../../core/config/permissions';
import {usePermissionGate} from '../../auth/usePermissionGate';
import {
  Screen,
  CustomButton,
  CustomHeader,
  MoreMenuTile,
  moreMenuAccentForIndex,
  SectionTitle,
  Spacer,
} from '../../../shared/components';
import {useAuthStore} from '../../auth/authStore';
import {TestPaymentButton} from '../../subscription/components/TestPaymentButton';
import {ProfileIcon, HomeworkIcon, TimetableIcon, ExamIcon, AttendanceIcon, NotificationIcon, CalendarIcon, LockIcon, WalletIcon} from '../../../assets/svg/svgIcons';
import type {TeacherStackParamList} from '../../../navigation/types';
import {ScreenNames} from '../../../navigation/ScreenNames';

const SVG_ICON: Record<string, React.ReactNode> = {
  profile: <ProfileIcon size={28} />,
  homework: <HomeworkIcon size={28} />,
  timetable: <TimetableIcon size={28} />,
  exam: <ExamIcon size={28} />,
  attendance: <AttendanceIcon size={28} />,
  announcement: <NotificationIcon size={28} />,
  event: <CalendarIcon size={28} />,
  calendar: <CalendarIcon size={28} />,
  card: <WalletIcon size={28} />,
  lock: <LockIcon size={28} />,
};

type Nav = NativeStackNavigationProp<TeacherStackParamList>;

const MENU: {
  icon: string;
  titleKey: TranslationKey;
  route: 'MyProfile' | 'MySchedule' | 'TeacherExams' | 'Announcements' | 'Events' | 'Chat' | 'Leave' | 'MyLeave' | 'MyAttendance' | 'AcademicCalendar' | 'SubscriptionPlans' | 'ChangePassword' | 'TeacherMySyllabus';
  permission?: PermissionKey;
}[] = [
  {icon: 'profile', titleKey: 'teacherMyProfile_title', route: ScreenNames.MyProfile},
  {icon: 'homework', titleKey: 'syllabus_mySyllabus', route: ScreenNames.TeacherMySyllabus, permission: P.SYLLABUS_VIEW},
  {icon: 'timetable', titleKey: 'teacherProfile_timetable', route: ScreenNames.MySchedule, permission: P.TIMETABLE_VIEW},
  {icon: 'exam', titleKey: 'teacherExams_title', route: ScreenNames.TeacherExams, permission: P.EXAMS_VIEW},
  {icon: 'attendance', titleKey: 'teacherProfile_myAttendance', route: ScreenNames.MyAttendance, permission: P.ATTENDANCE_VIEW},
  {icon: 'announcement', titleKey: 'teacherProfile_announcements', route: ScreenNames.Announcements, permission: P.ANNOUNCEMENTS_VIEW},
  {icon: 'event', titleKey: 'eventsManage_headerTitle', route: ScreenNames.Events, permission: P.EVENTS_VIEW},
  {icon: 'calendar', titleKey: 'calendar_title', route: ScreenNames.AcademicCalendar, permission: P.CALENDAR_VIEW},
  // {icon: 'chat', titleKey: 'teacherProfile_chat', route: ScreenNames.Chat},
  {icon: 'calendar', titleKey: 'teacherProfile_myLeave', route: ScreenNames.MyLeave, permission: P.LEAVE_VIEW},
  {icon: 'calendar', titleKey: 'teacherProfile_leaveManagement', route: ScreenNames.Leave, permission: P.LEAVE_APPROVE},
  {icon: 'card', titleKey: 'subscription_title', route: ScreenNames.SubscriptionPlans, permission: P.SUBSCRIPTION_VIEW},
  {icon: 'lock', titleKey: 'teacherProfile_changePassword', route: ScreenNames.ChangePassword},
];

export function TeacherProfileScreen(): React.JSX.Element {
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
  const navigation = useNavigation<Nav>();
  const {t} = useLanguage();
  const logout = useAuthStore(s => s.logout);
  const {gate, PermissionModal} = usePermissionGate();

  return (
    <Screen padded={false}>
      <CustomHeader title={t('teacherProfile_profile')} />
      <ScrollView showsVerticalScrollIndicator={false}>

        <View style={styles.content}>
          <SectionTitle title={t('teacherProfile_manage')} />
          <View style={styles.grid}>
            {MENU.map((item, index) => (
              <View key={item.route} style={styles.gridItem}>
                <MoreMenuTile
                  icon={item.icon}
                  title={t(item.titleKey)}
                  accentColor={moreMenuAccentForIndex(index)}
                  onPress={gate(item.permission, () => navigation.navigate(item.route))}
                  svgIcon={SVG_ICON[item.icon]}
                />
              </View>
            ))}
          </View>

          <Spacer size={24} />
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
