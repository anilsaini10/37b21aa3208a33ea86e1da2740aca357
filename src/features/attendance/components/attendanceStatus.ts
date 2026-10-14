/** Attendance status colours + labels shared by the teacher check-in card and the admin staff-attendance screens. */
import {useLanguage} from '../../../core/i18n';
import type {BadgeTone} from '../../../shared/components';
import type {AttendanceStatusCode} from '../../../shared/types';

export const ATTENDANCE_STATUS_CODES: AttendanceStatusCode[] = ['PRESENT', 'ABSENT', 'LATE', 'LEAVE', 'HOLIDAY'];

/** Present = green, Late = orange, Absent = red, Leave = blue, Holiday = grey. */
export const ATTENDANCE_STATUS_TONE: Record<AttendanceStatusCode, BadgeTone> = {
  PRESENT: 'success',
  ABSENT: 'error',
  LATE: 'warning',
  LEAVE: 'info',
  HOLIDAY: 'neutral',
};

export function useAttendanceStatusLabels(): Record<AttendanceStatusCode, string> {
  const {t} = useLanguage();
  return {
    PRESENT: t('markAttendance_presentLabel'),
    ABSENT: t('markAttendance_absentLabel'),
    LATE: t('markAttendance_lateLabel'),
    LEAVE: t('attendanceReport_leave'),
    HOLIDAY: t('attendance_holiday'),
  };
}
