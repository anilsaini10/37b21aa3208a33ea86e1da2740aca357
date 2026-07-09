/** Student add / edit — schema-driven form over DynamicForm, plus a manual class/section picker (with quick "create class" modal). */
import React, {useEffect, useState} from 'react';
import {Pressable, ScrollView} from 'react-native';
import {useNavigation, useRoute, type RouteProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {
  Screen,
  CustomHeader,
  DynamicForm,
  Loader,
  CustomModal,
  CustomInput,
  Select,
  Icon,
  AppText,
  CustomButton,
  Spacer,
} from '../../../shared/components';
import type {FormField} from '../../../shared/components';
import {useStudent, useCreateStudent, useUpdateStudent} from '../students.service';
import type {StudentInput} from '../students.service';
import {useClasses, useCreateClass} from '../../classes/classes.service';
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
  const {data: classes} = useClasses();
  const createClassMutation = useCreateClass();
  const [credentials, setCredentials] = useState<{email: string; password: string} | null>(null);

  const [classId, setClassId] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [classError, setClassError] = useState<string | undefined>();
  const [sectionError, setSectionError] = useState<string | undefined>();
  const [submitError, setSubmitError] = useState<string | undefined>();

  const [classModalOpen, setClassModalOpen] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newNumericLevel, setNewNumericLevel] = useState('');
  const [newSectionName, setNewSectionName] = useState('');
  const [newCapacity, setNewCapacity] = useState('40');
  const [classModalError, setClassModalError] = useState<string | undefined>();

  useEffect(() => {
    if (student) {
      setClassId(student.classId);
      setSectionId(student.sectionId);
    }
  }, [student]);

  const classOptions = (classes ?? []).map(c => ({label: c.name, value: c.id}));
  const selectedClass = (classes ?? []).find(c => c.id === classId);
  const sectionOptions = (selectedClass?.sections ?? []).map(s => ({
    label: t('studentForm_sectionOptionLabel', {section: s.name}),
    value: s.id,
  }));

  const openClassModal = (): void => {
    setNewClassName('');
    setNewNumericLevel('');
    setNewSectionName('');
    setNewCapacity('40');
    setClassModalError(undefined);
    setClassModalOpen(true);
  };

  const submitNewClass = (): void => {
    if (!newClassName.trim() || !newSectionName.trim()) {
      return;
    }
    createClassMutation.mutate(
      {
        name: newClassName.trim(),
        numericLevel: Number(newNumericLevel) || (classes?.length ?? 0) + 1,
        sections: [{name: newSectionName.trim(), capacity: Number(newCapacity) || 40}],
      },
      {
        onSuccess: created => {
          setClassId(created.id);
          setSectionId(created.sections[0].id);
          setClassError(undefined);
          setSectionError(undefined);
          setClassModalOpen(false);
        },
        onError: (e: Error & {code?: string}) => {
          setClassModalError(
            e.code === 'CLASS_NAME_TAKEN'
              ? t('classesManage_classNameTaken')
              : e.code === 'SECTION_NAME_TAKEN'
                ? t('classesManage_sectionNameTaken')
                : e.message,
          );
        },
      },
    );
  };

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
    {name: 'rollNo', label: t('studentForm_rollNoLabel'), type: 'number', required: true},
    {name: 'parentName', label: t('studentForm_parentNameLabel'), type: 'text', required: true},
    {name: 'parentPhone', label: t('studentForm_parentPhoneLabel'), type: 'phone', required: true},
    {name: 'parentEmail', label: t('studentForm_parentEmailLabel'), type: 'email', required: true},
    {name: 'bloodGroup', label: t('studentForm_bloodGroupLabel'), type: 'text'},
    {name: 'address', label: t('common_address'), type: 'textarea'},
  ];

  const defaultValues: Partial<Record<keyof StudentInput, unknown>> | undefined = student
    ? {
        name: student.name,
        gender: student.gender,
        dateOfBirth: student.dateOfBirth,
        rollNo: String(student.rollNo),
        parentName: student.parentName,
        parentPhone: student.parentPhone,
        parentEmail: student.parentEmail,
        bloodGroup: student.bloodGroup,
        address: student.address,
      }
    : undefined;

  const onSubmit = (values: Record<string, unknown>): void => {
    setSubmitError(undefined);
    let hasError = false;
    if (!classId) {
      setClassError(t('common_fieldRequired', {field: t('studentForm_classLabel')}));
      hasError = true;
    }
    if (!sectionId) {
      setSectionError(t('common_fieldRequired', {field: t('studentForm_sectionLabel')}));
      hasError = true;
    }
    if (hasError) {
      return;
    }

    const input: StudentInput = {
      name: String(values.name ?? ''),
      gender: values.gender as Student['gender'],
      dateOfBirth: String(values.dateOfBirth ?? ''),
      classId,
      sectionId,
      rollNo: Number(values.rollNo),
      parentName: String(values.parentName ?? ''),
      parentPhone: String(values.parentPhone ?? ''),
      parentEmail: String(values.parentEmail ?? ''),
      bloodGroup: values.bloodGroup ? String(values.bloodGroup) : undefined,
      address: values.address ? String(values.address) : undefined,
    };
    const onError = (e: Error & {code?: string}): void => {
      if (e.code === 'CLASS_NOT_FOUND') {
        setClassError(e.message);
      } else if (e.code === 'SECTION_NOT_FOUND') {
        setSectionError(e.message);
      } else {
        setSubmitError(e.message);
      }
    };
    if (id) {
      updateMutation.mutate({id, input}, {onSuccess: () => navigation.goBack(), onError});
    } else {
      createMutation.mutate(input, {
        onSuccess: result => {
          // Parent's login account: the backend generates + hashes the
          // default password and returns it once here so the admin can share
          // it — only when a brand-new parent account was created (adding a
          // sibling reuses the existing one, no new password to show).
          if (result.parentAccount.isNew && result.parentAccount.defaultPassword) {
            setCredentials({email: result.parentAccount.email, password: result.parentAccount.defaultPassword});
          } else {
            navigation.goBack();
          }
        },
        onError,
      });
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
        <Select
          label={t('studentForm_classLabel')}
          value={classId}
          options={classOptions}
          onChange={val => {
            setClassId(val);
            setSectionId('');
            setClassError(undefined);
          }}
          error={classError}
          required
        />
        <Pressable
          onPress={openClassModal}
          hitSlop={8}
          style={{flexDirection: 'row', alignItems: 'center', marginTop: -theme.spacing.sm, marginBottom: theme.spacing.md}}>
          <Icon name="add" size={14} color={theme.colors.primary} />
          <AppText variant="caption" color="primary" style={{marginLeft: 4, fontWeight: '700'}}>
            {t('studentForm_createClass')}
          </AppText>
        </Pressable>

        <Select
          label={t('studentForm_sectionLabel')}
          value={sectionId}
          options={sectionOptions}
          onChange={val => {
            setSectionId(val);
            setSectionError(undefined);
          }}
          error={sectionError}
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
          submitLabel={id ? t('studentForm_saveChanges') : t('studentForm_addTitle')}
          onSubmit={onSubmit}
          loading={createMutation.isPending || updateMutation.isPending}
        />
      </ScrollView>

      <CustomModal
        visible={classModalOpen}
        onClose={() => setClassModalOpen(false)}
        title={t('studentForm_createClass')}>
        <CustomInput
          label={t('studentForm_classNameLabel')}
          placeholder={t('studentForm_classNamePlaceholder')}
          value={newClassName}
          onChangeText={setNewClassName}
          required
        />
        <CustomInput
          label={t('studentForm_numericLevelLabel')}
          placeholder={t('studentForm_numericLevelPlaceholder')}
          keyboardType="numeric"
          value={newNumericLevel}
          onChangeText={setNewNumericLevel}
        />
        <CustomInput
          label={t('studentForm_sectionNameLabel')}
          placeholder={t('studentForm_sectionNamePlaceholder')}
          value={newSectionName}
          onChangeText={setNewSectionName}
          required
        />
        <CustomInput
          label={t('studentForm_capacityLabel')}
          keyboardType="numeric"
          value={newCapacity}
          onChangeText={setNewCapacity}
          containerStyle={{marginBottom: 0}}
        />
        {classModalError ? (
          <AppText variant="caption" color="error" style={{marginTop: theme.spacing.sm}}>
            {classModalError}
          </AppText>
        ) : null}
        <Spacer size={16} />
        <CustomButton
          title={t('common_add')}
          onPress={submitNewClass}
          loading={createClassMutation.isPending}
        />
      </CustomModal>

      <CustomModal
        visible={!!credentials}
        dismissable={false}
        onClose={() => undefined}
        title={t('studentForm_parentAccountCreatedTitle')}>
        <AppText variant="body" color="textSecondary">
          {t('studentForm_parentAccountCreatedMessage')}
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
