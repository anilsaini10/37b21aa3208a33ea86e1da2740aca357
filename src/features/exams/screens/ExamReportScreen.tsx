/** Students within one exam's class — table view; grade/edit/delete each student's result. */
import React, {useEffect, useState} from 'react';
import {Pressable, RefreshControl, ScrollView, View} from 'react-native';
import {useNavigation, useRoute, type RouteProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme, useThemedStyles} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {
  Screen,
  CustomHeader,
  CustomCard,
  CustomModal,
  CustomButton,
  CustomTable,
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
import type {BadgeTone, TableColumn} from '../../../shared/components';
import {useExamClassStudents, useDeleteExamResult} from '../adminExams.service';
import type {AdminStackParamList} from '../../../navigation/types';
import {ScreenNames} from '../../../navigation/ScreenNames';
import type {ExamClassStudentRow, ExamResultStatus} from '../../../shared/types';

type Nav = NativeStackNavigationProp<AdminStackParamList>;

const SEARCH_DEBOUNCE_MS = 350;

const STATUS_TONE: Record<ExamResultStatus, BadgeTone> = {
  PENDING: 'warning',
  GRADED: 'success',
  ABSENT: 'error',
};

export function ExamReportScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<AdminStackParamList, 'ExamReport'>>();
  const {examId, classId, className, maxMarks: maxMarksParam} = route.params;

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<{resultId: string; name: string} | null>(null);
  const [deleteError, setDeleteError] = useState<string | undefined>();

  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(handle);
  }, [search]);

  const {data, isLoading, isRefetching, isError, error, refetch} = useExamClassStudents(examId, classId, {
    page,
    pageSize: 15,
    search: debouncedSearch || undefined,
  });
  const deleteMutation = useDeleteExamResult();

  const maxMarks = data?.maxMarks ?? maxMarksParam;

  const styles = useThemedStyles(t2 => ({
    searchBarWrap: {paddingHorizontal: t2.spacing.lg, paddingTop: t2.spacing.md, paddingBottom: t2.spacing.sm},
    scrollContent: {padding: t2.spacing.lg, paddingTop: t2.spacing.sm, flexGrow: 1},
    tableCard: {overflow: 'hidden'},
    modalButtonWrap: {flex: 1},
  }));

  const STATUS_LABEL: Record<ExamResultStatus, string> = {
    PENDING: t('examResult_statusPending'),
    GRADED: t('examResult_statusGraded'),
    ABSENT: t('examResult_statusAbsent'),
  };

  const gradeStudent = (row: ExamClassStudentRow): void => {
    navigation.navigate(ScreenNames.StudentMarks, {
      examId,
      classId,
      studentId: row.studentId,
      studentName: row.name,
      maxMarks,
      resultId: row.result?.id,
      initial: row.result,
    });
  };

  const onDelete = (): void => {
    if (!deleteTarget) {
      return;
    }
    setDeleteError(undefined);
    deleteMutation.mutate(
      {examId, resultId: deleteTarget.resultId},
      {
        onSuccess: () => setDeleteTarget(null),
        onError: (e: Error) => setDeleteError(e.message),
      },
    );
  };

  const columns: TableColumn<ExamClassStudentRow>[] = [
    {
      key: 'student',
      title: t('examReport_student'),
      flex: 2,
      render: row => (
        <View>
          <AppText variant="bodyBold">{row.name}</AppText>
          <AppText variant="label" color="textMuted">
            {t('examReport_rollAdmission', {rollNo: row.rollNo, admissionNo: row.admissionNo})}
          </AppText>
        </View>
      ),
    },
    {
      key: 'marks',
      title: t('examReport_marks'),
      align: 'center',
      render: row => (
        <AppText variant="caption">
          {row.result ? `${row.result.marksObtained ?? '—'}/${maxMarks}` : '—'}
        </AppText>
      ),
    },
    {
      key: 'grade',
      title: t('examReport_grade'),
      align: 'center',
      render: row => (row.result?.grade ? <Badge label={row.result.grade} tone="primary" /> : <AppText variant="caption">—</AppText>),
    },
    {
      key: 'status',
      title: t('examResult_status'),
      align: 'center',
      render: row =>
        row.result ? (
          <Badge label={STATUS_LABEL[row.result.status]} tone={STATUS_TONE[row.result.status]} />
        ) : (
          <Badge label={t('examReport_notGraded')} tone="neutral" />
        ),
    },
    {
      key: 'actions',
      title: t('common_actions'),
      align: 'center',
      render: row =>
        row.result ? (
          <Row gap={theme.spacing.md} align="center">
            <Pressable onPress={() => gradeStudent(row)} hitSlop={8}>
              <Icon name="edit" size={18} color={theme.colors.textMuted} />
            </Pressable>
            <Pressable
              onPress={() => {
                setDeleteTarget({resultId: row.result!.id, name: row.name});
                setDeleteError(undefined);
              }}
              hitSlop={8}>
              <Icon name="delete" size={18} color={theme.colors.error} />
            </Pressable>
          </Row>
        ) : (
          <CustomButton title={t('examReport_gradeButton')} size="sm" variant="outline" onPress={() => gradeStudent(row)} />
        ),
    },
  ];

  return (
    <Screen padded={false}>
      <CustomHeader
        title={t('examReport_title')}
        subtitle={className ? t('examReport_subtitle', {className, maxMarks}) : undefined}
        onBack={() => navigation.goBack()}
      />
      <View style={styles.searchBarWrap}>
        <SearchBar value={search} onChangeText={setSearch} placeholder={t('examReport_searchPlaceholder')} />
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
        <Loader message={t('examReport_loadingMarks')} />
      ) : data.items.length === 0 ? (
        <EmptyState icon="grade" title={t('examReport_noMarksYet')} message={t('examReport_noMarksMessage')} />
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => {
                setPage(1);
                refetch();
              }}
            />
          }>
          <CustomCard padded={false} style={styles.tableCard}>
            <CustomTable<ExamClassStudentRow> columns={columns} data={data.items} keyExtractor={row => row.studentId} />
          </CustomCard>
          <Spacer size={8} />
          <Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} />
        </ScrollView>
      )}

      <CustomModal visible={!!deleteTarget} onClose={() => setDeleteTarget(null)} title={t('examReport_deleteTitle')}>
        <AppText variant="body" color="textSecondary">
          {t('examReport_deleteConfirm', {name: deleteTarget?.name ?? ''})}
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
