/** Inventory — school assets with condition badges and total value. */
import React from 'react';
import {ScrollView} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {
  Screen,
  AppText,
  CustomHeader,
  CustomCard,
  Badge,
  ListRow,
  Loader,
  EmptyState,
  Divider,
  Spacer,
} from '../../../shared/components';
import type {BadgeTone} from '../../../shared/components';
import {formatCurrency} from '../../../core/utils/format';
import {capitalize} from '../../../shared/helpers';
import {useInventory} from '../../operations/operations.service';
import type {AdminStackParamList} from '../../../navigation/types';
import type {InventoryItem} from '../../../shared/types';

type Nav = NativeStackNavigationProp<AdminStackParamList>;

export function InventoryScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const navigation = useNavigation<Nav>();
  const {t} = useLanguage();
  const {data, isLoading} = useInventory();

  if (isLoading || !data) {
    return <Loader message={t('inventory_loading')} />;
  }

  const totalValue = data.reduce((sum, item) => sum + item.value, 0);

  const conditionLabel = (condition: InventoryItem['condition']) =>
    condition === 'good'
      ? t('inventory_conditionGood')
      : condition === 'needs_repair'
      ? t('inventory_conditionRepair')
      : t('inventory_conditionDamaged');

  const conditionTone = (condition: InventoryItem['condition']): BadgeTone =>
    condition === 'good' ? 'success' : condition === 'needs_repair' ? 'warning' : 'error';

  return (
    <Screen padded={false}>
      <CustomHeader title={t('inventory_title')} onBack={() => navigation.goBack()} />
      <ScrollView
        contentContainerStyle={{padding: theme.spacing.lg}}
        showsVerticalScrollIndicator={false}>
        <CustomCard>
          <AppText variant="caption" color="textSecondary">
            {t('inventory_totalAssetValue')}
          </AppText>
          <AppText variant="h1" color="primary">
            {formatCurrency(totalValue)}
          </AppText>
          <AppText variant="caption" color="textSecondary">
            {t('inventory_itemsCount', {count: data.length})}
          </AppText>
        </CustomCard>

        <Spacer size={theme.spacing.md} />
        {data.length === 0 ? (
          <EmptyState icon="inventory" title={t('inventory_noItems')} message={t('inventory_noItemsMessage')} />
        ) : (
          <CustomCard padded={false} style={{paddingHorizontal: theme.spacing.lg}}>
            {data.map((item, i) => (
              <React.Fragment key={item.id}>
                {i > 0 ? <Divider /> : null}
                <ListRow
                  icon="inventory"
                  title={item.name}
                  subtitle={t('inventory_itemSubtitle', {
                    category: capitalize(item.category),
                    qty: item.quantity,
                    location: item.location,
                  })}
                  right={
                    <Badge
                      label={conditionLabel(item.condition)}
                      tone={conditionTone(item.condition)}
                    />
                  }
                />
              </React.Fragment>
            ))}
          </CustomCard>
        )}
      </ScrollView>
    </Screen>
  );
}
