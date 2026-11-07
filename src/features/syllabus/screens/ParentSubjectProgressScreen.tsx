/** Parent subject progress — chapter list with status badges and progress bars. */
import React from 'react';
import {FlatList, RefreshControl, View} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme, useThemedStyles} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {
  Screen,
  CustomHeader,
  CustomCard,
  Badge,
  EmptyState,
  AppText,
  Row,
  Spacer,
} from '../../../shared/components';
import {
  progressBarColor,
  chapterProgressTone,
} from '../../../shared/helpers';
import {useParentSubjectDetail} from '../parentSyllabus.service';
import type {ParentStackParamList} from '../../../navigation/types';
import type {ParentChapterProgress} from '../../../shared/types';
import {ScreenNames} from '../../../navigation/ScreenNames';

type Nav = NativeStackNavigationProp<ParentStackParamList>;

export function ParentSubjectProgressScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const navigation = useNavigation<Nav>();
  const route = useRoute<any>();
  const {subjectId, studentId} = route.params as {subjectId: string; studentId: string};

  const {data, isLoading, refetch} = useParentSubjectDetail(subjectId, studentId);

  const styles = useThemedStyles(t2 => ({
    list: {paddingHorizontal: t2.spacing.lg, paddingBottom: t2.spacing.xl},
    progressBar: {
      height: 6,
      borderRadius: 3,
      backgroundColor: t2.colors.border,
      marginTop: t2.spacing.xs,
    },
    progressFill: {height: 6, borderRadius: 3},
    meta: {flexDirection: 'row', columnGap: t2.spacing.md, marginTop: t2.spacing.xs},
  }));

  const renderChapter = ({item}: {item: ParentChapterProgress}) => {
    const pct = Math.round(item.completionPercentage);
    return (
      <CustomCard
        onPress={() =>
          navigation.navigate(ScreenNames.ParentChapterDetail as any, {
            planChapterId: item.planChapterId,
            studentId,
          })
        }
        style={{marginBottom: theme.spacing.md}}>
        <Row justify="space-between" align="flex-start">
          <View style={{flex: 1}}>
            <AppText variant="bodyBold">
              {item.chapterNumber}. {item.chapterName}
            </AppText>
          </View>
          <Badge
            label={t(`syllabus_${item.progressStatus.toLowerCase().replace('_', '')}` as any)}
            tone={chapterProgressTone(item.progressStatus)}
          />
        </Row>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {width: `${pct}%`, backgroundColor: progressBarColor(pct)},
            ]}
          />
        </View>
        <View style={styles.meta}>
          <AppText variant="caption" color="textSecondary">
            {pct}%
          </AppText>
          <AppText variant="caption" color="textSecondary">
            {t('syllabus_expectedDays')}: {item.expectedWorkingDays}
          </AppText>
          <AppText variant="caption" color="textSecondary">
            {t('syllabus_actualDays')}: {item.actualWorkingDays}
          </AppText>
        </View>
        {item.teacherRemarks ? (
          <>
            <Spacer size={theme.spacing.xs} />
            <AppText variant="caption" color="textSecondary">
              {item.teacherRemarks}
            </AppText>
          </>
        ) : null}
      </CustomCard>
    );
  };

  return (
    <Screen padded={false}>
      <CustomHeader
        title={data?.subjectName ?? t('syllabus_subjectProgress')}
        subtitle={data?.teacherName ?? undefined}
        onBack={() => navigation.goBack()}
      />
      <FlatList
        data={data?.chapters ?? []}
        keyExtractor={item => item.planChapterId}
        renderItem={renderChapter}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
        ListHeaderComponent={<Spacer size={theme.spacing.md} />}
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState
              title={t('syllabus_noChapters')}
              message={t('syllabus_noChaptersMessage')}
              icon="empty"
            />
          ) : null
        }
      />
    </Screen>
  );
}
