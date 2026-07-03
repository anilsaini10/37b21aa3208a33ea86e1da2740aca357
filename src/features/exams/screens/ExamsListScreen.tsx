/** Exams list — all exams with status badges, tap to view marks report. */
import React from 'react';
import {ScrollView} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {
  Screen,
  CustomHeader,
  CustomCard,
  Badge,
  ListRow,
  Loader,
  EmptyState,
  Divider,
} from '../../../shared/components';
import {formatDate} from '../../../core/utils/format';
import {capitalize} from '../../../shared/helpers';
import {useExams} from '../exams.service';
import type {AdminStackParamList} from '../../../navigation/types';
import type {Exam} from '../../../shared/types';

type Nav = NativeStackNavigationProp<AdminStackParamList>;

export function ExamsListScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const navigation = useNavigation<Nav>();
  const {data, isLoading} = useExams();
  const {t} = useLanguage();

  if (isLoading || !data) {
    return <Loader message={t('examsList_loadingExams')} />;
  }

  if (data.length === 0) {
    return (
      <Screen padded={false}>
        <CustomHeader title={t('examsList_title')} onBack={() => navigation.goBack()} />
        <EmptyState
          icon="exam"
          title={t('examsList_noExams')}
          message={t('examsList_noExamsMessage')}
        />
      </Screen>
    );
  }

  const toneFor = (status: Exam['status']) =>
    status === 'completed' ? 'success' : status === 'ongoing' ? 'warning' : 'neutral';

  return (
    <Screen padded={false}>
      <CustomHeader title={t('examsList_title')} onBack={() => navigation.goBack()} />
      <ScrollView
        contentContainerStyle={{padding: theme.spacing.lg}}
        showsVerticalScrollIndicator={false}>
        <CustomCard padded={false} style={{paddingHorizontal: theme.spacing.lg}}>
          {data.map((exam, i) => (
            <React.Fragment key={exam.id}>
              {i > 0 ? <Divider /> : null}
              <ListRow
                icon="exam"
                title={exam.name}
                subtitle={`${exam.className} · ${formatDate(exam.startDate)} – ${formatDate(exam.endDate)}`}
                right={<Badge label={capitalize(exam.status)} tone={toneFor(exam.status)} />}
                onPress={() => navigation.navigate('ExamReport', {examId: exam.id})}
              />
            </React.Fragment>
          ))}
        </CustomCard>
      </ScrollView>
    </Screen>
  );
}
