/** Student detail — profile, academic, parent, fee & documents + delete. */
import React, {useState} from 'react';
import {ScrollView, View} from 'react-native';
import {useNavigation, useRoute, type RouteProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme} from '../../../core/theme';
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
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<AdminStackParamList, 'StudentDetail'>>();
  const {id} = route.params;

  const {data: student, isLoading} = useStudent(id);
  const {data: fee} = useStudentFee(id);
  const deleteMutation = useDeleteStudent();
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (isLoading || !student) {
    return <Loader message="Loading student…" />;
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
        title="Student"
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
                Admission No · {student.admissionNo}
              </AppText>
              <Spacer size={6} />
              <Badge label={capitalize(student.status)} tone={statusTone(student.status)} />
            </View>
          </Row>
        </CustomCard>

        <SectionTitle title="Personal" />
        <CustomCard>
          <InfoRow label="Gender" value={capitalize(student.gender)} />
          <InfoRow label="Date of Birth" value={formatDate(student.dateOfBirth)} />
          <InfoRow label="Blood Group" value={student.bloodGroup ?? '—'} />
          <InfoRow label="Address" value={student.address ?? '—'} />
        </CustomCard>

        <SectionTitle title="Parent / Guardian" />
        <CustomCard>
          <InfoRow label="Name" value={student.parentName} />
          <InfoRow label="Phone" value={student.parentPhone} />
        </CustomCard>

        <SectionTitle title="Academic" />
        <CustomCard>
          <InfoRow label="Class" value={student.className} />
          <InfoRow label="Section" value={student.sectionName} />
          <InfoRow label="Roll No" value={String(student.rollNo)} />
          <InfoRow label="Attendance" value={`${student.attendancePercentage}%`} />
        </CustomCard>

        {fee ? (
          <>
            <SectionTitle title="Fee" />
            <CustomCard>
              <Row justify="space-between" align="center">
                <View>
                  <AppText variant="caption" color="textSecondary">
                    Due Amount
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
            <SectionTitle title="Documents" />
            <CustomCard>
              {student.documents.map(doc => (
                <InfoRow key={doc.id} label={doc.title} value="" />
              ))}
            </CustomCard>
          </>
        ) : null}

        <Spacer size={16} />
        <CustomButton
          title="Delete Student"
          variant="danger"
          iconLeft="delete"
          onPress={() => setConfirmOpen(true)}
        />
        <Spacer size={24} />
      </ScrollView>

      <CustomModal
        visible={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Delete Student">
        <AppText variant="body" color="textSecondary">
          Are you sure you want to delete {student.name}? This action cannot be undone.
        </AppText>
        <Spacer size={16} />
        <Row gap={theme.spacing.md}>
          <View style={{flex: 1}}>
            <CustomButton
              title="Cancel"
              variant="outline"
              onPress={() => setConfirmOpen(false)}
            />
          </View>
          <View style={{flex: 1}}>
            <CustomButton
              title="Delete"
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
