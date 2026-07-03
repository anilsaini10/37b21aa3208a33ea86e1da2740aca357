/** Student detail — profile, academic, parent, fee & documents + delete. */
import React, {useState} from 'react';
import {ScrollView, View} from 'react-native';
import {useNavigation, useRoute, type RouteProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme} from '../../../core/theme';
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
} from '../../../shared/components';
import {feeStatusTone, statusTone, capitalize} from '../../../shared/helpers';
import {formatDate, formatCurrency} from '../../../core/utils/format';
import {useStudent, useDeleteStudent} from '../students.service';
import {useStudentFee} from '../../fees/fees.service';
import type {AdminStackParamList} from '../../../navigation/types';

type Nav = NativeStackNavigationProp<AdminStackParamList>;

function InfoRow({label, value}: {label: string; value: string}): React.JSX.Element {
  return (
    <Row justify="space-between" style={{paddingVertical: 4}}>
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
  const {id} = route.params;

  const {data: student, isLoading} = useStudent(id);
  const {data: fee} = useStudentFee(id);
  const deleteMutation = useDeleteStudent();
  const [confirmOpen, setConfirmOpen] = useState(false);

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
        actions={[{icon: 'edit', onPress: () => navigation.navigate('StudentForm', {id})}]}
      />
      <ScrollView
        contentContainerStyle={{padding: theme.spacing.lg}}
        showsVerticalScrollIndicator={false}>
        <CustomCard>
          <Row gap={theme.spacing.md}>
            <Avatar name={student.name} uri={student.avatarUrl} size={72} />
            <View style={{flex: 1}}>
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
          <InfoRow label={t('common_phone')} value={student.parentPhone} />
        </CustomCard>

        <SectionTitle title={t('studentDetail_academicSection')} />
        <CustomCard>
          <InfoRow label={t('studentDetail_class')} value={student.className} />
          <InfoRow label={t('studentDetail_section')} value={student.sectionName} />
          <InfoRow label={t('studentDetail_rollNo')} value={String(student.rollNo)} />
          <InfoRow label={t('studentDetail_attendance')} value={`${student.attendancePercentage}%`} />
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
          <View style={{flex: 1}}>
            <CustomButton
              title={t('common_cancel')}
              variant="outline"
              onPress={() => setConfirmOpen(false)}
            />
          </View>
          <View style={{flex: 1}}>
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
