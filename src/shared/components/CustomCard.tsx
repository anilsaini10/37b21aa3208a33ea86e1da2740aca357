/** Themed surface card with optional press handling + elevation. */
import React from 'react';
import {Pressable, View, type StyleProp, type ViewStyle} from 'react-native';
import {useTheme} from '../../core/theme';

export interface CustomCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  padded?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function CustomCard({
  children,
  onPress,
  padded = true,
  style,
  testID,
}: CustomCardProps): React.JSX.Element {
  const {theme} = useTheme();

  const cardStyle: ViewStyle = {
    backgroundColor: theme.colors.card,
    borderRadius: theme.components.card.radius,
    padding: padded ? theme.components.card.padding : 0,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: theme.colors.shadow,
    shadowOpacity: theme.dark ? 0.3 : 0.06,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 2},
    elevation: theme.components.card.elevation,
  };

  if (onPress) {
    return (
      <Pressable
        testID={testID}
        onPress={onPress}
        style={({pressed}) => [cardStyle, {opacity: pressed ? 0.9 : 1}, style]}>
        {children}
      </Pressable>
    );
  }

  return (
    <View testID={testID} style={[cardStyle, style]}>
      {children}
    </View>
  );
}
