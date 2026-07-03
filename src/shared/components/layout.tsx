/** Small layout primitives: Screen, Row, Column, Spacer, Divider. */
import React from 'react';
import {
  View,
  ScrollView,
  StatusBar,
  type ViewStyle,
  type StyleProp,
  type ScrollViewProps,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useTheme} from '../../core/theme';

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
  const bg = {flex: 1, backgroundColor: theme.colors.background};
  const pad = padded ? {padding: theme.spacing.lg} : undefined;

  return (
    <SafeAreaView style={bg}>
      <StatusBar
        barStyle={theme.dark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.headerBackground}
      />
      {scroll ? (
        <ScrollView
          style={bg}
          contentContainerStyle={[pad, {flexGrow: 1}, contentContainerStyle]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
      ) : (
        <View style={[bg, pad, style]}>{children}</View>
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
        {
          flexDirection: 'row',
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

export function Spacer({size = 8, horizontal}: {size?: number; horizontal?: boolean}): React.JSX.Element {
  return <View style={horizontal ? {width: size} : {height: size}} />;
}

export function Divider({inset = 0}: {inset?: number}): React.JSX.Element {
  const {theme} = useTheme();
  return (
    <View
      style={{
        height: 1,
        backgroundColor: theme.colors.divider,
        marginVertical: theme.spacing.sm,
        marginHorizontal: inset,
      }}
    />
  );
}
