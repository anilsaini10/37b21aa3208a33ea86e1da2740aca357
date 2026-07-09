/** Add Teacher — schema-driven form over DynamicForm, plus subject + class pickers (with quick "create subject" modal).
 *
 * The backend only accepts ONE {subject, classId} pairing per teacher-create call — a teacher who
 * teaches multiple subjects/classes gets those added via later calls, not modelled here yet.
 */
import React, {useState} from 'react';
import {Pressable, ScrollView} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {
  Screen,
  CustomHeader,
  DynamicForm,
  CustomModal,
  CustomInput,
  Select,
  Icon,
  AppText,
  CustomButton,
  Spacer,
} from '../../../shared/components';
import type {FormField} from '../../../shared/components';
import {useCreateTeacher} from '../teachers.service';
import type {TeacherInput} from '../teachers.service';
import {useSubjects, useCreateSubject} from '../../subjects/subjects.service';
import {useClasses} from '../../classes/classes.service';
import type {AdminStackParamList} from '../../../navigation/types';
import type {Teacher} from '../../../shared/types';

type Nav = NativeStackNavigationProp<AdminStackParamList>;

export function TeacherFormScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const navigation = useNavigation<Nav>();
  const createMutation = useCreateTeacher();
  const {data: subjects} = useSubjects();
  const {data: classes} = useClasses();
  const createSubjectMutation = useCreateSubject();
  const [credentials, setCredentials] = useState<{email: string; password: string} | null>(null);

  const [subjectName, setSubjectName] = useState('');
  const [classId, setClassId] = useState('');
  const [subjectError, setSubjectError] = useState<string | undefined>();
  const [classError, setClassError] = useState<string | undefined>();
  const [submitError, setSubmitError] = useState<string | undefined>();

  const [subjectModalOpen, setSubjectModalOpen] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');

  const subjectOptions = (subjects ?? []).map(s => ({label: s.name, value: s.name}));
  const classOptions = (classes ?? []).map(c => ({label: c.name, value: c.id}));

  const submitNewSubject = (): void => {
    const name = newSubjectName.trim();
    if (!name) {
      return;
    }
    createSubjectMutation.mutate(
      {name},
      {
        onSuccess: created => {
          setSubjectName(created.name);
          setSubjectError(undefined);
          setNewSubjectName('');
          setSubjectModalOpen(false);
        },
      },
    );
  };

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
    {name: 'salary', label: t('teacherForm_salaryLabel'), type: 'number', required: true},
    {name: 'joiningDate', label: t('teacherForm_joiningDateLabel'), type: 'date', required: true},
  ];

  const onSubmit = (values: Record<string, unknown>): void => {
    setSubmitError(undefined);
    let hasError = false;
    if (!subjectName.trim()) {
      setSubjectError(t('common_fieldRequired', {field: t('teacherForm_subjectLabel')}));
      hasError = true;
    }
    if (!classId) {
      setClassError(t('common_fieldRequired', {field: t('studentForm_classLabel')}));
      hasError = true;
    }
    if (hasError) {
      return;
    }

    const input: TeacherInput = {
      name: String(values.name ?? ''),
      email: String(values.email ?? ''),
      phone: String(values.phone ?? ''),
      gender: values.gender as Teacher['gender'],
      subject: subjectName.trim(),
      classId,
      salary: Number(values.salary),
      joiningDate: String(values.joiningDate ?? ''),
    };
    createMutation.mutate(input, {
      onSuccess: result => {
        // Teacher's login account — the backend generates + hashes the
        // default password and returns it once here so the admin can share
        // it; the teacher changes it after first login.
        setCredentials({email: input.email, password: result.defaultPassword});
      },
      onError: (e: Error & {code?: string}) => {
        if (e.code === 'CLASS_NOT_FOUND') {
          setClassError(e.message);
        } else {
          setSubmitError(e.message);
        }
      },
    });
  };

  return (
    <Screen padded={false}>
      <CustomHeader title={t('teacherForm_addTitle')} onBack={() => navigation.goBack()} />
      <ScrollView
        contentContainerStyle={{padding: theme.spacing.lg}}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <Select
          label={t('teacherForm_subjectLabel')}
          value={subjectName}
          options={subjectOptions}
          onChange={val => {
            setSubjectName(val);
            setSubjectError(undefined);
          }}
          error={subjectError}
          required
        />
        <Pressable
          onPress={() => setSubjectModalOpen(true)}
          hitSlop={8}
          style={{flexDirection: 'row', alignItems: 'center', marginTop: -theme.spacing.sm, marginBottom: theme.spacing.md}}>
          <Icon name="add" size={14} color={theme.colors.primary} />
          <AppText variant="caption" color="primary" style={{marginLeft: 4, fontWeight: '700'}}>
            {t('teacherForm_createSubject')}
          </AppText>
        </Pressable>

        <Select
          label={t('studentForm_classLabel')}
          value={classId}
          options={classOptions}
          onChange={val => {
            setClassId(val);
            setClassError(undefined);
          }}
          error={classError}
          required
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

      <CustomModal
        visible={subjectModalOpen}
        onClose={() => setSubjectModalOpen(false)}
        title={t('teacherForm_createSubject')}>
        <CustomInput
          label={t('teacherForm_subjectNameLabel')}
          placeholder={t('teacherForm_subjectNamePlaceholder')}
          value={newSubjectName}
          onChangeText={setNewSubjectName}
          containerStyle={{marginBottom: 0}}
          required
        />
        <Spacer size={16} />
        <CustomButton
          title={t('common_add')}
          onPress={submitNewSubject}
          loading={createSubjectMutation.isPending}
        />
      </CustomModal>

      <CustomModal
        visible={!!credentials}
        dismissable={false}
        onClose={() => undefined}
        title={t('teacherForm_accountCreatedTitle')}>
        <AppText variant="body" color="textSecondary">
          {t('teacherForm_accountCreatedMessage')}
        </AppText>
        <Spacer size={12} />
        <AppText variant="label" color="textSecondary">
          {t('common_email')}
        </AppText>
        <AppText variant="bodyBold">{credentials?.email}</AppText>
        <Spacer size={8} />
        <AppText variant="label" color="textSecondary">
          {t('studentForm_defaultPasswordLabel')}
        </AppText>
        <AppText variant="bodyBold">{credentials?.password}</AppText>
        <Spacer size={16} />
        <CustomButton
          title={t('common_done')}
          onPress={() => {
            setCredentials(null);
            navigation.goBack();
          }}
        />
      </CustomModal>
    </Screen>
  );
}
