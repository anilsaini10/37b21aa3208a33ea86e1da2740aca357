/** Homework detail — a teacher's own homework (view-only here; edit via the existing form), with quick access to submission tracking. */
import React from 'react';
import {View} from 'react-native';
import {useNavigation, useRoute, type RouteProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme, useThemedStyles} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {Screen, CustomHeader, CustomCard, CustomButton, AppText, Row, Spacer, Badge, Loader, EmptyState} from '../../../shared/components';
import type {BadgeTone} from '../../../shared/components';
import {formatDate} from '../../../core/utils/format';
import {capitalize} from '../../../shared/helpers';
import {useTeacherHomeworkItem} from '../teacherHomework.service';
import {ScreenNames} from '../../../navigation/ScreenNames';
import type {TeacherStackParamList} from '../../../navigation/types';
import type {HomeworkType} from '../../../shared/types';

type Nav = NativeStackNavigationProp<TeacherStackParamList>;

const TYPE_TONE: Record<HomeworkType, BadgeTone> = {
  ASSIGNMENT: 'primary',
  PROJECT: 'info',
  READING: 'success',
  PRACTICE: 'warning',
  OTHER: 'neutral',
};

export function HomeworkDetailScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<TeacherStackParamList, 'HomeworkDetail'>>();
  const {homeworkId, initial} = route.params;
  const {data: homework, isLoading, isError, error, refetch} = useTeacherHomeworkItem(homeworkId, initial);

  const styles = useThemedStyles(t2 => ({
    content: {padding: t2.spacing.lg},
    card: {marginBottom: t2.spacing.md},
    titleBlock: {flex: 1},
  }));

  if (isError) {
    return (
      <Screen padded={false}>
        <CustomHeader title={t('homeworkDetail_title')} onBack={() => navigation.goBack()} />
        <EmptyState
          icon="warning"
          title={t('common_somethingWentWrong')}
          message={(error as {message?: string} | null)?.message ?? t('common_checkConnection')}
          actionLabel={t('common_retry')}
          onAction={() => refetch()}
        />
      </Screen>
    );
  }

  if (isLoading || !homework) {
    return <Loader message={t('homeworkDetail_loading')} />;
  }

  return (
    <Screen padded={false}>
      <CustomHeader
        title={t('homeworkDetail_title')}
        onBack={() => navigation.goBack()}
        actions={[
          {icon: 'edit', onPress: () => navigation.navigate(ScreenNames.HomeworkForm, {homeworkId, initial: homework})},
        ]}
      />
      <View style={styles.content}>
        <CustomCard style={styles.card}>
          <Row justify="space-between" align="flex-start">
            <AppText variant="h3" style={styles.titleBlock}>
              {homework.title}
            </AppText>
            <Badge label={capitalize(homework.type.toLowerCase())} tone={TYPE_TONE[homework.type]} />
          </Row>
          <Spacer size={theme.spacing.sm} />
          <AppText variant="caption" color="textSecondary">
            {t('mySchedule_classSection', {className: homework.className, sectionName: homework.sectionName})} ·{' '}
            {homework.subjectName}
          </AppText>
          <Spacer size={theme.spacing.xs} />
          <AppText variant="caption" color="textSecondary">
            {t('homeworkDetail_dueOn', {date: formatDate(homework.dueDate)})}
          </AppText>
          {homework.description ? (
            <>
              <Spacer size={theme.spacing.md} />
              <AppText variant="body">{homework.description}</AppText>
            </>
          ) : null}
        </CustomCard>

        <CustomButton
          title={t('homeworkDetail_trackSubmissions')}
          iconLeft="attendance"
          onPress={() => navigation.navigate(ScreenNames.HomeworkSubmissions, {homeworkId, initial: homework})}
        />
      </View>
    </Screen>
  );
}
