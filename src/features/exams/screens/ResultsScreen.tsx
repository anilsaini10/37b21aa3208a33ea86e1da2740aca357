/** Results — subject performance chart + report card list for the child. */
import React from 'react';
import {ScrollView} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme} from '../../../core/theme';
import {
  Screen,
  AppText,
  CustomHeader,
  CustomCard,
  BarChart,
  SectionTitle,
  ListRow,
  EmptyState,
  Loader,
  Spacer,
} from '../../../shared/components';
import {db} from '../../../core/mock/db';
import {useStudentReportCards} from '../exams.service';
import {useParentDashboard} from '../../dashboard/dashboard.service';
import type {ParentStackParamList} from '../../../navigation/types';

type Nav = NativeStackNavigationProp<ParentStackParamList>;

export function ResultsScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const navigation = useNavigation<Nav>();
  const child = db.students[0];
  const {data: cards, isLoading} = useStudentReportCards(child.id);
  const {data: dashboard, isLoading: dashLoading} = useParentDashboard();

  if (isLoading || dashLoading || !dashboard) {
    return <Loader message="Loading results…" />;
  }

  return (
    <Screen padded={false}>
      <CustomHeader title="Results" onBack={() => navigation.goBack()} />
      <ScrollView
        contentContainerStyle={{padding: theme.spacing.lg}}
        showsVerticalScrollIndicator={false}>
        <SectionTitle title="Subject Performance" />
        <CustomCard>
          <BarChart series={dashboard.performanceTrend} height={150} valueFormatter={v => `${v}%`} />
        </CustomCard>

        <SectionTitle title="Report Cards" />
        {cards && cards.length > 0 ? (
          <CustomCard padded={false} style={{paddingHorizontal: theme.spacing.lg}}>
            {cards.map(card => (
              <ListRow
                key={card.id}
                icon="grade"
                title={card.examName}
                subtitle={`${card.percentage}% · Grade ${card.overallGrade}`}
                onPress={() => navigation.navigate('ReportCard', {examId: card.examId})}
              />
            ))}
          </CustomCard>
        ) : (
          <EmptyState
            title="No report cards"
            message="Report cards will appear once exams are graded."
            icon="grade"
          />
        )}
        <Spacer size={24} />
      </ScrollView>
    </Screen>
  );
}
