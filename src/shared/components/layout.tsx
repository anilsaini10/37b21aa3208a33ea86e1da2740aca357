/** Small layout primitives: Screen, Row, Column, Spacer, Divider. */
import React from 'react';
import {
  View,
  ScrollView,
  StatusBar,
  StyleSheet,
  type ViewStyle,
  type StyleProp,
  type ScrollViewProps,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useTheme, useThemedStyles} from '../../core/theme';

interface ScreenProps {
  children: React.ReactNode;
  scroll?: boolean;
  padded?: boolean;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: ScrollViewProps['contentContainerStyle'];
}

/** Full-screen themed container with safe-area + status-bar handling. */
export function Screen({
  children,
  scroll,
  padded = true,
  style,
  contentContainerStyle,
}: ScreenProps): React.JSX.Element {
  const {theme} = useTheme();
  const styles = useThemedStyles(t => ({
    bg: {
      flex: 1,
      backgroundColor: t.colors.background,
    },
    padded: {
      padding: t.spacing.lg,
    },
    grow: {
      flexGrow: 1,
    },
  }));

  return (
    <SafeAreaView style={styles.bg}>
      <StatusBar
        barStyle={theme.dark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.headerBackground}
      />
      {scroll ? (
        <ScrollView
          style={styles.bg}
          contentContainerStyle={[padded && styles.padded, styles.grow, contentContainerStyle]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.bg, padded && styles.padded, style]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

export function Row({
  children,
  gap = 0,
  align = 'center',
  justify = 'flex-start',
  wrap,
  style,
}: {
  children: React.ReactNode;
  gap?: number;
  align?: ViewStyle['alignItems'];
  justify?: ViewStyle['justifyContent'];
  wrap?: boolean;
  style?: StyleProp<ViewStyle>;
}): React.JSX.Element {
  return (
    <View
      style={[
        rowStyles.row,
        {
          alignItems: align,
          justifyContent: justify,
          columnGap: gap,
          flexWrap: wrap ? 'wrap' : 'nowrap',
        },
        style,
      ]}>
      {children}
    </View>
  );
}

// `align`/`justify`/`gap`/`wrap` vary per call site, so only the constant part
// of Row's style is hoisted here; the rest is composed inline above.
const rowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
  },
});

export function Spacer({size = 8, horizontal}: {size?: number; horizontal?: boolean}): React.JSX.Element {
  return <View style={horizontal ? {width: size} : {height: size}} />;
}

export function Divider({inset = 0}: {inset?: number}): React.JSX.Element {
  const styles = useThemedStyles(theme => ({
    divider: {
      height: 1,
      backgroundColor: theme.colors.divider,
      marginVertical: theme.spacing.sm,
    },
  }));
  // `inset` varies per call site, so marginHorizontal stays inline.
  return <View style={[styles.divider, {marginHorizontal: inset}]} />;
}
