/** One class's students with their attendance breakdown for a chosen date range. */
import React, {useState} from 'react';
import {View, ScrollView} from 'react-native';
import {useNavigation, useRoute, type RouteProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme, useThemedStyles} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {Screen, AppText, CustomHeader, CustomCard, Loader, EmptyState, Row, Spacer, Divider} from '../../../shared/components';
import {DateRangeFilter, BreakdownLine} from './AttendanceReportScreen';
import {useClassStudentsAttendance} from '../attendance.service';
import type {AdminStackParamList} from '../../../navigation/types';

type Nav = NativeStackNavigationProp<AdminStackParamList>;

export function ClassAttendanceScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<AdminStackParamList, 'ClassAttendance'>>();
  const {classId, className, fromDate: initialFromDate, toDate: initialToDate} = route.params;

  const [fromDate, setFromDate] = useState(initialFromDate);
  const [toDate, setToDate] = useState(initialToDate);
  const {data, isLoading} = useClassStudentsAttendance(fromDate, toDate, classId);

  const styles = useThemedStyles(t2 => ({
    scrollContent: {
      padding: t2.spacing.lg,
    },
  }));

  return (
    <Screen padded={false}>
      <CustomHeader title={className} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <DateRangeFilter
          fromDate={fromDate}
          toDate={toDate}
          onChange={(f, tD) => {
            setFromDate(f);
            setToDate(tD);
          }}
        />

        {isLoading || !data ? (
          <Loader message={t('attendanceReport_loadingAttendance')} />
        ) : data.length === 0 ? (
          <EmptyState
            icon="students"
            title={t('attendanceReport_noStudentRecords')}
            message={t('attendanceReport_noRecordsMessage')}
          />
        ) : (
          <CustomCard padded={false} style={{paddingHorizontal: theme.spacing.lg}}>
            {data.map((row, i) => (
              <React.Fragment key={row.studentId}>
                {i > 0 ? <Divider /> : null}
                <Row justify="space-between" align="center" style={{paddingVertical: theme.spacing.sm}}>
                  <View>
                    <AppText variant="bodyBold">{row.studentName}</AppText>
                    <AppText variant="caption" color="textMuted">
                      {t('classAttendance_rollSection', {rollNo: row.rollNo, section: row.sectionName})}
                    </AppText>
                  </View>
                  <BreakdownLine
                    present={row.present}
                    absent={row.absent}
                    late={row.late}
                    leave={row.leave}
                    total={row.total}
                    percentage={row.percentage}
                  />
                </Row>
              </React.Fragment>
            ))}
          </CustomCard>
        )}
        <Spacer size={24} />
      </ScrollView>
    </Screen>
  );
}
