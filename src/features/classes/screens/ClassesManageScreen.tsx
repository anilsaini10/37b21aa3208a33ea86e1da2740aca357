/** Admin — Classes & Sections management: list, expand for detail, create/edit/delete class + section. */
import React, {useState} from 'react';
import {Pressable, ScrollView, View} from 'react-native';
import {useTheme, useThemedStyles} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {
  Screen,
  CustomHeader,
  CustomCard,
  CustomModal,
  CustomInput,
  CustomButton,
  Select,
  SearchBar,
  AppText,
  Badge,
  Icon,
  Row,
  Spacer,
  Divider,
  EmptyState,
  Loader,
} from '../../../shared/components';
import {
  useClasses,
  useCreateClass,
  useAddSection,
  useUpdateClass,
  useDeleteClass,
  useUpdateSection,
  useDeleteSection,
} from '../classes.service';
import {useTeachers} from '../../teachers/teachers.service';
import type {SchoolClass, Section} from '../../../shared/types';

interface SectionRow {
  name: string;
  capacity: string;
}

const NO_CLASS_TEACHER = '';

export function ClassesManageScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const {data: classes, isLoading, isError, error, refetch} = useClasses();
  const {data: teachersPage} = useTeachers({pageSize: 100});
  const createClassMutation = useCreateClass();
  const addSectionMutation = useAddSection();
  const updateClassMutation = useUpdateClass();
  const deleteClassMutation = useDeleteClass();
  const updateSectionMutation = useUpdateSection();
  const deleteSectionMutation = useDeleteSection();

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const [classModalOpen, setClassModalOpen] = useState(false);
  const [className, setClassName] = useState('');
  const [numericLevel, setNumericLevel] = useState('');
  const [sectionRows, setSectionRows] = useState<SectionRow[]>([{name: '', capacity: '40'}]);
  const [classModalError, setClassModalError] = useState<string | undefined>();

  const [sectionModalClassId, setSectionModalClassId] = useState<string | null>(null);
  const [newSectionName, setNewSectionName] = useState('');
  const [newSectionCapacity, setNewSectionCapacity] = useState('40');
  const [sectionModalError, setSectionModalError] = useState<string | undefined>();

  const [classEditTarget, setClassEditTarget] = useState<SchoolClass | null>(null);
  const [editClassName, setEditClassName] = useState('');
  const [editClassNumericLevel, setEditClassNumericLevel] = useState('');
  const [editClassError, setEditClassError] = useState<string | undefined>();

  const [deleteClassTarget, setDeleteClassTarget] = useState<SchoolClass | null>(null);
  const [deleteClassError, setDeleteClassError] = useState<string | undefined>();

  const [sectionEditTarget, setSectionEditTarget] = useState<Section | null>(null);
  const [editSectionName, setEditSectionName] = useState('');
  const [editSectionCapacity, setEditSectionCapacity] = useState('');
  const [editSectionClassTeacherId, setEditSectionClassTeacherId] = useState(NO_CLASS_TEACHER);
  const [editSectionError, setEditSectionError] = useState<string | undefined>();

  const [deleteSectionTarget, setDeleteSectionTarget] = useState<Section | null>(null);
  const [deleteSectionError, setDeleteSectionError] = useState<string | undefined>();

  const styles = useThemedStyles(t2 => ({
    searchSection: {paddingHorizontal: t2.spacing.lg, paddingTop: t2.spacing.md},
    scrollContent: {padding: t2.spacing.lg, flexGrow: 1},
    card: {marginBottom: t2.spacing.md},
    sectionRow: {paddingVertical: t2.spacing.sm},
    chipsRow: {rowGap: t2.spacing.sm, marginTop: t2.spacing.xs},
    sectionRowInputWrap: {flex: 1},
    removeButton: {marginLeft: t2.spacing.sm},
    modalButtonWrap: {flex: 1},
  }));

  const classTeacherOptions = [
    {label: t('classesManage_noClassTeacher'), value: NO_CLASS_TEACHER},
    ...(teachersPage?.items ?? []).map(tch => ({label: tch.name, value: tch.id})),
  ];

  const openClassModal = (): void => {
    setClassName('');
    setNumericLevel('');
    setSectionRows([{name: '', capacity: '40'}]);
    setClassModalError(undefined);
    setClassModalOpen(true);
  };

  const updateSectionRow = (index: number, patch: Partial<SectionRow>): void => {
    setSectionRows(prev => prev.map((row, i) => (i === index ? {...row, ...patch} : row)));
  };

  const addSectionRow = (): void => {
    setSectionRows(prev => [...prev, {name: '', capacity: '40'}]);
  };

  const removeSectionRow = (index: number): void => {
    setSectionRows(prev => prev.filter((_, i) => i !== index));
  };

  const submitClass = (): void => {
    const trimmedName = className.trim();
    const level = Number(numericLevel);
    const sections = sectionRows
      .map(row => ({name: row.name.trim(), capacity: Number(row.capacity) || 40}))
      .filter(row => row.name.length > 0);

    if (!trimmedName || !level || sections.length === 0) {
      setClassModalError(t('classesManage_fillRequiredFields'));
      return;
    }

    createClassMutation.mutate(
      {name: trimmedName, numericLevel: level, sections},
      {
        onSuccess: () => setClassModalOpen(false),
        onError: (e: Error & {code?: string}) => {
          if (e.code === 'CLASS_NAME_TAKEN') {
            setClassModalError(t('classesManage_classNameTaken'));
          } else if (e.code === 'SECTION_NAME_TAKEN') {
            setClassModalError(t('classesManage_sectionNameTaken'));
          } else {
            setClassModalError(e.message);
          }
        },
      },
    );
  };

  const openSectionModal = (classId: string): void => {
    setSectionModalClassId(classId);
    setNewSectionName('');
    setNewSectionCapacity('40');
    setSectionModalError(undefined);
  };

  const submitSection = (): void => {
    if (!sectionModalClassId || !newSectionName.trim()) {
      return;
    }
    addSectionMutation.mutate(
      {classId: sectionModalClassId, input: {name: newSectionName.trim(), capacity: Number(newSectionCapacity) || 40}},
      {
        onSuccess: () => setSectionModalClassId(null),
        onError: (e: Error & {code?: string}) => {
          setSectionModalError(
            e.code === 'SECTION_NAME_TAKEN' ? t('classesManage_sectionNameTaken') : e.message,
          );
        },
      },
    );
  };

  const openClassEditModal = (cls: SchoolClass): void => {
    setClassEditTarget(cls);
    setEditClassName(cls.name);
    setEditClassNumericLevel(String(cls.numericLevel));
    setEditClassError(undefined);
  };

  const submitEditClass = (): void => {
    if (!classEditTarget) {
      return;
    }
    const trimmedName = editClassName.trim();
    const level = Number(editClassNumericLevel);
    const patch: {name?: string; numericLevel?: number} = {};
    if (trimmedName && trimmedName !== classEditTarget.name) {
      patch.name = trimmedName;
    }
    if (level && level !== classEditTarget.numericLevel) {
      patch.numericLevel = level;
    }
    if (Object.keys(patch).length === 0) {
      setClassEditTarget(null);
      return;
    }
    updateClassMutation.mutate(
      {classId: classEditTarget.id, input: patch},
      {
        onSuccess: () => setClassEditTarget(null),
        onError: (e: Error & {code?: string}) => {
          setEditClassError(e.code === 'CLASS_NAME_TAKEN' ? t('classesManage_classNameTaken') : e.message);
        },
      },
    );
  };

  const confirmDeleteClass = (): void => {
    if (!deleteClassTarget) {
      return;
    }
    deleteClassMutation.mutate(deleteClassTarget.id, {
      onSuccess: () => setDeleteClassTarget(null),
      onError: (e: Error & {code?: string}) => {
        setDeleteClassError(
          e.code === 'CLASS_HAS_STUDENTS' ? t('classesManage_classHasStudents') : e.message,
        );
      },
    });
  };

  const openSectionEditModal = (section: Section): void => {
    setSectionEditTarget(section);
    setEditSectionName(section.name);
    setEditSectionCapacity(String(section.capacity));
    setEditSectionClassTeacherId(section.classTeacherId ?? NO_CLASS_TEACHER);
    setEditSectionError(undefined);
  };

  const submitEditSection = (): void => {
    if (!sectionEditTarget) {
      return;
    }
    const trimmedName = editSectionName.trim();
    const capacity = Number(editSectionCapacity);
    const currentTeacherId = sectionEditTarget.classTeacherId ?? NO_CLASS_TEACHER;
    const patch: {name?: string; capacity?: number; classTeacherId?: string | null} = {};
    if (trimmedName && trimmedName !== sectionEditTarget.name) {
      patch.name = trimmedName;
    }
    if (capacity && capacity !== sectionEditTarget.capacity) {
      patch.capacity = capacity;
    }
    if (editSectionClassTeacherId !== currentTeacherId) {
      patch.classTeacherId = editSectionClassTeacherId === NO_CLASS_TEACHER ? null : editSectionClassTeacherId;
    }
    if (Object.keys(patch).length === 0) {
      setSectionEditTarget(null);
      return;
    }
    updateSectionMutation.mutate(
      {classId: sectionEditTarget.classId, sectionId: sectionEditTarget.id, input: patch},
      {
        onSuccess: () => setSectionEditTarget(null),
        onError: (e: Error & {code?: string}) => {
          if (e.code === 'SECTION_NAME_TAKEN') {
            setEditSectionError(t('classesManage_sectionNameTaken'));
          } else if (e.code === 'TEACHER_ALREADY_CLASS_TEACHER') {
            setEditSectionError(t('classesManage_teacherAlreadyClassTeacher'));
          } else if (e.code === 'TEACHER_NOT_FOUND') {
            setEditSectionError(t('classesManage_teacherNotFound'));
          } else {
            setEditSectionError(e.message);
          }
        },
      },
    );
  };

  const confirmDeleteSection = (): void => {
    if (!deleteSectionTarget) {
      return;
    }
    deleteSectionMutation.mutate(
      {classId: deleteSectionTarget.classId, sectionId: deleteSectionTarget.id},
      {
        onSuccess: () => setDeleteSectionTarget(null),
        onError: (e: Error & {code?: string}) => {
          setDeleteSectionError(
            e.code === 'SECTION_HAS_STUDENTS' ? t('classesManage_sectionHasStudents') : e.message,
          );
        },
      },
    );
  };

  const renderClass = (cls: SchoolClass): React.JSX.Element => {
    const expanded = expandedId === cls.id;
    return (
      <CustomCard key={cls.id} style={styles.card} padded={false}>
        <Pressable onPress={() => setExpandedId(expanded ? null : cls.id)} style={{padding: theme.spacing.lg}}>
          <Row justify="space-between" align="center">
            <View style={{flex: 1}}>
              <AppText variant="h3">{cls.name}</AppText>
              <AppText variant="caption" color="textSecondary">
                {t('classesManage_studentsCount', {count: cls.totalStudents})}
              </AppText>
            </View>
            <Row gap={theme.spacing.md} align="center">
              <Pressable onPress={() => openClassEditModal(cls)} hitSlop={8}>
                <Icon name="edit" size={18} color={theme.colors.textMuted} />
              </Pressable>
              <Pressable
                onPress={() => {
                  setDeleteClassTarget(cls);
                  setDeleteClassError(undefined);
                }}
                hitSlop={8}>
                <Icon name="delete" size={18} color={theme.colors.error} />
              </Pressable>
              <Icon
                name="forward"
                size={18}
                color={theme.colors.textMuted}
                style={{transform: [{rotate: expanded ? '-90deg' : '90deg'}]}}
              />
            </Row>
          </Row>
        </Pressable>

        {expanded ? (
          <View style={{paddingHorizontal: theme.spacing.lg, paddingBottom: theme.spacing.lg}}>
            <Divider />
            <AppText variant="label" color="textSecondary">
              {t('classesManage_sectionsLabel')}
            </AppText>
            <Spacer size={theme.spacing.xs} />
            {cls.sections.length === 0 ? (
              <AppText variant="caption" color="textMuted">
                {t('classesManage_noSections')}
              </AppText>
            ) : (
              cls.sections.map((section, index) => (
                <View key={section.id}>
                  {index > 0 ? <Divider /> : null}
                  <Row justify="space-between" align="center" style={styles.sectionRow}>
                    <View>
                      <AppText variant="bodyBold">{section.name}</AppText>
                      <AppText variant="caption" color="textSecondary">
                        {t('classesManage_sectionMeta', {
                          count: section.studentCount,
                          capacity: section.capacity,
                        })}
                      </AppText>
                    </View>
                    <Row gap={theme.spacing.sm} align="center">
                      {section.classTeacherName ? (
                        <Badge label={section.classTeacherName} tone="info" />
                      ) : null}
                      <Pressable onPress={() => openSectionEditModal(section)} hitSlop={8}>
                        <Icon name="edit" size={16} color={theme.colors.textMuted} />
                      </Pressable>
                      <Pressable
                        onPress={() => {
                          setDeleteSectionTarget(section);
                          setDeleteSectionError(undefined);
                        }}
                        hitSlop={8}>
                        <Icon name="delete" size={16} color={theme.colors.error} />
                      </Pressable>
                    </Row>
                  </Row>
                </View>
              ))
            )}
            <Spacer size={theme.spacing.sm} />
            <CustomButton
              title={t('classesManage_addSection')}
              variant="outline"
              size="sm"
              iconLeft="add"
              onPress={() => openSectionModal(cls.id)}
            />

            <Spacer size={theme.spacing.md} />
            <AppText variant="label" color="textSecondary">
              {t('classesManage_subjectsLabel')}
            </AppText>
            <Row wrap style={styles.chipsRow}>
              {cls.subjects.length === 0 ? (
                <AppText variant="caption" color="textMuted">
                  {t('classesManage_noSubjects')}
                </AppText>
              ) : (
                cls.subjects.map(subject => <Badge key={subject.id} label={subject.name} tone="primary" />)
              )}
            </Row>
          </View>
        ) : null}
      </CustomCard>
    );
  };

  const filteredClasses = (classes ?? []).filter(cls =>
    cls.name.toLowerCase().includes(search.trim().toLowerCase()),
  );

  return (
    <Screen padded={false}>
      <CustomHeader
        title={t('classesManage_headerTitle')}
        actions={[{icon: 'add', onPress: openClassModal}]}
      />
      {isError ? (
        <EmptyState
          icon="warning"
          title={t('common_somethingWentWrong')}
          message={(error as {message?: string} | null)?.message ?? t('common_checkConnection')}
          actionLabel={t('common_retry')}
          onAction={() => refetch()}
        />
      ) : isLoading || !classes ? (
        <Loader message={t('classesManage_loading')} />
      ) : (
        <>
          <View style={styles.searchSection}>
            <SearchBar value={search} onChangeText={setSearch} placeholder={t('classesManage_searchPlaceholder')} />
          </View>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {classes.length === 0 ? (
              <EmptyState
                icon="class"
                title={t('classesManage_emptyTitle')}
                message={t('classesManage_emptyMessage')}
                actionLabel={t('classesManage_addClass')}
                onAction={openClassModal}
              />
            ) : filteredClasses.length === 0 ? (
              <EmptyState
                icon="search"
                title={t('studentsWiseClassList_noResultsTitle')}
                message={t('studentsWiseClassList_noResultsMessage')}
              />
            ) : (
              filteredClasses.map(renderClass)
            )}
          </ScrollView>
        </>
      )}

      <CustomModal visible={classModalOpen} onClose={() => setClassModalOpen(false)} title={t('classesManage_addClass')}>
        <CustomInput
          label={t('classesManage_classNameLabel')}
          placeholder={t('classesManage_classNamePlaceholder')}
          value={className}
          onChangeText={setClassName}
          required
        />
        <CustomInput
          label={t('classesManage_numericLevelLabel')}
          placeholder={t('classesManage_numericLevelPlaceholder')}
          keyboardType="numeric"
          value={numericLevel}
          onChangeText={setNumericLevel}
          required
        />
        <AppText variant="label" color="textSecondary">
          {t('classesManage_sectionsLabel')}
        </AppText>
        <Spacer size={theme.spacing.xs} />
        {sectionRows.map((row, index) => (
          <Row key={index} gap={theme.spacing.sm} align="flex-start">
            <View style={styles.sectionRowInputWrap}>
              <CustomInput
                placeholder={t('classesManage_sectionNamePlaceholder')}
                value={row.name}
                onChangeText={val => updateSectionRow(index, {name: val})}
              />
            </View>
            <View style={styles.sectionRowInputWrap}>
              <CustomInput
                placeholder={t('classesManage_capacityLabel')}
                keyboardType="numeric"
                value={row.capacity}
                onChangeText={val => updateSectionRow(index, {capacity: val})}
              />
            </View>
            {sectionRows.length > 1 ? (
              <Pressable onPress={() => removeSectionRow(index)} hitSlop={8} style={{marginTop: theme.spacing.sm}}>
                <Icon name="close" size={18} color={theme.colors.error} />
              </Pressable>
            ) : null}
          </Row>
        ))}
        <Pressable onPress={addSectionRow} hitSlop={8}>
          <Row gap={4}>
            <Icon name="add" size={14} color={theme.colors.primary} />
            <AppText variant="caption" color="primary" style={{fontWeight: '700'}}>
              {t('classesManage_addAnotherSection')}
            </AppText>
          </Row>
        </Pressable>

        {classModalError ? (
          <AppText variant="caption" color="error" style={{marginTop: theme.spacing.sm}}>
            {classModalError}
          </AppText>
        ) : null}

        <Spacer size={16} />
        <CustomButton title={t('common_add')} onPress={submitClass} loading={createClassMutation.isPending} />
      </CustomModal>

      <CustomModal
        visible={!!sectionModalClassId}
        onClose={() => setSectionModalClassId(null)}
        title={t('classesManage_addSection')}>
        <CustomInput
          label={t('classesManage_sectionNameLabel')}
          placeholder={t('classesManage_sectionNamePlaceholder')}
          value={newSectionName}
          onChangeText={setNewSectionName}
          required
        />
        <CustomInput
          label={t('classesManage_capacityLabel')}
          keyboardType="numeric"
          value={newSectionCapacity}
          onChangeText={setNewSectionCapacity}
          containerStyle={{marginBottom: 0}}
        />
        {sectionModalError ? (
          <AppText variant="caption" color="error" style={{marginTop: theme.spacing.sm}}>
            {sectionModalError}
          </AppText>
        ) : null}
        <Spacer size={16} />
        <CustomButton title={t('common_add')} onPress={submitSection} loading={addSectionMutation.isPending} />
      </CustomModal>

      <CustomModal
        visible={!!classEditTarget}
        onClose={() => setClassEditTarget(null)}
        title={t('classesManage_editClass')}>
        <CustomInput
          label={t('classesManage_classNameLabel')}
          placeholder={t('classesManage_classNamePlaceholder')}
          value={editClassName}
          onChangeText={setEditClassName}
          required
        />
        <CustomInput
          label={t('classesManage_numericLevelLabel')}
          placeholder={t('classesManage_numericLevelPlaceholder')}
          keyboardType="numeric"
          value={editClassNumericLevel}
          onChangeText={setEditClassNumericLevel}
          containerStyle={{marginBottom: 0}}
          required
        />
        {editClassError ? (
          <AppText variant="caption" color="error" style={{marginTop: theme.spacing.sm}}>
            {editClassError}
          </AppText>
        ) : null}
        <Spacer size={16} />
        <CustomButton title={t('common_save')} onPress={submitEditClass} loading={updateClassMutation.isPending} />
      </CustomModal>

      <CustomModal
        visible={!!deleteClassTarget}
        onClose={() => setDeleteClassTarget(null)}
        title={t('classesManage_deleteClass')}>
        <AppText variant="body" color="textSecondary">
          {t('classesManage_deleteClassConfirm', {name: deleteClassTarget?.name ?? ''})}
        </AppText>
        {deleteClassError ? (
          <AppText variant="caption" color="error" style={{marginTop: theme.spacing.sm}}>
            {deleteClassError}
          </AppText>
        ) : null}
        <Spacer size={16} />
        <Row gap={theme.spacing.md}>
          <View style={styles.modalButtonWrap}>
            <CustomButton title={t('common_cancel')} variant="outline" onPress={() => setDeleteClassTarget(null)} />
          </View>
          <View style={styles.modalButtonWrap}>
            <CustomButton
              title={t('common_delete')}
              variant="danger"
              loading={deleteClassMutation.isPending}
              onPress={confirmDeleteClass}
            />
          </View>
        </Row>
      </CustomModal>

      <CustomModal
        visible={!!sectionEditTarget}
        onClose={() => setSectionEditTarget(null)}
        title={t('classesManage_editSection')}>
        <CustomInput
          label={t('classesManage_sectionNameLabel')}
          placeholder={t('classesManage_sectionNamePlaceholder')}
          value={editSectionName}
          onChangeText={setEditSectionName}
          required
        />
        <CustomInput
          label={t('classesManage_capacityLabel')}
          keyboardType="numeric"
          value={editSectionCapacity}
          onChangeText={setEditSectionCapacity}
          required
        />
        <Select
          label={t('classesManage_classTeacherLabel')}
          value={editSectionClassTeacherId}
          options={classTeacherOptions}
          onChange={setEditSectionClassTeacherId}
        />
        {editSectionError ? (
          <AppText variant="caption" color="error" style={{marginBottom: theme.spacing.sm}}>
            {editSectionError}
          </AppText>
        ) : null}
        <CustomButton title={t('common_save')} onPress={submitEditSection} loading={updateSectionMutation.isPending} />
      </CustomModal>

      <CustomModal
        visible={!!deleteSectionTarget}
        onClose={() => setDeleteSectionTarget(null)}
        title={t('classesManage_deleteSection')}>
        <AppText variant="body" color="textSecondary">
          {t('classesManage_deleteSectionConfirm', {name: deleteSectionTarget?.name ?? ''})}
        </AppText>
        {deleteSectionError ? (
          <AppText variant="caption" color="error" style={{marginTop: theme.spacing.sm}}>
            {deleteSectionError}
          </AppText>
        ) : null}
        <Spacer size={16} />
        <Row gap={theme.spacing.md}>
          <View style={styles.modalButtonWrap}>
            <CustomButton title={t('common_cancel')} variant="outline" onPress={() => setDeleteSectionTarget(null)} />
          </View>
          <View style={styles.modalButtonWrap}>
            <CustomButton
              title={t('common_delete')}
              variant="danger"
              loading={deleteSectionMutation.isPending}
              onPress={confirmDeleteSection}
            />
          </View>
        </Row>
      </CustomModal>
    </Screen>
  );
}
