/** Create Homework — schema-driven form that assigns homework to a class. */
import React from 'react';
import {ScrollView} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {Screen, CustomHeader, DynamicForm} from '../../../shared/components';
import type {FormField} from '../../../shared/components';
import {db} from '../../../core/mock/db';
import {useAuthStore} from '../../auth/authStore';
import {useCreateHomework, type HomeworkInput} from '../homework.service';
import type {TeacherStackParamList} from '../../../navigation/types';

type Nav = NativeStackNavigationProp<TeacherStackParamList>;

export function CreateHomeworkScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const navigation = useNavigation<Nav>();
  const user = useAuthStore(s => s.user);
  const mutation = useCreateHomework(user?.name ?? 'Teacher');

  const classOptions = db.classes.map(c => ({label: c.name, value: c.id}));
  const sectionOptions = db.sections.map(s => ({
    label: t('createHomework_sectionOptionLabel', {name: s.name}),
    value: s.id,
  }));
  const subjectOptions = db.subjects.map(s => ({label: s.name, value: s.name}));

  const fields: FormField[] = [
    {
      name: 'title',
      label: t('common_title'),
      type: 'text',
      placeholder: t('createHomework_titlePlaceholder'),
      required: true,
    },
    {
      name: 'description',
      label: t('common_description'),
      type: 'textarea',
      placeholder: t('createHomework_descriptionPlaceholder'),
      required: true,
    },
    {name: 'subjectName', label: t('createHomework_subject'), type: 'select', options: subjectOptions, required: true},
    {name: 'classId', label: t('createHomework_class'), type: 'select', options: classOptions, required: true},
    {name: 'sectionId', label: t('createHomework_section'), type: 'select', options: sectionOptions, required: true},
    {name: 'dueDate', label: t('createHomework_dueDate'), type: 'date', required: true},
  ];

  const onSubmit = (values: HomeworkInput) => {
    mutation.mutate(values, {onSuccess: () => navigation.goBack()});
  };

  return (
    <Screen padded={false}>
      <CustomHeader title={t('createHomework_title')} onBack={() => navigation.goBack()} />
      <ScrollView
        contentContainerStyle={{padding: theme.spacing.lg}}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <DynamicForm
          fields={fields}
          submitLabel={t('createHomework_assignHomework')}
          loading={mutation.isPending}
          onSubmit={values => onSubmit(values as HomeworkInput)}
        />
      </ScrollView>
    </Screen>
  );
}
