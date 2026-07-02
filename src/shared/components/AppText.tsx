/**
 * AppText — themed Text primitive.
 *
 * Every string in the app should render through this so typography + colour
 * automatically follow the active theme and accessibility font scale.
 */
import React, {useMemo} from 'react';
import {Text, type TextProps, type TextStyle} from 'react-native';
import {useTheme} from '../../core/theme';

export type TextVariant =
  | 'display'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'body'
  | 'bodyBold'
  | 'caption'
  | 'label'
  | 'button';

export type TextColor =
  | 'text'
  | 'textSecondary'
  | 'textMuted'
  | 'primary'
  | 'onPrimary'
  | 'error'
  | 'success'
  | 'warning';

export interface AppTextProps extends TextProps {
  variant?: TextVariant;
  color?: TextColor;
  center?: boolean;
}

export function AppText({
  variant = 'body',
  color = 'text',
  center,
  style,
  children,
  ...rest
}: AppTextProps): React.JSX.Element {
  const {theme} = useTheme();

  const variantStyle = useMemo<TextStyle>(() => {
    const {fontSize, fontWeight, fontFamily, lineHeight} = theme.typography;
    switch (variant) {
      case 'display':
        return {fontSize: fontSize.display, lineHeight: lineHeight.display, fontFamily: fontFamily.bold, fontWeight: fontWeight.bold};
      case 'h1':
        return {fontSize: fontSize.xxxl, lineHeight: lineHeight.xxxl, fontFamily: fontFamily.bold, fontWeight: fontWeight.bold};
      case 'h2':
        return {fontSize: fontSize.xxl, lineHeight: lineHeight.xxl, fontFamily: fontFamily.semibold, fontWeight: fontWeight.semibold};
      case 'h3':
        return {fontSize: fontSize.xl, lineHeight: lineHeight.xl, fontFamily: fontFamily.semibold, fontWeight: fontWeight.semibold};
      case 'bodyBold':
        return {fontSize: fontSize.md, lineHeight: lineHeight.md, fontFamily: fontFamily.semibold, fontWeight: fontWeight.semibold};
      case 'caption':
        return {fontSize: fontSize.sm, lineHeight: lineHeight.sm, fontFamily: fontFamily.regular, fontWeight: fontWeight.regular};
      case 'label':
        return {fontSize: fontSize.xs, lineHeight: lineHeight.xs, fontFamily: fontFamily.medium, fontWeight: fontWeight.medium};
      case 'button':
        return {fontSize: fontSize.md, lineHeight: lineHeight.md, fontFamily: fontFamily.semibold, fontWeight: fontWeight.semibold};
      case 'body':
      default:
        return {fontSize: fontSize.md, lineHeight: lineHeight.md, fontFamily: fontFamily.regular, fontWeight: fontWeight.regular};
    }
  }, [theme, variant]);

  return (
    <Text
      style={[variantStyle, {color: theme.colors[color]}, center && {textAlign: 'center'}, style]}
      {...rest}>
      {children}
    </Text>
  );
}
