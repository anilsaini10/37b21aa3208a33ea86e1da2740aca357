/**
 * Create/Edit homework (teacher).
 *
 * Create shows a class → section → subject cascading picker, scoped to this
 * teacher's own classes/subjects; edit only touches title/description/type/dueDate —
 * classId/sectionId/subjectId can't be changed afterwards (backend requires delete + recreate).
 */
import React, {useEffect, useState} from 'react';
import {ScrollView} from 'react-native';
import {useNavigation, useRoute, type RouteProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {
  Screen,
  CustomHeader,
  CustomInput,
  Select,
  DatePicker,
  CustomButton,
  AppText,
  Spacer,
  Loader,
  EmptyState,
} from '../../../shared/components';
import {
  useTeacherHomeworkItem,
  useCreateTeacherHomework,
  useUpdateTeacherHomework,
  type CreateHomeworkInput,
  type UpdateHomeworkInput,
} from '../teacherHomework.service';
import {useTeacherClasses} from '../../teacher/teacherClasses.service';
import type {TeacherStackParamList} from '../../../navigation/types';
import type {HomeworkType} from '../../../shared/types';

type Nav = NativeStackNavigationProp<TeacherStackParamList>;

const TYPES: HomeworkType[] = ['ASSIGNMENT', 'PROJECT', 'READING', 'PRACTICE', 'OTHER'];

export function HomeworkFormScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<TeacherStackParamList, 'HomeworkForm'>>();
  const {homeworkId, initial} = route.params ?? {};

  const {data: homework, isLoading, isError, error, refetch} = useTeacherHomeworkItem(homeworkId ?? '', initial);
  const {data: myClasses} = useTeacherClasses();
  const createMutation = useCreateTeacherHomework();
  const updateMutation = useUpdateTeacherHomework();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<HomeworkType>('ASSIGNMENT');
  const [dueDate, setDueDate] = useState('');
  const [classId, setClassId] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [subjectId, setSubjectId] = useState('');

  const [titleError, setTitleError] = useState<string | undefined>();
  const [classError, setClassError] = useState<string | undefined>();
  const [sectionError, setSectionError] = useState<string | undefined>();
  const [subjectError, setSubjectError] = useState<string | undefined>();
  const [dueDateError, setDueDateError] = useState<string | undefined>();
  const [submitError, setSubmitError] = useState<string | undefined>();

  useEffect(() => {
    if (homework) {
      setTitle(homework.title);
      setDescription(homework.description ?? '');
      setType(homework.type);
      setDueDate(homework.dueDate.slice(0, 10));
    }
  }, [homework]);

  const TYPE_LABEL: Record<HomeworkType, string> = {
    ASSIGNMENT: t('homeworkForm_typeAssignment'),
    PROJECT: t('homeworkForm_typeProject'),
    READING: t('homeworkForm_typeReading'),
    PRACTICE: t('homeworkForm_typePractice'),
    OTHER: t('homeworkForm_typeOther'),
  };

  const selectedClass = (myClasses ?? []).find(c => c.classId === classId);
  const classOptions = (myClasses ?? []).map(c => ({label: c.className, value: c.classId}));
  const sectionOptions = (selectedClass?.sections ?? []).map(s => ({label: s.sectionName, value: s.sectionId}));
  const subjectOptions = (selectedClass?.mySubjects ?? []).map(s => ({label: s.subjectName, value: s.subjectId}));

  const onChangeClass = (val: string): void => {
    setClassId(val);
    setSectionId('');
    setSubjectId('');
    setClassError(undefined);
  };

  const onSubmit = (): void => {
    setSubmitError(undefined);
    let hasError = false;

    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();
    if (trimmedTitle.length < 2 || trimmedTitle.length > 200) {
      setTitleError(t('homeworkForm_titleLengthError'));
      hasError = true;
    } else {
      setTitleError(undefined);
    }
    if (!dueDate) {
      setDueDateError(t('homeworkForm_dueDateRequiredError'));
      hasError = true;
    } else {
      setDueDateError(undefined);
    }
    if (!homeworkId) {
      if (!classId) {
        setClassError(t('common_fieldRequired', {field: t('homeworkForm_class')}));
        hasError = true;
      }
      if (!sectionId) {
        setSectionError(t('common_fieldRequired', {field: t('homeworkForm_section')}));
        hasError = true;
      }
      if (!subjectId) {
        setSubjectError(t('common_fieldRequired', {field: t('homeworkForm_subject')}));
        hasError = true;
      }
    }
    if (hasError) {
      return;
    }

    const onError = (e: Error & {code?: string}): void => {
      if (e.code === 'SUBJECT_NOT_ASSIGNED') {
        setSubjectError(t('homeworkForm_subjectNotAssignedError'));
      } else if (e.code === 'SECTION_NOT_FOUND') {
        setSectionError(t('homeworkForm_sectionNotFoundError'));
      } else {
        setSubmitError(e.message);
      }
    };

    if (homeworkId) {
      if (!homework) {
        return;
      }
      const patch: UpdateHomeworkInput = {};
      if (trimmedTitle !== homework.title) {
        patch.title = trimmedTitle;
      }
      if (trimmedDescription !== (homework.description ?? '')) {
        patch.description = trimmedDescription;
      }
      if (type !== homework.type) {
        patch.type = type;
      }
      if (dueDate !== homework.dueDate.slice(0, 10)) {
        patch.dueDate = dueDate;
      }
      if (Object.keys(patch).length === 0) {
        navigation.goBack();
        return;
      }
      updateMutation.mutate({homeworkId, input: patch}, {onSuccess: () => navigation.goBack(), onError});
    } else {
      const input: CreateHomeworkInput = {
        classId,
        sectionId,
        subjectId,
        title: trimmedTitle,
        description: trimmedDescription || undefined,
        type,
        dueDate,
      };
      createMutation.mutate(input, {onSuccess: () => navigation.goBack(), onError});
    }
  };

  if (homeworkId && isError) {
    return (
      <EmptyState
        icon="warning"
        title={t('common_somethingWentWrong')}
        message={(error as {message?: string} | null)?.message ?? t('common_checkConnection')}
        actionLabel={t('common_retry')}
        onAction={() => refetch()}
      />
    );
  }
  if (homeworkId && (isLoading || !homework)) {
    return <Loader message={t('homeworkForm_loadingHomework')} />;
  }

  return (
    <Screen padded={false}>
      <CustomHeader
        title={homeworkId ? t('homeworkForm_editTitle') : t('homeworkForm_newTitle')}
        onBack={() => navigation.goBack()}
      />
      <ScrollView
        contentContainerStyle={{padding: theme.spacing.lg}}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        {!homeworkId ? (
          <>
            <Select
              label={t('homeworkForm_class')}
              value={classId}
              options={classOptions}
              onChange={onChangeClass}
              error={classError}
              required
            />
            <Select
              label={t('homeworkForm_section')}
              value={sectionId}
              options={sectionOptions}
              onChange={val => {
                setSectionId(val);
                setSectionError(undefined);
              }}
              error={sectionError}
              required
            />
            <Select
              label={t('homeworkForm_subject')}
              value={subjectId}
              options={subjectOptions}
              onChange={val => {
                setSubjectId(val);
                setSubjectError(undefined);
              }}
              error={subjectError}
              required
            />
          </>
        ) : null}

        <CustomInput
          label={t('common_title')}
          placeholder={t('homeworkForm_titlePlaceholder')}
          value={title}
          error={titleError}
          onChangeText={val => {
            setTitle(val);
            setTitleError(undefined);
          }}
          required
        />
        <CustomInput
          label={t('common_description')}
          placeholder={t('homeworkForm_descriptionPlaceholder')}
          value={description}
          onChangeText={setDescription}
          multiline
        />
        <Select
          label={t('homeworkForm_type')}
          value={type}
          options={TYPES.map(code => ({label: TYPE_LABEL[code], value: code}))}
          onChange={val => setType(val as HomeworkType)}
          required
        />
        <DatePicker label={t('homeworkForm_dueDate')} value={dueDate} onChange={setDueDate} />
        {dueDateError ? (
          <AppText variant="caption" color="error" style={{marginTop: -theme.spacing.sm, marginBottom: theme.spacing.sm}}>
            {dueDateError}
          </AppText>
        ) : null}

        {submitError ? (
          <AppText variant="caption" color="error" style={{marginBottom: theme.spacing.sm}}>
            {submitError}
          </AppText>
        ) : null}

        <CustomButton
          title={homeworkId ? t('common_save') : t('homeworkForm_create')}
          onPress={onSubmit}
          loading={createMutation.isPending || updateMutation.isPending}
        />
        <Spacer size={24} />
      </ScrollView>
    </Screen>
  );
}
