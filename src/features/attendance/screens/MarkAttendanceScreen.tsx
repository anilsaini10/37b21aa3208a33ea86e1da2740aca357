/** Mark Attendance — pick class/section, toggle P/A/L per student, save in bulk. */
import React, {useEffect, useState} from 'react';
import {View, ScrollView} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme} from '../../../core/theme';
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

export function MarkAttendanceScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const navigation = useNavigation<Nav>();
  const {t} = useLanguage();

  const OPTIONS: {key: AttStatus; label: string}[] = OPTION_KEYS.map(key => ({
    key,
    label:
      key === 'present'
        ? t('markAttendance_presentAbbr')
        : key === 'absent'
        ? t('markAttendance_absentAbbr')
        : t('markAttendance_lateAbbr'),
  }));

  const [classId, setClassId] = useState(db.classes[0]?.id ?? '');
  const [sectionId, setSectionId] = useState(db.sections[0]?.id ?? '');
  const [statuses, setStatuses] = useState<Record<string, AttStatus>>({});
  const [saved, setSaved] = useState(false);

  const {data: students, isLoading} = useAttendanceStudents(classId, sectionId);
  const markAttendance = useMarkAttendance();

  const classOptions = db.classes.map(c => ({label: c.name, value: c.id}));
  const sectionOptions = db.sections.map(s => ({
    label: t('common_sectionOptionLabel', {name: s.name}),
    value: s.id,
  }));

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
        contentContainerStyle={{padding: theme.spacing.lg}}
        showsVerticalScrollIndicator={false}>
        <Row gap={theme.spacing.md} align="flex-start">
          <View style={{flex: 1}}>
            <Select label={t('markAttendance_class')} value={classId} options={classOptions} onChange={setClassId} />
          </View>
          <View style={{flex: 1}}>
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
          <CustomCard>
            {students.map((student, i) => (
              <View key={student.id}>
                {i > 0 ? <Divider /> : null}
                <Row justify="space-between" gap={theme.spacing.sm}>
                  <View style={{flex: 1}}>
                    <AppText variant="bodyBold" numberOfLines={1}>
                      {student.name}
                    </AppText>
                    <AppText variant="caption" color="textSecondary">
                      {t('markAttendance_rollNumber', {rollNo: String(student.rollNo)})}
                    </AppText>
                  </View>
                  <Row gap={theme.spacing.xs}>
                    {OPTIONS.map(opt => (
                      <View key={opt.key} style={{width: 44}}>
                        <CustomButton
                          title={opt.label}
                          size="sm"
                          fullWidth={false}
                          variant={statuses[student.id] === opt.key ? 'primary' : 'outline'}
                          onPress={() => setStatus(student.id, opt.key)}
                        />
                      </View>
                    ))}
                  </Row>
                </Row>
              </View>
            ))}
          </CustomCard>
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
