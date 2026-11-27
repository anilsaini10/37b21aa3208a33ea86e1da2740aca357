/** Parent attendance — child's attendance history with inline child switcher. */
import React, {useState} from 'react';
import {View, ScrollView} from 'react-native';
import {useTheme, useThemedStyles} from '../../../core/theme';
import {useLanguage, type TranslationKey} from '../../../core/i18n';
import {
  Screen,
  CustomHeader,
  CustomCard,
  AppText,
  Badge,
  Row,
  Spacer,
  CustomTable,
  Loader,
  EmptyState,
  ChildSwitcher,
} from '../../../shared/components';
import type {BadgeTone, TableColumn} from '../../../shared/components';
import {DateRangeFilter} from './AttendanceReportScreen';
import {formatDateDMY} from '../../../core/utils/format';
import {useParentProfile} from '../../parent/parentStudents.service';
import {useParentAttendance} from '../../parent/parentAttendance.service';
import type {AttendanceStatusCode, ParentChild, StudentAttendanceHistoryRecord} from '../../../shared/types';

const STATUS_TONE: Record<AttendanceStatusCode, BadgeTone> = {
  PRESENT: 'success',
  ABSENT: 'error',
  LATE: 'warning',
  LEAVE: 'info',
  HOLIDAY: 'neutral',
};

const DAY_KEYS: TranslationKey[] = [
  'common_daySun', 'common_dayMon', 'common_dayTue', 'common_dayWed',
  'common_dayThu', 'common_dayFri', 'common_daySat',
];

function isoDaysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function SummaryStat({label, value, color}: {label: string; value: number; color: string}): React.JSX.Element {
  return (
    <View style={{alignItems: 'center'}}>
      <AppText variant="bodyBold" style={{color}}>
        {value}
      </AppText>
      <AppText variant="label" color="textMuted">
        {label}
      </AppText>
    </View>
  );
}

export function ParentAttendanceScreen(): React.JSX.Element {
  const {t} = useLanguage();
  const {data: profile, isLoading, isError, error, refetch} = useParentProfile();
  const [activeChildId, setActiveChildId] = useState<string | null>(null);

  if (isLoading || !profile) {
    if (isError) {
      return (
        <Screen padded={false}>
          <CustomHeader title={t('parentAttendance_title')} />
          <EmptyState
            icon="warning"
            title={t('common_somethingWentWrong')}
            message={(error as {message?: string} | null)?.message ?? t('common_checkConnection')}
            actionLabel={t('common_retry')}
            onAction={() => refetch()}
          />
        </Screen>
      );
    }
    return <Loader message={t('parentAttendance_loadingAttendance')} />;
  }

  const {children} = profile;

  if (children.length === 0) {
    return (
      <Screen padded={false}>
        <CustomHeader title={t('parentAttendance_title')} />
        <EmptyState
          icon="attendance"
          title={t('childProfile_noChildrenTitle')}
          message={t('childProfile_noChildrenMessage')}
        />
      </Screen>
    );
  }

  const child = children.find(c => c.id === activeChildId) ?? children[0];

  return (
    <ChildAttendance
      child={child}
      allChildren={children}
      activeChildId={child.id}
      onSelectChild={setActiveChildId}
    />
  );
}

function ChildAttendance({child, allChildren, activeChildId, onSelectChild}: {child: ParentChild; allChildren: ParentChild[]; activeChildId: string; onSelectChild: (id: string) => void}): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const [fromDate, setFromDate] = useState(isoDaysAgo(30));
  const [toDate, setToDate] = useState(todayIso());
  const {data, isLoading, isError, error, refetch} = useParentAttendance(child.id, fromDate, toDate);

  const STATUS_LABEL: Record<AttendanceStatusCode, string> = {
    PRESENT: t('markAttendance_presentLabel'),
    ABSENT: t('markAttendance_absentLabel'),
    LATE: t('markAttendance_lateLabel'),
    LEAVE: t('attendanceReport_leave'),
    HOLIDAY: t('attendance_holiday'),
  };

  const styles = useThemedStyles(t2 => ({
    scrollContent: {padding: t2.spacing.lg},
    summaryCard: {marginBottom: t2.spacing.md},
  }));

  const rows = data ? [...data.records].reverse() : [];
  const columns: TableColumn<StudentAttendanceHistoryRecord>[] = [
    {
      key: 'sno',
      title: t('myAttendance_colSno'),
      width: 48,
      align: 'center',
      render: record => <AppText variant="caption">{rows.indexOf(record) + 1}</AppText>,
    },
    {
      key: 'date',
      title: t('common_date'),
      flex: 1.3,
      render: record => <AppText variant="caption">{formatDateDMY(record.date)}</AppText>,
    },
    {
      key: 'day',
      title: t('parentAttendance_colDay'),
      flex: 0.8,
      render: record => {
        const [y, m, d] = record.date.slice(0, 10).split('-').map(Number);
        return <AppText variant="caption">{t(DAY_KEYS[new Date(y, m - 1, d).getDay()])}</AppText>;
      },
    },
    {
      key: 'status',
      title: t('common_status'),
      flex: 1.1,
      render: record => <Badge label={STATUS_LABEL[record.status]} tone={STATUS_TONE[record.status]} />,
    },
  ];

  return (
    <Screen padded={false}>
      <CustomHeader title={t('parentAttendance_title')} />
      <ChildSwitcher children={allChildren} activeChildId={activeChildId} onSelect={onSelectChild} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <DateRangeFilter
          fromDate={fromDate}
          toDate={toDate}
          onChange={(f, tD) => {
            setFromDate(f);
            setToDate(tD);
          }}
        />

        {isError ? (
          <EmptyState
            icon="warning"
            title={t('common_somethingWentWrong')}
            message={(error as {message?: string} | null)?.message ?? t('common_checkConnection')}
            actionLabel={t('common_retry')}
            onAction={() => refetch()}
          />
        ) : isLoading || !data ? (
          <Loader message={t('studentAttendanceHistory_loading')} />
        ) : (
          <>
            <CustomCard style={styles.summaryCard}>
              <Row justify="space-around">
                <SummaryStat label={STATUS_LABEL.PRESENT} value={data.summary.present} color={theme.colors.success} />
                <SummaryStat label={STATUS_LABEL.ABSENT} value={data.summary.absent} color={theme.colors.error} />
                <SummaryStat label={STATUS_LABEL.LATE} value={data.summary.late} color={theme.colors.warning} />
                <SummaryStat label={STATUS_LABEL.LEAVE} value={data.summary.leave} color={theme.colors.info} />
                <SummaryStat label={STATUS_LABEL.HOLIDAY} value={data.summary.holiday} color={theme.colors.textMuted} />
              </Row>
            </CustomCard>

            {data.records.length === 0 ? (
              <EmptyState
                icon="attendance"
                title={t('studentAttendanceHistory_noRecords')}
                message={t('studentAttendanceHistory_noRecordsMessage')}
              />
            ) : (
              // S.No · Date · Day · Status, newest first.
              <CustomTable columns={columns} data={rows} keyExtractor={record => record.id} />
            )}
          </>
        )}
        <Spacer size={24} />
      </ScrollView>
    </Screen>
  );
}
