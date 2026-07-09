/** Fees list for a specific class/section — searchable, paginated invoices. */
import React, {useState} from 'react';
import {FlatList, View} from 'react-native';
import {useNavigation, useRoute, type RouteProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useThemedStyles} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import type {TranslationKey} from '../../../core/i18n';
import {
  Screen,
  CustomHeader,
  SearchBar,
  ListRow,
  Badge,
  Pagination,
  EmptyState,
  Loader,
  Spacer,
} from '../../../shared/components';
import {formatCurrency} from '../../../core/utils/format';
import {feeStatusTone} from '../../../shared/helpers';
import {useFees} from '../fees.service';
import type {AdminStackParamList} from '../../../navigation/types';
import {ScreenNames} from '../../../navigation/ScreenNames';
import type {FeeInvoice, FeeStatus} from '../../../shared/types';

type Nav = NativeStackNavigationProp<AdminStackParamList>;

const FEE_STATUS_KEY: Record<FeeStatus, TranslationKey> = {
  paid: 'fees_paid',
  pending: 'fees_pending',
  partial: 'fees_partial',
  overdue: 'fees_overdue',
};

export function FeesStudentsListScreen(): React.JSX.Element {
  const {t} = useLanguage();
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<AdminStackParamList, 'FeesStudentsList'>>();
  const {classId, className, sectionId, sectionName} = route.params;
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const {data, isLoading} = useFees({classId, sectionId, page, search, pageSize: 15});
  const styles = useThemedStyles(t2 => ({
    searchBarWrap: {
      paddingHorizontal: t2.spacing.lg,
      paddingTop: t2.spacing.md,
    },
    listContent: {
      padding: t2.spacing.lg,
      paddingTop: t2.spacing.sm,
      flexGrow: 1,
    },
  }));

  const headerTitle = sectionName
    ? t('studentsList_headerTitleWithSection', {className, sectionName})
    : t('studentsList_headerTitleNoSection', {className});

  const onSearch = (text: string): void => {
    setSearch(text);
    setPage(1);
  };

  return (
    <Screen padded={false}>
      <CustomHeader title={headerTitle} onBack={() => navigation.goBack()} />
      <View style={styles.searchBarWrap}>
        <SearchBar
          value={search}
          onChangeText={onSearch}
          placeholder={t('feesStudentsList_searchPlaceholder')}
        />
      </View>
      {isLoading || !data ? (
        <Loader message={t('feesList_loadingFees')} />
      ) : (
        <FlatList
          data={data.items}
          keyExtractor={(item: FeeInvoice) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({item}) => (
            <ListRow
              avatarName={item.studentName}
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
          ListFooterComponent={
            data.items.length > 0 ? (
              <>
                <Spacer size={8} />
                <Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} />
              </>
            ) : null
          }
        />
      )}
    </Screen>
  );
}
