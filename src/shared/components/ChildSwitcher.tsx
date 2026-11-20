import React from 'react';
import {Pressable, ScrollView, View} from 'react-native';
import {useTheme, useThemedStyles} from '../../core/theme';
import {AppText} from './AppText';
import type {ParentChild} from '../types';

export interface ChildSwitcherProps {
  children: ParentChild[];
  activeChildId: string;
  onSelect: (id: string) => void;
}

export function ChildSwitcher({
  children,
  activeChildId,
  onSelect,
}: ChildSwitcherProps): React.JSX.Element | null {
  const {theme} = useTheme();
  const styles = useThemedStyles(t => ({
    container: {
      paddingHorizontal: t.spacing.lg,
      paddingVertical: t.spacing.sm,
    },
    content: {
      columnGap: t.spacing.sm,
    },
    pill: {
      paddingHorizontal: t.spacing.lg,
      paddingVertical: t.spacing.sm,
      borderRadius: t.radius.pill,
      alignItems: 'center',
    },
    pillActive: {
      backgroundColor: t.colors.primary,
    },
    pillInactive: {
      backgroundColor: t.colors.surfaceVariant,
    },
    subtitle: {
      marginTop: 1,
    },
  }));

  if (children.length <= 1) return null;

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.content}>
        {children.map(child => {
          const active = child.id === activeChildId;
          return (
            <Pressable
              key={child.id}
              onPress={() => onSelect(child.id)}
              style={[styles.pill, active ? styles.pillActive : styles.pillInactive]}>
              <AppText
                variant="label"
                style={{
                  color: active ? theme.colors.onPrimary : theme.colors.text,
                  fontWeight: '600',
                }}>
                {child.name}
              </AppText>
              <AppText
                variant="label"
                style={[
                  styles.subtitle,
                  {
                    color: active
                      ? theme.colors.onPrimary + 'CC'
                      : theme.colors.textMuted,
                    fontSize: 10,
                  },
                ]}>
                {child.className} - {child.sectionName}
              </AppText>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
