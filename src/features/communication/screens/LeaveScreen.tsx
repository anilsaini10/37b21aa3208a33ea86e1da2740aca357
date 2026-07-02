/** Leave application + history — shared (teacher & parent). */
import React, {useState} from 'react';
import {ScrollView, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useTheme} from '../../../core/theme';
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
import {capitalize} from '../../../shared/helpers';
import {generateId} from '../../../core/utils/misc';
import {useAuthStore} from '../../auth/authStore';
import type {LeaveApplication} from '../../../shared/types';
import type {BadgeTone} from '../../../shared/components';

function leaveTone(status: LeaveApplication['status']): BadgeTone {
  return status === 'approved' ? 'success' : status === 'rejected' ? 'error' : 'warning';
}

export function LeaveScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const navigation = useNavigation();
  const user = useAuthStore(s => s.user);

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
      <CustomHeader title="Leave Management" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{padding: theme.spacing.lg}} showsVerticalScrollIndicator={false}>
        <CustomCard>
          <AppText variant="h3">Apply for Leave</AppText>
          <Spacer size={12} />
          <DatePicker label="From" value={fromDate} onChange={setFromDate} />
          <DatePicker label="To" value={toDate} onChange={setToDate} />
          <CustomInput label="Reason" placeholder="Reason for leave" multiline value={reason} onChangeText={setReason} required />
          <CustomButton title="Submit Application" onPress={apply} />
        </CustomCard>

        <SectionTitle title="Leave History" />
        {history.map(item => (
          <CustomCard key={item.id} style={{marginBottom: theme.spacing.md}}>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
              <AppText variant="bodyBold">
                {formatDate(item.fromDate)} – {formatDate(item.toDate)}
              </AppText>
              <Badge label={capitalize(item.status)} tone={leaveTone(item.status)} />
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
