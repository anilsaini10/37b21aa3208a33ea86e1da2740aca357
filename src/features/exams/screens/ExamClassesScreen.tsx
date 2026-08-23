/** Classes assigned to an exam — grading progress per class; tap a class to see its students. */
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
  CustomModal,
  CustomButton,
  CustomInput,
  Select,
  SearchBar,
  AppText,
  Icon,
  Row,
  Spacer,
  Loader,
  EmptyState,
} from '../../../shared/components';
import {useExamClasses, useAddExamClass, useRemoveExamClass} from '../adminExams.service';
import {useClasses} from '../../classes/classes.service';
import type {AdminStackParamList} from '../../../navigation/types';
import {ScreenNames} from '../../../navigation/ScreenNames';
import type {ExamClassProgress} from '../../../shared/types';

type Nav = NativeStackNavigationProp<AdminStackParamList>;

function ProgressBar({fraction}: {fraction: number}): React.JSX.Element {
  const {theme} = useTheme();
  const pct = Math.max(0, Math.min(1, fraction));
  return (
    <View style={{height: 6, borderRadius: 3, backgroundColor: theme.colors.surfaceVariant, overflow: 'hidden'}}>
      <View style={{height: '100%', width: `${pct * 100}%`, backgroundColor: theme.colors.primary, borderRadius: 3}} />
    </View>
  );
}

export function ExamClassesScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<AdminStackParamList, 'ExamClasses'>>();
  const {examId, examName} = route.params;
  const {data, isLoading, isError, error, refetch} = useExamClasses(examId);
  const {data: allClasses} = useClasses();
  const addClassMutation = useAddExamClass();
  const removeClassMutation = useRemoveExamClass();

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addClassId, setAddClassId] = useState('');
  const [addMaxMarks, setAddMaxMarks] = useState('100');
  const [addError, setAddError] = useState<string | undefined>();

  const [removeTarget, setRemoveTarget] = useState<ExamClassProgress | null>(null);
  const [removeError, setRemoveError] = useState<string | undefined>();
  const [search, setSearch] = useState('');

  const styles = useThemedStyles(t2 => ({
    searchSection: {paddingHorizontal: t2.spacing.lg, paddingTop: t2.spacing.lg},
    scrollContent: {padding: t2.spacing.lg, flexGrow: 1},
    card: {marginBottom: t2.spacing.md},
    modalButtonWrap: {flex: 1},
  }));

  const filteredData = (data ?? []).filter(cls =>
    cls.className.toLowerCase().includes(search.trim().toLowerCase()),
  );

  const assignedClassIds = new Set((data ?? []).map(c => c.classId));
  const availableClassOptions = (allClasses ?? [])
    .filter(c => !assignedClassIds.has(c.id))
    .map(c => ({label: c.name, value: c.id}));

  const openAddModal = (): void => {
    setAddClassId('');
    setAddMaxMarks('100');
    setAddError(undefined);
    setAddModalOpen(true);
  };

  const submitAddClass = (): void => {
    const maxMarks = Number(addMaxMarks);
    if (!addClassId || !maxMarks || maxMarks <= 0) {
      setAddError(t('examClasses_fillRequiredFields'));
      return;
    }
    addClassMutation.mutate(
      {examId, input: {classId: addClassId, maxMarks}},
      {
        onSuccess: () => setAddModalOpen(false),
        onError: (e: Error & {code?: string}) => {
          setAddError(e.code === 'EXAM_CLASS_ALREADY_ASSIGNED' ? t('examClasses_alreadyAssigned') : e.message);
        },
      },
    );
  };

  const confirmRemoveClass = (): void => {
    if (!removeTarget) {
      return;
    }
    setRemoveError(undefined);
    removeClassMutation.mutate(
      {examId, classId: removeTarget.classId},
      {
        onSuccess: () => setRemoveTarget(null),
        onError: (e: Error & {code?: string}) => {
          setRemoveError(e.code === 'EXAM_CLASS_HAS_RESULTS' ? t('examClasses_hasResultsError') : e.message);
        },
      },
    );
  };

  return (
    <Screen padded={false}>
      <CustomHeader
        title={examName ?? t('examClasses_title')}
        onBack={() => navigation.goBack()}
        actions={[{icon: 'add', onPress: openAddModal}]}
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
        <Loader message={t('examClasses_loading')} />
      ) : data.length === 0 ? (
        <EmptyState
          icon="class"
          title={t('examClasses_noClasses')}
          message={t('examClasses_noClassesMessage')}
          actionLabel={t('examClasses_addClass')}
          onAction={openAddModal}
        />
      ) : (
        <>
          <View style={styles.searchSection}>
            <SearchBar value={search} onChangeText={setSearch} placeholder={t('examClasses_searchPlaceholder')} />
          </View>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {filteredData.length === 0 ? (
              <EmptyState
                icon="search"
                title={t('studentsWiseClassList_noResultsTitle')}
                message={t('studentsWiseClassList_noResultsMessage')}
              />
            ) : (
              filteredData.map(cls => (
            <CustomCard
              key={cls.classId}
              style={styles.card}
              onPress={() =>
                navigation.navigate(ScreenNames.ExamReport, {
                  examId,
                  classId: cls.classId,
                  className: cls.className,
                  maxMarks: cls.maxMarks,
                })
              }>
              <Row justify="space-between" align="center">
                <AppText variant="bodyBold">{cls.className}</AppText>
                <Pressable
                  onPress={() => {
                    setRemoveTarget(cls);
                    setRemoveError(undefined);
                  }}
                  hitSlop={8}>
                  <Icon name="delete" size={18} color={theme.colors.error} />
                </Pressable>
              </Row>
              <Spacer size={theme.spacing.sm} />
              <ProgressBar fraction={cls.studentCount > 0 ? cls.gradedCount / cls.studentCount : 0} />
              <Spacer size={theme.spacing.xs} />
              <AppText variant="caption" color="textSecondary">
                {t('examClasses_gradedCount', {graded: cls.gradedCount, total: cls.studentCount})}
              </AppText>
            </CustomCard>
              ))
            )}
          </ScrollView>
        </>
      )}

      <CustomModal visible={addModalOpen} onClose={() => setAddModalOpen(false)} title={t('examClasses_addClass')}>
        <Select
          label={t('studentForm_classLabel')}
          value={addClassId}
          options={availableClassOptions}
          onChange={setAddClassId}
          required
        />
        <CustomInput
          label={t('examForm_maxMarksPlaceholder')}
          keyboardType="numeric"
          value={addMaxMarks}
          onChangeText={setAddMaxMarks}
          required
        />
        {addError ? (
          <AppText variant="caption" color="error" style={{marginBottom: theme.spacing.sm}}>
            {addError}
          </AppText>
        ) : null}
        <CustomButton title={t('common_add')} onPress={submitAddClass} loading={addClassMutation.isPending} />
      </CustomModal>

      <CustomModal visible={!!removeTarget} onClose={() => setRemoveTarget(null)} title={t('examClasses_removeClass')}>
        <AppText variant="body" color="textSecondary">
          {t('examClasses_removeClassConfirm', {className: removeTarget?.className ?? ''})}
        </AppText>
        {removeError ? (
          <AppText variant="caption" color="error" style={{marginTop: theme.spacing.sm}}>
            {removeError}
          </AppText>
        ) : null}
        <Spacer size={16} />
        <Row gap={theme.spacing.md}>
          <View style={styles.modalButtonWrap}>
            <CustomButton title={t('common_cancel')} variant="outline" onPress={() => setRemoveTarget(null)} />
          </View>
          <View style={styles.modalButtonWrap}>
            <CustomButton
              title={t('common_delete')}
              variant="danger"
              loading={removeClassMutation.isPending}
              onPress={confirmRemoveClass}
            />
          </View>
        </Row>
      </CustomModal>
    </Screen>
  );
}
