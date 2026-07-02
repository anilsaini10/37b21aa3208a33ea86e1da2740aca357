/** Centered modal dialog. */
import React from 'react';
import {Modal, Pressable, View} from 'react-native';
import {useTheme} from '../../core/theme';
import {AppText} from './AppText';
import {Icon} from './Icon';

export interface CustomModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  dismissable?: boolean;
}

export function CustomModal({
  visible,
  onClose,
  title,
  children,
  dismissable = true,
}: CustomModalProps): React.JSX.Element {
  const {theme} = useTheme();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        onPress={dismissable ? onClose : undefined}
        style={{
          flex: 1,
          backgroundColor: theme.colors.overlay,
          alignItems: 'center',
          justifyContent: 'center',
          padding: theme.spacing.xl,
        }}>
        <Pressable
          onPress={e => e.stopPropagation()}
          style={{
            width: '100%',
            backgroundColor: theme.colors.surface,
            borderRadius: theme.radius.lg,
            padding: theme.spacing.lg,
            rowGap: theme.spacing.md,
          }}>
          {title ? (
            <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
              <AppText variant="h3">{title}</AppText>
              <Pressable onPress={onClose} hitSlop={8}>
                <Icon name="close" size={18} color={theme.colors.textMuted} />
              </Pressable>
            </View>
          ) : null}
          {children}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
