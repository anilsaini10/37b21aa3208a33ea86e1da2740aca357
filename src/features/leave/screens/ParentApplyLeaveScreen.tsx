/** Parent — Apply Leave: date range + reason for one child, submits then returns to that child's history. */
import React, {useState} from 'react';
import {ScrollView} from 'react-native';
import {useNavigation, useRoute, type RouteProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {Screen, CustomHeader, CustomCard, CustomInput, CustomButton, AppText, Spacer} from '../../../shared/components';
import {DateRangeFilter} from '../../attendance/screens/AttendanceReportScreen';
import {useApplyLeave} from '../parentLeave.service';
import type {ParentStackParamList} from '../../../navigation/types';

type Nav = NativeStackNavigationProp<ParentStackParamList>;

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function ParentApplyLeaveScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<ParentStackParamList, 'LeaveApply'>>();
  const {studentId, studentName} = route.params;

  const [fromDate, setFromDate] = useState(todayIso());
  const [toDate, setToDate] = useState(todayIso());
  const [reason, setReason] = useState('');
  const [dateError, setDateError] = useState<string | undefined>();
  const [reasonError, setReasonError] = useState<string | undefined>();
  const [submitError, setSubmitError] = useState<string | undefined>();

  const applyMutation = useApplyLeave();

  const onSubmit = (): void => {
    setDateError(undefined);
    setReasonError(undefined);
    setSubmitError(undefined);
    let hasError = false;

    if (toDate < fromDate) {
      setDateError(t('leave_dateRangeError'));
      hasError = true;
    }
    const trimmedReason = reason.trim();
    if (trimmedReason.length < 2 || trimmedReason.length > 500) {
      setReasonError(t('leave_reasonLengthError'));
      hasError = true;
    }
    if (hasError) {
      return;
    }

    applyMutation.mutate(
      {studentId, fromDate, toDate, reason: trimmedReason},
      {
        onSuccess: () => navigation.goBack(),
        onError: (e: Error) => setSubmitError(e.message),
      },
    );
  };

  return (
    <Screen padded={false}>
      <CustomHeader title={t('leave_applyForLeave')} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{padding: theme.spacing.lg}} showsVerticalScrollIndicator={false}>
        <AppText variant="caption" color="textSecondary">
          {studentName}
        </AppText>
        <Spacer size={theme.spacing.sm} />

        <DateRangeFilter
          fromDate={fromDate}
          toDate={toDate}
          onChange={(f, tD) => {
            setFromDate(f);
            setToDate(tD);
            setDateError(undefined);
          }}
        />
        {dateError ? (
          <AppText variant="caption" color="error" style={{marginTop: -theme.spacing.sm, marginBottom: theme.spacing.sm}}>
            {dateError}
          </AppText>
        ) : null}

        <CustomCard>
          <CustomInput
            label={t('leave_reason')}
            placeholder={t('leave_reasonPlaceholder')}
            multiline
            value={reason}
            error={reasonError}
            onChangeText={val => {
              setReason(val);
              setReasonError(undefined);
            }}
            required
          />
          {submitError ? (
            <AppText variant="caption" color="error">
              {submitError}
            </AppText>
          ) : null}
          <CustomButton
            title={t('leave_submitApplication')}
            onPress={onSubmit}
            loading={applyMutation.isPending}
          />
        </CustomCard>
        <Spacer size={24} />
      </ScrollView>
    </Screen>
  );
}
