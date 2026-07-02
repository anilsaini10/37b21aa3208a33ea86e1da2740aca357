/** Exam report — marks table for a single exam. */
import React from 'react';
import {ScrollView} from 'react-native';
import {useNavigation, useRoute, type RouteProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme} from '../../../core/theme';
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
  const {theme} = useTheme();
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<AdminStackParamList, 'ExamReport'>>();
  const {examId} = route.params;
  const {data, isLoading} = useExamMarks(examId);

  if (isLoading || !data) {
    return <Loader message="Loading marks…" />;
  }

  const columns: TableColumn<MarkEntry>[] = [
    {key: 'student', title: 'Student', flex: 2, accessor: r => r.studentName},
    {key: 'subject', title: 'Subject', accessor: r => r.subjectName},
    {
      key: 'marks',
      title: 'Marks',
      align: 'center',
      render: r => (
        <AppText variant="caption">
          {r.marksObtained}/{r.maxMarks}
        </AppText>
      ),
    },
    {
      key: 'grade',
      title: 'Grade',
      align: 'center',
      render: r => <Badge label={r.grade} tone="primary" />,
    },
  ];

  return (
    <Screen padded={false}>
      <CustomHeader title="Exam Report" onBack={() => navigation.goBack()} />
      {data.length === 0 ? (
        <EmptyState
          icon="grade"
          title="No marks yet"
          message="Marks for this exam have not been entered."
        />
      ) : (
        <ScrollView
          contentContainerStyle={{padding: theme.spacing.lg}}
          showsVerticalScrollIndicator={false}>
          <CustomCard padded={false} style={{overflow: 'hidden'}}>
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
