/** Circular avatar showing an image or initials fallback. */
import React from 'react';
import {Image, View} from 'react-native';
import {useTheme} from '../../core/theme';
import {AppText} from './AppText';
import {initials} from '../../core/utils/format';

export interface AvatarProps {
  name: string;
  uri?: string;
  size?: number;
}

export function Avatar({name, uri, size = 44}: AvatarProps): React.JSX.Element {
  const {theme} = useTheme();

  if (uri) {
    return (
      <Image
        source={{uri}}
        style={{width: size, height: size, borderRadius: size / 2, backgroundColor: theme.colors.surfaceVariant}}
      />
    );
  }

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: theme.colors.primary + '22',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <AppText style={{color: theme.colors.primary, fontSize: size * 0.38, fontWeight: '700'}}>
        {initials(name)}
      </AppText>
    </View>
  );
}
