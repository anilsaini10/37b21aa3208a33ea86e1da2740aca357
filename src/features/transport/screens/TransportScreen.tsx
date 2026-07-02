/** Transport — bus routes with driver, stops and capacity details. */
import React from 'react';
import {View, ScrollView} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme} from '../../../core/theme';
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
  const {data, isLoading} = useBusRoutes();

  if (isLoading || !data) {
    return <Loader message="Loading routes…" />;
  }

  if (data.length === 0) {
    return (
      <Screen padded={false}>
        <CustomHeader title="Transport" onBack={() => navigation.goBack()} />
        <EmptyState
          icon="bus"
          title="No bus routes"
          message="Configured transport routes will appear here."
        />
      </Screen>
    );
  }

  return (
    <Screen padded={false}>
      <CustomHeader title="Transport" onBack={() => navigation.goBack()} />
      <ScrollView
        contentContainerStyle={{padding: theme.spacing.lg}}
        showsVerticalScrollIndicator={false}>
        {data.map(route => (
          <View key={route.id} style={{marginBottom: theme.spacing.md}}>
            <CustomCard>
              <Row justify="space-between" align="flex-start">
                <AppText variant="h3" style={{flex: 1}}>
                  {route.routeName}
                </AppText>
                <Badge label={route.busNumber} tone="primary" />
              </Row>

              <Spacer size={theme.spacing.sm} />
              <Row gap={theme.spacing.sm} align="flex-start">
                <Icon name="phone" size={18} color={theme.colors.textSecondary} />
                <View style={{flex: 1}}>
                  <AppText variant="caption" color="textSecondary">
                    Driver
                  </AppText>
                  <AppText variant="body">
                    {route.driverName} · {route.driverPhone}
                  </AppText>
                </View>
              </Row>

              <Spacer size={theme.spacing.sm} />
              <Row gap={theme.spacing.sm} align="flex-start">
                <Icon name="transport" size={18} color={theme.colors.textSecondary} />
                <View style={{flex: 1}}>
                  <AppText variant="caption" color="textSecondary">
                    Stops
                  </AppText>
                  <AppText variant="body">{route.stops.join(' → ')}</AppText>
                </View>
              </Row>

              <Spacer size={theme.spacing.sm} />
              <Row gap={theme.spacing.sm} align="flex-start">
                <Icon name="students" size={18} color={theme.colors.textSecondary} />
                <View style={{flex: 1}}>
                  <AppText variant="caption" color="textSecondary">
                    Capacity
                  </AppText>
                  <AppText variant="body">
                    {route.studentCount}/{route.capacity} students
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
