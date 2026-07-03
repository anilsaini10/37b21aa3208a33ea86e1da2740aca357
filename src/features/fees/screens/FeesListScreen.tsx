/** Fee management — collection summary + invoice list. */
import React from 'react';
import {FlatList, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme, useThemedStyles} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import type {TranslationKey} from '../../../core/i18n';
import {
  Screen,
  CustomHeader,
  StatTile,
  ListRow,
  Badge,
  Row,
  Spacer,
  EmptyState,
  Loader,
} from '../../../shared/components';
import {feeStatusTone} from '../../../shared/helpers';
import {formatCurrency} from '../../../core/utils/format';
import {useFees, useFeeSummary} from '../fees.service';
import type {AdminStackParamList} from '../../../navigation/types';
import {ScreenNames} from '../../../navigation/ScreenNames';
import type {FeeInvoice, FeeStatus, StatCard} from '../../../shared/types';

type Nav = NativeStackNavigationProp<AdminStackParamList>;

const FEE_STATUS_KEY: Record<FeeStatus, TranslationKey> = {
  paid: 'fees_paid',
  pending: 'fees_pending',
  partial: 'fees_partial',
  overdue: 'fees_overdue',
};

export function FeesListScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const navigation = useNavigation<Nav>();
  const {t} = useLanguage();
  const {data: summary, isLoading: summaryLoading} = useFeeSummary();
  const {data: fees, isLoading: feesLoading} = useFees({pageSize: 50});
  const styles = useThemedStyles(t2 => ({
    listContent: {
      padding: t2.spacing.lg,
      flexGrow: 1,
    },
    tileWrapper: {
      flex: 1,
    },
  }));

  if (summaryLoading || feesLoading || !summary || !fees) {
    return <Loader message={t('feesList_loadingFees')} />;
  }

  const tiles: StatCard[] = [
    {
      key: 'collected',
      label: t('feesList_collected'),
      value: formatCurrency(summary.totalCollected),
      icon: 'money',
      accent: 'success',
    },
    {
      key: 'pending',
      label: t('fees_pending'),
      value: formatCurrency(summary.totalPending),
      icon: 'warning',
      accent: 'error',
    },
    {
      key: 'rate',
      label: t('feesList_collectionRate'),
      value: `${summary.collectionRate}%`,
      icon: 'reports',
      accent: 'primary',
    },
  ];

  return (
    <Screen padded={false}>
      <CustomHeader title={t('feesList_headerTitle')} />
      <FlatList
        data={fees.items}
        keyExtractor={(item: FeeInvoice) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <Row gap={theme.spacing.md} align="stretch">
              {tiles.map(tile => (
                <View key={tile.key} style={styles.tileWrapper}>
                  <StatTile stat={tile} />
                </View>
              ))}
            </Row>
            <Spacer size={16} />
          </>
        }
        renderItem={({item}) => (
          <ListRow
            title={item.studentName}
            subtitle={t('feesList_dueSubtitle', {
              className: item.className,
              amount: formatCurrency(item.dueAmount),
            })}
            right={<Badge label={t(FEE_STATUS_KEY[item.status])} tone={feeStatusTone(item.status)} />}
            onPress={() => navigation.navigate(ScreenNames.FeeReceipt, {invoiceId: item.id})}
          />
        )}
        ListEmptyComponent={
          <EmptyState icon="fee" title={t('feesList_noInvoices')} message={t('feesList_noInvoicesMessage')} />
        }
      />
    </Screen>
  );
}
