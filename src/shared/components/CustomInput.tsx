/** Themed text input with label, error state, icons and password toggle. */
import React, {useState} from 'react';
import {
  View,
  TextInput,
  Pressable,
  type TextInputProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import {useTheme} from '../../core/theme';
import {AppText} from './AppText';
import {Icon} from './Icon';

export interface CustomInputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  iconLeft?: string;
  secure?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  required?: boolean;
}

export function CustomInput({
  label,
  error,
  iconLeft,
  secure,
  required,
  containerStyle,
  ...inputProps
}: CustomInputProps): React.JSX.Element {
  const {theme} = useTheme();
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(!!secure);

  const borderColor = error
    ? theme.colors.error
    : focused
      ? theme.colors.primary
      : theme.colors.border;

  return (
    <View style={[{marginBottom: theme.spacing.md}, containerStyle]}>
      {label ? (
        <AppText variant="label" color="textSecondary" style={{marginBottom: theme.spacing.xs}}>
          {label}
          {required ? <AppText variant="label" color="error"> *</AppText> : null}
        </AppText>
      ) : null}

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          height: theme.components.input.height,
          borderWidth: theme.components.input.borderWidth,
          borderColor,
          borderRadius: theme.components.input.radius,
          backgroundColor: theme.colors.inputBackground,
          paddingHorizontal: theme.components.input.paddingHorizontal,
          columnGap: theme.spacing.sm,
        }}>
        {iconLeft ? <Icon name={iconLeft} size={18} color={theme.colors.textMuted} /> : null}
        <TextInput
          {...inputProps}
          secureTextEntry={hidden}
          onFocus={e => {
            setFocused(true);
            inputProps.onFocus?.(e);
          }}
          onBlur={e => {
            setFocused(false);
            inputProps.onBlur?.(e);
          }}
          placeholderTextColor={theme.colors.placeholder}
          style={{
            flex: 1,
            color: theme.colors.text,
            fontSize: theme.components.input.fontSize,
            paddingVertical: 0,
          }}
        />
        {secure ? (
          <Pressable onPress={() => setHidden(h => !h)} hitSlop={8}>
            <Icon name={hidden ? 'eye' : 'eye-off'} size={18} color={theme.colors.textMuted} />
          </Pressable>
        ) : null}
      </View>

      {error ? (
        <AppText variant="caption" color="error" style={{marginTop: theme.spacing.xs}}>
          {error}
        </AppText>
      ) : null}
    </View>
  );
}
