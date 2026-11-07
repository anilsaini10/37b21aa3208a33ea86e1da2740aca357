/** Small view-model helpers shared across feature screens. */
import type {BadgeTone} from './components/Badge';
import type {
  ApprovalStatus,
  AttendanceStatus,
  ChapterProgressStatus,
  ExamResultStatus,
  FeeStatus,
  HomeworkStatus,
  PlanStatus,
  ScheduleStatus,
  Status,
} from './types';

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

export function homeworkStatusTone(status: HomeworkStatus): BadgeTone {
  switch (status) {
    case 'SCHEDULED':
      return 'neutral';
    case 'ACTIVE':
      return 'info';
    case 'IN_PROGRESS':
      return 'warning';
    case 'COMPLETED':
      return 'success';
    default:
      return 'neutral';
  }
}

export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function chapterProgressTone(status: ChapterProgressStatus): BadgeTone {
  switch (status) {
    case 'COMPLETED':
      return 'success';
    case 'IN_PROGRESS':
      return 'info';
    case 'NOT_STARTED':
    default:
      return 'neutral';
  }
}

export function planStatusTone(status: PlanStatus): BadgeTone {
  switch (status) {
    case 'ACTIVE':
      return 'info';
    case 'COMPLETED':
      return 'success';
    case 'ARCHIVED':
      return 'warning';
    case 'DRAFT':
    default:
      return 'neutral';
  }
}

export function scheduleStatusTone(status: ScheduleStatus): BadgeTone {
  switch (status) {
    case 'AHEAD':
      return 'success';
    case 'ON_TRACK':
      return 'info';
    case 'DELAYED':
      return 'error';
    default:
      return 'neutral';
  }
}

export function approvalStatusTone(status: ApprovalStatus): BadgeTone {
  switch (status) {
    case 'APPROVED':
      return 'success';
    case 'REJECTED':
      return 'error';
    case 'PENDING':
    default:
      return 'warning';
  }
}

export function progressBarColor(percentage: number): string {
  if (percentage > 75) return '#22C55E';
  if (percentage >= 40) return '#F59E0B';
  return '#EF4444';
}

export function formatSessionYear(year: number): string {
  return `${year}-${String(year + 1).slice(2)}`;
}
