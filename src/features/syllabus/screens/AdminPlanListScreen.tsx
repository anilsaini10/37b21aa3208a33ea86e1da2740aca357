/** Admin Plan List — filters, paginated plan cards. */
import React, {useState, useCallback, useMemo} from 'react';
import {FlatList, RefreshControl, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useThemedStyles} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {
  Screen,
  CustomHeader,
  CustomCard,
  Select,
  Badge,
  AppText,
  Row,
  Spacer,
  Pagination,
  EmptyState,
  Loader,
} from '../../../shared/components';
import {formatSessionYear, planStatusTone, progressBarColor} from '../../../shared/helpers';
import {useAdminPlans, useSubjectsByClass} from '../adminSyllabus.service';
import {useClasses} from '../../classes/classes.service';
import {useTeachers} from '../../teachers/teachers.service';
import type {SyllabusPlan, PlanStatus} from '../../../shared/types';
import type {AdminStackParamList} from '../../../navigation/types';
import {ScreenNames} from '../../../navigation/ScreenNames';

type Nav = NativeStackNavigationProp<AdminStackParamList>;

const YEARS = Array.from({length: 7}, (_, i) => {
  const y = 2024 + i;
  return {label: formatSessionYear(y), value: String(y)};
});

const STATUS_OPTIONS = [
  {label: 'All', value: ''},
  {label: 'Draft', value: 'DRAFT'},
  {label: 'Active', value: 'ACTIVE'},
  {label: 'Completed', value: 'COMPLETED'},
  {label: 'Archived', value: 'ARCHIVED'},
];

export function AdminPlanListScreen(): React.JSX.Element {
  const {t} = useLanguage();
  const navigation = useNavigation<Nav>();
  const currentYear = new Date().getFullYear();

  const [sessionYear, setSessionYear] = useState(String(currentYear));
  const [classId, setClassId] = useState<string | undefined>();
  const [sectionId, setSectionId] = useState<string | undefined>();
  const [subjectId, setSubjectId] = useState<string | undefined>();
  const [teacherId, setTeacherId] = useState<string | undefined>();
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const {data: classes} = useClasses();
  const {data: subjects} = useSubjectsByClass(classId);
  const {data: teachersData} = useTeachers();

  const {data, isLoading, refetch, isRefetching} = useAdminPlans({
    sessionYear: Number(sessionYear),
    classId,
    sectionId,
    subjectId,
    teacherId,
    status: status || undefined,
    page,
    pageSize: 20,
  });

  const classOptions = useMemo(() => (classes ?? []).map(c => ({label: c.name, value: c.id})), [classes]);
  const sectionOptions = useMemo(() => {
    if (!classId || !classes) return [];
    const cls = classes.find(c => c.id === classId);
    return cls?.sections.map(s => ({label: s.name, value: s.id})) ?? [];
  }, [classId, classes]);
  const subjectOptions = useMemo(() => (subjects ?? []).map(s => ({label: s.name, value: s.id})), [subjects]);
  const teacherOptions = useMemo(() => {
    const items = teachersData?.items ?? teachersData ?? [];
    return (Array.isArray(items) ? items : []).map((te: any) => ({label: te.name, value: te.id}));
  }, [teachersData]);

  const styles = useThemedStyles(t2 => ({
    filters: {paddingHorizontal: t2.spacing.lg, paddingTop: t2.spacing.sm},
    filterRow: {flexDirection: 'row', gap: t2.spacing.sm},
    filterItem: {flex: 1},
    list: {paddingHorizontal: t2.spacing.lg, paddingBottom: t2.spacing.xl},
    card: {marginBottom: t2.spacing.md},
    progressBar: {height: 6, borderRadius: 3, marginTop: t2.spacing.xs},
    progressFill: {height: 6, borderRadius: 3},
  }));

  const handleClassChange = useCallback((val: string) => {
    setClassId(val);
    setSectionId(undefined);
    setSubjectId(undefined);
    setPage(1);
  }, []);

  const renderItem = useCallback(({item}: {item: SyllabusPlan}) => {
    const pct = item.avgCompletion ?? 0;
    return (
      <CustomCard style={styles.card} onPress={() => navigation.navigate(ScreenNames.AdminPlanDetail as any, {planId: item.id})}>
        <Row justify="space-between" align="flex-start">
          <View style={{flex: 1}}>
            <AppText variant="bodyBold">{item.className} - {item.sectionName}</AppText>
            <AppText variant="caption" color="textSecondary">{item.subjectName}</AppText>
            {item.teacherName ? <AppText variant="caption" color="textSecondary">{item.teacherName}</AppText> : null}
          </View>
          <Badge label={item.status} tone={planStatusTone(item.status)} />
        </Row>
        <Spacer size={4} />
        <Row justify="space-between">
          <AppText variant="caption" color="textSecondary">{t('syllabus_totalChapters')}: {item.totalChapters ?? 0}</AppText>
          <AppText variant="caption" color="textSecondary">{Math.round(pct)}%</AppText>
        </Row>
        <View style={[styles.progressBar, {backgroundColor: progressBarColor(pct) + '22'}]}>
          <View style={[styles.progressFill, {width: `${Math.min(pct, 100)}%`, backgroundColor: progressBarColor(pct)}]} />
        </View>
      </CustomCard>
    );
  }, [styles, t, navigation]);

  return (
    <Screen padded={false}>
      <CustomHeader
        title={t('syllabus_plans')}
        onBack={() => navigation.goBack()}
        actions={[{icon: 'add', onPress: () => navigation.navigate(ScreenNames.CreatePlan as any), circle: true}]}
      />
      <View style={styles.filters}>
        <View style={styles.filterRow}>
          <View style={styles.filterItem}>
            <Select label={t('syllabus_sessionYear')} value={sessionYear} options={YEARS} onChange={v => { setSessionYear(v); setPage(1); }} />
          </View>
          <View style={styles.filterItem}>
            <Select label={t('common_status')} value={status} options={STATUS_OPTIONS} onChange={v => { setStatus(v); setPage(1); }} />
          </View>
        </View>
        <View style={styles.filterRow}>
          <View style={styles.filterItem}>
            <Select label={t('class')} value={classId} options={classOptions} onChange={handleClassChange} />
          </View>
          <View style={styles.filterItem}>
            <Select label={t('syllabus_section')} value={sectionId} options={sectionOptions} onChange={v => { setSectionId(v); setPage(1); }} disabled={!classId} />
          </View>
        </View>
        <View style={styles.filterRow}>
          <View style={styles.filterItem}>
            <Select label={t('syllabus_subject')} value={subjectId} options={subjectOptions} onChange={v => { setSubjectId(v); setPage(1); }} disabled={!classId} />
          </View>
          <View style={styles.filterItem}>
            <Select label={t('teacher')} value={teacherId} options={teacherOptions} onChange={v => { setTeacherId(v); setPage(1); }} />
          </View>
        </View>
      </View>

      {isLoading ? (
        <Loader />
      ) : !data?.items?.length ? (
        <EmptyState title={t('syllabus_noPlans')} message={t('syllabus_noPlansMessage')} />
      ) : (
        <FlatList
          data={data.items}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />}
          ListFooterComponent={<Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} />}
        />
      )}
    </Screen>
  );
}
