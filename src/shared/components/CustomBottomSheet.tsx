/**
 * Bottom sheet built on the core Modal + Animated (no extra native dependency).
 * Slides content up from the bottom with a dimmed backdrop.
 */
import React, {useEffect, useRef} from 'react';
import {Animated, Modal, Pressable, ScrollView, useWindowDimensions, View} from 'react-native';
import {useThemedStyles} from '../../core/theme';
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
  const {height: screenHeight} = useWindowDimensions();
  const translateY = useRef(new Animated.Value(300)).current;

  const styles = useThemedStyles(theme => ({
    backdrop: {flex: 1, backgroundColor: theme.colors.overlay, justifyContent: 'flex-end'},
    sheet: {
      backgroundColor: theme.colors.surface,
      borderTopLeftRadius: theme.radius.xl,
      borderTopRightRadius: theme.radius.xl,
      paddingTop: theme.spacing.lg,
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.xxl,
    },
    handle: {
      alignSelf: 'center',
      width: 44,
      height: 5,
      borderRadius: 3,
      backgroundColor: theme.colors.border,
      marginBottom: theme.spacing.sm,
    },
    title: {marginBottom: theme.spacing.md},
  }));

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: visible ? 0 : 300,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [visible, translateY]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable onPress={onClose} style={styles.backdrop}>
        <Animated.View
          style={{transform: [{translateY}]}}
          onStartShouldSetResponder={() => true}>
          <Pressable
            onPress={e => e.stopPropagation()}
            style={[styles.sheet, {maxHeight: screenHeight * 0.75}]}>
            <View style={styles.handle} />
            {title ? (
              <AppText variant="h3" style={styles.title}>
                {title}
              </AppText>
            ) : null}
            <ScrollView showsVerticalScrollIndicator={false}>{children}</ScrollView>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}
