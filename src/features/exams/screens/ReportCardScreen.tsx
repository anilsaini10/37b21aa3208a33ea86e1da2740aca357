/** Report card — per-subject marks table + overall result summary. */
import React from 'react';
import {View, ScrollView} from 'react-native';
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
  EmptyState,
  Loader,
  Row,
  Spacer,
  Divider,
} from '../../../shared/components';
import type {TableColumn} from '../../../shared/components';
import {db} from '../../../core/mock/db';
import {useReportCard} from '../exams.service';
import type {ParentStackParamList} from '../../../navigation/types';

type Nav = NativeStackNavigationProp<ParentStackParamList>;
type SubjectRow = {subjectName: string; marks: number; maxMarks: number; grade: string};

function SummaryItem({label, value}: {label: string; value: string}): React.JSX.Element {
  return (
    <View style={{alignItems: 'center'}}>
      <AppText variant="h3">{value}</AppText>
      <AppText variant="label" color="textMuted">
        {label}
      </AppText>
    </View>
  );
}

export function ReportCardScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<ParentStackParamList, 'ReportCard'>>();
  const {examId} = route.params;
  const child = db.students[0];
  const {data: card, isLoading} = useReportCard(examId, child.id);

  if (isLoading) {
    return <Loader message="Loading report card…" />;
  }

  if (!card) {
    return (
      <Screen padded={false}>
        <CustomHeader title="Report Card" onBack={() => navigation.goBack()} />
        <EmptyState
          title="No report card"
          message="Marks for this exam are not available yet."
          icon="grade"
        />
      </Screen>
    );
  }

  const columns: TableColumn<SubjectRow>[] = [
    {key: 'subject', title: 'Subject', flex: 2, accessor: r => r.subjectName},
    {
      key: 'marks',
      title: 'Marks',
      align: 'center',
      render: r => (
        <AppText variant="caption">
          {r.marks}/{r.maxMarks}
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
      <CustomHeader title="Report Card" onBack={() => navigation.goBack()} />
      <ScrollView
        contentContainerStyle={{padding: theme.spacing.lg}}
        showsVerticalScrollIndicator={false}>
        <CustomCard>
          <AppText variant="h3">{card.examName}</AppText>
          <AppText variant="caption" color="textSecondary">
            {card.studentName}
          </AppText>
          <AppText variant="caption" color="textSecondary">
            {card.className}
          </AppText>
        </CustomCard>

        <Spacer size={theme.spacing.md} />
        <CustomCard padded={false} style={{overflow: 'hidden'}}>
          <CustomTable<SubjectRow>
            columns={columns}
            data={card.subjects}
            keyExtractor={(r, i) => r.subjectName + i}
          />
        </CustomCard>

        <Spacer size={theme.spacing.md} />
        <CustomCard>
          <Row justify="space-around">
            <SummaryItem label="Total" value={`${card.totalMarks}/${card.totalMaxMarks}`} />
            <SummaryItem label="Percentage" value={`${card.percentage}%`} />
          </Row>
          <Divider />
          <Row justify="space-around">
            <SummaryItem label="Grade" value={card.overallGrade} />
            <SummaryItem label="Rank" value={card.rank !== undefined ? `#${card.rank}` : '—'} />
          </Row>
        </CustomCard>
        <Spacer size={24} />
      </ScrollView>
    </Screen>
  );
}
