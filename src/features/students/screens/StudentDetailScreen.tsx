/** Student detail — profile, academic, parent, fee & documents + delete. */
import React, {useState} from 'react';
import {Linking, RefreshControl, ScrollView, View, StyleSheet} from 'react-native';
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
  CustomModal,
  Avatar,
  Badge,
  Row,
  Spacer,
  SectionTitle,
  Loader,
  EmptyState,
} from '../../../shared/components';
import {feeStatusTone, statusTone, capitalize} from '../../../shared/helpers';
import {formatDate, formatCurrency} from '../../../core/utils/format';
import {useStudent, useDeleteStudent} from '../students.service';
import {useStudentFee} from '../../fees/fees.service';
import type {AdminStackParamList} from '../../../navigation/types';
import {ScreenNames} from '../../../navigation/ScreenNames';

type Nav = NativeStackNavigationProp<AdminStackParamList>;

function AttendanceBar({percentage}: {percentage: number}): React.JSX.Element {
  const {theme} = useTheme();
  const styles = useThemedStyles(t2 => ({
    track: {
      height: 8,
      borderRadius: t2.radius.pill,
      backgroundColor: t2.colors.surfaceVariant,
      overflow: 'hidden',
      marginTop: t2.spacing.xs,
    },
  }));
  const clamped = Math.max(0, Math.min(100, percentage));
  const tone = clamped >= 75 ? theme.colors.success : clamped >= 50 ? theme.colors.warning : theme.colors.error;
  return (
    <View style={styles.track}>
      <View style={{width: `${clamped}%`, height: '100%', backgroundColor: tone}} />
    </View>
  );
}

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
  const {t} = useLanguage();
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<AdminStackParamList, 'StudentDetail'>>();
  const {id, initial} = route.params;

  const {data: student, isLoading, isRefetching, isError, error, refetch} = useStudent(id, initial);
  const {data: fee} = useStudentFee(id);
  const deleteMutation = useDeleteStudent();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const styles = useThemedStyles(t2 => ({
    scrollContent: {
      padding: t2.spacing.lg,
    },
    avatarBlock: {
      flex: 1,
    },
    modalButtonWrap: {
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
  if (isLoading || !student) {
    return <Loader message={t('studentDetail_loadingStudent')} />;
  }

  const onDelete = (): void => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        setConfirmOpen(false);
        navigation.goBack();
      },
    });
  };

  return (
    <Screen padded={false}>
      <CustomHeader
        title={t('studentDetail_headerTitle')}
        onBack={() => navigation.goBack()}
        actions={[{icon: 'edit', onPress: () => navigation.navigate(ScreenNames.StudentForm, {id})}]}
      />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />}>
        <CustomCard>
          <Row gap={theme.spacing.md}>
            <Avatar name={student.name} uri={student.avatarUrl} size={72} />
            <View style={styles.avatarBlock}>
              <AppText variant="h2">{student.name}</AppText>
              <AppText variant="caption" color="textSecondary">
                {t('studentDetail_admissionNo')} · {student.admissionNo}
              </AppText>
              <Spacer size={6} />
              <Badge label={capitalize(student.status)} tone={statusTone(student.status)} />
            </View>
          </Row>
        </CustomCard>

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
          <Row justify="space-between" style={infoRowStyles.row}>
            <AppText variant="body" color="textSecondary">
              {t('common_phone')}
            </AppText>
            <AppText variant="body" color="primary" onPress={() => Linking.openURL(`tel:${student.parentPhone}`)}>
              {student.parentPhone}
            </AppText>
          </Row>
          <Row justify="space-between" style={infoRowStyles.row}>
            <AppText variant="body" color="textSecondary">
              {t('common_email')}
            </AppText>
            <AppText variant="body" color="primary" onPress={() => Linking.openURL(`mailto:${student.parentEmail}`)}>
              {student.parentEmail}
            </AppText>
          </Row>
        </CustomCard>

        <SectionTitle title={t('studentDetail_academicSection')} />
        <CustomCard>
          <InfoRow label={t('studentDetail_class')} value={student.className} />
          <InfoRow label={t('studentDetail_section')} value={student.sectionName} />
          <InfoRow label={t('studentDetail_rollNo')} value={String(student.rollNo)} />
          <Spacer size={4} />
          <Row justify="space-between">
            <AppText variant="body" color="textSecondary">
              {t('studentDetail_attendance')}
            </AppText>
            <AppText variant="body">{`${student.attendancePercentage}%`}</AppText>
          </Row>
          <AttendanceBar percentage={student.attendancePercentage} />
        </CustomCard>

        {fee ? (
          <>
            <SectionTitle title={t('studentDetail_feeSection')} />
            <CustomCard>
              <Row justify="space-between" align="center">
                <View>
                  <AppText variant="caption" color="textSecondary">
                    {t('studentDetail_dueAmount')}
                  </AppText>
                  <AppText variant="h2" color="error">
                    {formatCurrency(fee.dueAmount)}
                  </AppText>
                </View>
                <Badge label={capitalize(fee.status)} tone={feeStatusTone(fee.status)} />
              </Row>
            </CustomCard>
          </>
        ) : null}

        {student.documents.length > 0 ? (
          <>
            <SectionTitle title={t('studentDetail_documentsSection')} />
            <CustomCard>
              {student.documents.map(doc => (
                <InfoRow key={doc.id} label={doc.title} value="" />
              ))}
            </CustomCard>
          </>
        ) : null}

        <Spacer size={16} />
        <CustomButton
          title={t('studentDetail_deleteStudent')}
          variant="danger"
          iconLeft="delete"
          onPress={() => setConfirmOpen(true)}
        />
        <Spacer size={24} />
      </ScrollView>

      <CustomModal
        visible={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title={t('studentDetail_deleteStudent')}>
        <AppText variant="body" color="textSecondary">
          {t('studentDetail_deleteConfirm', {name: student.name})}
        </AppText>
        <Spacer size={16} />
        <Row gap={theme.spacing.md}>
          <View style={styles.modalButtonWrap}>
            <CustomButton
              title={t('common_cancel')}
              variant="outline"
              onPress={() => setConfirmOpen(false)}
            />
          </View>
          <View style={styles.modalButtonWrap}>
            <CustomButton
              title={t('common_delete')}
              variant="danger"
              loading={deleteMutation.isPending}
              onPress={onDelete}
            />
          </View>
        </Row>
      </CustomModal>
    </Screen>
  );
}
