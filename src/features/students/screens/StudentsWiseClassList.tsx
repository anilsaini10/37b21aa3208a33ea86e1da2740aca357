/** Students-wise class list — searchable/filterable, every class as a compact accent-colored card with its sections shown next to the name. */
import React, {useMemo, useState} from 'react';
import {Pressable, ScrollView, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme, useThemedStyles} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {
  Screen,
  CustomHeader,
  ClassCard,
  classCardAccent,
  SearchBar,
  Select,
  AppText,
  Row,
  Spacer,
  EmptyState,
  Loader,
} from '../../../shared/components';
import {useClasses} from '../../classes/classes.service';
import type {AdminStackParamList} from '../../../navigation/types';
import {ScreenNames} from '../../../navigation/ScreenNames';
import type {SchoolClass, Status} from '../../../shared/types';

type Nav = NativeStackNavigationProp<AdminStackParamList>;
type StatusFilter = Extract<Status, 'active' | 'inactive'> | 'all';

const ALL_SECTIONS_VALUE = '';

export function StudentsWiseClassListScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const styles = useThemedStyles(t2 => ({
    scrollContent: {
      padding: t2.spacing.lg,
      paddingTop: t2.spacing.sm,
      flexGrow: 1,
    },
    searchItem: {flex: 7},
    filterItem: {flex: 3},
    statusRow: {paddingTop: t2.spacing.sm},
    pill: {
      paddingHorizontal: t2.spacing.md,
      paddingVertical: t2.spacing.xs,
      borderRadius: t2.radius.pill,
    },
  }));
  const {t} = useLanguage();
  const navigation = useNavigation<Nav>();
  const {data: classes, isLoading, isError, error, refetch} = useClasses();

  const [search, setSearch] = useState('');
  const [sectionFilter, setSectionFilter] = useState(ALL_SECTIONS_VALUE);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const STATUS_FILTERS: {label: string; value: StatusFilter}[] = [
    {label: t('common_all'), value: 'all'},
    {label: t('teacherEdit_active'), value: 'active'},
    {label: t('teacherEdit_inactive'), value: 'inactive'},
  ];

  const sectionOptions = useMemo(() => {
    const names = Array.from(new Set((classes ?? []).flatMap(c => c.sections.map(s => s.name)))).sort();
    return [
      {label: t('studentsWiseClassList_allSections'), value: ALL_SECTIONS_VALUE},
      ...names.map(name => ({label: name, value: name})),
    ];
  }, [classes, t]);

  const filteredClasses = useMemo(() => {
    if (!classes) {
      return [];
    }
    const query = search.trim().toLowerCase();
    return classes.filter(cls => {
      const matchesSearch = !query || cls.name.toLowerCase().includes(query);
      const matchesSection = !sectionFilter || cls.sections.some(s => s.name === sectionFilter);
      return matchesSearch && matchesSection;
    });
  }, [classes, search, sectionFilter]);

  const openClass = (cls: SchoolClass): void => {
    navigation.navigate(ScreenNames.StudentsList, {
      classId: cls.id,
      className: cls.name,
      statusFilter: statusFilter === 'all' ? undefined : statusFilter,
      sections: cls.sections.map(s => ({id: s.id, name: s.name, studentCount: s.studentCount})),
    });
  };

  if (isError) {
    return (
      <Screen padded={false}>
        <CustomHeader title={t('studentsWiseClassList_headerTitle')} subtitle={t('studentsWiseClassList_subtitle')} />
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

  if (isLoading || !classes) {
    return <Loader message={t('classesManage_loading')} />;
  }

  return (
    <Screen padded={false}>
      <CustomHeader title={t('studentsWiseClassList_headerTitle')} subtitle={t('studentsWiseClassList_subtitle')} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <AppText variant="caption" color="textSecondary">
          {t('studentsWiseClassList_totalClassesLabel')}:{' '}
          <AppText variant="caption" color="text" style={{fontWeight: theme.typography.fontWeight.bold}}>
            {classes.length}
          </AppText>
        </AppText>
        <Spacer size={theme.spacing.sm} />
        <Row gap={theme.spacing.sm}>
          <View style={styles.searchItem}>
            <SearchBar value={search} onChangeText={setSearch} placeholder={t('studentsWiseClassList_searchPlaceholder')} />
          </View>
          <View style={styles.filterItem}>
            <Select
              label={t('studentsWiseClassList_filterBySection')}
              value={sectionFilter}
              options={sectionOptions}
              onChange={setSectionFilter}
            />
          </View>
        </Row>
        <Row gap={theme.spacing.xs} style={styles.statusRow}>
          {STATUS_FILTERS.map(f => (
            <Pressable
              key={f.value}
              onPress={() => setStatusFilter(f.value)}
              style={[styles.pill, {backgroundColor: statusFilter === f.value ? theme.colors.primary : theme.colors.surfaceVariant}]}>
              <AppText variant="label" style={{color: statusFilter === f.value ? theme.colors.onPrimary : theme.colors.textSecondary}}>
                {f.label}
              </AppText>
            </Pressable>
          ))}
        </Row>

        {filteredClasses.length === 0 ? (
          classes.length === 0 ? (
            <EmptyState icon="class" title={t('classList_emptyTitle')} message={t('classList_emptyMessage')} />
          ) : (
            <EmptyState
              icon="search"
              title={t('studentsWiseClassList_noResultsTitle')}
              message={t('studentsWiseClassList_noResultsMessage')}
            />
          )
        ) : (
          filteredClasses.map((cls, index) => (
            <ClassCard
              key={cls.id}
              compact
              name={cls.name}
              titleSuffix={cls.sections.length > 0 ? `(${cls.sections.map(s => s.name).join(', ')})` : undefined}
              subtitle={t('classList_studentCount', {count: cls.totalStudents})}
              accent={classCardAccent(index)}
              onPress={() => openClass(cls)}
            />
          ))
        )}
      </ScrollView>
    </Screen>
  );
}
