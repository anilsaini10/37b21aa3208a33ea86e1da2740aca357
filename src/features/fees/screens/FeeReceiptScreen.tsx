/** Fee receipt — shared (admin & parent). Reads {invoiceId} from route params. */
import React from 'react';
import {ScrollView, View} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useTheme} from '../../../core/theme';
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
import {capitalize, feeStatusTone} from '../../../shared/helpers';
import {useFees} from '../fees.service';

export function FeeReceiptScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const {invoiceId} = (route.params ?? {}) as {invoiceId: string};

  // Reuse the (already-cached) invoice list to find this receipt.
  const {data, isLoading} = useFees({pageSize: 200});
  const invoice = data?.items.find(i => i.id === invoiceId);

  if (isLoading) {
    return <Loader message="Loading receipt…" />;
  }
  if (!invoice) {
    return (
      <Screen padded={false}>
        <CustomHeader title="Receipt" onBack={() => navigation.goBack()} />
        <EmptyState title="Receipt not found" icon="fee" />
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
      <CustomHeader title="Fee Receipt" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{padding: theme.spacing.lg}}>
        <CustomCard>
          <View style={{alignItems: 'center', marginBottom: theme.spacing.md}}>
            <Icon name="class" size={36} color={theme.colors.primary} />
            <AppText variant="h3">Greenwood School</AppText>
            <AppText variant="label" color="textMuted">
              Fee Receipt · {invoice.id.toUpperCase()}
            </AppText>
            <View style={{marginTop: theme.spacing.xs}}>
              <Badge label={capitalize(invoice.status)} tone={feeStatusTone(invoice.status)} />
            </View>
          </View>
          <Divider />
          <LineItem label="Student" value={invoice.studentName} />
          <LineItem label="Class" value={invoice.className} />
          <LineItem label="Due Date" value={formatDate(invoice.dueDate)} />
          <Divider />
          {invoice.categories.map(cat => (
            <LineItem key={cat.id} label={cat.name} value={formatCurrency(cat.amount)} />
          ))}
          <Divider />
          <LineItem label="Total" value={formatCurrency(invoice.totalAmount)} bold />
          <LineItem label="Paid" value={formatCurrency(invoice.paidAmount)} />
          <LineItem label="Balance Due" value={formatCurrency(invoice.dueAmount)} bold />
        </CustomCard>

        <View style={{height: theme.spacing.lg}} />
        <CustomButton title="Download PDF" iconLeft="download" onPress={() => undefined} />
      </ScrollView>
    </Screen>
  );
}
