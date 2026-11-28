import React from 'react';
import {View} from 'react-native';
import {useThemedStyles} from '../../core/theme';
import {Select} from './Select';
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
  const styles = useThemedStyles(t => ({
    container: {
      paddingHorizontal: t.spacing.lg,
      paddingTop: t.spacing.sm,
    },
  }));

  if (children.length <= 1) return null;

  const options = children.map(child => ({
    value: child.id,
    label: `${child.name} - ${child.className}, ${child.sectionName}`,
  }));

  return (
    <View style={styles.container}>
      <Select
        value={activeChildId}
        options={options}
        onChange={onSelect}
      />
    </View>
  );
}
