/** Mark Attendance — pick class/section, toggle P/A/L per student, save in bulk. */
import React, {useEffect, useState} from 'react';
import {View, ScrollView} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme} from '../../../core/theme';
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

const OPTIONS: {key: AttStatus; label: string}[] = [
  {key: 'present', label: 'P'},
  {key: 'absent', label: 'A'},
  {key: 'late', label: 'L'},
];

export function MarkAttendanceScreen(): React.JSX.Element {
  const {theme} = useTheme();
  const navigation = useNavigation<Nav>();

  const [classId, setClassId] = useState(db.classes[0]?.id ?? '');
  const [sectionId, setSectionId] = useState(db.sections[0]?.id ?? '');
  const [statuses, setStatuses] = useState<Record<string, AttStatus>>({});
  const [saved, setSaved] = useState(false);

  const {data: students, isLoading} = useAttendanceStudents(classId, sectionId);
  const markAttendance = useMarkAttendance();

  const classOptions = db.classes.map(c => ({label: c.name, value: c.id}));
  const sectionOptions = db.sections.map(s => ({label: `Sec ${s.name}`, value: s.id}));

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
      <CustomHeader title="Mark Attendance" onBack={() => navigation.goBack()} />
      <ScrollView
        contentContainerStyle={{padding: theme.spacing.lg}}
        showsVerticalScrollIndicator={false}>
        <Row gap={theme.spacing.md} align="flex-start">
          <View style={{flex: 1}}>
            <Select label="Class" value={classId} options={classOptions} onChange={setClassId} />
          </View>
          <View style={{flex: 1}}>
            <Select label="Section" value={sectionId} options={sectionOptions} onChange={setSectionId} />
          </View>
        </Row>

        <SectionTitle title="Students" />

        {isLoading ? (
          <Loader message="Loading students…" />
        ) : !students || students.length === 0 ? (
          <EmptyState
            icon="students"
            title="No students"
            message="No students found for this class and section."
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
                      {`Roll ${student.rollNo}`}
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
                <Badge label="Saved ✓" tone="success" />
              </Row>
            ) : null}
            <Spacer size={8} />
            <CustomButton
              title="Save Attendance"
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
