/** Mark Attendance — pick class/section, toggle P/A/L per student, save in bulk. */
import React, {useEffect, useState} from 'react';
import {Pressable, View, ScrollView} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme, useThemedStyles} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {
  Screen,
  AppText,
  CustomHeader,
  CustomCard,
  CustomButton,
  SectionTitle,
  Select,
  Badge,
  Loader,
  EmptyState,
  Row,
  Spacer,
  Divider,
} from '../../../shared/components';
import {db} from '../../../core/mock/db';
import {useAttendanceStudents, useMarkAttendance} from '../attendance.service';
import type {TeacherStackParamList} from '../../../navigation/types';

type Nav = NativeStackNavigationProp<TeacherStackParamList>;
type AttStatus = 'present' | 'absent' | 'late';

const OPTION_KEYS: AttStatus[] = ['present', 'absent', 'late'];

/** Present → green, Absent → red, Late → amber, matching the app's semantic tones. */
const STATUS_TONE: Record<AttStatus, 'success' | 'error' | 'warning'> = {
  present: 'success',
  absent: 'error',
  late: 'warning',
};

export function MarkAttendanceScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const navigation = useNavigation<Nav>();
  const {t} = useLanguage();
  const styles = useThemedStyles(t2 => ({
    scrollContent: {
      padding: t2.spacing.lg,
    },
    selectFlex: {
      flex: 1,
    },
    summaryRow: {
      marginBottom: t2.spacing.md,
    },
    summaryItem: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: t2.spacing.xs,
      borderRadius: t2.radius.md,
    },
    studentInfo: {
      flex: 1,
    },
    optionButton: {
      width: 44,
      height: 36,
      borderRadius: t2.components.button.radius,
      alignItems: 'center',
      justifyContent: 'center',
    },
  }));

  const OPTIONS: {key: AttStatus; label: string}[] = OPTION_KEYS.map(key => ({
    key,
    label:
      key === 'present'
        ? t('markAttendance_presentAbbr')
        : key === 'absent'
        ? t('markAttendance_absentAbbr')
        : t('markAttendance_lateAbbr'),
  }));

  const SUMMARY: {key: AttStatus; label: string}[] = OPTION_KEYS.map(key => ({
    key,
    label:
      key === 'present'
        ? t('markAttendance_presentLabel')
        : key === 'absent'
        ? t('markAttendance_absentLabel')
        : t('markAttendance_lateLabel'),
  }));

  const [classId, setClassId] = useState(db.classes[0]?.id ?? '');
  const [sectionId, setSectionId] = useState(db.sections[0]?.id ?? '');
  const [statuses, setStatuses] = useState<Record<string, AttStatus>>({});
  const [saved, setSaved] = useState(false);

  const counts: Record<AttStatus, number> = {present: 0, absent: 0, late: 0};
  Object.values(statuses).forEach(status => {
    counts[status] += 1;
  });

  const {data: students, isLoading} = useAttendanceStudents(classId, sectionId);
  const markAttendance = useMarkAttendance();

  const classOptions = db.classes.map(c => ({label: c.name, value: c.id}));
  const sectionsForClass = db.sections.filter(s => s.classId === classId);
  const sectionOptions = sectionsForClass.map(s => ({
    label: t('common_sectionOptionLabel', {name: s.name}),
    value: s.id,
  }));

  const onChangeClass = (nextClassId: string) => {
    setClassId(nextClassId);
    const firstSection = db.sections.find(s => s.classId === nextClassId);
    setSectionId(firstSection?.id ?? '');
  };

  useEffect(() => {
    if (students) {
      const next: Record<string, AttStatus> = {};
      students.forEach(s => {
        next[s.id] = 'present';
      });
      setStatuses(next);
      setSaved(false);
    }
  }, [students]);

  const setStatus = (id: string, status: AttStatus) => {
    setStatuses(prev => ({...prev, [id]: status}));
    setSaved(false);
  };

  const onSave = () => {
    markAttendance.mutate(
      {
        date: new Date().toISOString().slice(0, 10),
        entries: Object.entries(statuses).map(([studentId, status]) => ({studentId, status})),
      },
      {onSuccess: () => setSaved(true)},
    );
  };

  return (
    <Screen padded={false}>
      <CustomHeader title={t('markAttendance_title')} onBack={() => navigation.goBack()} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <Row gap={theme.spacing.md} align="flex-start">
          <View style={styles.selectFlex}>
            <Select label={t('markAttendance_class')} value={classId} options={classOptions} onChange={onChangeClass} />
          </View>
          <View style={styles.selectFlex}>
            <Select
              label={t('markAttendance_section')}
              value={sectionId}
              options={sectionOptions}
              onChange={setSectionId}
            />
          </View>
        </Row>

        <SectionTitle title={t('markAttendance_students')} />

        {isLoading ? (
          <Loader message={t('markAttendance_loadingStudents')} />
        ) : !students || students.length === 0 ? (
          <EmptyState
            icon="students"
            title={t('markAttendance_noStudentsTitle')}
            message={t('markAttendance_noStudentsMessage')}
          />
        ) : (
          <>
            <Row gap={theme.spacing.sm} style={styles.summaryRow}>
              {SUMMARY.map(item => {
                const color = theme.colors[STATUS_TONE[item.key]];
                return (
                  <View
                    key={item.key}
                    style={[styles.summaryItem, {backgroundColor: color + '18'}]}>
                    <AppText variant="bodyBold" style={{color}}>
                      {counts[item.key]}
                    </AppText>
                    <AppText variant="label" style={{color}}>
                      {item.label}
                    </AppText>
                  </View>
                );
              })}
            </Row>

            <CustomCard>
              {students.map((student, i) => (
                <View key={student.id}>
                  {i > 0 ? <Divider /> : null}
                  <Row justify="space-between" gap={theme.spacing.sm}>
                    <View style={styles.studentInfo}>
                      <AppText variant="bodyBold" numberOfLines={1}>
                        {student.name}
                      </AppText>
                      <AppText variant="caption" color="textSecondary">
                        {t('markAttendance_rollNumber', {rollNo: String(student.rollNo)})}
                      </AppText>
                    </View>
                    <Row gap={theme.spacing.xs}>
                      {OPTIONS.map(opt => {
                        const isSelected = statuses[student.id] === opt.key;
                        const color = theme.colors[STATUS_TONE[opt.key]];
                        return (
                          <Pressable
                            key={opt.key}
                            onPress={() => setStatus(student.id, opt.key)}
                            style={[
                              styles.optionButton,
                              {
                                backgroundColor: isSelected ? color : color + '18',
                                borderWidth: isSelected ? 0 : 1.5,
                                borderColor: color + '55',
                              },
                            ]}>
                            <AppText
                              variant="button"
                              style={{color: isSelected ? theme.colors.onPrimary : color}}>
                              {opt.label}
                            </AppText>
                          </Pressable>
                        );
                      })}
                    </Row>
                  </Row>
                </View>
              ))}
            </CustomCard>
          </>
        )}

        {students && students.length > 0 ? (
          <>
            <Spacer size={16} />
            {saved ? (
              <Row justify="center">
                <Badge label={t('markAttendance_saved')} tone="success" />
              </Row>
            ) : null}
            <Spacer size={8} />
            <CustomButton
              title={t('markAttendance_saveAttendance')}
              iconLeft="check"
              loading={markAttendance.isPending}
              onPress={onSave}
            />
          </>
        ) : null}
        <Spacer size={24} />
      </ScrollView>
    </Screen>
  );
}
