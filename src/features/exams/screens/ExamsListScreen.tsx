/** Exams list (admin) — search, pagination, create/edit/delete; tap an exam to manage its classes. */
import React, {useEffect, useState} from 'react';
import {FlatList, Pressable, RefreshControl, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme, useThemedStyles} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {
  Screen,
  CustomHeader,
  CustomCard,
  CustomModal,
  CustomButton,
  SearchBar,
  AppText,
  Icon,
  Row,
  Spacer,
  Pagination,
  EmptyState,
  Loader,
} from '../../../shared/components';
import {formatDate} from '../../../core/utils/format';
import {useAdminExams, useDeleteExam} from '../adminExams.service';
import {ScreenNames} from '../../../navigation/ScreenNames';
import type {AdminStackParamList} from '../../../navigation/types';
import type {AdminExam} from '../../../shared/types';

type Nav = NativeStackNavigationProp<AdminStackParamList>;

const SEARCH_DEBOUNCE_MS = 350;

export function ExamsListScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const navigation = useNavigation<Nav>();

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<AdminExam | null>(null);
  const [deleteError, setDeleteError] = useState<string | undefined>();

  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(handle);
  }, [search]);

  const {data, isLoading, isRefetching, isError, error, refetch} = useAdminExams({
    page,
    pageSize: 15,
    search: debouncedSearch || undefined,
  });
  const deleteMutation = useDeleteExam();

  const styles = useThemedStyles(t2 => ({
    searchBarWrap: {
      paddingHorizontal: t2.spacing.lg,
      paddingTop: t2.spacing.md,
      paddingBottom: t2.spacing.sm,
    },
    list: {flex: 1},
    listContent: {padding: t2.spacing.lg, paddingTop: t2.spacing.sm, flexGrow: 1},
    card: {marginBottom: t2.spacing.md},
    modalButtonWrap: {flex: 1},
  }));

  const dateRangeLabel = (exam: AdminExam): string | undefined => {
    if (exam.startDate && exam.endDate) {
      return `${formatDate(exam.startDate)} – ${formatDate(exam.endDate)}`;
    }
    if (exam.startDate) {
      return formatDate(exam.startDate);
    }
    return undefined;
  };

  const onDelete = (): void => {
    if (!deleteTarget) {
      return;
    }
    setDeleteError(undefined);
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
      onError: (e: Error) => setDeleteError(e.message),
    });
  };

  return (
    <Screen padded={false}>
      <CustomHeader
        title={t('examsList_title')}
        onBack={() => navigation.goBack()}
        actions={[{icon: 'add', onPress: () => navigation.navigate(ScreenNames.ExamForm, {})}]}
      />
      <View style={styles.searchBarWrap}>
        <SearchBar value={search} onChangeText={setSearch} placeholder={t('examsList_searchPlaceholder')} />
      </View>

      {isError ? (
        <EmptyState
          icon="warning"
          title={t('common_somethingWentWrong')}
          message={(error as {message?: string} | null)?.message ?? t('common_checkConnection')}
          actionLabel={t('common_retry')}
          onAction={() => refetch()}
        />
      ) : isLoading || !data ? (
        <Loader message={t('examsList_loadingExams')} />
      ) : (
        <FlatList
          style={styles.list}
          data={data.items}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => {
                setPage(1);
                refetch();
              }}
            />
          }
          renderItem={({item}) => (
            <CustomCard
              style={styles.card}
              onPress={() =>
                navigation.navigate(ScreenNames.ExamClasses, {examId: item.id, examName: item.title})
              }>
              <Row justify="space-between" align="flex-start">
                <View style={{flex: 1}}>
                  <AppText variant="bodyBold">{item.title}</AppText>
                  {dateRangeLabel(item) ? (
                    <Row gap={4} style={{marginTop: 2}}>
                      <Icon name="calendar" size={13} color={theme.colors.textMuted} />
                      <AppText variant="label" color="textMuted">
                        {dateRangeLabel(item)}
                      </AppText>
                    </Row>
                  ) : null}
                </View>
                <Row gap={theme.spacing.md} align="center">
                  <Pressable
                    onPress={() => navigation.navigate(ScreenNames.ExamForm, {examId: item.id, initial: item})}
                    hitSlop={8}>
                    <Icon name="edit" size={18} color={theme.colors.textMuted} />
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      setDeleteTarget(item);
                      setDeleteError(undefined);
                    }}
                    hitSlop={8}>
                    <Icon name="delete" size={18} color={theme.colors.error} />
                  </Pressable>
                </Row>
              </Row>
              {item.classes.length > 0 ? (
                <>
                  <Spacer size={theme.spacing.xs} />
                  <AppText variant="caption" color="textSecondary">
                    {item.classes.map(c => c.className).join(', ')}
                  </AppText>
                </>
              ) : null}
            </CustomCard>
          )}
          ListEmptyComponent={
            <EmptyState
              icon="exam"
              title={t('examsList_noExams')}
              message={t('examsList_noExamsMessage')}
              actionLabel={t('examsList_addExam')}
              onAction={() => navigation.navigate(ScreenNames.ExamForm, {})}
            />
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

      <CustomModal
        visible={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title={t('examsList_deleteTitle')}>
        <AppText variant="body" color="textSecondary">
          {t('examsList_deleteConfirm', {title: deleteTarget?.title ?? ''})}
        </AppText>
        {deleteError ? (
          <AppText variant="caption" color="error" style={{marginTop: theme.spacing.sm}}>
            {deleteError}
          </AppText>
        ) : null}
        <Spacer size={16} />
        <Row gap={theme.spacing.md}>
          <View style={styles.modalButtonWrap}>
            <CustomButton title={t('common_cancel')} variant="outline" onPress={() => setDeleteTarget(null)} />
          </View>
          <View style={styles.modalButtonWrap}>
            <CustomButton
              title={t('common_delete')}
              variant="danger"
              loading={deleteMutation.isPending}
              onPress={onDelete}
            />
          </View>
        </Row>
      </CustomModal>
    </Screen>
  );
}
