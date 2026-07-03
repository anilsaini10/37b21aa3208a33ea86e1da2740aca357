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
import {useTheme, useThemedStyles} from '../../core/theme';
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

  const styles = useThemedStyles(t => ({
    container: {marginBottom: t.spacing.md},
    label: {marginBottom: t.spacing.xs},
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      height: t.components.input.height,
      borderWidth: t.components.input.borderWidth,
      borderRadius: t.components.input.radius,
      backgroundColor: t.colors.inputBackground,
      paddingHorizontal: t.components.input.paddingHorizontal,
      columnGap: t.spacing.sm,
    },
    textInput: {
      flex: 1,
      color: t.colors.text,
      fontSize: t.components.input.fontSize,
      paddingVertical: 0,
    },
    errorText: {marginTop: t.spacing.xs},
  }));

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? (
        <AppText variant="label" color="textSecondary" style={styles.label}>
          {label}
          {required ? <AppText variant="label" color="error"> *</AppText> : null}
        </AppText>
      ) : null}

      <View style={[styles.inputRow, {borderColor}]}>
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
          style={styles.textInput}
        />
        {secure ? (
          <Pressable onPress={() => setHidden(h => !h)} hitSlop={8}>
            <Icon name={hidden ? 'eye' : 'eye-off'} size={18} color={theme.colors.textMuted} />
          </Pressable>
        ) : null}
      </View>

      {error ? (
        <AppText variant="caption" color="error" style={styles.errorText}>
          {error}
        </AppText>
      ) : null}
    </View>
  );
}
