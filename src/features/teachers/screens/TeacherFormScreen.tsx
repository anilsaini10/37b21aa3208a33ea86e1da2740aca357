/** Add Teacher — schema-driven form over DynamicForm. */
import React from 'react';
import {ScrollView} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme} from '../../../core/theme';
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
  const navigation = useNavigation<Nav>();
  const createMutation = useCreateTeacher();

  const subjectOptions = db.subjects.map(s => ({label: s.name, value: s.name}));

  const fields: FormField[] = [
    {name: 'name', label: 'Full Name', type: 'text', required: true},
    {name: 'email', label: 'Email', type: 'email', required: true},
    {name: 'phone', label: 'Phone', type: 'phone', required: true},
    {
      name: 'gender',
      label: 'Gender',
      type: 'select',
      options: [
        {label: 'Male', value: 'male'},
        {label: 'Female', value: 'female'},
      ],
    },
    {name: 'subject', label: 'Subject', type: 'select', options: subjectOptions, required: true},
    {name: 'salary', label: 'Monthly Salary', type: 'number', required: true},
    {name: 'joiningDate', label: 'Joining Date', type: 'date', required: true},
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
      <CustomHeader title="Add Teacher" onBack={() => navigation.goBack()} />
      <ScrollView
        contentContainerStyle={{padding: theme.spacing.lg}}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <DynamicForm
          fields={fields}
          submitLabel="Add Teacher"
          onSubmit={onSubmit}
          loading={createMutation.isPending}
        />
      </ScrollView>
    </Screen>
  );
}
