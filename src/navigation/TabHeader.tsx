import React from 'react';
import {View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useThemedStyles} from '../core/theme';
import {AppText, Row} from '../shared/components';

interface TabHeaderProps {
  title: string;
  icon: React.ReactNode;
}

export function TabHeader({title, icon}: TabHeaderProps): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const styles = useThemedStyles(t => ({
    container: {
      paddingTop: insets.top + t.spacing.sm,
      paddingBottom: t.spacing.sm,
      paddingHorizontal: t.spacing.lg,
      backgroundColor: t.colors.background,
    },
  }));

  return (
    <View style={styles.container}>
      <Row gap={10} align="center">
        {icon}
        <AppText variant="headerTitle">{title}</AppText>
      </Row>
    </View>
  );
}
