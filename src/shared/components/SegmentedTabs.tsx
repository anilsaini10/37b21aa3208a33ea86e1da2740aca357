/** Pill-style segmented switch (2–4 options) — e.g. "Students | Attendance" at the top of a tab. */
import React from 'react';
import {Pressable, View, type StyleProp, type ViewStyle} from 'react-native';
import {useThemedStyles} from '../../core/theme';
import {AppText} from './AppText';

export interface SegmentedTabOption<V extends string> {
  value: V;
  label: string;
}

export function SegmentedTabs<V extends string>({
  options,
  value,
  onChange,
  style,
  radius,
}: {
  options: SegmentedTabOption<V>[];
  value: V;
  onChange: (value: V) => void;
  style?: StyleProp<ViewStyle>;
  /** Corner radius of the bar (items use radius − 2). Defaults to the theme's medium radius. */
  radius?: number;
}): React.JSX.Element {
  const styles = useThemedStyles(t => ({
    bar: {
      flexDirection: 'row',
      padding: 3,
      borderRadius: radius ?? t.radius.md,
      backgroundColor: t.colors.surfaceVariant,
    },
    // Fixed height — the active state only changes colour, so nothing shifts on tap.
    item: {
      flex: 1,
      height: 36,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: Math.max(0, (radius ?? t.radius.md) - 2),
    },
    itemActive: {backgroundColor: t.colors.surface},
  }));
  return (
    <View style={[styles.bar, style]}>
      {options.map(o => {
        const active = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            accessibilityRole="tab"
            accessibilityState={{selected: active}}
            style={[styles.item, active ? styles.itemActive : null]}>
            <AppText variant="label" color={active ? 'primary' : 'textSecondary'}>
              {o.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}
