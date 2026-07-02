/** Attendance report — school-wide daily summary with breakdown + bar chart. */
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
  BarChart,
  Loader,
  SectionTitle,
  Row,
  Spacer,
} from '../../../shared/components';
import {useAttendanceSummary} from '../attendance.service';
import type {AdminStackParamList} from '../../../navigation/types';

type Nav = NativeStackNavigationProp<AdminStackParamList>;

export function AttendanceReportScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const navigation = useNavigation<Nav>();
  const {data, isLoading} = useAttendanceSummary();

  if (isLoading || !data) {
    return <Loader message="Loading attendance…" />;
  }

  const {present, absent, late, leave, total, percentage} = data;

  const tiles: {label: string; value: number; color: string}[] = [
    {label: 'Present', value: present, color: theme.colors.success},
    {label: 'Absent', value: absent, color: theme.colors.error},
    {label: 'Late', value: late, color: theme.colors.warning},
    {label: 'Leave', value: leave, color: theme.colors.info},
    {label: 'Total', value: total, color: theme.colors.primary},
  ];

  return (
    <Screen padded={false}>
      <CustomHeader title="Attendance Report" onBack={() => navigation.goBack()} />
      <ScrollView
        contentContainerStyle={{padding: theme.spacing.lg}}
        showsVerticalScrollIndicator={false}>
        <CustomCard>
          <AppText variant="caption" color="textSecondary">
            Overall attendance
          </AppText>
          <AppText variant="display" color="primary">
            {percentage}%
          </AppText>
          <AppText variant="caption" color="textSecondary">
            {present} of {total} marked present
          </AppText>
        </CustomCard>

        <SectionTitle title="Breakdown" />
        <Row gap={theme.spacing.sm} wrap style={{rowGap: theme.spacing.sm}}>
          {tiles.map(t => (
            <View key={t.label} style={{width: '31%'}}>
              <CustomCard style={{alignItems: 'center'}}>
                <AppText variant="h2" style={{color: t.color}}>
                  {t.value}
                </AppText>
                <AppText variant="label" color="textSecondary">
                  {t.label}
                </AppText>
              </CustomCard>
            </View>
          ))}
        </Row>

        <SectionTitle title="Distribution" />
        <CustomCard>
          <BarChart
            series={{
              labels: ['Present', 'Absent', 'Late', 'Leave'],
              values: [present, absent, late, leave],
            }}
            height={150}
          />
        </CustomCard>
        <Spacer size={24} />
      </ScrollView>
    </Screen>
  );
}
