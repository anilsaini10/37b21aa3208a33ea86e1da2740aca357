/** Debounce-friendly search input row. */
import React from 'react';
import {View, TextInput, Pressable} from 'react-native';
import {useTheme} from '../../core/theme';
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
  placeholder = 'Search…',
  onClear,
}: SearchBarProps): React.JSX.Element {
  const {theme} = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        columnGap: theme.spacing.sm,
        height: 44,
        paddingHorizontal: theme.spacing.md,
        borderRadius: theme.radius.md,
        backgroundColor: theme.colors.surfaceVariant,
        borderWidth: 1,
        borderColor: theme.colors.border,
      }}>
      <Icon name="search" size={16} color={theme.colors.textMuted} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.placeholder}
        style={{flex: 1, color: theme.colors.text, fontSize: 15, paddingVertical: 0}}
      />
      {value.length > 0 ? (
        <Pressable onPress={() => (onClear ? onClear() : onChangeText(''))} hitSlop={8}>
          <Icon name="close" size={14} color={theme.colors.textMuted} />
        </Pressable>
      ) : null}
    </View>
  );
}
