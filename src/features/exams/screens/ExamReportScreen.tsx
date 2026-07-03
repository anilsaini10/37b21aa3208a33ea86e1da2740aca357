/** Exam report — marks table for a single exam. */
import React from 'react';
import {ScrollView} from 'react-native';
import {useNavigation, useRoute, type RouteProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useThemedStyles} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {
  Screen,
  AppText,
  CustomHeader,
  CustomCard,
  CustomTable,
  Badge,
  Loader,
  EmptyState,
} from '../../../shared/components';
import type {TableColumn} from '../../../shared/components';
import {useExamMarks} from '../exams.service';
import type {AdminStackParamList} from '../../../navigation/types';
import type {MarkEntry} from '../../../shared/types';

type Nav = NativeStackNavigationProp<AdminStackParamList>;

export function ExamReportScreen(): React.JSX.Element {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<AdminStackParamList, 'ExamReport'>>();
  const {examId} = route.params;
  const {data, isLoading} = useExamMarks(examId);
  const {t} = useLanguage();
  const styles = useThemedStyles(t2 => ({
    scrollContent: {
      padding: t2.spacing.lg,
    },
    tableCard: {
      overflow: 'hidden',
    },
  }));

  if (isLoading || !data) {
    return <Loader message={t('examReport_loadingMarks')} />;
  }

  const columns: TableColumn<MarkEntry>[] = [
    {key: 'student', title: t('examReport_student'), flex: 2, accessor: r => r.studentName},
    {key: 'subject', title: t('examReport_subject'), accessor: r => r.subjectName},
    {
      key: 'marks',
      title: t('examReport_marks'),
      align: 'center',
      render: r => (
        <AppText variant="caption">
          {r.marksObtained}/{r.maxMarks}
        </AppText>
      ),
    },
    {
      key: 'grade',
      title: t('examReport_grade'),
      align: 'center',
      render: r => <Badge label={r.grade} tone="primary" />,
    },
  ];

  return (
    <Screen padded={false}>
      <CustomHeader title={t('examReport_title')} onBack={() => navigation.goBack()} />
      {data.length === 0 ? (
        <EmptyState
          icon="grade"
          title={t('examReport_noMarksYet')}
          message={t('examReport_noMarksMessage')}
        />
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <CustomCard padded={false} style={styles.tableCard}>
            <CustomTable<MarkEntry>
              columns={columns}
              data={data}
              keyExtractor={r => r.id}
            />
          </CustomCard>
        </ScrollView>
      )}
    </Screen>
  );
}
