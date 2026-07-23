/** Add/Edit Staff — one form for both, keyed off an optional `staffId` route param. No login/password involved — a plain HR record. */
import React, {useState} from 'react';
import {ScrollView, Switch} from 'react-native';
import {useNavigation, useRoute, type RouteProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {Screen, CustomHeader, CustomCard, DynamicForm, AppText, Row, Spacer} from '../../../shared/components';
import type {FormField} from '../../../shared/components';
import {useCreateStaff, useUpdateStaff} from '../adminStaff.service';
import type {StaffInput} from '../adminStaff.service';
import type {AdminStackParamList} from '../../../navigation/types';
import type {Staff} from '../../../shared/types';

type Nav = NativeStackNavigationProp<AdminStackParamList>;

export function StaffFormScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<AdminStackParamList, 'StaffForm'>>();
  const {staffId, initial} = route.params ?? {};
  const isEdit = !!staffId && !!initial;

  const createMutation = useCreateStaff();
  const updateMutation = useUpdateStaff();
  const [isActive, setIsActive] = useState(initial?.status !== 'inactive');
  const [submitError, setSubmitError] = useState<string | undefined>();

  const fields: FormField[] = [
    {name: 'name', label: t('staffForm_nameLabel'), type: 'text', required: true},
    {name: 'email', label: t('common_email'), type: 'email'},
    {name: 'phone', label: t('common_phone'), type: 'phone', required: true},
    {
      name: 'gender',
      label: t('teacherForm_genderLabel'),
      type: 'select',
      options: [
        {label: t('teacherForm_genderMale'), value: 'male'},
        {label: t('teacherForm_genderFemale'), value: 'female'},
      ],
      required: true,
    },
    {
      name: 'designation',
      label: t('staffForm_designationLabel'),
      type: 'text',
      placeholder: t('staffForm_designationPlaceholder'),
      required: true,
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
    name: initial?.name ?? '',
    email: initial?.email ?? '',
    phone: initial?.phone ?? '',
    gender: initial?.gender ?? 'male',
    designation: initial?.designation ?? '',
    qualification: initial?.qualification ?? '',
    experienceYears: initial ? String(initial.experienceYears) : '',
    experienceMonths: initial ? String(initial.experienceMonths) : '',
    salary: initial ? String(initial.salary) : '',
    joiningDate: initial?.joiningDate ?? '',
  };

  const onSubmit = (values: Record<string, unknown>): void => {
    setSubmitError(undefined);
    const email = String(values.email ?? '').trim();
    const input: StaffInput = {
      name: String(values.name ?? ''),
      email: email || undefined,
      phone: String(values.phone ?? ''),
      gender: values.gender as Staff['gender'],
      designation: String(values.designation ?? ''),
      qualification: String(values.qualification ?? ''),
      experienceYears: Number(values.experienceYears),
      experienceMonths: Number(values.experienceMonths),
      salary: Number(values.salary),
      joiningDate: String(values.joiningDate ?? ''),
    };

    if (isEdit) {
      updateMutation.mutate(
        {staffId: staffId!, input: {...input, status: isActive ? 'active' : 'inactive'}},
        {
          onSuccess: () => navigation.goBack(),
          onError: (e: Error) => setSubmitError(e.message),
        },
      );
    } else {
      createMutation.mutate(input, {
        onSuccess: () => navigation.goBack(),
        onError: (e: Error) => setSubmitError(e.message),
      });
    }
  };

  return (
    <Screen padded={false}>
      <CustomHeader
        title={isEdit ? t('staffForm_editTitle') : t('staffForm_addTitle')}
        onBack={() => navigation.goBack()}
      />
      <ScrollView
        contentContainerStyle={{padding: theme.spacing.lg}}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        {isEdit ? (
          <>
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
          </>
        ) : null}

        {submitError ? (
          <AppText variant="caption" color="error" style={{marginBottom: theme.spacing.sm}}>
            {submitError}
          </AppText>
        ) : null}

        <DynamicForm
          fields={fields}
          defaultValues={defaultValues}
          submitLabel={isEdit ? t('common_save') : t('common_add')}
          onSubmit={onSubmit}
          loading={isEdit ? updateMutation.isPending : createMutation.isPending}
        />
      </ScrollView>
    </Screen>
  );
}
