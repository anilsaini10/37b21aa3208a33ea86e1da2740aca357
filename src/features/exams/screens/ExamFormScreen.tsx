/**
 * Create/Edit exam (admin).
 *
 * Create shows a class multi-select with a per-class maxMarks input; edit only
 * touches title/description/dates — classes are managed on the Exam's Classes screen instead.
 */
import React, {useEffect, useState} from 'react';
import {Pressable, ScrollView, View} from 'react-native';
import {useNavigation, useRoute, type RouteProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {
  Screen,
  CustomHeader,
  CustomInput,
  DatePicker,
  CustomButton,
  Icon,
  AppText,
  Row,
  Spacer,
  Loader,
  EmptyState,
} from '../../../shared/components';
import {
  useAdminExam,
  useCreateExam,
  useUpdateExam,
  type CreateExamInput,
  type UpdateExamInput,
} from '../adminExams.service';
import {useClasses} from '../../classes/classes.service';
import type {AdminStackParamList} from '../../../navigation/types';

type Nav = NativeStackNavigationProp<AdminStackParamList>;

interface SelectedClass {
  classId: string;
  className: string;
  maxMarks: string;
}

function OptionalDateField({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: string;
  onChange: (v?: string) => void;
}): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  return (
    <View style={{marginBottom: theme.spacing.md}}>
      <Row justify="space-between" align="center">
        <AppText variant="label" color="textSecondary">
          {label}
        </AppText>
        {value ? (
          <Pressable onPress={() => onChange(undefined)} hitSlop={8}>
            <AppText variant="caption" color="error">
              {t('common_clear')}
            </AppText>
          </Pressable>
        ) : null}
      </Row>
      <Spacer size={theme.spacing.xs} />
      <DatePicker value={value} onChange={onChange} />
    </View>
  );
}

function ClassCheckboxRow({
  label,
  selected,
  onToggle,
}: {
  label: string;
  selected: boolean;
  onToggle: () => void;
}): React.JSX.Element {
  const {theme} = useTheme();
  return (
    <Pressable onPress={onToggle} style={{flexDirection: 'row', alignItems: 'center', paddingVertical: theme.spacing.sm}}>
      <View
        style={{
          width: 20,
          height: 20,
          borderRadius: 4,
          borderWidth: 1.5,
          borderColor: selected ? theme.colors.primary : theme.colors.border,
          backgroundColor: selected ? theme.colors.primary : 'transparent',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: theme.spacing.sm,
        }}>
        {selected ? <Icon name="check" size={12} color={theme.colors.onPrimary} /> : null}
      </View>
      <AppText variant="body">{label}</AppText>
    </Pressable>
  );
}

export function ExamFormScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<AdminStackParamList, 'ExamForm'>>();
  const {examId, initial} = route.params ?? {};

  const {data: exam, isLoading, isError, error, refetch} = useAdminExam(examId ?? '', initial);
  const {data: classes} = useClasses();
  const createMutation = useCreateExam();
  const updateMutation = useUpdateExam();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState<string | undefined>();
  const [endDate, setEndDate] = useState<string | undefined>();
  const [selectedClasses, setSelectedClasses] = useState<SelectedClass[]>([]);

  const [titleError, setTitleError] = useState<string | undefined>();
  const [dateRangeError, setDateRangeError] = useState<string | undefined>();
  const [classesError, setClassesError] = useState<string | undefined>();
  const [submitError, setSubmitError] = useState<string | undefined>();

  useEffect(() => {
    if (exam) {
      setTitle(exam.title);
      setDescription(exam.description ?? '');
      setStartDate(exam.startDate ?? undefined);
      setEndDate(exam.endDate ?? undefined);
    }
  }, [exam]);

  const toggleClass = (classId: string, className: string): void => {
    setClassesError(undefined);
    setSelectedClasses(prev => {
      const idx = prev.findIndex(c => c.classId === classId);
      if (idx !== -1) {
        return prev.filter(c => c.classId !== classId);
      }
      return [...prev, {classId, className, maxMarks: '100'}];
    });
  };

  const updateMaxMarks = (classId: string, maxMarks: string): void => {
    setSelectedClasses(prev => prev.map(c => (c.classId === classId ? {...c, maxMarks} : c)));
  };

  const onSubmit = (): void => {
    setSubmitError(undefined);
    setDateRangeError(undefined);
    setClassesError(undefined);
    let hasError = false;

    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();
    if (trimmedTitle.length < 2 || trimmedTitle.length > 200) {
      setTitleError(t('examForm_titleLengthError'));
      hasError = true;
    } else {
      setTitleError(undefined);
    }
    if (startDate && endDate && new Date(endDate).getTime() < new Date(startDate).getTime()) {
      setDateRangeError(t('examForm_dateRangeError'));
      hasError = true;
    }

    if (!examId) {
      if (selectedClasses.length === 0) {
        setClassesError(t('examForm_classesRequiredError'));
        hasError = true;
      } else if (selectedClasses.some(c => !c.maxMarks.trim() || Number(c.maxMarks) <= 0)) {
        setClassesError(t('examForm_maxMarksInvalidError'));
        hasError = true;
      }
    }

    if (hasError) {
      return;
    }

    const onError = (e: Error & {code?: string}): void => {
      if (e.code === 'INVALID_DATE_RANGE') {
        setDateRangeError(t('examForm_invalidDateRangeServer'));
      } else {
        setSubmitError(e.message);
      }
    };

    if (examId) {
      if (!exam) {
        return;
      }
      const patch: UpdateExamInput = {};
      if (trimmedTitle !== exam.title) {
        patch.title = trimmedTitle;
      }
      if (trimmedDescription !== (exam.description ?? '')) {
        patch.description = trimmedDescription;
      }
      if (startDate !== (exam.startDate ?? undefined)) {
        patch.startDate = startDate;
      }
      if (endDate !== (exam.endDate ?? undefined)) {
        patch.endDate = endDate;
      }
      if (Object.keys(patch).length === 0) {
        navigation.goBack();
        return;
      }
      updateMutation.mutate({examId, input: patch}, {onSuccess: () => navigation.goBack(), onError});
    } else {
      const input: CreateExamInput = {
        title: trimmedTitle,
        description: trimmedDescription || undefined,
        startDate,
        endDate,
        classes: selectedClasses.map(c => ({classId: c.classId, maxMarks: Number(c.maxMarks)})),
      };
      createMutation.mutate(input, {onSuccess: () => navigation.goBack(), onError});
    }
  };

  if (examId && isError) {
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
  if (examId && (isLoading || !exam)) {
    return <Loader message={t('examForm_loadingExam')} />;
  }

  return (
    <Screen padded={false}>
      <CustomHeader
        title={examId ? t('examForm_editTitle') : t('examForm_newExam')}
        onBack={() => navigation.goBack()}
      />
      <ScrollView
        contentContainerStyle={{padding: theme.spacing.lg}}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <CustomInput
          label={t('common_title')}
          placeholder={t('examForm_titlePlaceholder')}
          value={title}
          error={titleError}
          onChangeText={val => {
            setTitle(val);
            setTitleError(undefined);
          }}
          required
        />
        <CustomInput
          label={t('examForm_description')}
          placeholder={t('examForm_descriptionPlaceholder')}
          value={description}
          onChangeText={setDescription}
          multiline
        />

        <OptionalDateField label={t('examForm_startDate')} value={startDate} onChange={setStartDate} />
        <OptionalDateField label={t('examForm_endDate')} value={endDate} onChange={setEndDate} />

        {dateRangeError ? (
          <AppText variant="caption" color="error" style={{marginBottom: theme.spacing.sm}}>
            {dateRangeError}
          </AppText>
        ) : null}

        {!examId ? (
          <View>
            <AppText variant="label" color="textSecondary">
              {t('examForm_classesLabel')}
              <AppText variant="label" color="error"> *</AppText>
            </AppText>
            <Spacer size={theme.spacing.xs} />
            {(classes ?? []).map(cls => {
              const selected = selectedClasses.find(c => c.classId === cls.id);
              return (
                <View key={cls.id}>
                  <ClassCheckboxRow
                    label={cls.name}
                    selected={!!selected}
                    onToggle={() => toggleClass(cls.id, cls.name)}
                  />
                  {selected ? (
                    <View style={{marginLeft: 28, marginBottom: theme.spacing.sm}}>
                      <CustomInput
                        placeholder={t('examForm_maxMarksPlaceholder')}
                        keyboardType="numeric"
                        value={selected.maxMarks}
                        onChangeText={val => updateMaxMarks(cls.id, val)}
                        containerStyle={{marginBottom: 0}}
                      />
                    </View>
                  ) : null}
                </View>
              );
            })}
            {classesError ? (
              <AppText variant="caption" color="error" style={{marginTop: theme.spacing.xs, marginBottom: theme.spacing.sm}}>
                {classesError}
              </AppText>
            ) : null}
            <Spacer size={theme.spacing.sm} />
          </View>
        ) : null}

        {submitError ? (
          <AppText variant="caption" color="error" style={{marginBottom: theme.spacing.sm}}>
            {submitError}
          </AppText>
        ) : null}

        <CustomButton
          title={examId ? t('common_save') : t('examForm_create')}
          onPress={onSubmit}
          loading={createMutation.isPending || updateMutation.isPending}
        />
        <Spacer size={24} />
      </ScrollView>
    </Screen>
  );
}
