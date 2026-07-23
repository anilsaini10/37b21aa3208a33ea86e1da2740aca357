/**
 * Add Teacher — schema-driven form (DynamicForm) plus a subjects chip-multiselect and an
 * optional class-teacher-of-section picker. `subjects` here is just a general expertise list
 * (names only) — it does NOT bind any subject to a class. After creation, the admin is walked
 * through an "Assign to Class" step to actually schedule the teacher (optional, can be skipped
 * and done later from the teacher's detail screen).
 */
import React, {useState} from 'react';
import {ScrollView, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {
  Screen,
  CustomHeader,
  CustomCard,
  DynamicForm,
  CheckboxMultiSelect,
  Select,
  CustomButton,
  AppText,
  Row,
  Spacer,
} from '../../../shared/components';
import type {FormField} from '../../../shared/components';
import {useCreateTeacher, useAssignTeacherSubject} from '../teachers.service';
import type {TeacherInput} from '../teachers.service';
import {useSubjects} from '../../subjects/subjects.service';
import {useClasses} from '../../classes/classes.service';
import {ScreenNames} from '../../../navigation/ScreenNames';
import type {AdminStackParamList} from '../../../navigation/types';
import type {Teacher} from '../../../shared/types';

type Nav = NativeStackNavigationProp<AdminStackParamList>;

interface CreatedTeacher {
  id: string;
  email: string;
  password: string;
  subjectsTaught: string[];
}

export function TeacherFormScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const navigation = useNavigation<Nav>();
  const createMutation = useCreateTeacher();
  const {data: subjects} = useSubjects();
  const {data: classes} = useClasses();
  const [createdTeacher, setCreatedTeacher] = useState<CreatedTeacher | null>(null);

  const [subjectsTaught, setSubjectsTaught] = useState<string[]>([]);
  const [subjectsError, setSubjectsError] = useState<string | undefined>();
  const [classTeacherSectionId, setClassTeacherSectionId] = useState('');
  const [classTeacherError, setClassTeacherError] = useState<string | undefined>();
  const [submitError, setSubmitError] = useState<string | undefined>();

  const subjectSuggestions = (subjects ?? []).map(s => s.name);
  const sectionOptions = [
    {label: t('common_none'), value: ''},
    ...(classes ?? []).flatMap(c => c.sections.map(s => ({label: `${c.name} - ${s.name}`, value: s.id}))),
  ];

  const fields: FormField[] = [
    {name: 'name', label: t('teacherForm_fullNameLabel'), type: 'text', required: true},
    {name: 'email', label: t('common_email'), type: 'email', required: true},
    {name: 'phone', label: t('common_phone'), type: 'phone', required: true},
    {
      name: 'gender',
      label: t('teacherForm_genderLabel'),
      type: 'select',
      options: [
        {label: t('teacherForm_genderMale'), value: 'male'},
        {label: t('teacherForm_genderFemale'), value: 'female'},
      ],
    },
    {
      name: 'qualification',
      label: t('teacherForm_qualificationLabel'),
      type: 'text',
      placeholder: t('teacherForm_qualificationPlaceholder'),
      required: true,
    },
    {
      name: 'experienceYears',
      label: t('teacherForm_experienceYearsLabel'),
      type: 'number',
      required: true,
      validate: v => {
        const n = Number(v);
        return Number.isFinite(n) && n >= 0
          ? undefined
          : t('common_fieldMustBeNonNegative', {field: t('teacherForm_experienceYearsLabel')});
      },
    },
    {
      name: 'experienceMonths',
      label: t('teacherForm_experienceMonthsLabel'),
      type: 'number',
      required: true,
      validate: v => {
        const n = Number(v);
        return Number.isFinite(n) && n >= 0 && n <= 11
          ? undefined
          : t('common_fieldMustBeBetween', {field: t('teacherForm_experienceMonthsLabel'), min: 0, max: 11});
      },
    },
    {name: 'salary', label: t('teacherForm_salaryLabel'), type: 'number', required: true},
    {name: 'joiningDate', label: t('teacherForm_joiningDateLabel'), type: 'date', required: true},
  ];

  const onSubmit = (values: Record<string, unknown>): void => {
    setSubmitError(undefined);
    setSubjectsError(undefined);
    setClassTeacherError(undefined);
    if (subjectsTaught.length === 0) {
      setSubjectsError(t('common_fieldRequired', {field: t('teacherForm_subjectsLabel')}));
      return;
    }

    const input: TeacherInput = {
      name: String(values.name ?? ''),
      email: String(values.email ?? ''),
      phone: String(values.phone ?? ''),
      gender: values.gender as Teacher['gender'],
      qualification: String(values.qualification ?? ''),
      experienceYears: Number(values.experienceYears),
      experienceMonths: Number(values.experienceMonths),
      subjects: subjectsTaught,
      salary: Number(values.salary),
      joiningDate: String(values.joiningDate ?? ''),
      classTeacherSectionId: classTeacherSectionId || undefined,
    };
    createMutation.mutate(input, {
      onSuccess: result => {
        setCreatedTeacher({
          id: result.teacher.id,
          email: input.email,
          password: result.defaultPassword,
          subjectsTaught: result.teacher.subjectsTaught,
        });
      },
      onError: (e: Error & {code?: string}) => {
        if (e.code === 'SECTION_ALREADY_HAS_CLASS_TEACHER') {
          setClassTeacherError(t('teacherForm_sectionAlreadyHasClassTeacher'));
        } else if (e.code === 'SECTION_NOT_FOUND') {
          setClassTeacherError(e.message);
        } else {
          setSubmitError(e.message);
        }
      },
    });
  };

  if (createdTeacher) {
    return (
      <AssignToClassStage
        teacherId={createdTeacher.id}
        email={createdTeacher.email}
        password={createdTeacher.password}
        subjectsTaught={createdTeacher.subjectsTaught}
        onFinish={() =>
          navigation.replace(ScreenNames.TeacherDetail, {teacherId: createdTeacher.id})
        }
      />
    );
  }

  return (
    <Screen padded={false}>
      <CustomHeader title={t('teacherForm_addTitle')} onBack={() => navigation.goBack()} />
      <ScrollView
        contentContainerStyle={{padding: theme.spacing.lg}}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <CheckboxMultiSelect
          label={t('teacherForm_subjectsLabel')}
          value={subjectsTaught}
          onChange={vals => {
            setSubjectsTaught(vals);
            setSubjectsError(undefined);
          }}
          options={subjectSuggestions}
          placeholder={t('teacherForm_selectSubjects')}
          error={subjectsError}
          required
        />

        <Select
          label={t('teacherForm_classTeacherSectionLabel')}
          value={classTeacherSectionId}
          options={sectionOptions}
          error={classTeacherError}
          onChange={val => {
            setClassTeacherSectionId(val);
            setClassTeacherError(undefined);
          }}
        />

        {submitError ? (
          <AppText variant="caption" color="error" style={{marginBottom: theme.spacing.sm}}>
            {submitError}
          </AppText>
        ) : null}

        <DynamicForm
          fields={fields}
          submitLabel={t('teacherForm_addTitle')}
          onSubmit={onSubmit}
          loading={createMutation.isPending}
        />
      </ScrollView>
    </Screen>
  );
}

function AssignToClassStage({
  teacherId,
  email,
  password,
  subjectsTaught,
  onFinish,
}: {
  teacherId: string;
  email: string;
  password: string;
  subjectsTaught: string[];
  onFinish: () => void;
}): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const {data: classes} = useClasses();
  const assignMutation = useAssignTeacherSubject();
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [assigned, setAssigned] = useState<Record<string, string[]>>({});
  const [assignError, setAssignError] = useState<string | undefined>();

  const classOptions = (classes ?? []).map(c => ({label: c.name, value: c.id}));

  const assignSubject = (subject: string): void => {
    const classId = drafts[subject];
    if (!classId) {
      return;
    }
    setAssignError(undefined);
    assignMutation.mutate(
      {teacherId, input: {subject, classId}},
      {
        onSuccess: () => {
          const className = classOptions.find(c => c.value === classId)?.label ?? '';
          setAssigned(prev => ({...prev, [subject]: [...(prev[subject] ?? []), className]}));
          setDrafts(prev => ({...prev, [subject]: ''}));
        },
        onError: (e: Error) => setAssignError(e.message),
      },
    );
  };

  return (
    <Screen padded={false}>
      <CustomHeader title={t('teacherForm_assignToClassTitle')} />
      <ScrollView contentContainerStyle={{padding: theme.spacing.lg}} showsVerticalScrollIndicator={false}>
        <CustomCard>
          <AppText variant="body" color="textSecondary">
            {t('teacherForm_accountCreatedMessage')}
          </AppText>
          <Spacer size={12} />
          <AppText variant="label" color="textSecondary">
            {t('common_email')}
          </AppText>
          <AppText variant="bodyBold">{email}</AppText>
          <Spacer size={8} />
          <AppText variant="label" color="textSecondary">
            {t('studentForm_defaultPasswordLabel')}
          </AppText>
          <AppText variant="bodyBold">{password}</AppText>
        </CustomCard>

        <Spacer size={theme.spacing.md} />
        <AppText variant="caption" color="textSecondary">
          {t('teacherForm_assignToClassMessage')}
        </AppText>
        <Spacer size={theme.spacing.sm} />

        {subjectsTaught.map(subject => (
          <CustomCard key={subject} style={{marginBottom: theme.spacing.md}}>
            <AppText variant="bodyBold">{subject}</AppText>
            {(assigned[subject] ?? []).length > 0 ? (
              <AppText variant="label" color="success">
                {t('teacherForm_assignedTo', {classes: (assigned[subject] ?? []).join(', ')})}
              </AppText>
            ) : null}
            <Spacer size={theme.spacing.sm} />
            <Row gap={theme.spacing.sm} align="flex-start">
              <View style={{flex: 1}}>
                <Select
                  value={drafts[subject] ?? ''}
                  options={classOptions}
                  onChange={val => setDrafts(prev => ({...prev, [subject]: val}))}
                />
              </View>
              <View style={{width: 96}}>
                <CustomButton
                  title={t('teacherForm_assignButton')}
                  size="sm"
                  disabled={!drafts[subject]}
                  loading={assignMutation.isPending}
                  onPress={() => assignSubject(subject)}
                />
              </View>
            </Row>
          </CustomCard>
        ))}

        {assignError ? (
          <AppText variant="caption" color="error">
            {assignError}
          </AppText>
        ) : null}

        <Spacer size={theme.spacing.md} />
        <CustomButton title={t('common_done')} onPress={onFinish} />
        <Spacer size={24} />
      </ScrollView>
    </Screen>
  );
}
