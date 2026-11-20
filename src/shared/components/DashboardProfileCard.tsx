import React, {useState} from 'react';
import {Image, TouchableOpacity, View} from 'react-native';
import {useTheme} from '../../core/theme';
import {useLanguage, type TranslationKey} from '../../core/i18n';
import {useAuthStore} from '../../features/auth/authStore';
import {useCachedImage} from '../../core/utils/useCachedImage';
import {AppText} from './AppText';
import {Avatar} from './Avatar';
import {CustomCard} from './CustomCard';
import {Icon} from './Icon';
import {Divider, Row, Spacer} from './layout';
import {ProfileImageModal} from './ProfileImageModal';

const DAY_KEYS: TranslationKey[] = [
  'common_daySun', 'common_dayMon', 'common_dayTue', 'common_dayWed',
  'common_dayThu', 'common_dayFri', 'common_daySat',
];
const MONTH_KEYS: TranslationKey[] = [
  'common_monthJan', 'common_monthFeb', 'common_monthMar', 'common_monthApr',
  'common_monthMay', 'common_monthJun', 'common_monthJul', 'common_monthAug',
  'common_monthSep', 'common_monthOct', 'common_monthNov', 'common_monthDec',
];

export interface DashboardProfileCardProps {
  name: string;
  avatarUri?: string;
  schoolName?: string;
  roleLabel: string;
  email?: string;
  footer?: React.ReactNode;
}

export function DashboardProfileCard({
  name,
  avatarUri,
  schoolName,
  roleLabel,
  email,
  footer,
}: DashboardProfileCardProps): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const now = new Date();
  const todayLabel = `${t(DAY_KEYS[now.getDay()])}, ${now.getDate()} ${t(MONTH_KEYS[now.getMonth()])} ${now.getFullYear()}`;

  const user = useAuthStore(s => s.user);

  const [imageModalVisible, setImageModalVisible] = useState(false);

  const remotePhoto = user?.profilePhoto ?? avatarUri;
  const displayPhoto = useCachedImage(remotePhoto);

  return (
    <CustomCard style={{marginBottom: theme.spacing.md, borderColor: 'transparent'}}>
      <Row gap={theme.spacing.md} align="flex-start">
        <TouchableOpacity onPress={() => setImageModalVisible(true)} activeOpacity={0.7}>
          {displayPhoto ? (
            <Image
              source={{uri: displayPhoto}}
              style={{width: 56, height: 56, borderRadius: 100}}
              resizeMode="cover"
            />
          ) : (
            <Avatar name={name} uri={avatarUri} size={56} />
          )}
        </TouchableOpacity>
        <View style={{flex: 1}}>
          <Row justify="space-between" align="flex-start" gap={theme.spacing.sm}>
            <View style={{flex: 1}}>
              <AppText variant="h3" numberOfLines={1}>
                {name}
              </AppText>
              {schoolName ? (
                <>
                  <Spacer size={2} />
                  <Row gap={4} align="center">
                    <Icon name="home" size={13} color={theme.colors.textMuted} />
                    <AppText variant="caption" color="textSecondary" numberOfLines={1} style={{flex: 1}}>
                      {schoolName}
                    </AppText>
                  </Row>
                </>
              ) : null}
            </View>
            <View
              style={{
                backgroundColor: theme.colors.primary + '1A',
                paddingHorizontal: theme.spacing.sm,
                paddingVertical: 3,
                borderRadius: theme.radius.pill,
              }}>
              <AppText variant="label" color="primary" style={{fontWeight: '700'}}>
                {roleLabel}
              </AppText>
            </View>
          </Row>
        </View>
      </Row>
      <Divider dashed />
      <Row justify="space-between" align="center">
        <Row gap={4} align="center">
          <Icon name="calendar" size={14} color={theme.colors.textMuted} />
          <AppText variant="caption" color="textSecondary">
            {todayLabel}
          </AppText>
        </Row>
        {email ? (
          <Row gap={4} align="center" style={{flexShrink: 1, marginLeft: theme.spacing.sm}}>
            <Icon name="email" size={14} color={theme.colors.textMuted} />
            <AppText variant="caption" color="textMuted" numberOfLines={1} style={{flexShrink: 1}}>
              {email}
            </AppText>
          </Row>
        ) : null}
      </Row>
      {footer ? (
        <>
          <Divider dashed />
          {footer}
        </>
      ) : null}
      <ProfileImageModal
        visible={imageModalVisible}
        onClose={() => setImageModalVisible(false)}
        currentImageUri={displayPhoto}
      />
    </CustomCard>
  );
}
