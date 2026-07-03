/** Transport — bus routes with driver, stops and capacity details. */
import React from 'react';
import {View, ScrollView} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme, useThemedStyles} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {
  Screen,
  AppText,
  CustomHeader,
  CustomCard,
  Badge,
  Icon,
  Row,
  Spacer,
  Loader,
  EmptyState,
} from '../../../shared/components';
import {useBusRoutes} from '../../operations/operations.service';
import type {AdminStackParamList} from '../../../navigation/types';

type Nav = NativeStackNavigationProp<AdminStackParamList>;

export function TransportScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const navigation = useNavigation<Nav>();
  const {t} = useLanguage();
  const {data, isLoading} = useBusRoutes();
  const styles = useThemedStyles(t2 => ({
    scrollContent: {
      padding: t2.spacing.lg,
    },
    routeCard: {
      marginBottom: t2.spacing.md,
    },
    routeNameText: {
      flex: 1,
    },
    infoTextBlock: {
      flex: 1,
    },
  }));

  if (isLoading || !data) {
    return <Loader message={t('transport_loading')} />;
  }

  if (data.length === 0) {
    return (
      <Screen padded={false}>
        <CustomHeader title={t('transport_title')} onBack={() => navigation.goBack()} />
        <EmptyState
          icon="bus"
          title={t('transport_noRoutes')}
          message={t('transport_noRoutesMessage')}
        />
      </Screen>
    );
  }

  return (
    <Screen padded={false}>
      <CustomHeader title={t('transport_title')} onBack={() => navigation.goBack()} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {data.map(route => (
          <View key={route.id} style={styles.routeCard}>
            <CustomCard>
              <Row justify="space-between" align="flex-start">
                <AppText variant="h3" style={styles.routeNameText}>
                  {route.routeName}
                </AppText>
                <Badge label={route.busNumber} tone="primary" />
              </Row>

              <Spacer size={theme.spacing.sm} />
              <Row gap={theme.spacing.sm} align="flex-start">
                <Icon name="phone" size={18} color={theme.colors.textSecondary} />
                <View style={styles.infoTextBlock}>
                  <AppText variant="caption" color="textSecondary">
                    {t('transport_driver')}
                  </AppText>
                  <AppText variant="body">
                    {route.driverName} · {route.driverPhone}
                  </AppText>
                </View>
              </Row>

              <Spacer size={theme.spacing.sm} />
              <Row gap={theme.spacing.sm} align="flex-start">
                <Icon name="transport" size={18} color={theme.colors.textSecondary} />
                <View style={styles.infoTextBlock}>
                  <AppText variant="caption" color="textSecondary">
                    {t('transport_stops')}
                  </AppText>
                  <AppText variant="body">{route.stops.join(' → ')}</AppText>
                </View>
              </Row>

              <Spacer size={theme.spacing.sm} />
              <Row gap={theme.spacing.sm} align="flex-start">
                <Icon name="students" size={18} color={theme.colors.textSecondary} />
                <View style={styles.infoTextBlock}>
                  <AppText variant="caption" color="textSecondary">
                    {t('transport_capacity')}
                  </AppText>
                  <AppText variant="body">
                    {t('transport_studentsCapacity', {count: route.studentCount, capacity: route.capacity})}
                  </AppText>
                </View>
              </Row>
            </CustomCard>
          </View>
        ))}
      </ScrollView>
    </Screen>
  );
}
