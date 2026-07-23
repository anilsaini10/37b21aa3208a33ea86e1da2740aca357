/** One class's students with their attendance status for a chosen day — searchable, paginated, real backend. */
import React, {useEffect, useState} from 'react';
import {View, ScrollView} from 'react-native';
import {useNavigation, useRoute, type RouteProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme, useThemedStyles} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {
  Screen,
  AppText,
  CustomHeader,
  CustomCard,
  DatePicker,
  SearchBar,
  Badge,
  Pagination,
  Loader,
  EmptyState,
  Row,
  Spacer,
  Divider,
} from '../../../shared/components';
import type {BadgeTone} from '../../../shared/components';
import {useClassStudentsAttendance} from '../adminStudentAttendance.service';
import type {AdminStackParamList} from '../../../navigation/types';
import type {AttendanceStatusCode} from '../../../shared/types';

type Nav = NativeStackNavigationProp<AdminStackParamList>;
type StatusOrUnmarked = AttendanceStatusCode | 'UNMARKED';

const SEARCH_DEBOUNCE_MS = 350;

const STATUS_TONE: Record<StatusOrUnmarked, BadgeTone> = {
  PRESENT: 'success',
  ABSENT: 'error',
  LATE: 'warning',
  LEAVE: 'info',
  HOLIDAY: 'neutral',
  UNMARKED: 'neutral',
};

export function ClassAttendanceScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<AdminStackParamList, 'ClassAttendance'>>();
  const {classId, className, date: initialDate} = route.params;

  const [date, setDate] = useState(initialDate);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(handle);
  }, [search]);

  const {data, isLoading, isError, error, refetch} = useClassStudentsAttendance(classId, {
    date,
    page,
    pageSize: 20,
    search: debouncedSearch || undefined,
  });

  const STATUS_LABEL: Record<StatusOrUnmarked, string> = {
    PRESENT: t('attendance_present'),
    ABSENT: t('attendance_absent'),
    LATE: t('attendance_late'),
    LEAVE: t('attendanceReport_leave'),
    HOLIDAY: t('attendance_holiday'),
    UNMARKED: t('classAttendance_notMarked'),
  };

  const styles = useThemedStyles(t2 => ({
    filterCard: {
      marginBottom: t2.spacing.md,
    },
    scrollContent: {
      padding: t2.spacing.lg,
    },
    searchWrap: {
      marginBottom: t2.spacing.md,
    },
  }));

  return (
    <Screen padded={false}>
      <CustomHeader title={className} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <CustomCard style={styles.filterCard}>
          <DatePicker
            label={t('attendanceReport_dateLabel')}
            value={date}
            onChange={d => {
              setDate(d);
              setPage(1);
            }}
          />
        </CustomCard>

        <View style={styles.searchWrap}>
          <SearchBar value={search} onChangeText={setSearch} placeholder={t('classAttendance_searchPlaceholder')} />
        </View>

        {isError ? (
          <EmptyState
            icon="warning"
            title={t('common_somethingWentWrong')}
            message={(error as {message?: string} | null)?.message ?? t('common_checkConnection')}
            actionLabel={t('common_retry')}
            onAction={() => refetch()}
          />
        ) : isLoading || !data ? (
          <Loader message={t('attendanceReport_loadingAttendance')} />
        ) : data.items.length === 0 ? (
          <EmptyState
            icon="students"
            title={t('attendanceReport_noStudentRecords')}
            message={t('attendanceReport_noRecordsMessageDay')}
          />
        ) : (
          <>
            <CustomCard padded={false} style={{paddingHorizontal: theme.spacing.lg}}>
              {data.items.map((row, i) => {
                const statusKey: StatusOrUnmarked = row.status ?? 'UNMARKED';
                return (
                  <React.Fragment key={row.studentId}>
                    {i > 0 ? <Divider /> : null}
                    <Row justify="space-between" align="center" style={{paddingVertical: theme.spacing.sm}}>
                      <View style={{flex: 1}}>
                        <AppText variant="bodyBold" numberOfLines={1}>
                          {row.name}
                        </AppText>
                        <AppText variant="caption" color="textMuted">
                          {t('classAttendance_rollSection', {rollNo: row.rollNo, section: row.sectionName})}
                        </AppText>
                      </View>
                      <Badge label={STATUS_LABEL[statusKey]} tone={STATUS_TONE[statusKey]} />
                    </Row>
                  </React.Fragment>
                );
              })}
            </CustomCard>
            <Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} />
          </>
        )}
        <Spacer size={24} />
      </ScrollView>
    </Screen>
  );
}
