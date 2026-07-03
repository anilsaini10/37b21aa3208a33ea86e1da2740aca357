/** Circular avatar showing an image or initials fallback. */
import React from 'react';
import {Image, View} from 'react-native';
import {useThemedStyles} from '../../core/theme';
import {AppText} from './AppText';
import {initials} from '../../core/utils/format';

export interface AvatarProps {
  name: string;
  uri?: string;
  size?: number;
}

export function Avatar({name, uri, size = 44}: AvatarProps): React.JSX.Element {
  const styles = useThemedStyles(theme => ({
    image: {backgroundColor: theme.colors.surfaceVariant},
    circle: {
      backgroundColor: theme.colors.primary + '22',
      alignItems: 'center',
      justifyContent: 'center',
    },
    initials: {color: theme.colors.primary, fontWeight: '700'},
  }));

  const sizeStyle = {width: size, height: size, borderRadius: size / 2};

  if (uri) {
    return <Image source={{uri}} style={[styles.image, sizeStyle]} />;
  }

  return (
    <View style={[styles.circle, sizeStyle]}>
      <AppText style={[styles.initials, {fontSize: size * 0.38}]}>{initials(name)}</AppText>
    </View>
  );
}
