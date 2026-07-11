/** Teacher detail — profile, contact, employment info, and subject/class assignments. */
import React from 'react';
import {RefreshControl, ScrollView, View, StyleSheet} from 'react-native';
import {useNavigation, useRoute, type RouteProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme, useThemedStyles} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {
  Screen,
  AppText,
  CustomHeader,
  CustomCard,
  Avatar,
  Badge,
  Row,
  Spacer,
  SectionTitle,
  Loader,
  EmptyState,
} from '../../../shared/components';
import {statusTone, capitalize} from '../../../shared/helpers';
import {formatDate, formatCurrency} from '../../../core/utils/format';
import {useTeacher} from '../teachers.service';
import type {AdminStackParamList} from '../../../navigation/types';

type Nav = NativeStackNavigationProp<AdminStackParamList>;

const infoRowStyles = StyleSheet.create({
  row: {
    paddingVertical: 4,
  },
});

function InfoRow({label, value}: {label: string; value: string}): React.JSX.Element {
  return (
    <Row justify="space-between" style={infoRowStyles.row}>
      <AppText variant="body" color="textSecondary">
        {label}
      </AppText>
      <AppText variant="body">{value}</AppText>
    </Row>
  );
}

export function TeacherDetailScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<AdminStackParamList, 'TeacherDetail'>>();
  const {teacherId, initial} = route.params;

  const {data: teacher, isLoading, isRefetching, isError, error, refetch} = useTeacher(teacherId, initial);
  const styles = useThemedStyles(t2 => ({
    scrollContent: {
      padding: t2.spacing.lg,
    },
    avatarBlock: {
      flex: 1,
    },
  }));

  if (isError) {
    return (
      <EmptyState
        icon="warning"
        title={t('common_somethingWentWrong')}
        message={(error as {message?: string} | null)?.message ?? t('common_checkConnection')}
        actionLabel={t('common_retry')}
        onAction={() => refetch()}
      />
    );
  }
  if (isLoading || !teacher) {
    return <Loader message={t('teacherDetail_loadingTeacher')} />;
  }

  return (
    <Screen padded={false}>
      <CustomHeader title={t('teacherDetail_headerTitle')} onBack={() => navigation.goBack()} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />}>
        <CustomCard>
          <Row gap={theme.spacing.md}>
            <Avatar name={teacher.name} uri={teacher.avatarUrl} size={72} />
            <View style={styles.avatarBlock}>
              <AppText variant="h2">{teacher.name}</AppText>
              <AppText variant="caption" color="textSecondary">
                {t('teacherDetail_employeeId')} · {teacher.employeeId}
              </AppText>
              <Spacer size={6} />
              <Badge label={capitalize(teacher.status)} tone={statusTone(teacher.status)} />
            </View>
          </Row>
        </CustomCard>

        <SectionTitle title={t('teacherDetail_contactSection')} />
        <CustomCard>
          <InfoRow label={t('common_email')} value={teacher.email} />
          <InfoRow label={t('common_phone')} value={teacher.phone ?? '—'} />
          <InfoRow label={t('teacherDetail_gender')} value={capitalize(teacher.gender)} />
        </CustomCard>

        <SectionTitle title={t('teacherDetail_employmentSection')} />
        <CustomCard>
          <InfoRow label={t('teacherForm_joiningDateLabel')} value={formatDate(teacher.joiningDate)} />
          <InfoRow label={t('teacherForm_salaryLabel')} value={formatCurrency(teacher.salary)} />
          <InfoRow label={t('teacherDetail_performanceScore')} value={String(teacher.performanceScore)} />
        </CustomCard>

        <SectionTitle title={t('teacherDetail_subjectsSection')} />
        <CustomCard>
          {teacher.subjects.length === 0 ? (
            <AppText variant="caption" color="textMuted">
              {t('teacherDetail_noSubjects')}
            </AppText>
          ) : (
            teacher.subjects.map((s, index) => (
              <View key={`${s.subjectId}_${s.classId}`}>
                {index > 0 ? <Spacer size={4} /> : null}
                <InfoRow label={s.name} value={s.className} />
              </View>
            ))
          )}
        </CustomCard>

        <Spacer size={24} />
      </ScrollView>
    </Screen>
  );
}
