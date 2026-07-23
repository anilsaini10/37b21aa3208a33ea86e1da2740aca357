/** Staff detail — profile, contact, employment info, plus Edit and Delete (confirm first). */
import React, {useState} from 'react';
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
  CustomModal,
  CustomButton,
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
import {useStaffMember, useDeleteStaff} from '../adminStaff.service';
import {ScreenNames} from '../../../navigation/ScreenNames';
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

export function StaffDetailScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<AdminStackParamList, 'StaffDetail'>>();
  const {staffId, initial} = route.params;

  const {data: staff, isLoading, isRefetching, isError, error, refetch} = useStaffMember(staffId, initial);
  const deleteMutation = useDeleteStaff();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | undefined>();

  const styles = useThemedStyles(t2 => ({
    scrollContent: {
      padding: t2.spacing.lg,
    },
    profileBlock: {
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
  if (isLoading || !staff) {
    return <Loader message={t('staffDetail_loadingStaff')} />;
  }

  const confirmDelete = (): void => {
    setDeleteError(undefined);
    deleteMutation.mutate(staff.id, {
      onSuccess: () => {
        setDeleteOpen(false);
        navigation.goBack();
      },
      onError: (e: Error) => setDeleteError(e.message),
    });
  };

  return (
    <Screen padded={false}>
      <CustomHeader
        title={t('teacherDetail_headerTitle')}
        onBack={() => navigation.goBack()}
        actions={[
          {icon: 'edit', onPress: () => navigation.navigate(ScreenNames.StaffForm, {staffId: staff.id, initial: staff})},
          {
            icon: 'delete',
            onPress: () => {
              setDeleteError(undefined);
              setDeleteOpen(true);
            },
          },
        ]}
      />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />}>
        <CustomCard>
          <Row gap={theme.spacing.md}>
            <Avatar name={staff.name} size={72} />
            <View style={styles.profileBlock}>
              <AppText variant="h2">{staff.name}</AppText>
              <AppText variant="caption" color="textSecondary">
                {t('teacherDetail_employeeId')} · {staff.employeeId}
              </AppText>
              <Spacer size={6} />
              <Badge label={capitalize(staff.status)} tone={statusTone(staff.status)} />
            </View>
          </Row>
        </CustomCard>

        <SectionTitle title={t('teacherDetail_contactSection')} />
        <CustomCard>
          {staff.email ? <InfoRow label={t('common_email')} value={staff.email} /> : null}
          <InfoRow label={t('common_phone')} value={staff.phone} />
          <InfoRow label={t('teacherDetail_gender')} value={capitalize(staff.gender)} />
        </CustomCard>

        <SectionTitle title={t('teacherDetail_employmentSection')} />
        <CustomCard>
          <InfoRow label={t('staffForm_designationLabel')} value={staff.designation} />
          <InfoRow label={t('teacherForm_joiningDateLabel')} value={formatDate(staff.joiningDate)} />
          <InfoRow label={t('teacherForm_salaryLabel')} value={formatCurrency(staff.salary)} />
          <InfoRow label={t('teacherDetail_qualification')} value={staff.qualification} />
          <InfoRow
            label={t('teacherDetail_experience')}
            value={t('teacherDetail_experienceValue', {years: staff.experienceYears, months: staff.experienceMonths})}
          />
        </CustomCard>
        <Spacer size={24} />
      </ScrollView>

      <CustomModal visible={deleteOpen} onClose={() => setDeleteOpen(false)} title={t('staffDetail_deleteTitle')}>
        <AppText variant="body" color="textSecondary">
          {t('staffDetail_deleteConfirm', {name: staff.name})}
        </AppText>
        {deleteError ? (
          <AppText variant="caption" color="error" style={{marginTop: theme.spacing.sm}}>
            {deleteError}
          </AppText>
        ) : null}
        <Spacer size={16} />
        <Row gap={theme.spacing.md}>
          <View style={styles.modalButtonWrap}>
            <CustomButton title={t('common_cancel')} variant="outline" onPress={() => setDeleteOpen(false)} />
          </View>
          <View style={styles.modalButtonWrap}>
            <CustomButton
              title={t('common_delete')}
              variant="danger"
              loading={deleteMutation.isPending}
              onPress={confirmDelete}
            />
          </View>
        </Row>
      </CustomModal>
    </Screen>
  );
}
