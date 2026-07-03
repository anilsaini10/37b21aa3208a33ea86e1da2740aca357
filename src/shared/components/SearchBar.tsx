/** Debounce-friendly search input row. */
import React from 'react';
import {View, TextInput, Pressable} from 'react-native';
import {useTheme, useThemedStyles} from '../../core/theme';
import {useLanguage} from '../../core/i18n';
import {Icon} from './Icon';

export interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onClear?: () => void;
}

export function SearchBar({
  value,
  onChangeText,
  placeholder,
  onClear,
}: SearchBarProps): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const styles = useThemedStyles(t2 => ({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      columnGap: t2.spacing.sm,
      height: 44,
      paddingHorizontal: t2.spacing.md,
      borderRadius: t2.radius.md,
      backgroundColor: t2.colors.surfaceVariant,
      borderWidth: 1,
      borderColor: t2.colors.border,
    },
    input: {
      flex: 1,
      color: t2.colors.text,
      fontSize: 15,
      paddingVertical: 0,
    },
  }));
  return (
    <View style={styles.container}>
      <Icon name="search" size={16} color={theme.colors.textMuted} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder ?? t('common_search')}
        placeholderTextColor={theme.colors.placeholder}
        style={styles.input}
      />
      {value.length > 0 ? (
        <Pressable onPress={() => (onClear ? onClear() : onChangeText(''))} hitSlop={8}>
          <Icon name="close" size={14} color={theme.colors.textMuted} />
        </Pressable>
      ) : null}
    </View>
  );
}
