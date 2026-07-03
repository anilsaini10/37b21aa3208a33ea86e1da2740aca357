/** Centered modal dialog. */
import React from 'react';
import {Modal, Pressable, View} from 'react-native';
import {useTheme, useThemedStyles} from '../../core/theme';
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
  const styles = useThemedStyles(t => ({
    backdrop: {
      flex: 1,
      backgroundColor: t.colors.overlay,
      alignItems: 'center',
      justifyContent: 'center',
      padding: t.spacing.xl,
    },
    content: {
      width: '100%',
      backgroundColor: t.colors.surface,
      borderRadius: t.radius.lg,
      padding: t.spacing.lg,
      rowGap: t.spacing.md,
    },
    titleRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  }));
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable onPress={dismissable ? onClose : undefined} style={styles.backdrop}>
        <Pressable onPress={e => e.stopPropagation()} style={styles.content}>
          {title ? (
            <View style={styles.titleRow}>
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
