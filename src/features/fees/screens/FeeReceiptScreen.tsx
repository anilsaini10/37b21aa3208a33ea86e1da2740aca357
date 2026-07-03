/** Fee receipt — shared (admin & parent). Reads {invoiceId} from route params. */
import React from 'react';
import {ScrollView, View} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useTheme} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import type {TranslationKey} from '../../../core/i18n';
import {
  Screen,
  AppText,
  CustomHeader,
  CustomCard,
  CustomButton,
  Badge,
  Divider,
  Row,
  Icon,
  Loader,
  EmptyState,
} from '../../../shared/components';
import {formatCurrency, formatDate} from '../../../core/utils/format';
import {feeStatusTone} from '../../../shared/helpers';
import {useFees} from '../fees.service';
import type {FeeStatus} from '../../../shared/types';

const FEE_STATUS_KEY: Record<FeeStatus, TranslationKey> = {
  paid: 'fees_paid',
  pending: 'fees_pending',
  partial: 'fees_partial',
  overdue: 'fees_overdue',
};

export function FeeReceiptScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const {invoiceId} = (route.params ?? {}) as {invoiceId: string};
  const {t} = useLanguage();

  // Reuse the (already-cached) invoice list to find this receipt.
  const {data, isLoading} = useFees({pageSize: 200});
  const invoice = data?.items.find(i => i.id === invoiceId);

  if (isLoading) {
    return <Loader message={t('feeReceipt_loadingReceipt')} />;
  }
  if (!invoice) {
    return (
      <Screen padded={false}>
        <CustomHeader title={t('feeReceipt_notFoundHeaderTitle')} onBack={() => navigation.goBack()} />
        <EmptyState title={t('feeReceipt_notFound')} icon="fee" />
      </Screen>
    );
  }

  const LineItem = ({label, value, bold}: {label: string; value: string; bold?: boolean}) => (
    <Row justify="space-between" style={{marginVertical: theme.spacing.xs}}>
      <AppText variant={bold ? 'bodyBold' : 'caption'} color={bold ? 'text' : 'textSecondary'}>
        {label}
      </AppText>
      <AppText variant={bold ? 'bodyBold' : 'caption'}>{value}</AppText>
    </Row>
  );

  return (
    <Screen padded={false}>
      <CustomHeader title={t('feeReceipt_headerTitle')} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{padding: theme.spacing.lg}}>
        <CustomCard>
          <View style={{alignItems: 'center', marginBottom: theme.spacing.md}}>
            <Icon name="class" size={36} color={theme.colors.primary} />
            <AppText variant="h3">Greenwood School</AppText>
            <AppText variant="label" color="textMuted">
              {t('feeReceipt_receiptNumber', {id: invoice.id.toUpperCase()})}
            </AppText>
            <View style={{marginTop: theme.spacing.xs}}>
              <Badge label={t(FEE_STATUS_KEY[invoice.status])} tone={feeStatusTone(invoice.status)} />
            </View>
          </View>
          <Divider />
          <LineItem label={t('feeReceipt_student')} value={invoice.studentName} />
          <LineItem label={t('feeReceipt_class')} value={invoice.className} />
          <LineItem label={t('feeReceipt_dueDate')} value={formatDate(invoice.dueDate)} />
          <Divider />
          {invoice.categories.map(cat => (
            <LineItem key={cat.id} label={cat.name} value={formatCurrency(cat.amount)} />
          ))}
          <Divider />
          <LineItem label={t('feeReceipt_total')} value={formatCurrency(invoice.totalAmount)} bold />
          <LineItem label={t('fees_paid')} value={formatCurrency(invoice.paidAmount)} />
          <LineItem label={t('feeReceipt_balanceDue')} value={formatCurrency(invoice.dueAmount)} bold />
        </CustomCard>

        <View style={{height: theme.spacing.lg}} />
        <CustomButton title={t('feeReceipt_downloadPdf')} iconLeft="download" onPress={() => undefined} />
      </ScrollView>
    </Screen>
  );
}
