/** Admin Subject Management — list, create/edit, toggle, delete, assign classes. */
import React, {useState, useCallback} from 'react';
import {Alert, FlatList, Pressable, RefreshControl, Switch, View} from 'react-native';
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
  Badge,
  AppText,
  Row,
  Spacer,
  EmptyState,
  Loader,
  CheckboxMultiSelect,
} from '../../../shared/components';
import {
  useAdminSubjects,
  useCreateAdminSubject,
  useUpdateAdminSubject,
  useDeleteAdminSubject,
  useToggleSubjectStatus,
  useAssignSubjectClasses,
} from '../adminSyllabus.service';
import {useClasses} from '../../classes/classes.service';
import type {SyllabusSubject} from '../../../shared/types';
import type {AdminStackParamList} from '../../../navigation/types';

type Nav = NativeStackNavigationProp<AdminStackParamList>;

export function AdminSubjectsScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const navigation = useNavigation<Nav>();

  const {data: subjects, isLoading, refetch, isRefetching} = useAdminSubjects();
  const {data: classes} = useClasses();
  const createMutation = useCreateAdminSubject();
  const updateMutation = useUpdateAdminSubject();
  const deleteMutation = useDeleteAdminSubject();
  const toggleMutation = useToggleSubjectStatus();
  const assignMutation = useAssignSubjectClasses();

  const [editSubject, setEditSubject] = useState<SyllabusSubject | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [assignTarget, setAssignTarget] = useState<SyllabusSubject | null>(null);
  const [selectedClassNames, setSelectedClassNames] = useState<string[]>([]);

  const classList = classes ?? [];
  const classOptions = classList.map(c => c.name);
  const classNameToId = new Map(classList.map(c => [c.name, c.id]));
  const classIdToName = new Map(classList.map(c => [c.id, c.name]));

  const styles = useThemedStyles(t2 => ({
    list: {padding: t2.spacing.lg},
    card: {marginBottom: t2.spacing.md},
    cardRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
    actions: {flexDirection: 'row', gap: t2.spacing.sm, marginTop: t2.spacing.sm},
  }));

  const openCreate = useCallback(() => {
    setEditSubject(null);
    setName('');
    setDescription('');
    setShowForm(true);
  }, []);

  const openEdit = useCallback((subject: SyllabusSubject) => {
    setEditSubject(subject);
    setName(subject.name);
    setDescription(subject.description ?? '');
    setShowForm(true);
  }, []);

  const handleSave = useCallback(async () => {
    if (!name.trim()) return;
    try {
      if (editSubject) {
        await updateMutation.mutateAsync({subjectId: editSubject.id, name: name.trim(), description: description.trim() || undefined});
      } else {
        await createMutation.mutateAsync({name: name.trim(), description: description.trim() || undefined});
      }
      setShowForm(false);
      Alert.alert(t('common_success'), t('syllabus_saveSuccess'));
    } catch (e: any) {
      Alert.alert(t('common_error'), e.message);
    }
  }, [name, description, editSubject, updateMutation, createMutation, t]);

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

  const handleToggle = useCallback(async (id: string) => {
    try {
      await toggleMutation.mutateAsync(id);
    } catch (e: any) {
      Alert.alert(t('common_error'), e.message);
    }
  }, [toggleMutation, t]);

  const openAssign = useCallback((subject: SyllabusSubject) => {
    setAssignTarget(subject);
    setSelectedClassNames((subject.classIds ?? []).map(id => classIdToName.get(id) ?? id));
  }, [classIdToName]);

  const handleAssign = useCallback(async () => {
    if (!assignTarget) return;
    try {
      await assignMutation.mutateAsync({subjectId: assignTarget.id, classIds: selectedClassNames.map(n => classNameToId.get(n) ?? n)});
      setAssignTarget(null);
      Alert.alert(t('common_success'), t('syllabus_saveSuccess'));
    } catch (e: any) {
      Alert.alert(t('common_error'), e.message);
    }
  }, [assignTarget, selectedClassNames, classNameToId, assignMutation, t]);

  const renderItem = useCallback(({item}: {item: SyllabusSubject}) => (
    <CustomCard style={styles.card} onPress={() => openEdit(item)}>
      <View style={styles.cardRow}>
        <View style={{flex: 1}}>
          <AppText variant="bodyBold">{item.name}</AppText>
          {item.description ? <AppText variant="caption" color="textSecondary" numberOfLines={2}>{item.description}</AppText> : null}
        </View>
        <Badge label={item.isActive ? t('common_active') : t('common_inactive')} tone={item.isActive ? 'success' : 'neutral'} />
      </View>
      <View style={styles.actions}>
        <CustomButton title={t('syllabus_toggleStatus')} variant="outline" size="sm" fullWidth={false} onPress={() => handleToggle(item.id)} />
        <CustomButton title={t('syllabus_assignToClasses')} variant="outline" size="sm" fullWidth={false} onPress={() => openAssign(item)} />
        <CustomButton title={t('common_delete')} variant="dangerOutline" size="sm" fullWidth={false} onPress={() => setDeleteTarget(item.id)} />
      </View>
    </CustomCard>
  ), [styles, t, openEdit, handleToggle, openAssign]);

  return (
    <Screen padded={false}>
      <CustomHeader
        title={t('syllabus_subjects')}
        onBack={() => navigation.goBack()}
        actions={[{icon: 'add', onPress: openCreate, circle: true}]}
      />
      {isLoading ? (
        <Loader />
      ) : !subjects?.length ? (
        <EmptyState title={t('syllabus_noSubjects')} message={t('syllabus_noSubjectsMessage')} actionLabel={t('syllabus_createSubject')} onAction={openCreate} />
      ) : (
        <FlatList
          data={subjects}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />}
        />
      )}

      <CustomBottomSheet visible={showForm} onClose={() => setShowForm(false)} title={editSubject ? t('syllabus_editSubject') : t('syllabus_createSubject')}>
        <CustomInput label={t('syllabus_subjectName')} value={name} onChangeText={setName} maxLength={100} required />
        <CustomInput label={t('syllabus_description')} value={description} onChangeText={setDescription} maxLength={500} multiline />
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

      <CustomBottomSheet visible={!!assignTarget} onClose={() => setAssignTarget(null)} title={t('syllabus_assignToClasses')}>
        <CheckboxMultiSelect
          options={classOptions}
          value={selectedClassNames}
          onChange={setSelectedClassNames}
        />
        <Spacer size={theme.spacing.md} />
        <CustomButton title={t('common_save')} onPress={handleAssign} loading={assignMutation.isPending} />
      </CustomBottomSheet>
    </Screen>
  );
}
