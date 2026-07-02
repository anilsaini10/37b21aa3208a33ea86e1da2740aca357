/** Reports — school-wide analytics: attendance, fees, performance. */
import React from 'react';
import {View, ScrollView} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme} from '../../../core/theme';
import {
  Screen,
  CustomHeader,
  CustomCard,
  SectionTitle,
  BarChart,
  LineChart,
  StatTile,
  Loader,
  Row,
  Spacer,
} from '../../../shared/components';
import {formatCurrency} from '../../../core/utils/format';
import {useAdminDashboard} from '../../dashboard/dashboard.service';
import {useFeeSummary} from '../../fees/fees.service';
import type {AdminStackParamList} from '../../../navigation/types';
import type {StatCard} from '../../../shared/types';

type Nav = NativeStackNavigationProp<AdminStackParamList>;

export function ReportsScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const navigation = useNavigation<Nav>();
  const {data: dashboard, isLoading: dashboardLoading} = useAdminDashboard();
  const {data: feeSummary, isLoading: feeLoading} = useFeeSummary();

  if (dashboardLoading || feeLoading || !dashboard || !feeSummary) {
    return <Loader message="Loading reports…" />;
  }

  const stats: StatCard[] = [
    {
      key: 'collected',
      label: 'Collected',
      value: formatCurrency(feeSummary.totalCollected),
      icon: 'money',
      accent: 'success',
    },
    {
      key: 'pending',
      label: 'Pending',
      value: formatCurrency(feeSummary.totalPending),
      icon: 'fee',
      accent: 'error',
    },
    {
      key: 'rate',
      label: 'Collection Rate',
      value: `${feeSummary.collectionRate}%`,
      icon: 'reports',
      accent: 'primary',
    },
  ];

  return (
    <Screen padded={false}>
      <CustomHeader title="Reports" onBack={() => navigation.goBack()} />
      <ScrollView
        contentContainerStyle={{padding: theme.spacing.lg}}
        showsVerticalScrollIndicator={false}>
        <SectionTitle title="Attendance Trend" />
        <CustomCard>
          <LineChart series={dashboard.attendanceTrend} />
        </CustomCard>

        <SectionTitle title="Fee Collection" />
        <CustomCard>
          <BarChart series={dashboard.feeCollectionTrend} color={theme.colors.success} />
        </CustomCard>

        <SectionTitle title="Student Performance" />
        <CustomCard>
          <BarChart series={dashboard.performanceTrend} valueFormatter={v => `${v}%`} />
        </CustomCard>

        <SectionTitle title="Fee Summary" />
        <Row gap={theme.spacing.sm} wrap style={{rowGap: theme.spacing.sm}}>
          {stats.map(s => (
            <View key={s.key} style={{flexBasis: '31%', flexGrow: 1}}>
              <StatTile stat={s} />
            </View>
          ))}
        </Row>
        <Spacer size={24} />
      </ScrollView>
    </Screen>
  );
}
