/** Create Syllabus Plan — 3-step wizard. */
import React, {useState, useCallback, useMemo} from 'react';
import {Alert, Pressable, ScrollView, Switch, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme, useThemedStyles} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {
  Screen,
  CustomHeader,
  CustomCard,
  CustomButton,
  CustomInput,
  Select,
  DatePicker,
  AppText,
  Row,
  Spacer,
  Loader,
  EmptyState,
} from '../../../shared/components';
import {formatSessionYear} from '../../../shared/helpers';
import {useAdminChapters, useCreatePlan, useSubjectsByClass} from '../adminSyllabus.service';
import {useClasses} from '../../classes/classes.service';
import {useTeachers} from '../../teachers/teachers.service';
import type {CreatePlanChapterInput, SyllabusChapter} from '../../../shared/types';
import type {AdminStackParamList} from '../../../navigation/types';

type Nav = NativeStackNavigationProp<AdminStackParamList>;

const YEARS = Array.from({length: 7}, (_, i) => {
  const y = 2024 + i;
  return {label: formatSessionYear(y), value: String(y)};
});

interface ChapterSelection extends CreatePlanChapterInput {
  name: string;
  selected: boolean;
}

export function CreatePlanScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const {t} = useLanguage();
  const navigation = useNavigation<Nav>();
  const [step, setStep] = useState(1);

  const currentYear = new Date().getFullYear();
  const [sessionYear, setSessionYear] = useState(String(currentYear));
  const [classId, setClassId] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [remarks, setRemarks] = useState('');
  const [approvalEnabled, setApprovalEnabled] = useState(false);
  const [chapters, setChapters] = useState<ChapterSelection[]>([]);

  const {data: classes} = useClasses();
  const {data: subjects} = useSubjectsByClass(classId || undefined);
  const {data: teachersData} = useTeachers();
  const {data: chaptersData, isLoading: chaptersLoading} = useAdminChapters(
    classId && subjectId ? {classId, subjectId, pageSize: 200} : {},
  );
  const createMutation = useCreatePlan();

  const classOptions = useMemo(() => (classes ?? []).map(c => ({label: c.name, value: c.id})), [classes]);
  const sectionOptions = useMemo(() => {
    if (!classId || !classes) return [];
    const cls = classes.find(c => c.id === classId);
    return cls?.sections.map(s => ({label: s.name, value: s.id})) ?? [];
  }, [classId, classes]);
  const subjectOptions = useMemo(() => (subjects ?? []).map(s => ({label: s.name, value: s.id})), [subjects]);
  const teacherOptions = useMemo(() => {
    const items = teachersData?.items ?? teachersData ?? [];
    return [{label: t('common_notAssigned'), value: ''}, ...(Array.isArray(items) ? items : []).map((te: any) => ({label: te.name, value: te.id}))];
  }, [teachersData, t]);

  const styles = useThemedStyles(t2 => ({
    content: {padding: t2.spacing.lg, paddingBottom: t2.spacing.xxl},
    stepIndicator: {marginBottom: t2.spacing.lg, alignItems: 'center'},
    chapterRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: t2.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: t2.colors.divider,
    },
    checkbox: {
      width: 22,
      height: 22,
      borderRadius: 4,
      borderWidth: 2,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: t2.spacing.sm,
    },
    chapterFields: {flex: 1},
    fieldRow: {flexDirection: 'row', gap: t2.spacing.sm},
    fieldCol: {flex: 1},
    reviewCard: {marginBottom: t2.spacing.sm},
    switchRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: t2.spacing.sm,
    },
    navRow: {flexDirection: 'row', gap: t2.spacing.md, marginTop: t2.spacing.lg},
  }));

  const initChapters = useCallback(() => {
    if (!chaptersData?.items) return;
    setChapters(
      chaptersData.items.map((ch: SyllabusChapter, i: number) => ({
        chapterId: ch.id,
        name: ch.name,
        selected: false,
        sequenceNumber: i + 1,
        expectedWorkingDays: ch.expectedWorkingDays,
        plannedStartDate: undefined,
        plannedEndDate: undefined,
      })),
    );
  }, [chaptersData]);

  const goToStep2 = useCallback(() => {
    if (!sessionYear || !classId || !sectionId || !subjectId) {
      Alert.alert(t('common_error'), t('common_select'));
      return;
    }
    initChapters();
    setStep(2);
  }, [sessionYear, classId, sectionId, subjectId, initChapters, t]);

  const goToStep3 = useCallback(() => {
    const selected = chapters.filter(c => c.selected);
    if (!selected.length) {
      Alert.alert(t('common_error'), t('syllabus_addChapters'));
      return;
    }
    setStep(3);
  }, [chapters, t]);

  const toggleChapter = useCallback((idx: number) => {
    setChapters(prev => prev.map((c, i) => (i === idx ? {...c, selected: !c.selected} : c)));
  }, []);

  const updateChapterField = useCallback((idx: number, field: string, value: any) => {
    setChapters(prev => prev.map((c, i) => (i === idx ? {...c, [field]: value} : c)));
  }, []);

  const handleSubmit = useCallback(async () => {
    const selected = chapters.filter(c => c.selected);
    try {
      await createMutation.mutateAsync({
        sessionYear: Number(sessionYear),
        classId,
        sectionId,
        subjectId,
        teacherId: teacherId || undefined,
        remarks: remarks.trim() || undefined,
        approvalEnabled,
        chapters: selected.map(c => ({
          chapterId: c.chapterId,
          sequenceNumber: c.sequenceNumber,
          expectedWorkingDays: c.expectedWorkingDays,
          plannedStartDate: c.plannedStartDate,
          plannedEndDate: c.plannedEndDate,
        })),
      });
      Alert.alert(t('common_success'), t('syllabus_planCreated'));
      navigation.goBack();
    } catch (e: any) {
      Alert.alert(t('common_error'), e.message);
    }
  }, [chapters, sessionYear, classId, sectionId, subjectId, teacherId, remarks, approvalEnabled, createMutation, navigation, t]);

  const selectedClassName = classes?.find(c => c.id === classId)?.name ?? '';
  const selectedSectionName = classes?.find(c => c.id === classId)?.sections.find(s => s.id === sectionId)?.name ?? '';
  const selectedSubjectName = subjects?.find(s => s.id === subjectId)?.name ?? '';
  const selectedChapters = chapters.filter(c => c.selected);

  return (
    <Screen padded={false}>
      <CustomHeader title={t('syllabus_createPlan')} onBack={() => (step > 1 ? setStep(step - 1) : navigation.goBack())} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.stepIndicator}>
          <AppText variant="bodyBold" color="primary">
            {t('syllabus_step', {step: String(step), total: '3'})}
          </AppText>
          <AppText variant="caption" color="textSecondary">
            {step === 1 ? t('syllabus_basicInfo') : step === 2 ? t('syllabus_chapterConfig') : t('syllabus_review')}
          </AppText>
        </View>

        {step === 1 && (
          <>
            <Select label={t('syllabus_sessionYear')} value={sessionYear} options={YEARS} onChange={setSessionYear} required />
            <Select label={t('class')} value={classId} options={classOptions} onChange={v => { setClassId(v); setSectionId(''); setSubjectId(''); }} required />
            <Select label={t('syllabus_section')} value={sectionId} options={sectionOptions} onChange={setSectionId} disabled={!classId} required />
            <Select label={t('syllabus_subject')} value={subjectId} options={subjectOptions} onChange={setSubjectId} disabled={!classId} required />
            <Select label={t('teacher')} value={teacherId} options={teacherOptions} onChange={setTeacherId} />
            <CustomInput label={t('syllabus_remarks')} value={remarks} onChangeText={setRemarks} maxLength={1000} multiline />
            <View style={styles.switchRow}>
              <AppText>{t('syllabus_approvalEnabled')}</AppText>
              <Switch value={approvalEnabled} onValueChange={setApprovalEnabled} />
            </View>
            <View style={styles.navRow}>
              <CustomButton title={t('common_next')} onPress={goToStep2} />
            </View>
          </>
        )}

        {step === 2 && (
          <>
            {chaptersLoading ? (
              <Loader />
            ) : !chapters.length ? (
              <EmptyState title={t('syllabus_noChapters')} message={t('syllabus_noChaptersMessage')} />
            ) : (
              chapters.map((ch, idx) => (
                <View key={ch.chapterId} style={styles.chapterRow}>
                  <Pressable onPress={() => toggleChapter(idx)} style={[styles.checkbox, {borderColor: ch.selected ? theme.colors.primary : theme.colors.border, backgroundColor: ch.selected ? theme.colors.primary : 'transparent'}]}>
                    {ch.selected ? <AppText style={{color: theme.colors.onPrimary, fontSize: 14}}>✓</AppText> : null}
                  </Pressable>
                  <View style={styles.chapterFields}>
                    <AppText variant="bodyBold">{ch.name}</AppText>
                    {ch.selected && (
                      <>
                        <View style={styles.fieldRow}>
                          <View style={styles.fieldCol}>
                            <CustomInput label={t('syllabus_sequenceNumber')} value={String(ch.sequenceNumber)} onChangeText={v => updateChapterField(idx, 'sequenceNumber', Number(v) || 1)} keyboardType="number-pad" />
                          </View>
                          <View style={styles.fieldCol}>
                            <CustomInput label={t('syllabus_expectedDays')} value={String(ch.expectedWorkingDays)} onChangeText={v => updateChapterField(idx, 'expectedWorkingDays', Number(v) || 0)} keyboardType="number-pad" />
                          </View>
                        </View>
                        <View style={styles.fieldRow}>
                          <View style={styles.fieldCol}>
                            <DatePicker label={t('syllabus_plannedStart')} value={ch.plannedStartDate} onChange={v => updateChapterField(idx, 'plannedStartDate', v)} />
                          </View>
                          <View style={styles.fieldCol}>
                            <DatePicker label={t('syllabus_plannedEnd')} value={ch.plannedEndDate} onChange={v => updateChapterField(idx, 'plannedEndDate', v)} />
                          </View>
                        </View>
                      </>
                    )}
                  </View>
                </View>
              ))
            )}
            <View style={styles.navRow}>
              <CustomButton title={t('common_back')} variant="outline" onPress={() => setStep(1)} style={{flex: 1}} />
              <CustomButton title={t('common_next')} onPress={goToStep3} style={{flex: 1}} />
            </View>
          </>
        )}

        {step === 3 && (
          <>
            <CustomCard style={styles.reviewCard}>
              <AppText variant="bodyBold">{t('syllabus_basicInfo')}</AppText>
              <AppText color="textSecondary">{t('syllabus_sessionYear')}: {formatSessionYear(Number(sessionYear))}</AppText>
              <AppText color="textSecondary">{t('class')}: {selectedClassName} - {selectedSectionName}</AppText>
              <AppText color="textSecondary">{t('syllabus_subject')}: {selectedSubjectName}</AppText>
              {remarks ? <AppText color="textSecondary">{t('syllabus_remarks')}: {remarks}</AppText> : null}
              <AppText color="textSecondary">{t('syllabus_approvalEnabled')}: {approvalEnabled ? t('common_yes') : t('common_no')}</AppText>
            </CustomCard>

            <AppText variant="bodyBold">{t('syllabus_chapters')} ({selectedChapters.length})</AppText>
            <Spacer size={theme.spacing.sm} />
            {selectedChapters.map(ch => (
              <CustomCard key={ch.chapterId} style={styles.reviewCard}>
                <AppText>{ch.name}</AppText>
                <AppText variant="caption" color="textSecondary">
                  {t('syllabus_sequenceNumber')}: {ch.sequenceNumber} · {t('syllabus_expectedDays')}: {ch.expectedWorkingDays}
                </AppText>
                {ch.plannedStartDate || ch.plannedEndDate ? (
                  <AppText variant="caption" color="textSecondary">
                    {ch.plannedStartDate ?? '—'} → {ch.plannedEndDate ?? '—'}
                  </AppText>
                ) : null}
              </CustomCard>
            ))}

            <View style={styles.navRow}>
              <CustomButton title={t('common_back')} variant="outline" onPress={() => setStep(2)} style={{flex: 1}} />
              <CustomButton title={t('common_submit')} onPress={handleSubmit} loading={createMutation.isPending} style={{flex: 1}} />
            </View>
          </>
        )}
      </ScrollView>
    </Screen>
  );
}
