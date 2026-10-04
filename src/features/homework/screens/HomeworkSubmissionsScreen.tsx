/**
 * Homework submission tracking — mark which students (already sorted by
 * rollNo server-side) submitted a given homework. Status toggles (single row
 * or "mark all visible") are staged locally and instant — no interruption per
 * tap. Only pressing "Save" opens a confirmation modal (with one optional
 * remark applied to the whole batch); confirming there fires the single
 * batched PATCH call (matches the API's design — records accepts one or many
 * at once). The PATCH response only returns a count, so a successful save
 * just refetches the list (via query invalidation) rather than hand-merging.
 */
import React, {useState} from 'react';
import {Pressable, ScrollView, View} from 'react-native';
import {useNavigation, useRoute, type RouteProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme, useThemedStyles} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {
  Screen,
  CustomHeader,
  CustomCard,
  CustomButton,
  CustomModal,
  CustomInput,
  SearchBar,
  Select,
  AppText,
  Row,
  Spacer,
  Divider,
  Loader,
  EmptyState,
} from '../../../shared/components';
import {formatDate} from '../../../core/utils/format';
import {useHomeworkSubmissions, useMarkHomeworkSubmissions} from '../teacherHomework.service';
import {ScreenNames} from '../../../navigation/ScreenNames';
import type {TeacherStackParamList} from '../../../navigation/types';
import type {HomeworkSubmissionRecordInput, HomeworkSubmissionStatus, HomeworkSubmissionStudent} from '../../../shared/types';

type Nav = NativeStackNavigationProp<TeacherStackParamList>;
type StatusFilter = 'ALL' | HomeworkSubmissionStatus | 'UNCHECKED';

const ALL_STATUS_VALUE = 'ALL';

export function HomeworkSubmissionsScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<TeacherStackParamList, 'HomeworkSubmissions'>>();
  const {homeworkId} = route.params;

  const {data, isLoading, isError, error, refetch} = useHomeworkSubmissions(homeworkId);
  const markMutation = useMarkHomeworkSubmissions(homeworkId);

  const [pendingStatus, setPendingStatus] = useState<Record<string, HomeworkSubmissionStatus>>({});
  const [saveError, setSaveError] = useState<string | undefined>();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(ALL_STATUS_VALUE);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [saveRemark, setSaveRemark] = useState('');
  const [bulkAction, setBulkAction] = useState('');

  const styles = useThemedStyles(t2 => ({
    filterSection: {
      flexDirection: 'row',
      columnGap: t2.spacing.sm,
      paddingHorizontal: t2.spacing.lg,
      paddingTop: t2.spacing.md,
    },
    searchItem: {flex: 7},
    filterItem: {flex: 3},
    bulkRow: {
      paddingHorizontal: t2.spacing.lg,
      paddingTop: t2.spacing.md,
      alignItems: 'center',
    },
    bulkTitle: {paddingRight: t2.spacing.sm},
    bulkDropdown: {width: 130},
    filterField: {height: 36},
    filterValueText: {fontSize: t2.typography.fontSize.sm},
    filterLabelBold: {fontWeight: t2.typography.fontWeight.bold},
    content: {padding: t2.spacing.lg, flexGrow: 1},
    row: {paddingVertical: t2.spacing.sm},
    nameBlock: {flex: 1},
    pill: {
      paddingHorizontal: t2.spacing.md,
      paddingVertical: t2.spacing.xs,
      borderRadius: t2.radius.pill,
    },
    footer: {
      padding: t2.spacing.lg,
      borderTopWidth: 1,
      borderTopColor: t2.colors.divider,
    },
    modalButtonWrap: {flex: 1},
  }));

  if (isError) {
    return (
      <Screen padded={false}>
        <CustomHeader title={t('homeworkSubmissions_title')} onBack={() => navigation.goBack()} />
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

  if (isLoading || !data) {
    return <Loader message={t('homeworkSubmissions_loading')} />;
  }

  const statusOptions = [
    {label: t('common_all'), value: ALL_STATUS_VALUE},
    {label: t('homeworkSubmissions_submitted'), value: 'SUBMITTED'},
    {label: t('homeworkSubmissions_notSubmitted'), value: 'NOT_SUBMITTED'},
    {label: t('homeworkSubmissions_unchecked'), value: 'UNCHECKED'},
  ];

  const bulkOptions = [
    {label: t('common_select'), value: ''},
    {label: t('homeworkSubmissions_markAllSubmitted'), value: 'SUBMITTED'},
    {label: t('homeworkSubmissions_markAllNotSubmitted'), value: 'NOT_SUBMITTED'},
  ];

  const query = search.trim().toLowerCase();
  const filteredStudents = data.students.filter(student => {
    const effectiveStatus = pendingStatus[student.studentId] ?? student.status;
    const matchesSearch = !query || student.name.toLowerCase().includes(query);
    const matchesStatus =
      statusFilter === ALL_STATUS_VALUE ||
      (statusFilter === 'UNCHECKED' ? effectiveStatus === null : effectiveStatus === statusFilter);
    return matchesSearch && matchesStatus;
  });

  /**
   * Tapping the already-active pill deselects it — reverts to whatever the server currently
   * has for that student (which may itself be null/"unchecked"), rather than force-setting a
   * status; the mark API has no way to explicitly save back to null, so "deselect" only ever
   * undoes a local, not-yet-saved staging change.
   */
  const toggleStatus = (studentId: string, currentEffective: HomeworkSubmissionStatus | null, status: HomeworkSubmissionStatus): void => {
    setSaveError(undefined);
    setPendingStatus(prev => {
      if (currentEffective === status) {
        const next = {...prev};
        delete next[studentId];
        return next;
      }
      return {...prev, [studentId]: status};
    });
  };

  /** Stages the same status for every currently visible (search/status-filtered) student — instant, local only. */
  const markAllVisible = (status: HomeworkSubmissionStatus): void => {
    setSaveError(undefined);
    setPendingStatus(prev => {
      const next = {...prev};
      filteredStudents.forEach(student => {
        next[student.studentId] = status;
      });
      return next;
    });
  };

  /** The dropdown is a one-shot action trigger, not a persistent filter — it resets to "Select" right after firing. */
  const onBulkActionChange = (value: string): void => {
    if (value === 'SUBMITTED' || value === 'NOT_SUBMITTED') {
      markAllVisible(value);
    }
    setBulkAction('');
  };

  const changedCount = Object.keys(pendingStatus).length;

  const openSaveModal = (): void => {
    if (changedCount === 0) {
      return;
    }
    setSaveRemark('');
    setSaveModalOpen(true);
  };

  const confirmSave = (): void => {
    const remark = saveRemark.trim();
    const records: HomeworkSubmissionRecordInput[] = Object.entries(pendingStatus).map(([studentId, status]) =>
      remark ? {studentId, status, remarks: remark} : {studentId, status},
    );
    setSaveError(undefined);
    markMutation.mutate(records, {
      onSuccess: () => {
        setPendingStatus({});
        setSaveModalOpen(false);
      },
      onError: (e: Error) => setSaveError(e.message),
    });
  };

  const renderRow = (student: HomeworkSubmissionStudent, index: number): React.JSX.Element => {
    const effectiveStatus = pendingStatus[student.studentId] ?? student.status;
    const submittedActive = effectiveStatus === 'SUBMITTED';
    const notSubmittedActive = effectiveStatus === 'NOT_SUBMITTED';
    return (
      <View key={student.studentId}>
        {index > 0 ? <Divider /> : null}
        <View style={styles.row}>
          <Row justify="space-between" align="center">
            <View style={styles.nameBlock}>
              <AppText variant="bodyBold" numberOfLines={1}>
                {student.name}
              </AppText>
              <AppText variant="caption" color="textSecondary">
                {t('homeworkSubmissions_rollNo', {roll: student.rollNo})}
              </AppText>
            </View>
            <Row gap={theme.spacing.xs}>
              <Pressable
                onPress={() => toggleStatus(student.studentId, effectiveStatus, 'SUBMITTED')}
                style={[
                  styles.pill,
                  {
                    backgroundColor: submittedActive ? theme.colors.success : theme.colors.success + '18',
                    borderWidth: submittedActive ? 0 : 1,
                    borderColor: theme.colors.success + '55',
                  },
                ]}>
                <AppText variant="label" style={{color: submittedActive ? theme.colors.onPrimary : theme.colors.success}}>
                  {t('homeworkSubmissions_submitted')}
                </AppText>
              </Pressable>
              <Pressable
                onPress={() => toggleStatus(student.studentId, effectiveStatus, 'NOT_SUBMITTED')}
                style={[
                  styles.pill,
                  {
                    backgroundColor: notSubmittedActive ? theme.colors.error : theme.colors.error + '18',
                    borderWidth: notSubmittedActive ? 0 : 1,
                    borderColor: theme.colors.error + '55',
                  },
                ]}>
                <AppText variant="label" style={{color: notSubmittedActive ? theme.colors.onPrimary : theme.colors.error}}>
                  {t('homeworkSubmissions_notSubmitted')}
                </AppText>
              </Pressable>
            </Row>
          </Row>
        </View>
      </View>
    );
  };

  return (
    <Screen padded={false}>
      <CustomHeader
        title={data.title}
        subtitle={`${data.sectionName} · ${formatDate(data.dueDate)}`}
        onBack={() => navigation.goBack()}
        actions={[{icon: 'edit', onPress: () => navigation.navigate(ScreenNames.HomeworkDetail, {homeworkId})}]}
      />
      {data.students.length === 0 ? (
        <EmptyState
          icon="students"
          title={t('homeworkSubmissions_emptyTitle')}
          message={t('homeworkSubmissions_emptyMessage')}
        />
      ) : (
        <>
          <Row style={styles.filterSection}>
            <View style={styles.searchItem}>
              <SearchBar value={search} onChangeText={setSearch} placeholder={t('homeworkSubmissions_searchPlaceholder')} />
            </View>
            <View style={styles.filterItem}>
              <Select
                label={t('homeworkSubmissions_filterByStatus')}
                value={statusFilter}
                options={statusOptions}
                onChange={val => setStatusFilter(val as StatusFilter)}
                style={styles.filterField}
                valueStyle={styles.filterValueText}
                labelStyle={styles.filterLabelBold}
              />
            </View>
          </Row>
          {filteredStudents.length > 0 ? (
            <Row align="center" style={styles.bulkRow}>
              <AppText variant="bodyBold" style={styles.bulkTitle} numberOfLines={1}>
                {t('homeworkSubmissions_bulkLabel', {count: filteredStudents.length})}:
              </AppText>
              <View style={styles.bulkDropdown}>
                <Select
                  value={bulkAction}
                  options={bulkOptions}
                  onChange={onBulkActionChange}
                  style={styles.filterField}
                  valueStyle={styles.filterValueText}
                />
              </View>
            </Row>
          ) : null}
          {filteredStudents.length === 0 ? (
            <EmptyState
              icon="search"
              title={t('studentsWiseClassList_noResultsTitle')}
              message={t('studentsWiseClassList_noResultsMessage')}
            />
          ) : (
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
              <CustomCard padded={false} style={{paddingHorizontal: theme.spacing.lg}}>
                {filteredStudents.map(renderRow)}
              </CustomCard>
              <Spacer size={80} />
            </ScrollView>
          )}
          <View style={styles.footer}>
            {saveError ? (
              <AppText variant="caption" color="error" style={{marginBottom: theme.spacing.sm}}>
                {saveError}
              </AppText>
            ) : null}
            <CustomButton
              title={changedCount > 0 ? t('homeworkSubmissions_saveCount', {count: changedCount}) : t('homeworkSubmissions_save')}
              onPress={openSaveModal}
              loading={markMutation.isPending}
              disabled={changedCount === 0}
            />
          </View>
        </>
      )}

      <CustomModal visible={saveModalOpen} onClose={() => setSaveModalOpen(false)} title={t('homeworkSubmissions_confirmSaveTitle')}>
        <AppText variant="body" color="textSecondary">
          {t('homeworkSubmissions_confirmSaveMessage', {count: changedCount})}
        </AppText>
        <Spacer size={theme.spacing.md} />
        <CustomInput
          label={t('homeworkSubmissions_remarkLabel')}
          placeholder={t('homeworkSubmissions_remarksPlaceholder')}
          value={saveRemark}
          onChangeText={setSaveRemark}
          maxLength={500}
          containerStyle={{marginBottom: 0}}
        />
        {saveError ? (
          <AppText variant="caption" color="error" style={{marginTop: theme.spacing.sm}}>
            {saveError}
          </AppText>
        ) : null}
        <Spacer size={16} />
        <Row gap={theme.spacing.md}>
          <View style={styles.modalButtonWrap}>
            <CustomButton title={t('common_cancel')} variant="outline" onPress={() => setSaveModalOpen(false)} />
          </View>
          <View style={styles.modalButtonWrap}>
            <CustomButton title={t('common_confirm')} loading={markMutation.isPending} onPress={confirmSave} />
          </View>
        </Row>
      </CustomModal>
    </Screen>
  );
}
