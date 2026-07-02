/** Fee management — collection summary + invoice list. */
import React from 'react';
import {FlatList, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme} from '../../../core/theme';
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
import {feeStatusTone, capitalize} from '../../../shared/helpers';
import {formatCurrency} from '../../../core/utils/format';
import {useFees, useFeeSummary} from '../fees.service';
import type {AdminStackParamList} from '../../../navigation/types';
import type {FeeInvoice, StatCard} from '../../../shared/types';

type Nav = NativeStackNavigationProp<AdminStackParamList>;

export function FeesListScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const navigation = useNavigation<Nav>();
  const {data: summary, isLoading: summaryLoading} = useFeeSummary();
  const {data: fees, isLoading: feesLoading} = useFees({pageSize: 50});

  if (summaryLoading || feesLoading || !summary || !fees) {
    return <Loader message="Loading fees…" />;
  }

  const tiles: StatCard[] = [
    {
      key: 'collected',
      label: 'Collected',
      value: formatCurrency(summary.totalCollected),
      icon: 'money',
      accent: 'success',
    },
    {
      key: 'pending',
      label: 'Pending',
      value: formatCurrency(summary.totalPending),
      icon: 'warning',
      accent: 'error',
    },
    {
      key: 'rate',
      label: 'Collection Rate',
      value: `${summary.collectionRate}%`,
      icon: 'reports',
      accent: 'primary',
    },
  ];

  return (
    <Screen padded={false}>
      <CustomHeader title="Fee Management" />
      <FlatList
        data={fees.items}
        keyExtractor={(item: FeeInvoice) => item.id}
        contentContainerStyle={{padding: theme.spacing.lg, flexGrow: 1}}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <Row gap={theme.spacing.md} align="stretch">
              {tiles.map(tile => (
                <View key={tile.key} style={{flex: 1}}>
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
            subtitle={`${item.className} · Due ${formatCurrency(item.dueAmount)}`}
            right={<Badge label={capitalize(item.status)} tone={feeStatusTone(item.status)} />}
            onPress={() => navigation.navigate('FeeReceipt', {invoiceId: item.id})}
          />
        )}
        ListEmptyComponent={
          <EmptyState icon="fee" title="No invoices" message="Fee invoices will appear here." />
        }
      />
    </Screen>
  );
}
