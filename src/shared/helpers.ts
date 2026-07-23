/** Small view-model helpers shared across feature screens. */
import type {BadgeTone} from './components/Badge';
import type {AttendanceStatus, ExamResultStatus, FeeStatus, Status} from './types';

export function feeStatusTone(status: FeeStatus): BadgeTone {
  switch (status) {
    case 'paid':
      return 'success';
    case 'partial':
      return 'warning';
    case 'overdue':
      return 'error';
    case 'pending':
    default:
      return 'neutral';
  }
}

export function attendanceTone(status: AttendanceStatus): BadgeTone {
  switch (status) {
    case 'present':
      return 'success';
    case 'absent':
      return 'error';
    case 'late':
      return 'warning';
    case 'leave':
      return 'info';
    case 'holiday':
    default:
      return 'neutral';
  }
}

export function statusTone(status: Status): BadgeTone {
  switch (status) {
    case 'active':
      return 'success';
    case 'pending':
      return 'warning';
    case 'inactive':
    case 'archived':
    default:
      return 'neutral';
  }
}

export function examResultStatusTone(status: ExamResultStatus): BadgeTone {
  switch (status) {
    case 'GRADED':
      return 'success';
    case 'PENDING':
      return 'warning';
    case 'ABSENT':
      return 'error';
    default:
      return 'neutral';
  }
}

export function attendancePercentageTone(percentage: number): BadgeTone {
  if (percentage >= 90) {
    return 'success';
  }
  if (percentage >= 75) {
    return 'warning';
  }
  return 'error';
}

export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
