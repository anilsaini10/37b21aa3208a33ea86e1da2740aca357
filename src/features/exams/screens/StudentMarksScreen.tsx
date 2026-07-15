/** Grade / edit a student's exam result (admin) — one overall marksObtained + grade + remarks + status. */
import React, {useState} from 'react';
import {Pressable, ScrollView} from 'react-native';
import {useNavigation, useRoute, type RouteProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {
  Screen,
  CustomHeader,
  CustomInput,
  CustomButton,
  Badge,
  AppText,
  Row,
  Spacer,
} from '../../../shared/components';
import type {BadgeTone} from '../../../shared/components';
import {
  useCreateExamResult,
  useUpdateExamResult,
  type CreateResultInput,
  type UpdateResultInput,
} from '../adminExams.service';
import type {AdminStackParamList} from '../../../navigation/types';
import type {ExamResultStatus} from '../../../shared/types';

type Nav = NativeStackNavigationProp<AdminStackParamList>;

const STATUS_TONE: Record<ExamResultStatus, BadgeTone> = {
  PENDING: 'warning',
  GRADED: 'success',
  ABSENT: 'error',
};

const STATUSES: ExamResultStatus[] = ['PENDING', 'GRADED', 'ABSENT'];

export function StudentMarksScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<AdminStackParamList, 'StudentMarks'>>();
  const {examId, studentId, studentName, maxMarks, resultId, initial} = route.params;

  const createMutation = useCreateExamResult();
  const updateMutation = useUpdateExamResult();

  const [marksObtained, setMarksObtained] = useState(initial?.marksObtained != null ? String(initial.marksObtained) : '');
  const [grade, setGrade] = useState(initial?.grade ?? '');
  const [remarks, setRemarks] = useState(initial?.remarks ?? '');
  const [status, setStatus] = useState<ExamResultStatus>(initial?.status ?? 'PENDING');

  const [marksError, setMarksError] = useState<string | undefined>();
  const [gradeError, setGradeError] = useState<string | undefined>();
  const [submitError, setSubmitError] = useState<string | undefined>();

  const STATUS_LABEL: Record<ExamResultStatus, string> = {
    PENDING: t('examResult_statusPending'),
    GRADED: t('examResult_statusGraded'),
    ABSENT: t('examResult_statusAbsent'),
  };

  const onSubmit = (): void => {
    setSubmitError(undefined);
    setMarksError(undefined);
    setGradeError(undefined);
    let hasError = false;

    const trimmedMarks = marksObtained.trim();
    const trimmedGrade = grade.trim();
    const trimmedRemarks = remarks.trim();
    let marksValue: number | undefined;

    if (trimmedMarks) {
      const n = Number(trimmedMarks);
      if (!Number.isFinite(n) || n < 0 || n > maxMarks) {
        setMarksError(t('examResult_invalidMarksError', {max: maxMarks}));
        hasError = true;
      } else {
        marksValue = n;
      }
    }
    if (trimmedGrade.length > 10) {
      setGradeError(t('examResult_gradeLengthError'));
      hasError = true;
    }
    if (hasError) {
      return;
    }

    const onError = (e: Error & {code?: string}): void => {
      if (e.code === 'INVALID_MARKS') {
        setMarksError(t('examResult_invalidMarksError', {max: maxMarks}));
      } else {
        setSubmitError(e.message);
      }
    };

    if (resultId) {
      const input: UpdateResultInput = {
        marksObtained: marksValue,
        grade: trimmedGrade || undefined,
        remarks: trimmedRemarks || undefined,
        status,
      };
      updateMutation.mutate({examId, resultId, input}, {onSuccess: () => navigation.goBack(), onError});
    } else {
      const input: CreateResultInput = {
        studentId,
        marksObtained: marksValue,
        grade: trimmedGrade || undefined,
        remarks: trimmedRemarks || undefined,
        status,
      };
      createMutation.mutate({examId, input}, {onSuccess: () => navigation.goBack(), onError});
    }
  };

  return (
    <Screen padded={false}>
      <CustomHeader title={studentName} subtitle={t('examResult_outOf', {max: maxMarks})} onBack={() => navigation.goBack()} />
      <ScrollView
        contentContainerStyle={{padding: theme.spacing.lg}}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <CustomInput
          label={t('examResult_marksObtained')}
          placeholder={t('examResult_marksPlaceholder', {max: maxMarks})}
          keyboardType="numeric"
          value={marksObtained}
          error={marksError}
          onChangeText={val => {
            setMarksObtained(val);
            setMarksError(undefined);
          }}
        />
        <CustomInput
          label={t('examResult_grade')}
          placeholder={t('examResult_gradePlaceholder')}
          value={grade}
          error={gradeError}
          onChangeText={val => {
            setGrade(val);
            setGradeError(undefined);
          }}
        />
        <CustomInput
          label={t('examResult_remarks')}
          placeholder={t('examResult_remarksPlaceholder')}
          value={remarks}
          onChangeText={setRemarks}
          multiline
        />

        <AppText variant="label" color="textSecondary">
          {t('examResult_status')}
        </AppText>
        <Spacer size={theme.spacing.xs} />
        <Row gap={theme.spacing.sm}>
          {STATUSES.map(s => (
            <Pressable key={s} onPress={() => setStatus(s)}>
              <Badge label={STATUS_LABEL[s]} tone={status === s ? STATUS_TONE[s] : 'neutral'} />
            </Pressable>
          ))}
        </Row>

        {submitError ? (
          <AppText variant="caption" color="error" style={{marginTop: theme.spacing.md}}>
            {submitError}
          </AppText>
        ) : null}

        <Spacer size={theme.spacing.lg} />
        <CustomButton
          title={resultId ? t('common_save') : t('examResult_save')}
          onPress={onSubmit}
          loading={createMutation.isPending || updateMutation.isPending}
        />
        <Spacer size={24} />
      </ScrollView>
    </Screen>
  );
}
