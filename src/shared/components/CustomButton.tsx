/** Themed, multi-variant button with loading + icon support. */
import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import {useTheme} from '../../core/theme';
import {AppText} from './AppText';
import {Icon} from './Icon';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface CustomButtonProps {
  title: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  iconLeft?: string;
  iconRight?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function CustomButton({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = true,
  iconLeft,
  iconRight,
  style,
  testID,
}: CustomButtonProps): React.JSX.Element {
  const {theme} = useTheme();
  const isDisabled = disabled || loading;

  const height = size === 'sm' ? 40 : size === 'lg' ? 56 : theme.components.button.height;

  const bg: Record<ButtonVariant, string> = {
    primary: theme.colors.primary,
    secondary: theme.colors.secondary,
    outline: 'transparent',
    ghost: 'transparent',
    danger: theme.colors.error,
  };

  const fg: Record<ButtonVariant, string> = {
    primary: theme.colors.onPrimary,
    secondary: theme.colors.onSecondary,
    outline: theme.colors.primary,
    ghost: theme.colors.primary,
    danger: theme.colors.onPrimary,
  };

  const border =
    variant === 'outline' ? {borderWidth: 1.5, borderColor: theme.colors.primary} : undefined;

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={isDisabled}
      style={({pressed}) => [
        {
          height,
          backgroundColor: bg[variant],
          borderRadius: theme.components.button.radius,
          paddingHorizontal: theme.components.button.paddingHorizontal,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          columnGap: theme.spacing.sm,
          opacity: isDisabled ? 0.5 : pressed ? 0.85 : 1,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
        },
        border,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={fg[variant]} />
      ) : (
        <View style={{flexDirection: 'row', alignItems: 'center', columnGap: theme.spacing.sm}}>
          {iconLeft ? <Icon name={iconLeft} size={18} color={fg[variant]} /> : null}
          <AppText variant="button" style={{color: fg[variant]}}>
            {title}
          </AppText>
          {iconRight ? <Icon name={iconRight} size={18} color={fg[variant]} /> : null}
        </View>
      )}
    </Pressable>
  );
}
