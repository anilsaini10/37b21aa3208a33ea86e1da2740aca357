/** Small view-model helpers shared across feature screens. */
import type {BadgeTone} from './components/Badge';
import type {AttendanceStatus, FeeStatus, Status} from './types';

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

export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
