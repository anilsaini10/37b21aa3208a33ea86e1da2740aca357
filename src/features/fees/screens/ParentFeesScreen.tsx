/** Parent fees — invoice summary, fee breakdown, pay + receipt actions. */
import React, {useState} from 'react';
import {View, ScrollView} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme, useThemedStyles} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import type {TranslationKey} from '../../../core/i18n';
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
import {feeStatusTone} from '../../../shared/helpers';
import {db} from '../../../core/mock/db';
import {useStudentFee, usePayFee} from '../fees.service';
import type {ParentStackParamList} from '../../../navigation/types';
import {ScreenNames} from '../../../navigation/ScreenNames';
import type {FeePayment, FeeStatus} from '../../../shared/types';

type Nav = NativeStackNavigationProp<ParentStackParamList>;
type PayMethod = FeePayment['method'];

const FEE_STATUS_KEY: Record<FeeStatus, TranslationKey> = {
  paid: 'fees_paid',
  pending: 'fees_pending',
  partial: 'fees_partial',
  overdue: 'fees_overdue',
};

export function ParentFeesScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const navigation = useNavigation<Nav>();
  const {t} = useLanguage();
  const child = db.students[0];
  const {data: invoice, isLoading} = useStudentFee(child.id);
  const payMutation = usePayFee();
  const styles = useThemedStyles(t2 => ({
    scrollContent: {
      padding: t2.spacing.lg,
    },
    dueBlock: {
      alignItems: 'flex-end',
    },
    methodWrapper: {
      flex: 1,
    },
  }));

  const METHODS: {key: Extract<PayMethod, 'upi' | 'card' | 'netbanking'>; label: string}[] = [
    {key: 'upi', label: t('parentFees_methodUpi')},
    {key: 'card', label: t('parentFees_methodCard')},
    {key: 'netbanking', label: t('parentFees_methodNetBanking')},
  ];

  const [modalVisible, setModalVisible] = useState(false);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<PayMethod>('upi');

  if (isLoading) {
    return <Loader message={t('parentFees_loadingFees')} />;
  }

  if (!invoice) {
    return (
      <Screen padded={false}>
        <CustomHeader title={t('parentFees_headerTitle')} />
        <EmptyState
          title={t('parentFees_noFeeRecord')}
          message={t('parentFees_noFeeRecordMessage')}
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
      <CustomHeader title={t('parentFees_headerTitle')} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <CustomCard>
          <Row justify="space-between" align="flex-start">
            <View>
              <AppText variant="caption" color="textSecondary">
                {t('feeReceipt_total')}
              </AppText>
              <AppText variant="h2">{formatCurrency(invoice.totalAmount)}</AppText>
            </View>
            <Badge label={t(FEE_STATUS_KEY[invoice.status])} tone={feeStatusTone(invoice.status)} />
          </Row>
          <Divider />
          <Row justify="space-between">
            <View>
              <AppText variant="caption" color="textSecondary">
                {t('fees_paid')}
              </AppText>
              <AppText variant="bodyBold" color="success">
                {formatCurrency(invoice.paidAmount)}
              </AppText>
            </View>
            <View style={styles.dueBlock}>
              <AppText variant="caption" color="textSecondary">
                {t('parentFees_due')}
              </AppText>
              <AppText variant="bodyBold" color="error">
                {formatCurrency(invoice.dueAmount)}
              </AppText>
            </View>
          </Row>
        </CustomCard>

        <SectionTitle title={t('parentFees_feeStructure')} />
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
          title={t('parentFees_payNow')}
          disabled={invoice.dueAmount === 0}
          loading={payMutation.isPending}
          onPress={openPay}
        />
        <Spacer size={theme.spacing.sm} />
        <CustomButton
          title={t('parentFees_downloadReceipt')}
          variant="outline"
          onPress={() => navigation.navigate(ScreenNames.FeeReceipt, {invoiceId: invoice.id})}
        />
        <Spacer size={24} />
      </ScrollView>

      <CustomModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={t('parentFees_payFeesModalTitle')}>
        <CustomInput
          label={t('common_amount')}
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
          iconLeft="money"
        />
        <AppText variant="label" color="textSecondary">
          {t('parentFees_paymentMethod')}
        </AppText>
        <Row gap={theme.spacing.sm}>
          {METHODS.map(m => (
            <View key={m.key} style={styles.methodWrapper}>
              <CustomButton
                title={m.label}
                size="sm"
                variant={method === m.key ? 'primary' : 'outline'}
                onPress={() => setMethod(m.key)}
              />
            </View>
          ))}
        </Row>
        <CustomButton title={t('parentFees_confirmPayment')} onPress={confirmPay} />
      </CustomModal>
    </Screen>
  );
}
