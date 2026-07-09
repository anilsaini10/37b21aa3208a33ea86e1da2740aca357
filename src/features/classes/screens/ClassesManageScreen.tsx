/** Admin — Classes & Sections management: list, expand for detail, create class, add section. */
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
  AppText,
  Badge,
  Icon,
  Row,
  Spacer,
  Divider,
  EmptyState,
  Loader,
} from '../../../shared/components';
import {useClasses, useCreateClass, useAddSection} from '../classes.service';
import type {SchoolClass} from '../../../shared/types';

interface SectionRow {
  name: string;
  capacity: string;
}

export function ClassesManageScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const {data: classes, isLoading, isError, error, refetch} = useClasses();
  const createClassMutation = useCreateClass();
  const addSectionMutation = useAddSection();

  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [classModalOpen, setClassModalOpen] = useState(false);
  const [className, setClassName] = useState('');
  const [numericLevel, setNumericLevel] = useState('');
  const [sectionRows, setSectionRows] = useState<SectionRow[]>([{name: '', capacity: '40'}]);
  const [classModalError, setClassModalError] = useState<string | undefined>();

  const [sectionModalClassId, setSectionModalClassId] = useState<string | null>(null);
  const [newSectionName, setNewSectionName] = useState('');
  const [newSectionCapacity, setNewSectionCapacity] = useState('40');
  const [sectionModalError, setSectionModalError] = useState<string | undefined>();

  const styles = useThemedStyles(t2 => ({
    scrollContent: {padding: t2.spacing.lg, flexGrow: 1},
    card: {marginBottom: t2.spacing.md},
    sectionRow: {paddingVertical: t2.spacing.sm},
    chipsRow: {rowGap: t2.spacing.sm, marginTop: t2.spacing.xs},
    sectionRowInputWrap: {flex: 1},
    removeButton: {marginLeft: t2.spacing.sm},
  }));

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

  const renderClass = (cls: SchoolClass): React.JSX.Element => {
    const expanded = expandedId === cls.id;
    return (
      <CustomCard key={cls.id} style={styles.card} padded={false}>
        <Pressable onPress={() => setExpandedId(expanded ? null : cls.id)} style={{padding: theme.spacing.lg}}>
          <Row justify="space-between" align="center">
            <View>
              <AppText variant="h3">{cls.name}</AppText>
              <AppText variant="caption" color="textSecondary">
                {t('classesManage_studentsCount', {count: cls.totalStudents})}
              </AppText>
            </View>
            <Icon
              name="forward"
              size={18}
              color={theme.colors.textMuted}
              style={{transform: [{rotate: expanded ? '-90deg' : '90deg'}]}}
            />
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
                  <Row justify="space-between" style={styles.sectionRow}>
                    <View>
                      <AppText variant="bodyBold">{section.name}</AppText>
                      <AppText variant="caption" color="textSecondary">
                        {t('classesManage_sectionMeta', {
                          count: section.studentCount,
                          capacity: section.capacity,
                        })}
                      </AppText>
                    </View>
                    {section.classTeacherName ? (
                      <Badge label={section.classTeacherName} tone="info" />
                    ) : null}
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
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {classes.length === 0 ? (
            <EmptyState
              icon="class"
              title={t('classesManage_emptyTitle')}
              message={t('classesManage_emptyMessage')}
              actionLabel={t('classesManage_addClass')}
              onAction={openClassModal}
            />
          ) : (
            classes.map(renderClass)
          )}
        </ScrollView>
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
    </Screen>
  );
}
