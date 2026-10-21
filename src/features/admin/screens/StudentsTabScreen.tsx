/** Admin "Students" tab — one entry for both Students and Student Attendance, switched by buttons under the header. */
import React, {useState} from 'react';
import {useThemedStyles} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {Screen, CustomHeader, SegmentedTabs} from '../../../shared/components';
import {StudentsWiseClassListScreen} from '../../students/screens/StudentsWiseClassList';
import {AttendanceReportScreen} from '../../attendance/screens/AttendanceReportScreen';

type View = 'students' | 'attendance';

export function StudentsTabScreen(): React.JSX.Element {
  const {t} = useLanguage();
  const [view, setView] = useState<View>('students');
  const styles = useThemedStyles(t2 => ({
    switcher: {marginHorizontal: t2.spacing.lg, marginTop: t2.spacing.md},
  }));

  const switcher = (
    <SegmentedTabs<View>
      style={styles.switcher}
      value={view}
      onChange={setView}
      options={[
        {value: 'students', label: t('adminTabs_students')},
        {value: 'attendance', label: t('adminTabs_studentAttendance')},
      ]}
    />
  );

  if (view === 'students') {
    return <StudentsWiseClassListScreen topSlot={switcher} />;
  }
  return (
    <Screen padded={false}>
      <CustomHeader title={t('studentsWiseClassList_headerTitle')} subtitle={t('studentsWiseClassList_subtitle')} />
      {switcher}
      <AttendanceReportScreen embedded fixedTab="students" />
    </Screen>
  );
}
