/**
 * ResultModal — centered success/error feedback shown after a save-style action
 * completes (e.g. "Save Attendance"), so the user has a clear final confirmation
 * of what happened instead of having to infer it from the screen staying put.
 * The icon pops in with a small scale animation on each time it opens.
 */
import React, {useEffect, useRef} from 'react';
import {Animated, View} from 'react-native';
import {useTheme, useThemedStyles} from '../../core/theme';
import {useLanguage} from '../../core/i18n';
import {CustomModal} from './CustomModal';
import {CustomButton} from './CustomButton';
import {AppText} from './AppText';
import {Icon} from './Icon';
import {Spacer} from './layout';

export interface ResultModalProps {
  visible: boolean;
  variant: 'success' | 'error';
  title: string;
  message?: string;
  onClose: () => void;
  /** Defaults to the "OK" translation. */
  actionLabel?: string;
}

export function ResultModal({
  visible,
  variant,
  title,
  message,
  onClose,
  actionLabel,
}: ResultModalProps): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const scale = useRef(new Animated.Value(0)).current;
  const color = variant === 'success' ? theme.colors.success : theme.colors.error;

  useEffect(() => {
    if (visible) {
      scale.setValue(0);
      Animated.spring(scale, {
        toValue: 1,
        friction: 4,
        tension: 60,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, scale]);

  const styles = useThemedStyles(t2 => ({
    wrap: {
      alignItems: 'center',
      paddingVertical: t2.spacing.sm,
    },
    iconCircle: {
      width: 72,
      height: 72,
      borderRadius: 36,
      alignItems: 'center',
      justifyContent: 'center',
    },
  }));

  return (
    <CustomModal visible={visible} onClose={onClose}>
      <View style={styles.wrap}>
        <Animated.View
          style={[styles.iconCircle, {backgroundColor: color + '1F', transform: [{scale}]}]}>
          <Icon name={variant === 'success' ? 'check' : 'close'} size={36} color={color} />
        </Animated.View>
        <Spacer size={theme.spacing.md} />
        <AppText variant="h3" center>
          {title}
        </AppText>
        {message ? (
          <>
            <Spacer size={theme.spacing.xs} />
            <AppText variant="body" color="textSecondary" center>
              {message}
            </AppText>
          </>
        ) : null}
        <Spacer size={theme.spacing.lg} />
        <CustomButton title={actionLabel ?? t('common_ok')} onPress={onClose} />
      </View>
    </CustomModal>
  );
}
