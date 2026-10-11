/**
 * 6-box OTP input. A single invisible TextInput is overlaid on top of the
 * visual boxes so the OS can autofill it (iOS `textContentType="oneTimeCode"`,
 * Android `autoComplete="sms-otp"`) or the user can paste the full code —
 * the boxes just mirror whatever that hidden input holds.
 */
import React, {useRef} from 'react';
import {Pressable, TextInput, View} from 'react-native';
import {useTheme, useThemedStyles} from '../../core/theme';
import {AppText} from './AppText';

export interface OtpInputProps {
  length?: number;
  value: string;
  onChangeText: (value: string) => void;
  onComplete?: (value: string) => void;
  error?: string;
  autoFocus?: boolean;
  disabled?: boolean;
}

export function OtpInput({
  length = 6,
  value,
  onChangeText,
  onComplete,
  error,
  autoFocus,
  disabled,
}: OtpInputProps): React.JSX.Element {
  const {theme} = useTheme();
  const inputRef = useRef<TextInput>(null);
  const digits = Array.from({length}, (_, i) => value[i] ?? '');

  const styles = useThemedStyles(t => ({
    wrap: {
      position: 'relative',
    },
    row: {
      flexDirection: 'row',
      columnGap: t.spacing.sm,
      justifyContent: 'center',
    },
    box: {
      width: 46,
      height: 54,
      borderRadius: t.radius.md,
      borderWidth: 1.5,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: t.colors.inputBackground,
    },
    boxDisabled: {
      opacity: 0.5,
    },
    hiddenInput: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      opacity: 0,
    },
    errorText: {
      marginTop: t.spacing.sm,
    },
  }));

  const handleChange = (text: string): void => {
    const digitsOnly = text.replace(/\D/g, '').slice(0, length);
    onChangeText(digitsOnly);
    if (digitsOnly.length === length) {
      onComplete?.(digitsOnly);
    }
  };

  return (
    <View>
      <View style={styles.wrap}>
        <Pressable onPress={() => !disabled && inputRef.current?.focus()}>
          <View style={styles.row}>
            {digits.map((digit, i) => {
              const isActive = i === value.length;
              const borderColor = error
                ? theme.colors.error
                : isActive
                  ? theme.colors.primary
                  : theme.colors.border;
              return (
                <View key={i} style={[styles.box, disabled && styles.boxDisabled, {borderColor}]}>
                  <AppText variant="h3">{digit}</AppText>
                </View>
              );
            })}
          </View>
        </Pressable>
        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={handleChange}
          keyboardType="number-pad"
          maxLength={length}
          textContentType="oneTimeCode"
          autoComplete="sms-otp"
          autoFocus={autoFocus}
          editable={!disabled}
          caretHidden
          style={styles.hiddenInput}
        />
      </View>
      {error ? (
        <AppText variant="caption" color="error" center style={styles.errorText}>
          {error}
        </AppText>
      ) : null}
    </View>
  );
}
