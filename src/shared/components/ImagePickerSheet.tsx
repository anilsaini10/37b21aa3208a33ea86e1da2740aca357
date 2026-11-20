import React from 'react';
import {TouchableOpacity, View} from 'react-native';
import {useTheme} from '../../core/theme';
import {useLanguage} from '../../core/i18n';
import {AppText} from './AppText';
import {CustomBottomSheet} from './CustomBottomSheet';
import {Icon} from './Icon';
import {Row} from './layout';
import type {ImageSource} from '../utils/useImagePicker';

export interface ImagePickerSheetProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (source: ImageSource) => void;
  title?: string;
}

export function ImagePickerSheet({
  visible,
  onClose,
  onSelect,
  title,
}: ImagePickerSheetProps): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();

  const options: {source: ImageSource; icon: string; labelKey: 'profileImage_camera' | 'profileImage_gallery'}[] = [
    {source: 'camera', icon: 'camera', labelKey: 'profileImage_camera'},
    {source: 'gallery', icon: 'image', labelKey: 'profileImage_gallery'},
  ];

  return (
    <CustomBottomSheet visible={visible} onClose={onClose} title={title ?? t('profileImage_selectImage')}>
      {options.map(opt => (
        <TouchableOpacity
          key={opt.source}
          activeOpacity={0.7}
          onPress={() => {
            onClose();
            onSelect(opt.source);
          }}
          style={{
            paddingVertical: theme.spacing.md,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
          }}>
          <Row gap={theme.spacing.md} align="center">
            <View
              style={{
                width: 42,
                height: 42,
                borderRadius: theme.radius.md,
                backgroundColor: theme.colors.primary + '14',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Icon name={opt.icon} size={22} color={theme.colors.primary} />
            </View>
            <AppText variant="body" style={{fontWeight: '600'}}>
              {t(opt.labelKey)}
            </AppText>
          </Row>
        </TouchableOpacity>
      ))}
    </CustomBottomSheet>
  );
}
