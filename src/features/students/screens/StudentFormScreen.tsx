/** Student add / edit — schema-driven form over DynamicForm. */
import React from 'react';
import {ScrollView} from 'react-native';
import {useNavigation, useRoute, type RouteProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {Screen, CustomHeader, DynamicForm, Loader} from '../../../shared/components';
import type {FormField} from '../../../shared/components';
import {db} from '../../../core/mock/db';
import {useStudent, useCreateStudent, useUpdateStudent} from '../students.service';
import type {StudentInput} from '../students.service';
import type {AdminStackParamList} from '../../../navigation/types';
import type {Student} from '../../../shared/types';

type Nav = NativeStackNavigationProp<AdminStackParamList>;

export function StudentFormScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<AdminStackParamList, 'StudentForm'>>();
  const id = route.params?.id;

  const {data: student, isLoading} = useStudent(id ?? '');
  const createMutation = useCreateStudent();
  const updateMutation = useUpdateStudent();

  const classOptions = db.classes.map(c => ({label: c.name, value: c.id}));
  const sectionOptions = db.sections.map(s => ({
    label: t('studentForm_sectionOptionLabel', {section: s.name}),
    value: s.id,
  }));

  const fields: FormField[] = [
    {name: 'name', label: t('studentForm_fullNameLabel'), type: 'text', required: true},
    {
      name: 'gender',
      label: t('studentForm_genderLabel'),
      type: 'select',
      options: [
        {label: t('studentForm_genderMale'), value: 'male'},
        {label: t('studentForm_genderFemale'), value: 'female'},
      ],
    },
    {name: 'dateOfBirth', label: t('studentForm_dateOfBirthLabel'), type: 'date', required: true},
    {name: 'classId', label: t('studentForm_classLabel'), type: 'select', options: classOptions, required: true},
    {
      name: 'sectionId',
      label: t('studentForm_sectionLabel'),
      type: 'select',
      options: sectionOptions,
      required: true,
    },
    {name: 'rollNo', label: t('studentForm_rollNoLabel'), type: 'number', required: true},
    {name: 'parentName', label: t('studentForm_parentNameLabel'), type: 'text', required: true},
    {name: 'parentPhone', label: t('studentForm_parentPhoneLabel'), type: 'phone', required: true},
    {name: 'bloodGroup', label: t('studentForm_bloodGroupLabel'), type: 'text'},
    {name: 'address', label: t('common_address'), type: 'textarea'},
  ];

  const defaultValues: Partial<Record<keyof StudentInput, unknown>> | undefined = student
    ? {
        name: student.name,
        gender: student.gender,
        dateOfBirth: student.dateOfBirth,
        classId: student.classId,
        sectionId: student.sectionId,
        rollNo: String(student.rollNo),
        parentName: student.parentName,
        parentPhone: student.parentPhone,
        bloodGroup: student.bloodGroup,
        address: student.address,
      }
    : undefined;

  const onSubmit = (values: Record<string, unknown>): void => {
    const input: StudentInput = {
      name: String(values.name ?? ''),
      gender: values.gender as Student['gender'],
      dateOfBirth: String(values.dateOfBirth ?? ''),
      classId: String(values.classId ?? ''),
      sectionId: String(values.sectionId ?? ''),
      rollNo: Number(values.rollNo),
      parentName: String(values.parentName ?? ''),
      parentPhone: String(values.parentPhone ?? ''),
      bloodGroup: values.bloodGroup ? String(values.bloodGroup) : undefined,
      address: values.address ? String(values.address) : undefined,
    };
    if (id) {
      updateMutation.mutate({id, input}, {onSuccess: () => navigation.goBack()});
    } else {
      createMutation.mutate(input, {onSuccess: () => navigation.goBack()});
    }
  };

  if (id && (isLoading || !student)) {
    return <Loader message={t('studentForm_loadingStudent')} />;
  }

  return (
    <Screen padded={false}>
      <CustomHeader
        title={id ? t('studentForm_editTitle') : t('studentForm_addTitle')}
        onBack={() => navigation.goBack()}
      />
      <ScrollView
        contentContainerStyle={{padding: theme.spacing.lg}}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <DynamicForm
          fields={fields}
          defaultValues={defaultValues}
          submitLabel={id ? t('studentForm_saveChanges') : t('studentForm_addTitle')}
          onSubmit={onSubmit}
          loading={createMutation.isPending || updateMutation.isPending}
        />
      </ScrollView>
    </Screen>
  );
}
