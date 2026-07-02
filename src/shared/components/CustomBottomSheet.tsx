/**
 * Bottom sheet built on the core Modal + Animated (no extra native dependency).
 * Slides content up from the bottom with a dimmed backdrop.
 */
import React, {useEffect, useRef} from 'react';
import {Animated, Modal, Pressable, View} from 'react-native';
import {useTheme} from '../../core/theme';
import {AppText} from './AppText';

export interface CustomBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export function CustomBottomSheet({
  visible,
  onClose,
  title,
  children,
}: CustomBottomSheetProps): React.JSX.Element {
  const {theme} = useTheme();
  const translateY = useRef(new Animated.Value(300)).current;

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: visible ? 0 : 300,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [visible, translateY]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        onPress={onClose}
        style={{flex: 1, backgroundColor: theme.colors.overlay, justifyContent: 'flex-end'}}>
        <Animated.View
          style={{transform: [{translateY}]}}
          onStartShouldSetResponder={() => true}>
          <Pressable
            onPress={e => e.stopPropagation()}
            style={{
              backgroundColor: theme.colors.surface,
              borderTopLeftRadius: theme.radius.xl,
              borderTopRightRadius: theme.radius.xl,
              padding: theme.spacing.lg,
              paddingBottom: theme.spacing.xxl,
              rowGap: theme.spacing.md,
            }}>
            <View
              style={{
                alignSelf: 'center',
                width: 44,
                height: 5,
                borderRadius: 3,
                backgroundColor: theme.colors.border,
                marginBottom: theme.spacing.xs,
              }}
            />
            {title ? <AppText variant="h3">{title}</AppText> : null}
            {children}
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}
