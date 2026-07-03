/** Add Teacher — schema-driven form over DynamicForm. */
import React from 'react';
import {ScrollView} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {Screen, CustomHeader, DynamicForm} from '../../../shared/components';
import type {FormField} from '../../../shared/components';
import {db} from '../../../core/mock/db';
import {useCreateTeacher} from '../teachers.service';
import type {TeacherInput} from '../teachers.service';
import type {AdminStackParamList} from '../../../navigation/types';
import type {Teacher} from '../../../shared/types';

type Nav = NativeStackNavigationProp<AdminStackParamList>;

export function TeacherFormScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const navigation = useNavigation<Nav>();
  const createMutation = useCreateTeacher();

  const subjectOptions = db.subjects.map(s => ({label: s.name, value: s.name}));

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
    {name: 'subject', label: t('teacherForm_subjectLabel'), type: 'select', options: subjectOptions, required: true},
    {name: 'salary', label: t('teacherForm_salaryLabel'), type: 'number', required: true},
    {name: 'joiningDate', label: t('teacherForm_joiningDateLabel'), type: 'date', required: true},
  ];

  const onSubmit = (values: Record<string, unknown>): void => {
    const input: TeacherInput = {
      name: String(values.name ?? ''),
      email: String(values.email ?? ''),
      phone: String(values.phone ?? ''),
      gender: values.gender as Teacher['gender'],
      subject: String(values.subject ?? ''),
      salary: Number(values.salary),
      joiningDate: String(values.joiningDate ?? ''),
    };
    createMutation.mutate(input, {onSuccess: () => navigation.goBack()});
  };

  return (
    <Screen padded={false}>
      <CustomHeader title={t('teacherForm_addTitle')} onBack={() => navigation.goBack()} />
      <ScrollView
        contentContainerStyle={{padding: theme.spacing.lg}}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
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
