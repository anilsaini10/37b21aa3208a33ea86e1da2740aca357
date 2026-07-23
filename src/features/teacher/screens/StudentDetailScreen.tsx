/** Student detail (teacher view) — read-only profile, parent contact & academic info. */
import React from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {useNavigation, useRoute, type RouteProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme, useThemedStyles} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {
  Screen,
  AppText,
  CustomHeader,
  CustomCard,
  CustomButton,
  Avatar,
  Badge,
  Row,
  Spacer,
  SectionTitle,
} from '../../../shared/components';
import {statusTone, capitalize} from '../../../shared/helpers';
import {formatDate} from '../../../core/utils/format';
import {ScreenNames} from '../../../navigation/ScreenNames';
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

export function StudentDetailScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const styles = useThemedStyles(t2 => ({
    scrollContent: {
      padding: t2.spacing.lg,
    },
    nameBlock: {
      flex: 1,
    },
  }));
  const {t} = useLanguage();
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<TeacherStackParamList, 'StudentDetail'>>();
  const {student} = route.params;

  return (
    <Screen padded={false}>
      <CustomHeader
        title={t('studentDetail_headerTitle')}
        onBack={navigation.canGoBack() ? () => navigation.goBack() : undefined}
      />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <CustomCard>
          <Row gap={theme.spacing.md}>
            <Avatar name={student.name} uri={student.avatarUrl} size={72} />
            <View style={styles.nameBlock}>
              <AppText variant="h2">{student.name}</AppText>
              <AppText variant="caption" color="textSecondary">
                {t('studentDetail_admissionNo')} · {student.admissionNo}
              </AppText>
              <Spacer size={6} />
              <Badge label={capitalize(student.status)} tone={statusTone(student.status)} />
            </View>
          </Row>
        </CustomCard>

        <SectionTitle title={t('studentDetail_academicSection')} />
        <CustomCard>
          <InfoRow label={t('studentDetail_class')} value={student.className} />
          <InfoRow label={t('studentDetail_section')} value={student.sectionName} />
          <InfoRow label={t('studentDetail_rollNo')} value={String(student.rollNo)} />
          <InfoRow label={t('studentDetail_attendance')} value={`${student.attendancePercentage}%`} />
        </CustomCard>
        <CustomButton
          title={t('studentDetail_viewAttendanceHistory')}
          variant="outline"
          size="sm"
          iconLeft="attendance"
          onPress={() =>
            navigation.navigate(ScreenNames.StudentAttendanceHistory, {studentId: student.id, studentName: student.name})
          }
        />

        <SectionTitle title={t('studentDetail_personalSection')} />
        <CustomCard>
          <InfoRow label={t('studentDetail_gender')} value={capitalize(student.gender)} />
          <InfoRow label={t('studentDetail_dateOfBirth')} value={formatDate(student.dateOfBirth)} />
          <InfoRow label={t('studentDetail_bloodGroup')} value={student.bloodGroup ?? '—'} />
          <InfoRow label={t('common_address')} value={student.address ?? '—'} />
        </CustomCard>

        <SectionTitle title={t('studentDetail_parentGuardianSection')} />
        <CustomCard>
          <InfoRow label={t('common_name')} value={student.parentName} />
          <InfoRow label={t('common_phone')} value={student.parentPhone} />
          <InfoRow label={t('common_email')} value={student.parentEmail} />
        </CustomCard>

        <Spacer size={24} />
      </ScrollView>
    </Screen>
  );
}
