/** A single tappable-list selection column used by Date/Time pickers. */
import React from 'react';
import {Pressable, ScrollView, View} from 'react-native';
import {useTheme} from '../../core/theme';
import {AppText} from './AppText';

export interface ScrollPickerProps {
  options: {label: string; value: number}[];
  value: number;
  onChange: (value: number) => void;
}

export function ScrollPicker({options, value, onChange}: ScrollPickerProps): React.JSX.Element {
  const {theme} = useTheme();
  return (
    <View style={{flex: 1}}>
      <ScrollView style={{maxHeight: 180}} showsVerticalScrollIndicator={false}>
        {options.map(opt => {
          const selected = opt.value === value;
          return (
            <Pressable
              key={opt.value}
              onPress={() => onChange(opt.value)}
              style={{
                paddingVertical: theme.spacing.sm,
                alignItems: 'center',
                borderRadius: theme.radius.sm,
                backgroundColor: selected ? theme.colors.primary + '22' : 'transparent',
              }}>
              <AppText
                variant={selected ? 'bodyBold' : 'body'}
                style={{color: selected ? theme.colors.primary : theme.colors.text}}>
                {opt.label}
              </AppText>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
