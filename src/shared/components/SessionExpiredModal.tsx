import React from 'react';
import {View} from 'react-native';
import {useTheme, useThemedStyles} from '../../core/theme';
import {useLanguage} from '../../core/i18n';
import {useAuthStore} from '../../features/auth/authStore';
import {CustomModal} from './CustomModal';
import {CustomButton} from './CustomButton';
import {AppText} from './AppText';
import {Icon} from './Icon';
import {Spacer} from './layout';

export function SessionExpiredModal(): React.JSX.Element | null {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const sessionExpired = useAuthStore(s => s.sessionExpired);
  const confirmForceLogout = useAuthStore(s => s.confirmForceLogout);

  const styles = useThemedStyles(t2 => ({
    wrap: {alignItems: 'center', paddingVertical: t2.spacing.sm},
    iconCircle: {
      width: 72,
      height: 72,
      borderRadius: 36,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: t2.colors.warning + '1F',
    },
  }));

  if (!sessionExpired) return null;

  return (
    <CustomModal visible dismissable={false} onClose={confirmForceLogout}>
      <View style={styles.wrap}>
        <View style={styles.iconCircle}>
          <Icon name="logout" size={36} color={theme.colors.warning} />
        </View>
        <Spacer size={theme.spacing.md} />
        <AppText variant="h3" center>
          {t('common_sessionExpiredTitle')}
        </AppText>
        <Spacer size={theme.spacing.xs} />
        <AppText variant="body" color="textSecondary" center>
          {t('common_sessionExpiredMessage')}
        </AppText>
        <Spacer size={theme.spacing.lg} />
        <CustomButton title={t('common_relogin')} onPress={confirmForceLogout} />
      </View>
    </CustomModal>
  );
}
