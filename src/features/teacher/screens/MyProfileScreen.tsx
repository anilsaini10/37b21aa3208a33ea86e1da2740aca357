/** My Profile — teacher's own read-only HR details (qualification, experience, subjects taught, class teacher assignment). */
import React from 'react';
import {RefreshControl, ScrollView, StyleSheet, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme, useThemedStyles} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {
  Screen,
  AppText,
  CustomHeader,
  CustomCard,
  ProfileHero,
  Badge,
  Row,
  Spacer,
  SectionTitle,
  Loader,
  EmptyState,
} from '../../../shared/components';
import {capitalize} from '../../../shared/helpers';
import {formatDate, formatCurrency} from '../../../core/utils/format';
import {useTeacherOwnProfile} from '../teacherOwnProfile.service';
import type {TeacherStackParamList} from '../../../navigation/types';

type Nav = NativeStackNavigationProp<TeacherStackParamList>;

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

export function MyProfileScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const navigation = useNavigation<Nav>();
  const styles = useThemedStyles(t2 => ({
    content: {
      padding: t2.spacing.lg,
    },
  }));

  const {data: teacher, isLoading, isRefetching, isError, error, refetch} = useTeacherOwnProfile();

  if (isError) {
    return (
      <Screen padded={false}>
        <CustomHeader title={t('teacherMyProfile_title')} onBack={() => navigation.goBack()} />
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

  if (isLoading || !teacher) {
    return (
      <Screen padded={false}>
        <CustomHeader title={t('teacherMyProfile_title')} onBack={() => navigation.goBack()} />
        <Loader message={t('teacherMyProfile_loading')} />
      </Screen>
    );
  }

  return (
    <Screen padded={false}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />}>
        <ProfileHero
          name={teacher.name}
          avatarUri={teacher.avatarUrl}
          lines={[teacher.employeeId]}
          badgeLabel={capitalize(teacher.status)}
          onBack={() => navigation.goBack()}
          title={t('teacherMyProfile_title')}
        />

        <View style={styles.content}>
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
            <InfoRow label={t('teacherDetail_qualification')} value={teacher.qualification} />
            <InfoRow
              label={t('teacherDetail_experience')}
              value={t('teacherDetail_experienceValue', {years: teacher.experienceYears, months: teacher.experienceMonths})}
            />
            <InfoRow label={t('teacherDetail_performanceScore')} value={String(teacher.performanceScore)} />
          </CustomCard>

          <SectionTitle title={t('teacherDetail_subjectsTaughtSection')} />
          <CustomCard>
            {teacher.subjectsTaught.length === 0 ? (
              <AppText variant="caption" color="textMuted">
                {t('teacherDetail_noSubjectsTaught')}
              </AppText>
            ) : (
              <Row gap={theme.spacing.xs} wrap>
                {teacher.subjectsTaught.map(s => (
                  <Badge key={s} label={s} tone="primary" />
                ))}
              </Row>
            )}
          </CustomCard>

          <SectionTitle title={t('teacherMyProfile_classTeacherSection')} />
          <CustomCard>
            {teacher.classTeacherOf.length === 0 ? (
              <AppText variant="caption" color="textMuted">
                {t('teacherMyProfile_noClassTeacherAssignment')}
              </AppText>
            ) : (
              teacher.classTeacherOf.map((section, i) => (
                <View key={section.sectionId}>
                  {i > 0 ? <Spacer size={4} /> : null}
                  <AppText variant="body">
                    {section.className} - {section.sectionName}
                  </AppText>
                </View>
              ))
            )}
          </CustomCard>

          <Spacer size={24} />
        </View>
      </ScrollView>
    </Screen>
  );
}
