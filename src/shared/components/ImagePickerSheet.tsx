import React from 'react';
import {TouchableOpacity, View} from 'react-native';
import {useTheme} from '../../core/theme';
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
  title = 'Select Image',
}: ImagePickerSheetProps): React.JSX.Element {
  const {theme} = useTheme();

  const options: {source: ImageSource; icon: string; label: string}[] = [
    {source: 'camera', icon: 'camera', label: 'Camera'},
    {source: 'gallery', icon: 'image', label: 'Gallery'},
  ];

  return (
    <CustomBottomSheet visible={visible} onClose={onClose} title={title}>
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
              {opt.label}
            </AppText>
          </Row>
        </TouchableOpacity>
      ))}
    </CustomBottomSheet>
  );
}
