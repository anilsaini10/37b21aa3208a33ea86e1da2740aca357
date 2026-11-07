/** Teacher — plan detail with chapter list. */
import React from 'react';
import {FlatList, RefreshControl, View} from 'react-native';
import {useNavigation, useRoute, type RouteProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme, useThemedStyles} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {
  Screen,
  Row,
  Spacer,
  CustomHeader,
  CustomCard,
  Badge,
  AppText,
  EmptyState,
} from '../../../shared/components';
import {
  progressBarColor,
  chapterProgressTone,
  planStatusTone,
} from '../../../shared/helpers';
import {useTeacherPlanDetail} from '../teacherSyllabus.service';
import type {TeacherPlanChapter} from '../../../shared/types';
import type {TeacherStackParamList} from '../../../navigation/types';
import {ScreenNames} from '../../../navigation/ScreenNames';

type Nav = NativeStackNavigationProp<TeacherStackParamList>;

export function TeacherPlanDetailScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<TeacherStackParamList, 'TeacherSyllabusPlanDetail'>>();
  const {planId} = route.params as {planId: string};

  const {data: plan, isLoading, refetch} = useTeacherPlanDetail(planId);

  const styles = useThemedStyles(t2 => ({
    header: {padding: t2.spacing.lg},
    list: {paddingHorizontal: t2.spacing.lg, paddingBottom: t2.spacing.xxl},
    card: {marginBottom: t2.spacing.md},
    progressBar: {
      height: 6,
      borderRadius: 3,
      backgroundColor: t2.colors.border,
      marginTop: t2.spacing.xs,
    },
    progressFill: {height: 6, borderRadius: 3},
  }));

  const renderChapter = ({item}: {item: TeacherPlanChapter}) => {
    const pct = item.completionPercentage;
    return (
      <CustomCard
        style={styles.card}
        onPress={() =>
          navigation.navigate(ScreenNames.TeacherChapterDetail as any, {
            planId,
            planChapterId: item.id,
          })
        }>
        <Row justify="space-between" align="flex-start">
          <View style={{flex: 1}}>
            <AppText variant="bodyBold">
              {item.chapterNumber}. {item.chapterName}
            </AppText>
          </View>
          <Badge label={item.progressStatus.replace('_', ' ')} tone={chapterProgressTone(item.progressStatus)} />
        </Row>
        <Spacer size={theme.spacing.xs} />
        <Row justify="space-between">
          <AppText variant="caption" color="textSecondary">
            {pct}%
          </AppText>
          <AppText variant="caption" color="textSecondary">
            {t('syllabus_workingDays')}: {item.actualWorkingDays}/{item.expectedWorkingDays}
          </AppText>
        </Row>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, {width: `${pct}%`, backgroundColor: progressBarColor(pct)}]} />
        </View>
      </CustomCard>
    );
  };

  const ListHeader = plan ? (
    <View style={styles.header}>
      <Row justify="space-between" align="flex-start">
        <View style={{flex: 1}}>
          <AppText variant="h3">{plan.className} - {plan.sectionName}</AppText>
          <AppText color="textSecondary">{plan.subjectName}</AppText>
        </View>
        <Badge label={plan.status} tone={planStatusTone(plan.status)} />
      </Row>
      {plan.remarks ? (
        <>
          <Spacer size={theme.spacing.sm} />
          <AppText variant="caption" color="textSecondary">{plan.remarks}</AppText>
        </>
      ) : null}
      {plan.approvalEnabled ? (
        <>
          <Spacer size={theme.spacing.xs} />
          <Badge label={t('syllabus_approvalEnabled')} tone="warning" />
        </>
      ) : null}
      <Spacer size={theme.spacing.md} />
      <AppText variant="bodyBold">{t('syllabus_chapters')}</AppText>
    </View>
  ) : null;

  return (
    <Screen padded={false}>
      <CustomHeader title={t('syllabus_planDetail')} onBack={() => navigation.goBack()} />
      <FlatList
        data={plan?.chapters ?? []}
        keyExtractor={item => item.id}
        renderItem={renderChapter}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState title={t('syllabus_noChapters')} message={t('syllabus_noChaptersMessage')} icon="empty" />
          ) : null
        }
      />
    </Screen>
  );
}
