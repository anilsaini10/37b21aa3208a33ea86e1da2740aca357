/** Parent homework — read-only view of a child's assigned homework; tap a card for full details in a modal. */
import React, {useState} from 'react';
import {FlatList, Pressable, RefreshControl, ScrollView, View} from 'react-native';
import {useTheme, useThemedStyles} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {
  Screen,
  CustomHeader,
  CustomCard,
  CustomModal,
  AppText,
  Badge,
  Icon,
  Row,
  Spacer,
  Pagination,
  EmptyState,
  Loader,
} from '../../../shared/components';
import type {BadgeTone} from '../../../shared/components';
import {formatDate} from '../../../core/utils/format';
import {useParentProfile} from '../../parent/parentStudents.service';
import {useParentHomeworkList, useParentHomeworkItem} from '../../parent/parentHomework.service';
import type {HomeworkType, ParentChild, ParentHomeworkItem} from '../../../shared/types';

const TYPE_ICON: Record<HomeworkType, string> = {
  ASSIGNMENT: 'homework',
  PROJECT: 'inventory',
  READING: 'book',
  PRACTICE: 'edit',
  OTHER: 'event',
};

const TYPE_TONE: Record<HomeworkType, BadgeTone> = {
  ASSIGNMENT: 'primary',
  PROJECT: 'info',
  READING: 'success',
  PRACTICE: 'warning',
  OTHER: 'neutral',
};

function daysUntil(dueDate: string): number {
  const today = new Date().toISOString().slice(0, 10);
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((new Date(dueDate).getTime() - new Date(today).getTime()) / msPerDay);
}

export function ParentHomeworkScreen(): React.JSX.Element {
  const {t} = useLanguage();
  const {data: profile, isLoading, isError, error, refetch} = useParentProfile();
  const [activeChildId, setActiveChildId] = useState<string | null>(null);

  if (isLoading || !profile) {
    if (isError) {
      return (
        <Screen padded={false}>
          <CustomHeader title={t('parentHomework_title')} />
          <EmptyState
            icon="warning"
            title={t('common_somethingWentWrong')}
            message={(error as {message?: string} | null)?.message ?? t('common_checkConnection')}
            actionLabel={t('common_retry')}
            onAction={() => refetch()}
          />
        </Screen>
      );
    }
    return <Loader message={t('parentHomework_loadingHomework')} />;
  }

  const {children} = profile;

  if (children.length === 0) {
    return (
      <Screen padded={false}>
        <CustomHeader title={t('parentHomework_title')} />
        <EmptyState
          icon="homework"
          title={t('childProfile_noChildrenTitle')}
          message={t('childProfile_noChildrenMessage')}
        />
      </Screen>
    );
  }

  const child = children.find(c => c.id === activeChildId) ?? children[0];

  return (
    <ChildHomeworkList
      child={child}
      children={children.length > 1 ? children : undefined}
      onSelectChild={setActiveChildId}
    />
  );
}

function ChildHomeworkList({
  child,
  children,
  onSelectChild,
}: {
  child: ParentChild;
  children?: ParentChild[];
  onSelectChild: (id: string) => void;
}): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const [page, setPage] = useState(1);
  const [detailTarget, setDetailTarget] = useState<ParentHomeworkItem | null>(null);

  const {data, isLoading, isRefetching, isError, error, refetch} = useParentHomeworkList({
    studentId: child.id,
    page,
    pageSize: 15,
  });
  const {data: detail} = useParentHomeworkItem(detailTarget?.id ?? '', child.id, detailTarget ?? undefined);

  const styles = useThemedStyles(t2 => ({
    switcherWrap: {paddingHorizontal: t2.spacing.lg, paddingTop: t2.spacing.md},
    switcherContent: {columnGap: t2.spacing.sm},
    childPill: {
      paddingHorizontal: t2.spacing.lg,
      paddingVertical: t2.spacing.sm,
      borderRadius: t2.radius.pill,
    },
    listContent: {padding: t2.spacing.lg, flexGrow: 1},
    card: {marginBottom: t2.spacing.md},
    modalContent: {maxHeight: 420},
  }));

  const dueDateInfo = (dueDate: string): {label: string; tone: 'error' | 'warning' | 'success'} => {
    const diff = daysUntil(dueDate);
    if (diff < 0) {
      return {label: t('homeworkList_overdue'), tone: 'error'};
    }
    if (diff === 0) {
      return {label: t('homeworkList_dueToday'), tone: 'warning'};
    }
    if (diff === 1) {
      return {label: t('homeworkList_dueTomorrow'), tone: 'warning'};
    }
    return {label: formatDate(dueDate), tone: 'success'};
  };

  return (
    <Screen padded={false}>
      <CustomHeader title={t('parentHomework_title')} />
      {children ? (
        <View style={styles.switcherWrap}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.switcherContent}>
            {children.map(c => {
              const active = c.id === child.id;
              return (
                <Pressable
                  key={c.id}
                  onPress={() => onSelectChild(c.id)}
                  style={[
                    styles.childPill,
                    {backgroundColor: active ? theme.colors.primary : theme.colors.surfaceVariant},
                  ]}>
                  <AppText variant="label" style={{color: active ? theme.colors.onPrimary : theme.colors.textSecondary}}>
                    {c.name}
                  </AppText>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      ) : null}

      {isError ? (
        <EmptyState
          icon="warning"
          title={t('common_somethingWentWrong')}
          message={(error as {message?: string} | null)?.message ?? t('common_checkConnection')}
          actionLabel={t('common_retry')}
          onAction={() => refetch()}
        />
      ) : isLoading || !data ? (
        <Loader message={t('parentHomework_loadingHomework')} />
      ) : (
        <FlatList
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
          renderItem={({item}) => {
            const due = dueDateInfo(item.dueDate);
            const typeTone = TYPE_TONE[item.type];
            const typeColor = theme.colors[typeTone === 'neutral' ? 'textMuted' : typeTone];
            return (
              <CustomCard style={styles.card} onPress={() => setDetailTarget(item)}>
                <Row gap={theme.spacing.sm} align="center">
                  <Icon name={TYPE_ICON[item.type]} size={18} color={typeColor} />
                  <AppText variant="bodyBold" style={{flex: 1}} numberOfLines={1}>
                    {item.title}
                  </AppText>
                </Row>
                <Spacer size={theme.spacing.sm} />
                <Row gap={theme.spacing.xs} wrap>
                  <Badge label={item.className + (item.sectionName ? ` - ${item.sectionName}` : '')} tone="neutral" />
                  <Badge label={item.subjectName} tone="primary" />
                </Row>
                <Spacer size={theme.spacing.xs} />
                <Row justify="space-between" align="center">
                  <AppText variant="caption" style={{color: theme.colors[due.tone]}}>
                    {t('homeworkList_dueLabel', {due: due.label})}
                  </AppText>
                  <AppText variant="caption" color="textMuted">
                    {item.teacherName}
                  </AppText>
                </Row>
              </CustomCard>
            );
          }}
          ListEmptyComponent={
            <EmptyState
              icon="homework"
              title={t('parentHomework_noHomework')}
              message={t('parentHomework_noAssignments')}
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

      <CustomModal visible={!!detailTarget} onClose={() => setDetailTarget(null)} title={detail?.title}>
        {detail ? (
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <Row gap={theme.spacing.xs} wrap>
              <Badge
                label={detail.className + (detail.sectionName ? ` - ${detail.sectionName}` : '')}
                tone="neutral"
              />
              <Badge label={detail.subjectName} tone="primary" />
              <Badge label={detail.type} tone={TYPE_TONE[detail.type]} />
            </Row>
            <Spacer size={12} />
            <AppText variant="caption" style={{color: theme.colors[dueDateInfo(detail.dueDate).tone]}}>
              {t('homeworkList_dueLabel', {due: dueDateInfo(detail.dueDate).label})}
            </AppText>
            <Spacer size={12} />
            <AppText variant="body">{detail.description ?? t('parentHomework_noDescription')}</AppText>
            <Spacer size={12} />
            <AppText variant="caption" color="textSecondary">
              {t('parentHomework_assignedBy', {name: detail.teacherName})}
            </AppText>
          </ScrollView>
        ) : null}
      </CustomModal>
    </Screen>
  );
}
