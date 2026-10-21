/** Admin "Teachers" tab — one entry for both Teachers and Teacher Attendance, switched by buttons under the header. */
import React, {useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useThemedStyles} from '../../../core/theme';
import {useLanguage} from '../../../core/i18n';
import {Screen, CustomHeader, SegmentedTabs} from '../../../shared/components';
import {TeachersListScreen} from '../../teachers/screens/TeachersListScreen';
import {StaffAttendanceRegisterScreen} from '../../attendance/screens/StaffAttendanceRegisterScreen';
import {ScreenNames} from '../../../navigation/ScreenNames';
import type {AdminStackParamList} from '../../../navigation/types';

type View = 'teachers' | 'attendance';

export function TeachersTabScreen(): React.JSX.Element {
  const {t} = useLanguage();
  const navigation = useNavigation<NativeStackNavigationProp<AdminStackParamList>>();
  const [view, setView] = useState<View>('teachers');
  const styles = useThemedStyles(t2 => ({
    switcher: {marginHorizontal: t2.spacing.lg, marginTop: t2.spacing.md},
  }));

  const switcher = (
    <SegmentedTabs<View>
      style={styles.switcher}
      value={view}
      onChange={setView}
      options={[
        {value: 'teachers', label: t('adminTabs_teachers')},
        {value: 'attendance', label: t('adminTabs_teacherAttendance')},
      ]}
    />
  );

  if (view === 'teachers') {
    return <TeachersListScreen topSlot={switcher} />;
  }
  return (
    <Screen padded={false}>
      <CustomHeader
        title={t('teachersList_headerTitle')}
        actions={[{icon: 'attendance', onPress: () => navigation.navigate(ScreenNames.MarkStaffAttendance)}]}
      />
      {switcher}
      <StaffAttendanceRegisterScreen embedded />
    </Screen>
  );
}
