/** Leave application + history — shared (teacher & parent). */
import React, {useState} from 'react';
import {ScrollView, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useTheme} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {
  Screen,
  AppText,
  CustomHeader,
  CustomCard,
  CustomInput,
  CustomButton,
  DatePicker,
  Badge,
  SectionTitle,
  Spacer,
} from '../../../shared/components';
import {formatDate} from '../../../core/utils/format';
import {generateId} from '../../../core/utils/misc';
import {useAuthStore} from '../../auth/authStore';
import type {LeaveApplication} from '../../../shared/types';
import type {BadgeTone} from '../../../shared/components';

function leaveTone(status: LeaveApplication['status']): BadgeTone {
  return status === 'approved' ? 'success' : status === 'rejected' ? 'error' : 'warning';
}

export function LeaveScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const navigation = useNavigation();
  const user = useAuthStore(s => s.user);

  const leaveStatusLabel = (status: LeaveApplication['status']) =>
    status === 'approved' ? t('leave_approved') : status === 'rejected' ? t('leave_rejected') : t('leave_pending');

  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [reason, setReason] = useState('');
  const [history, setHistory] = useState<LeaveApplication[]>([
    {
      id: 'lv_seed',
      applicantId: 'me',
      applicantName: user?.name ?? 'You',
      applicantRole: user?.role ?? 'teacher',
      fromDate: '2026-06-10',
      toDate: '2026-06-12',
      reason: 'Family function',
      status: 'approved',
      appliedAt: '2026-06-05',
    },
  ]);

  const apply = () => {
    if (!fromDate || !toDate || !reason.trim()) {
      return;
    }
    const application: LeaveApplication = {
      id: generateId('lv'),
      applicantId: 'me',
      applicantName: user?.name ?? 'You',
      applicantRole: user?.role ?? 'teacher',
      fromDate,
      toDate,
      reason: reason.trim(),
      status: 'pending',
      appliedAt: new Date().toISOString(),
    };
    setHistory(prev => [application, ...prev]);
    setFromDate('');
    setToDate('');
    setReason('');
  };

  return (
    <Screen padded={false}>
      <CustomHeader title={t('leave_title')} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{padding: theme.spacing.lg}} showsVerticalScrollIndicator={false}>
        <CustomCard>
          <AppText variant="h3">{t('leave_applyForLeave')}</AppText>
          <Spacer size={12} />
          <DatePicker label={t('leave_from')} value={fromDate} onChange={setFromDate} />
          <DatePicker label={t('leave_to')} value={toDate} onChange={setToDate} />
          <CustomInput
            label={t('leave_reason')}
            placeholder={t('leave_reasonPlaceholder')}
            multiline
            value={reason}
            onChangeText={setReason}
            required
          />
          <CustomButton title={t('leave_submitApplication')} onPress={apply} />
        </CustomCard>

        <SectionTitle title={t('leave_history')} />
        {history.map(item => (
          <CustomCard key={item.id} style={{marginBottom: theme.spacing.md}}>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
              <AppText variant="bodyBold">
                {formatDate(item.fromDate)} – {formatDate(item.toDate)}
              </AppText>
              <Badge label={leaveStatusLabel(item.status)} tone={leaveTone(item.status)} />
            </View>
            <AppText variant="caption" color="textSecondary">
              {item.reason}
            </AppText>
          </CustomCard>
        ))}
      </ScrollView>
    </Screen>
  );
}
