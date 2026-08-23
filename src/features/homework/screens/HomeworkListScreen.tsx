/** My Homework (teacher) — search, class/section/subject filters, pagination, create/edit/delete. */
import React, {useEffect, useState} from 'react';
import {FlatList, Pressable, RefreshControl, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme, useThemedStyles} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {
  Screen,
  CustomHeader,
  CustomCard,
  CustomModal,
  CustomButton,
  Select,
  SearchBar,
  AppText,
  Badge,
  Icon,
  Row,
  Spacer,
  Pagination,
  EmptyState,
  Loader,
} from '../../../shared/components';
import type {BadgeTone} from '../../../shared/components';
import {formatDate} from '../../../core/utils/format';
import {useTeacherHomeworkList, useDeleteTeacherHomework} from '../teacherHomework.service';
import {useTeacherClasses} from '../../teacher/teacherClasses.service';
import {ScreenNames} from '../../../navigation/ScreenNames';
import type {TeacherStackParamList} from '../../../navigation/types';
import type {HomeworkType, TeacherHomework} from '../../../shared/types';

type Nav = NativeStackNavigationProp<TeacherStackParamList>;

const ALL_FILTER_VALUE = '';
const SEARCH_DEBOUNCE_MS = 350;

const TYPE_ICON: Record<HomeworkType, string> = {
  ASSIGNMENT: 'homework',
  PROJECT: 'inventory',
  READING: 'book',
  PRACTICE: 'edit',
  OTHER: 'event',
};

const TYPE_TONE: Record<HomeworkType, BadgeTone> = {
  ASSIGNMENT: 'primary',
  PROJECT: 'info',
  READING: 'success',
  PRACTICE: 'warning',
  OTHER: 'neutral',
};

function daysUntil(dueDate: string): number {
  const today = new Date().toISOString().slice(0, 10);
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((new Date(dueDate).getTime() - new Date(today).getTime()) / msPerDay);
}

export function HomeworkListScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const navigation = useNavigation<Nav>();

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [classId, setClassId] = useState(ALL_FILTER_VALUE);
  const [sectionId, setSectionId] = useState(ALL_FILTER_VALUE);
  const [subjectId, setSubjectId] = useState(ALL_FILTER_VALUE);
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<TeacherHomework | null>(null);
  const [deleteError, setDeleteError] = useState<string | undefined>();

  const {data: myClasses} = useTeacherClasses();

  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(handle);
  }, [search]);

  const {data, isLoading, isRefetching, isError, error, refetch} = useTeacherHomeworkList({
    page,
    pageSize: 15,
    search: debouncedSearch || undefined,
    classId: classId || undefined,
    sectionId: sectionId || undefined,
    subjectId: subjectId || undefined,
  });
  const deleteMutation = useDeleteTeacherHomework();

  const styles = useThemedStyles(t2 => ({
    searchBarWrap: {paddingHorizontal: t2.spacing.lg, paddingTop: t2.spacing.md, paddingBottom: t2.spacing.sm},
    filtersRow: {paddingHorizontal: t2.spacing.lg, columnGap: t2.spacing.sm},
    filterWrap: {flex: 1, marginBottom: 0},
    filterField: {height: 42},
    filterValueText: {fontSize: t2.typography.fontSize.sm},
    list: {flex: 1},
    listContent: {padding: t2.spacing.lg, paddingTop: t2.spacing.sm, flexGrow: 1},
    card: {marginBottom: t2.spacing.md},
    modalButtonWrap: {flex: 1},
  }));

  const selectedClass = (myClasses ?? []).find(c => c.classId === classId);
  const classOptions = [
    {label: t('homeworkList_allClasses'), value: ALL_FILTER_VALUE},
    ...(myClasses ?? []).map(c => ({label: c.className, value: c.classId})),
  ];
  const sectionOptions = [
    {label: t('homeworkList_allSections'), value: ALL_FILTER_VALUE},
    ...(selectedClass?.sections ?? []).map(s => ({label: s.sectionName, value: s.sectionId})),
  ];
  const subjectOptions = [
    {label: t('homeworkList_allSubjects'), value: ALL_FILTER_VALUE},
    ...(selectedClass?.mySubjects ?? []).map(s => ({label: s.subjectName, value: s.subjectId})),
  ];

  const onChangeClass = (val: string): void => {
    setClassId(val);
    setSectionId(ALL_FILTER_VALUE);
    setSubjectId(ALL_FILTER_VALUE);
    setPage(1);
  };

  const dueDateInfo = (dueDate: string): {label: string; tone: 'error' | 'warning' | 'textMuted'} => {
    const diff = daysUntil(dueDate);
    if (diff < 0) {
      return {label: formatDate(dueDate) + ' (' + t('homeworkList_overdue') + ')', tone: 'error'};
    }
    if (diff === 0) {
      return {label: t('homeworkList_dueToday'), tone: 'warning'};
    }
    if (diff === 1) {
      return {label: t('homeworkList_dueTomorrow'), tone: 'warning'};
    }
    return {label: formatDate(dueDate), tone: 'textMuted'};
  };

  const onDelete = (): void => {
    if (!deleteTarget) {
      return;
    }
    setDeleteError(undefined);
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
      onError: (e: Error & {code?: string}) => {
        setDeleteError(e.code === 'NOT_HOMEWORK_OWNER' ? t('homeworkList_notOwnerError') : e.message);
      },
    });
  };

  return (
    <Screen padded={false}>
      <CustomHeader
        title={t('homeworkList_myHomeworkTitle')}
        actions={[{icon: 'add', onPress: () => navigation.navigate(ScreenNames.HomeworkForm, {})}]}
      />
      <View style={styles.searchBarWrap}>
        <SearchBar value={search} onChangeText={setSearch} placeholder={t('homeworkList_searchPlaceholder')} />
      </View>
      <Row gap={theme.spacing.sm} align="flex-start" style={styles.filtersRow}>
        <View style={styles.filterWrap}>
          <Select
            label={t('homeworkList_filterByClass')}
            value={classId}
            options={classOptions}
            onChange={onChangeClass}
            style={styles.filterField}
            valueStyle={styles.filterValueText}
          />
        </View>
        <View style={styles.filterWrap}>
          <Select
            label={t('homeworkList_filterBySection')}
            value={sectionId}
            options={sectionOptions}
            onChange={val => {
              setSectionId(val);
              setPage(1);
            }}
            style={styles.filterField}
            valueStyle={styles.filterValueText}
          />
        </View>
        <View style={styles.filterWrap}>
          <Select
            label={t('homeworkList_filterBySubject')}
            value={subjectId}
            options={subjectOptions}
            onChange={val => {
              setSubjectId(val);
              setPage(1);
            }}
            style={styles.filterField}
            valueStyle={styles.filterValueText}
          />
        </View>
      </Row>

      {isError ? (
        <EmptyState
          icon="warning"
          title={t('common_somethingWentWrong')}
          message={(error as {message?: string} | null)?.message ?? t('common_checkConnection')}
          actionLabel={t('common_retry')}
          onAction={() => refetch()}
        />
      ) : isLoading || !data ? (
        <Loader message={t('homeworkList_loadingHomework')} />
      ) : (
        <FlatList
          style={styles.list}
          data={data.items}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => {
                setPage(1);
                refetch();
              }}
            />
          }
          renderItem={({item}) => {
            const due = dueDateInfo(item.dueDate);
            const typeTone = TYPE_TONE[item.type];
            const typeColor = theme.colors[typeTone === 'neutral' ? 'textMuted' : typeTone];
            return (
              <CustomCard
                style={styles.card}
                onPress={() => navigation.navigate(ScreenNames.HomeworkDetail, {homeworkId: item.id, initial: item})}>
                <Row justify="space-between" align="flex-start">
                  <Row gap={theme.spacing.sm} align="center" style={{flex: 1}}>
                    <Icon name={TYPE_ICON[item.type]} size={18} color={typeColor} />
                    <AppText variant="bodyBold" style={{flex: 1}} numberOfLines={1}>
                      {item.title}
                    </AppText>
                  </Row>
                  <Row gap={theme.spacing.md} align="center">
                    <Pressable
                      onPress={() => navigation.navigate(ScreenNames.HomeworkForm, {homeworkId: item.id, initial: item})}
                      hitSlop={8}>
                      <Icon name="edit" size={18} color={theme.colors.textMuted} />
                    </Pressable>
                    <Pressable
                      onPress={() => {
                        setDeleteTarget(item);
                        setDeleteError(undefined);
                      }}
                      hitSlop={8}>
                      <Icon name="delete" size={18} color={theme.colors.error} />
                    </Pressable>
                  </Row>
                </Row>
                <Spacer size={theme.spacing.sm} />
                <Row gap={theme.spacing.xs} wrap>
                  <Badge label={item.className + (item.sectionName ? ` - ${item.sectionName}` : '')} tone="neutral" />
                  <Badge label={item.subjectName} tone="primary" />
                </Row>
                <Spacer size={theme.spacing.xs} />
                <AppText variant="caption" style={{color: theme.colors[due.tone]}}>
                  {t('homeworkList_dueLabel', {due: due.label})}
                </AppText>
              </CustomCard>
            );
          }}
          ListEmptyComponent={
            <EmptyState
              icon="homework"
              title={t('homeworkList_noHomeworkYet')}
              message={t('homeworkList_noHomeworkMessage')}
              actionLabel={t('homeworkList_createHomeworkAction')}
              onAction={() => navigation.navigate(ScreenNames.HomeworkForm, {})}
            />
          }
          ListFooterComponent={
            data.items.length > 0 ? (
              <>
                <Spacer size={8} />
                <Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} />
              </>
            ) : null
          }
        />
      )}

      <CustomModal
        visible={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title={t('homeworkList_deleteTitle')}>
        <AppText variant="body" color="textSecondary">
          {t('homeworkList_deleteConfirm', {title: deleteTarget?.title ?? ''})}
        </AppText>
        {deleteError ? (
          <AppText variant="caption" color="error" style={{marginTop: theme.spacing.sm}}>
            {deleteError}
          </AppText>
        ) : null}
        <Spacer size={16} />
        <Row gap={theme.spacing.md}>
          <View style={styles.modalButtonWrap}>
            <CustomButton title={t('common_cancel')} variant="outline" onPress={() => setDeleteTarget(null)} />
          </View>
          <View style={styles.modalButtonWrap}>
            <CustomButton
              title={t('common_delete')}
              variant="danger"
              loading={deleteMutation.isPending}
              onPress={onDelete}
            />
          </View>
        </Row>
      </CustomModal>
    </Screen>
  );
}
