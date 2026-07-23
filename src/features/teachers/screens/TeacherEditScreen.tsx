/**
 * Edit Teacher — full profile/HR edit (name, contact, employment, qualification, experience,
 * general subject expertise, active/inactive status). Pre-filled from the detail screen's
 * already-loaded teacher — no extra fetch. Separate from subject-class scheduling (assign/remove,
 * on the detail screen) and from homeroom section assignment (Classes/Sections edit screen).
 */
import React, {useState} from 'react';
import {ScrollView, Switch} from 'react-native';
import {useNavigation, useRoute, type RouteProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {
  Screen,
  CustomHeader,
  CustomCard,
  CustomInput,
  DynamicForm,
  CheckboxMultiSelect,
  Select,
  AppText,
  Row,
  Spacer,
} from '../../../shared/components';
import type {FormField} from '../../../shared/components';
import {useUpdateTeacher} from '../teachers.service';
import type {UpdateTeacherInput} from '../teachers.service';
import {useSubjects} from '../../subjects/subjects.service';
import {useClasses} from '../../classes/classes.service';
import {isValidEmail} from '../../../shared/utils/validators';
import type {AdminStackParamList} from '../../../navigation/types';
import type {Teacher} from '../../../shared/types';

type Nav = NativeStackNavigationProp<AdminStackParamList>;

export function TeacherEditScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<AdminStackParamList, 'TeacherEdit'>>();
  const {teacherId, initial} = route.params;
  const updateMutation = useUpdateTeacher();
  const {data: subjects} = useSubjects();
  const {data: classes} = useClasses();

  const [email, setEmail] = useState(initial.email);
  const [emailError, setEmailError] = useState<string | undefined>();
  const [subjectsTaught, setSubjectsTaught] = useState<string[]>(initial.subjectsTaught);
  const [subjectsError, setSubjectsError] = useState<string | undefined>();
  const [isActive, setIsActive] = useState(initial.status === 'active');
  const initialClassTeacherSectionId = initial.classTeacherOf[0]?.sectionId ?? '';
  const [classTeacherSectionId, setClassTeacherSectionId] = useState(initialClassTeacherSectionId);
  const [classTeacherError, setClassTeacherError] = useState<string | undefined>();
  const [submitError, setSubmitError] = useState<string | undefined>();

  const subjectSuggestions = (subjects ?? []).map(s => s.name);
  const sectionOptions = [
    {label: t('common_none'), value: ''},
    ...(classes ?? []).flatMap(c => c.sections.map(s => ({label: `${c.name} - ${s.name}`, value: s.id}))),
  ];

  const fields: FormField[] = [
    {name: 'name', label: t('teacherForm_fullNameLabel'), type: 'text', required: true},
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

  const defaultValues = {
    name: initial.name,
    phone: initial.phone,
    gender: initial.gender,
    qualification: initial.qualification,
    experienceYears: String(initial.experienceYears),
    experienceMonths: String(initial.experienceMonths),
    salary: String(initial.salary),
    joiningDate: initial.joiningDate,
  };

  const onSubmit = (values: Record<string, unknown>): void => {
    setSubmitError(undefined);
    setEmailError(undefined);
    setSubjectsError(undefined);
    setClassTeacherError(undefined);
    let hasError = false;

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setEmailError(t('common_fieldRequired', {field: t('common_email')}));
      hasError = true;
    } else if (!isValidEmail(trimmedEmail)) {
      setEmailError(t('signUpScreen_emailError'));
      hasError = true;
    }
    if (subjectsTaught.length === 0) {
      setSubjectsError(t('common_fieldRequired', {field: t('teacherForm_subjectsLabel')}));
      hasError = true;
    }
    if (hasError) {
      return;
    }

    const input: UpdateTeacherInput = {
      name: String(values.name ?? ''),
      email: trimmedEmail,
      phone: String(values.phone ?? ''),
      gender: values.gender as Teacher['gender'],
      qualification: String(values.qualification ?? ''),
      experienceYears: Number(values.experienceYears),
      experienceMonths: Number(values.experienceMonths),
      subjectsTaught,
      salary: Number(values.salary),
      joiningDate: String(values.joiningDate ?? ''),
      status: isActive ? 'active' : 'inactive',
    };
    if (classTeacherSectionId && classTeacherSectionId !== initialClassTeacherSectionId) {
      input.classTeacherSectionId = classTeacherSectionId;
    }

    updateMutation.mutate(
      {id: teacherId, input},
      {
        onSuccess: () => navigation.goBack(),
        onError: (e: Error & {code?: string}) => {
          if (e.code === 'EMAIL_TAKEN') {
            setEmailError(t('teacherForm_emailTakenError'));
          } else if (e.code === 'SECTION_ALREADY_HAS_CLASS_TEACHER') {
            setClassTeacherError(t('teacherForm_sectionAlreadyHasClassTeacher'));
          } else if (e.code === 'SECTION_NOT_FOUND') {
            setClassTeacherError(e.message);
          } else {
            setSubmitError(e.message);
          }
        },
      },
    );
  };

  return (
    <Screen padded={false}>
      <CustomHeader title={t('teacherEdit_title')} onBack={() => navigation.goBack()} />
      <ScrollView
        contentContainerStyle={{padding: theme.spacing.lg}}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <CustomInput
          label={t('common_email')}
          value={email}
          onChangeText={val => {
            setEmail(val);
            setEmailError(undefined);
          }}
          error={emailError}
          autoCapitalize="none"
          keyboardType="email-address"
          required
        />

        <CustomCard>
          <Row justify="space-between" align="center">
            <AppText variant="bodyBold">{t('teacherEdit_statusLabel')}</AppText>
            <Row gap={theme.spacing.sm} align="center">
              <AppText variant="caption" color={isActive ? 'success' : 'textMuted'}>
                {isActive ? t('teacherEdit_active') : t('teacherEdit_inactive')}
              </AppText>
              <Switch value={isActive} onValueChange={setIsActive} />
            </Row>
          </Row>
        </CustomCard>
        <Spacer size={theme.spacing.md} />

        <Select
          label={t('teacherForm_classTeacherSectionLabel')}
          value={classTeacherSectionId}
          options={sectionOptions}
          onChange={val => {
            setClassTeacherSectionId(val);
            setClassTeacherError(undefined);
          }}
          error={classTeacherError}
        />

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

        {submitError ? (
          <AppText variant="caption" color="error" style={{marginBottom: theme.spacing.sm}}>
            {submitError}
          </AppText>
        ) : null}

        <DynamicForm
          fields={fields}
          defaultValues={defaultValues}
          submitLabel={t('common_save')}
          onSubmit={onSubmit}
          loading={updateMutation.isPending}
        />
      </ScrollView>
    </Screen>
  );
}
