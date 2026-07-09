/** Admin — Subjects management: list (with class chips), create subject (+ optional class links). */
import React, {useState} from 'react';
import {FlatList, Pressable} from 'react-native';
import {useTheme, useThemedStyles} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {
  Screen,
  CustomHeader,
  CustomCard,
  CustomModal,
  CustomBottomSheet,
  CustomInput,
  CustomButton,
  AppText,
  Badge,
  Icon,
  Row,
  Spacer,
  EmptyState,
  Loader,
} from '../../../shared/components';
import {useSubjects, useCreateSubject} from '../subjects.service';
import {useClasses} from '../../classes/classes.service';
import type {Subject} from '../../../shared/types';

export function SubjectsManageScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const {data: subjects, isLoading, isError, error: loadError, refetch} = useSubjects();
  const {data: classes} = useClasses();
  const createSubjectMutation = useCreateSubject();

  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);
  const [classSheetOpen, setClassSheetOpen] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const styles = useThemedStyles(t2 => ({
    listContent: {padding: t2.spacing.lg, flexGrow: 1},
    card: {marginBottom: t2.spacing.md},
    chipsRow: {rowGap: t2.spacing.sm, marginTop: t2.spacing.xs},
    fieldBase: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      minHeight: t2.components.input.height,
      borderWidth: 1,
      borderRadius: t2.components.input.radius,
      paddingHorizontal: t2.spacing.md,
      paddingVertical: t2.spacing.sm,
      backgroundColor: t2.colors.inputBackground,
      borderColor: t2.colors.border,
      marginBottom: t2.spacing.md,
    },
    optionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: t2.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: t2.colors.divider,
    },
  }));

  const openModal = (): void => {
    setName('');
    setSelectedClassIds([]);
    setError(undefined);
    setModalOpen(true);
  };

  const toggleClass = (classId: string): void => {
    setSelectedClassIds(prev => (prev.includes(classId) ? prev.filter(id => id !== classId) : [...prev, classId]));
  };

  const submit = (): void => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError(t('subjectsManage_nameRequired'));
      return;
    }
    createSubjectMutation.mutate(
      {name: trimmed, classIds: selectedClassIds.length > 0 ? selectedClassIds : undefined},
      {
        onSuccess: () => setModalOpen(false),
        onError: (e: Error & {code?: string}) => {
          setError(e.code === 'SUBJECT_ALREADY_EXISTS' ? t('subjectsManage_alreadyExists') : e.message);
        },
      },
    );
  };

  const selectedClassNames = (classes ?? [])
    .filter(c => selectedClassIds.includes(c.id))
    .map(c => c.name)
    .join(', ');

  const renderSubject = ({item}: {item: Subject}): React.JSX.Element => (
    <CustomCard style={styles.card}>
      <AppText variant="bodyBold">{item.name}</AppText>
      <Row wrap style={styles.chipsRow}>
        {item.classes.length === 0 ? (
          <AppText variant="caption" color="textMuted">
            {t('subjectsManage_noClasses')}
          </AppText>
        ) : (
          item.classes.map(cls => <Badge key={cls.id} label={cls.name} tone="primary" />)
        )}
      </Row>
    </CustomCard>
  );

  return (
    <Screen padded={false}>
      <CustomHeader title={t('subjectsManage_headerTitle')} actions={[{icon: 'add', onPress: openModal}]} />
      {isError ? (
        <EmptyState
          icon="warning"
          title={t('common_somethingWentWrong')}
          message={(loadError as {message?: string} | null)?.message ?? t('common_checkConnection')}
          actionLabel={t('common_retry')}
          onAction={() => refetch()}
        />
      ) : isLoading || !subjects ? (
        <Loader message={t('subjectsManage_loading')} />
      ) : (
        <FlatList
          data={subjects}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={renderSubject}
          ListEmptyComponent={
            <EmptyState
              icon="homework"
              title={t('subjectsManage_emptyTitle')}
              message={t('subjectsManage_emptyMessage')}
              actionLabel={t('subjectsManage_addSubject')}
              onAction={openModal}
            />
          }
        />
      )}

      <CustomModal visible={modalOpen} onClose={() => setModalOpen(false)} title={t('subjectsManage_addSubject')}>
        <CustomInput
          label={t('subjectsManage_nameLabel')}
          placeholder={t('subjectsManage_namePlaceholder')}
          value={name}
          onChangeText={val => {
            setName(val);
            setError(undefined);
          }}
          required
        />
        <AppText variant="label" color="textSecondary">
          {t('subjectsManage_linkClassesLabel')}
        </AppText>
        <Spacer size={theme.spacing.xs} />
        <Pressable onPress={() => setClassSheetOpen(true)} style={styles.fieldBase}>
          <AppText color={selectedClassIds.length > 0 ? 'text' : 'textMuted'} style={{flex: 1}}>
            {selectedClassIds.length > 0 ? selectedClassNames : t('subjectsManage_selectClassesPlaceholder')}
          </AppText>
          <Icon name="forward" size={18} color={theme.colors.textMuted} style={{transform: [{rotate: '90deg'}]}} />
        </Pressable>

        {error ? (
          <AppText variant="caption" color="error" style={{marginTop: -theme.spacing.sm, marginBottom: theme.spacing.sm}}>
            {error}
          </AppText>
        ) : null}

        <CustomButton title={t('common_add')} onPress={submit} loading={createSubjectMutation.isPending} />
      </CustomModal>

      <CustomBottomSheet
        visible={classSheetOpen}
        onClose={() => setClassSheetOpen(false)}
        title={t('subjectsManage_linkClassesLabel')}>
        {(classes ?? []).map(cls => {
          const isSelected = selectedClassIds.includes(cls.id);
          return (
            <Pressable key={cls.id} onPress={() => toggleClass(cls.id)} style={styles.optionRow}>
              <AppText style={{color: isSelected ? theme.colors.primary : theme.colors.text}}>{cls.name}</AppText>
              {isSelected ? <Icon name="check" size={16} color={theme.colors.primary} /> : null}
            </Pressable>
          );
        })}
        <Spacer size={16} />
        <CustomButton title={t('common_done')} onPress={() => setClassSheetOpen(false)} />
      </CustomBottomSheet>
    </Screen>
  );
}
