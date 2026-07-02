/** Parent fees — invoice summary, fee breakdown, pay + receipt actions. */
import React, {useState} from 'react';
import {View, ScrollView} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme} from '../../../core/theme';
import {
  Screen,
  AppText,
  CustomHeader,
  CustomCard,
  CustomButton,
  CustomInput,
  CustomModal,
  Badge,
  SectionTitle,
  EmptyState,
  Loader,
  Row,
  Spacer,
  Divider,
} from '../../../shared/components';
import {formatCurrency} from '../../../core/utils/format';
import {feeStatusTone, capitalize} from '../../../shared/helpers';
import {db} from '../../../core/mock/db';
import {useStudentFee, usePayFee} from '../fees.service';
import type {ParentStackParamList} from '../../../navigation/types';
import type {FeePayment} from '../../../shared/types';

type Nav = NativeStackNavigationProp<ParentStackParamList>;
type PayMethod = FeePayment['method'];

const METHODS: {key: Extract<PayMethod, 'upi' | 'card' | 'netbanking'>; label: string}[] = [
  {key: 'upi', label: 'UPI'},
  {key: 'card', label: 'Card'},
  {key: 'netbanking', label: 'Net Banking'},
];

export function ParentFeesScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const navigation = useNavigation<Nav>();
  const child = db.students[0];
  const {data: invoice, isLoading} = useStudentFee(child.id);
  const payMutation = usePayFee();

  const [modalVisible, setModalVisible] = useState(false);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<PayMethod>('upi');

  if (isLoading) {
    return <Loader message="Loading fees…" />;
  }

  if (!invoice) {
    return (
      <Screen padded={false}>
        <CustomHeader title="Fees" />
        <EmptyState
          title="No fee record"
          message="There is no fee invoice for your child yet."
          icon="fee"
        />
      </Screen>
    );
  }

  const openPay = (): void => {
    setAmount(String(invoice.dueAmount));
    setMethod('upi');
    setModalVisible(true);
  };

  const confirmPay = (): void => {
    payMutation.mutate({invoiceId: invoice.id, amount: Number(amount), method});
    setModalVisible(false);
  };

  return (
    <Screen padded={false}>
      <CustomHeader title="Fees" />
      <ScrollView
        contentContainerStyle={{padding: theme.spacing.lg}}
        showsVerticalScrollIndicator={false}>
        <CustomCard>
          <Row justify="space-between" align="flex-start">
            <View>
              <AppText variant="caption" color="textSecondary">
                Total
              </AppText>
              <AppText variant="h2">{formatCurrency(invoice.totalAmount)}</AppText>
            </View>
            <Badge label={capitalize(invoice.status)} tone={feeStatusTone(invoice.status)} />
          </Row>
          <Divider />
          <Row justify="space-between">
            <View>
              <AppText variant="caption" color="textSecondary">
                Paid
              </AppText>
              <AppText variant="bodyBold" color="success">
                {formatCurrency(invoice.paidAmount)}
              </AppText>
            </View>
            <View style={{alignItems: 'flex-end'}}>
              <AppText variant="caption" color="textSecondary">
                Due
              </AppText>
              <AppText variant="bodyBold" color="error">
                {formatCurrency(invoice.dueAmount)}
              </AppText>
            </View>
          </Row>
        </CustomCard>

        <SectionTitle title="Fee Structure" />
        <CustomCard>
          {invoice.categories.map((cat, i) => (
            <View key={cat.id}>
              {i > 0 ? <Divider /> : null}
              <Row justify="space-between">
                <AppText variant="body">{cat.name}</AppText>
                <AppText variant="bodyBold">{formatCurrency(cat.amount)}</AppText>
              </Row>
            </View>
          ))}
        </CustomCard>

        <Spacer size={theme.spacing.md} />
        <CustomButton
          title="Pay Now"
          disabled={invoice.dueAmount === 0}
          loading={payMutation.isPending}
          onPress={openPay}
        />
        <Spacer size={theme.spacing.sm} />
        <CustomButton
          title="Download Receipt"
          variant="outline"
          onPress={() => navigation.navigate('FeeReceipt', {invoiceId: invoice.id})}
        />
        <Spacer size={24} />
      </ScrollView>

      <CustomModal visible={modalVisible} onClose={() => setModalVisible(false)} title="Pay Fees">
        <CustomInput
          label="Amount"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
          iconLeft="money"
        />
        <AppText variant="label" color="textSecondary">
          Payment Method
        </AppText>
        <Row gap={theme.spacing.sm}>
          {METHODS.map(m => (
            <View key={m.key} style={{flex: 1}}>
              <CustomButton
                title={m.label}
                size="sm"
                variant={method === m.key ? 'primary' : 'outline'}
                onPress={() => setMethod(m.key)}
              />
            </View>
          ))}
        </Row>
        <CustomButton title="Confirm Payment" onPress={confirmPay} />
      </CustomModal>
    </Screen>
  );
}
