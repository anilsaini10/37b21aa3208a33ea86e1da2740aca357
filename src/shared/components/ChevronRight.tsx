/**
 * Right-facing chevron drawn purely from View borders (no icon asset/library) —
 * a square with only its right + bottom edges visible, rotated 45deg.
 */
import React from 'react';
import {View} from 'react-native';

export interface ChevronRightProps {
  size?: number;
  color: string;
  strokeWidth?: number;
}

export function ChevronRight({size = 14, color, strokeWidth}: ChevronRightProps): React.JSX.Element {
  const edge = size * 0.62;
  const border = strokeWidth ?? Math.max(1.5, size * 0.16);
  return (
    <View
      style={{
        width: edge,
        height: edge,
        borderRightWidth: border,
        borderBottomWidth: border,
        borderColor: color,
        transform: [{rotate: '-45deg'}],
      }}
    />
  );
}
