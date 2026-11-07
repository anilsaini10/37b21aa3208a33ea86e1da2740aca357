import React from 'react';
import {View} from 'react-native';
import {useTheme} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {CustomModal, AppText, Icon, CustomButton} from '../../../shared/components';

interface ContactAdminModalProps {
  visible: boolean;
  onClose: () => void;
}

export function ContactAdminModal({visible, onClose}: ContactAdminModalProps): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();

  return (
    <CustomModal visible={visible} onClose={onClose} title={t('permissions_contactAdminTitle')}>
      <View style={{alignItems: 'center', paddingVertical: theme.spacing.md}}>
        <View
          style={{
            width: 64,
            height: 64,
            borderRadius: 32,
            backgroundColor: theme.colors.warning + '22',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: theme.spacing.md,
          }}>
          <Icon name="lock" size={32} color={theme.colors.warning} />
        </View>
        <AppText variant="body" color="textSecondary" style={{textAlign: 'center'}}>
          {t('permissions_contactAdminMessage')}
        </AppText>
      </View>
      <CustomButton title={t('common_close')} onPress={onClose} />
    </CustomModal>
  );
}
