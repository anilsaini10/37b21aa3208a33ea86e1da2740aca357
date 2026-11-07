/** Admin Chapter Management — filter, list, create/edit, toggle, delete. */
import React, {useState, useCallback, useMemo} from 'react';
import {Alert, FlatList, RefreshControl, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme, useThemedStyles} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {
  Screen,
  CustomHeader,
  CustomCard,
  CustomButton,
  CustomBottomSheet,
  CustomInput,
  CustomModal,
  Select,
  Badge,
  AppText,
  Row,
  Spacer,
  Pagination,
  EmptyState,
  Loader,
} from '../../../shared/components';
import {
  useAdminChapters,
  useCreateChapter,
  useUpdateChapter,
  useDeleteChapter,
  useToggleChapterStatus,
  useSubjectsByClass,
} from '../adminSyllabus.service';
import {useClasses} from '../../classes/classes.service';
import type {SyllabusChapter} from '../../../shared/types';
import type {AdminStackParamList} from '../../../navigation/types';

type Nav = NativeStackNavigationProp<AdminStackParamList>;

export function AdminChaptersScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const navigation = useNavigation<Nav>();

  const [classId, setClassId] = useState<string | undefined>();
  const [subjectId, setSubjectId] = useState<string | undefined>();
  const [page, setPage] = useState(1);

  const {data: classes} = useClasses();
  const {data: subjects} = useSubjectsByClass(classId);
  const {data, isLoading, refetch, isRefetching} = useAdminChapters({classId, subjectId, page, pageSize: 50});

  const createMutation = useCreateChapter();
  const updateMutation = useUpdateChapter();
  const deleteMutation = useDeleteChapter();
  const toggleMutation = useToggleChapterStatus();

  const [showForm, setShowForm] = useState(false);
  const [editChapter, setEditChapter] = useState<SyllabusChapter | null>(null);
  const [formClassId, setFormClassId] = useState('');
  const [formSubjectId, setFormSubjectId] = useState('');
  const [chapterName, setChapterName] = useState('');
  const [chapterNumber, setChapterNumber] = useState('');
  const [sequenceNumber, setSequenceNumber] = useState('');
  const [expectedDays, setExpectedDays] = useState('0');
  const [description, setDescription] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const {data: formSubjects} = useSubjectsByClass(formClassId || undefined);

  const classOptions = useMemo(() => (classes ?? []).map(c => ({label: c.name, value: c.id})), [classes]);
  const subjectOptions = useMemo(() => (subjects ?? []).map(s => ({label: s.name, value: s.id})), [subjects]);
  const formSubjectOptions = useMemo(() => (formSubjects ?? []).map(s => ({label: s.name, value: s.id})), [formSubjects]);

  const styles = useThemedStyles(t2 => ({
    filterRow: {
      flexDirection: 'row',
      gap: t2.spacing.sm,
      paddingHorizontal: t2.spacing.lg,
      paddingVertical: t2.spacing.sm,
    },
    filterItem: {flex: 1},
    list: {paddingHorizontal: t2.spacing.lg},
    card: {marginBottom: t2.spacing.md},
    cardHeader: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
    meta: {flexDirection: 'row', gap: t2.spacing.md, marginTop: t2.spacing.xs},
    actions: {flexDirection: 'row', gap: t2.spacing.sm, marginTop: t2.spacing.sm},
  }));

  const openCreate = useCallback(() => {
    setEditChapter(null);
    setFormClassId(classId ?? '');
    setFormSubjectId(subjectId ?? '');
    setChapterName('');
    setChapterNumber('');
    setSequenceNumber('');
    setExpectedDays('0');
    setDescription('');
    setShowForm(true);
  }, [classId, subjectId]);

  const openEdit = useCallback((ch: SyllabusChapter) => {
    setEditChapter(ch);
    setFormClassId(ch.classId);
    setFormSubjectId(ch.subjectId);
    setChapterName(ch.name);
    setChapterNumber(String(ch.chapterNumber));
    setSequenceNumber(String(ch.sequenceNumber));
    setExpectedDays(String(ch.expectedWorkingDays));
    setDescription(ch.description ?? '');
    setShowForm(true);
  }, []);

  const handleSave = useCallback(async () => {
    if (!chapterName.trim() || !formClassId || !formSubjectId || !chapterNumber || !sequenceNumber) return;
    try {
      const payload = {
        name: chapterName.trim(),
        chapterNumber: Number(chapterNumber),
        sequenceNumber: Number(sequenceNumber),
        expectedWorkingDays: Number(expectedDays) || 0,
        classId: formClassId,
        subjectId: formSubjectId,
        description: description.trim() || undefined,
      };
      if (editChapter) {
        await updateMutation.mutateAsync({chapterId: editChapter.id, ...payload});
      } else {
        await createMutation.mutateAsync(payload);
      }
      setShowForm(false);
      Alert.alert(t('common_success'), t('syllabus_saveSuccess'));
    } catch (e: any) {
      Alert.alert(t('common_error'), e.message);
    }
  }, [chapterName, formClassId, formSubjectId, chapterNumber, sequenceNumber, expectedDays, description, editChapter, updateMutation, createMutation, t]);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget);
      setDeleteTarget(null);
      Alert.alert(t('common_success'), t('syllabus_deleteSuccess'));
    } catch (e: any) {
      Alert.alert(t('common_error'), e.message);
    }
  }, [deleteTarget, deleteMutation, t]);

  const handleClassChange = useCallback((val: string) => {
    setClassId(val);
    setSubjectId(undefined);
    setPage(1);
  }, []);

  const renderItem = useCallback(({item}: {item: SyllabusChapter}) => (
    <CustomCard style={styles.card} onPress={() => openEdit(item)}>
      <View style={styles.cardHeader}>
        <AppText variant="bodyBold" style={{flex: 1}}>Ch {item.chapterNumber}: {item.name}</AppText>
        <Badge label={item.isActive ? t('common_active') : t('common_inactive')} tone={item.isActive ? 'success' : 'neutral'} />
      </View>
      <View style={styles.meta}>
        <AppText variant="caption" color="textSecondary">{t('syllabus_sequenceNumber')}: {item.sequenceNumber}</AppText>
        <AppText variant="caption" color="textSecondary">{t('syllabus_expectedDays')}: {item.expectedWorkingDays}</AppText>
      </View>
      {item.subjectName ? <AppText variant="caption" color="textSecondary">{item.subjectName}</AppText> : null}
      <View style={styles.actions}>
        <CustomButton title={t('syllabus_toggleStatus')} variant="outline" size="sm" fullWidth={false} onPress={() => toggleMutation.mutate(item.id)} />
        <CustomButton title={t('common_delete')} variant="dangerOutline" size="sm" fullWidth={false} onPress={() => setDeleteTarget(item.id)} />
      </View>
    </CustomCard>
  ), [styles, t, openEdit, toggleMutation]);

  return (
    <Screen padded={false}>
      <CustomHeader
        title={t('syllabus_chapters')}
        onBack={() => navigation.goBack()}
        actions={[{icon: 'add', onPress: openCreate, circle: true}]}
      />
      <View style={styles.filterRow}>
        <View style={styles.filterItem}>
          <Select label={t('syllabus_selectClass')} value={classId} options={classOptions} onChange={handleClassChange} />
        </View>
        <View style={styles.filterItem}>
          <Select
            label={t('syllabus_selectSubject')}
            value={subjectId}
            options={subjectOptions}
            onChange={v => { setSubjectId(v); setPage(1); }}
            disabled={!classId}
            onDisabledPress={() => Alert.alert(t('syllabus_selectClass'))}
          />
        </View>
      </View>

      {isLoading ? (
        <Loader />
      ) : !data?.items?.length ? (
        <EmptyState title={t('syllabus_noChapters')} message={t('syllabus_noChaptersMessage')} actionLabel={t('syllabus_createChapter')} onAction={openCreate} />
      ) : (
        <FlatList
          data={data.items}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />}
          ListFooterComponent={<Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} />}
        />
      )}

      <CustomBottomSheet visible={showForm} onClose={() => setShowForm(false)} title={editChapter ? t('syllabus_editChapter') : t('syllabus_createChapter')}>
        <Select label={t('syllabus_selectClass')} value={formClassId} options={classOptions} onChange={v => { setFormClassId(v); setFormSubjectId(''); }} required />
        <Select label={t('syllabus_selectSubject')} value={formSubjectId} options={formSubjectOptions} onChange={setFormSubjectId} disabled={!formClassId} required />
        <CustomInput label={t('syllabus_chapterName')} value={chapterName} onChangeText={setChapterName} maxLength={200} required />
        <Row gap={theme.spacing.sm}>
          <View style={{flex: 1}}>
            <CustomInput label={t('syllabus_chapterNumber')} value={chapterNumber} onChangeText={setChapterNumber} keyboardType="number-pad" required />
          </View>
          <View style={{flex: 1}}>
            <CustomInput label={t('syllabus_sequenceNumber')} value={sequenceNumber} onChangeText={setSequenceNumber} keyboardType="number-pad" required />
          </View>
        </Row>
        <CustomInput label={t('syllabus_expectedDays')} value={expectedDays} onChangeText={setExpectedDays} keyboardType="number-pad" />
        <CustomInput label={t('syllabus_description')} value={description} onChangeText={setDescription} maxLength={1000} multiline />
        <Spacer size={theme.spacing.md} />
        <CustomButton title={t('common_save')} onPress={handleSave} loading={createMutation.isPending || updateMutation.isPending} />
      </CustomBottomSheet>

      <CustomModal visible={!!deleteTarget} onClose={() => setDeleteTarget(null)} title={t('common_confirm')}>
        <AppText>{t('syllabus_confirmDelete')}</AppText>
        <Spacer size={theme.spacing.md} />
        <Row gap={theme.spacing.sm}>
          <CustomButton title={t('common_cancel')} variant="outline" onPress={() => setDeleteTarget(null)} />
          <CustomButton title={t('common_delete')} variant="danger" onPress={handleDelete} loading={deleteMutation.isPending} />
        </Row>
      </CustomModal>
    </Screen>
  );
}
