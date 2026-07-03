/** Attendance report — school-wide daily summary with breakdown + bar chart. */
import React from 'react';
import {View, ScrollView} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
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
  const {t} = useLanguage();
  const {data, isLoading} = useAttendanceSummary();

  if (isLoading || !data) {
    return <Loader message={t('attendanceReport_loadingAttendance')} />;
  }

  const {present, absent, late, leave, total, percentage} = data;

  const tiles: {label: string; value: number; color: string}[] = [
    {label: t('attendance_present'), value: present, color: theme.colors.success},
    {label: t('attendance_absent'), value: absent, color: theme.colors.error},
    {label: t('attendance_late'), value: late, color: theme.colors.warning},
    {label: t('attendanceReport_leave'), value: leave, color: theme.colors.info},
    {label: t('attendanceReport_total'), value: total, color: theme.colors.primary},
  ];

  return (
    <Screen padded={false}>
      <CustomHeader title={t('attendanceReport_title')} onBack={() => navigation.goBack()} />
      <ScrollView
        contentContainerStyle={{padding: theme.spacing.lg}}
        showsVerticalScrollIndicator={false}>
        <CustomCard>
          <AppText variant="caption" color="textSecondary">
            {t('attendanceReport_overallAttendance')}
          </AppText>
          <AppText variant="display" color="primary">
            {percentage}%
          </AppText>
          <AppText variant="caption" color="textSecondary">
            {t('attendanceReport_markedPresent', {present: String(present), total: String(total)})}
          </AppText>
        </CustomCard>

        <SectionTitle title={t('attendanceReport_breakdown')} />
        <Row gap={theme.spacing.sm} wrap style={{rowGap: theme.spacing.sm}}>
          {tiles.map(tile => (
            <View key={tile.label} style={{width: '31%'}}>
              <CustomCard style={{alignItems: 'center'}}>
                <AppText variant="h2" style={{color: tile.color}}>
                  {tile.value}
                </AppText>
                <AppText variant="label" color="textSecondary">
                  {tile.label}
                </AppText>
              </CustomCard>
            </View>
          ))}
        </Row>

        <SectionTitle title={t('attendanceReport_distribution')} />
        <CustomCard>
          <BarChart
            series={{
              labels: [t('attendance_present'), t('attendance_absent'), t('attendance_late'), t('attendanceReport_leave')],
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
