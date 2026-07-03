/** A single tappable-list selection column used by Date/Time pickers. */
import React from 'react';
import {Pressable, ScrollView, View} from 'react-native';
import {useTheme, useThemedStyles} from '../../core/theme';
import {AppText} from './AppText';

export interface ScrollPickerProps {
  options: {label: string; value: number}[];
  value: number;
  onChange: (value: number) => void;
}

export function ScrollPicker({options, value, onChange}: ScrollPickerProps): React.JSX.Element {
  const {theme} = useTheme();
  const styles = useThemedStyles(t => ({
    column: {
      flex: 1,
    },
    scrollArea: {
      maxHeight: 180,
    },
    option: {
      paddingVertical: t.spacing.sm,
      alignItems: 'center',
      borderRadius: t.radius.sm,
    },
  }));
  return (
    <View style={styles.column}>
      <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
        {options.map(opt => {
          const selected = opt.value === value;
          return (
            <Pressable
              key={opt.value}
              onPress={() => onChange(opt.value)}
              style={[styles.option, {backgroundColor: selected ? theme.colors.primary + '22' : 'transparent'}]}>
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
