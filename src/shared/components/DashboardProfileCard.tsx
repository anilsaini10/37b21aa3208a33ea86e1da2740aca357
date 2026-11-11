import React, {useState} from 'react';
import {TouchableOpacity, View, Image, ActivityIndicator} from 'react-native';
import {useTheme} from '../../core/theme';
import {useLanguage, type TranslationKey} from '../../core/i18n';
import {useAuthStore} from '../../features/auth/authStore';
import {AppText} from './AppText';
import {Avatar} from './Avatar';
import {CustomCard} from './CustomCard';
import {Icon} from './Icon';
import {Divider, Row, Spacer} from './layout';
import {ImagePickerSheet} from './ImagePickerSheet';
import {useImagePicker} from '../utils/useImagePicker';
import type {ImageSource} from '../utils/useImagePicker';

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
  const updateProfilePhoto = useAuthStore(s => s.updateProfilePhoto);

  const [sheetVisible, setSheetVisible] = useState(false);
  const [uploading, setUploading] = useState(false);
  const {pick} = useImagePicker();

  const displayPhoto = user?.profilePhoto ?? avatarUri;

  async function handleImageSelect(source: ImageSource) {
    try {
      const img = await pick(source);
      if (!img) return;
      setUploading(true);
      await updateProfilePhoto(img.uri, img.type, img.name);
    } catch (e: any) {
      if (e?.code !== 'CANCELLED') console.warn(e);
    } finally {
      setUploading(false);
    }
  }

  return (
    <CustomCard style={{marginBottom: theme.spacing.md, borderColor: 'transparent'}}>
      <Row gap={theme.spacing.md} align="flex-start">
        <TouchableOpacity onPress={() => setSheetVisible(true)} disabled={uploading}>
          <View>
            {displayPhoto ? (
              <Image
                source={{uri: displayPhoto}}
                style={{width: 56, height: 56, borderRadius: 100}}
                resizeMode="cover"
              />
            ) : (
              <Avatar name={name} uri={avatarUri} size={56} />
            )}
            {uploading && (
              <View
                style={{
                  ...({position: 'absolute', top: 0, left: 0, right: 0, bottom: 0} as const),
                  borderRadius: 100,
                  backgroundColor: 'rgba(0,0,0,0.4)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <ActivityIndicator size="small" color="#fff" />
              </View>
            )}
          </View>
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
      <ImagePickerSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        onSelect={handleImageSelect}
      />
    </CustomCard>
  );
}
