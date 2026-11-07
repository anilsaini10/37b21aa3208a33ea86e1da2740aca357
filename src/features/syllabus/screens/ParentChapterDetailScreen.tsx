/** Parent chapter detail — chapter info, dates comparison, progress history timeline. */
import React from 'react';
import {FlatList, RefreshControl, View} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useTheme, useThemedStyles} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {
  Screen,
  CustomHeader,
  CustomCard,
  Badge,
  AppText,
  Row,
  Spacer,
  Divider,
} from '../../../shared/components';
import {
  progressBarColor,
  chapterProgressTone,
} from '../../../shared/helpers';
import {useParentChapterDetail} from '../parentSyllabus.service';

export function ParentChapterDetailScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const navigation = useNavigation();
  const route = useRoute<any>();
  const {planChapterId, studentId} = route.params as {planChapterId: string; studentId: string};

  const {data, isLoading, refetch} = useParentChapterDetail(planChapterId, studentId);

  const styles = useThemedStyles(t2 => ({
    content: {padding: t2.spacing.lg},
    progressBar: {
      height: 8,
      borderRadius: 4,
      backgroundColor: t2.colors.border,
      marginTop: t2.spacing.xs,
    },
    progressFill: {height: 8, borderRadius: 4},
    dateRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: t2.spacing.xs,
    },
    historyDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      marginTop: 4,
    },
    historyLine: {
      width: 2,
      flex: 1,
      marginLeft: 4,
    },
    historyRow: {
      flexDirection: 'row',
      columnGap: t2.spacing.md,
      marginBottom: t2.spacing.md,
    },
  }));

  const pct = data ? Math.round(data.completionPercentage) : 0;

  const renderDateRow = (label: string, value?: string) => (
    <View style={styles.dateRow}>
      <AppText variant="caption" color="textSecondary">{label}</AppText>
      <AppText variant="caption">{value ?? '—'}</AppText>
    </View>
  );

  const history = data?.progressHistory ?? [];

  return (
    <Screen padded={false}>
      <CustomHeader
        title={data ? `${data.chapterNumber}. ${data.chapterName}` : t('syllabus_chapterDetail')}
        onBack={() => navigation.goBack()}
      />
      <FlatList
        data={history}
        keyExtractor={(_, i) => String(i)}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
        ListHeaderComponent={
          data ? (
            <>
              <CustomCard>
                <Row justify="space-between" align="center">
                  <AppText variant="h3">{pct}%</AppText>
                  <Badge
                    label={t(`syllabus_${data.progressStatus.toLowerCase().replace('_', '')}` as any)}
                    tone={chapterProgressTone(data.progressStatus)}
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
              </CustomCard>
              <Spacer size={theme.spacing.md} />

              <CustomCard>
                {renderDateRow(t('syllabus_plannedStart'), data.plannedStartDate)}
                {renderDateRow(t('syllabus_actualStart'), data.actualStartDate)}
                {renderDateRow(t('syllabus_plannedEnd'), data.plannedEndDate)}
                {renderDateRow(t('syllabus_actualEnd'), data.actualEndDate)}
                <Divider />
                {renderDateRow(t('syllabus_expectedDays'), String(data.expectedWorkingDays))}
                {renderDateRow(t('syllabus_actualDays'), String(data.actualWorkingDays))}
              </CustomCard>
              <Spacer size={theme.spacing.md} />

              {data.teacherRemarks ? (
                <>
                  <CustomCard>
                    <AppText variant="label" color="textSecondary">
                      {t('syllabus_teacherRemarks')}
                    </AppText>
                    <Spacer size={theme.spacing.xs} />
                    <AppText>{data.teacherRemarks}</AppText>
                  </CustomCard>
                  <Spacer size={theme.spacing.md} />
                </>
              ) : null}

              {history.length > 0 ? (
                <AppText variant="bodyBold" style={{marginBottom: theme.spacing.md}}>
                  {t('syllabus_progressHistory')}
                </AppText>
              ) : null}
            </>
          ) : null
        }
        renderItem={({item, index}) => (
          <View style={styles.historyRow}>
            <View style={{alignItems: 'center'}}>
              <View
                style={[
                  styles.historyDot,
                  {backgroundColor: progressBarColor(item.completionPercentage)},
                ]}
              />
              {index < history.length - 1 ? (
                <View style={[styles.historyLine, {backgroundColor: theme.colors.border}]} />
              ) : null}
            </View>
            <View style={{flex: 1}}>
              <Row justify="space-between">
                <AppText variant="caption" color="textSecondary">
                  {item.progressDate}
                </AppText>
                <AppText variant="bodyBold">{Math.round(item.completionPercentage)}%</AppText>
              </Row>
              {item.remarks ? (
                <AppText variant="caption" color="textSecondary">
                  {item.remarks}
                </AppText>
              ) : null}
            </View>
          </View>
        )}
      />
    </Screen>
  );
}
