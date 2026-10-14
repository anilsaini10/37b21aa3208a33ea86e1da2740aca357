/**
 * Date sheet helpers — client-side mirrors of the backend's paper/marks rules,
 * plus mapping backend error codes onto the form field they belong to.
 */
import {extractErrorCode, extractErrorDetails, extractErrorMessage} from '../../core/api/apiError';
import type {TranslationKey} from '../../core/i18n';
import type {ExamPaperConflict} from '../../shared/types';

type Translate = (key: TranslationKey, params?: Record<string, string | number>) => string;

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

export const ROOM_MAX_LENGTH = 100;
export const GRADE_MAX_LENGTH = 10;
export const REMARKS_MAX_LENGTH = 500;
/** Backend caps for one bulk request / one marks save. */
export const BULK_MAX_PAPERS = 100;
export const MARKS_MAX_ENTRIES = 300;

export function isValidTime(value?: string): value is string {
  return !!value && TIME_RE.test(value);
}

export function timeToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

/** Back-to-back papers (09:00–12:00 then 12:00–13:00) do NOT overlap — only a real overlap does. */
export function timesOverlap(aStart: string, aEnd: string, bStart: string, bEnd: string): boolean {
  return timeToMinutes(aStart) < timeToMinutes(bEnd) && timeToMinutes(bStart) < timeToMinutes(aEnd);
}

/** Today's local date as "YYYY-MM-DD" — compared as a plain string against paper dates. */
export function todayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * "2026-10-20" (or an ISO datetime — only its first 10 chars are used) → "20 Oct 2026".
 * Split by parts on purpose: `new Date("YYYY-MM-DD")` is UTC and can shift the day.
 */
export function formatPaperDate(date: string, withYear = true): string {
  const [y, m, d] = date.slice(0, 10).split('-').map(Number);
  if (!y || !m || !d) {
    return '';
  }
  return withYear ? `${d} ${MONTHS[m - 1]} ${y}` : `${d} ${MONTHS[m - 1]}`;
}

/** Day of week (0 = Sunday) of a "YYYY-MM-DD" date, as a local calendar date. */
export function paperWeekday(date: string): number {
  const [y, m, d] = date.slice(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d).getDay();
}

/** Marks can be saved only on or after the paper's date. */
export function isPaperHeld(paperDate: string): boolean {
  return paperDate.slice(0, 10) <= todayIso();
}

/** "12.5" → 12.5; anything that isn't a plain non-negative decimal → NaN. */
export function parseMarks(value: string): number {
  const trimmed = value.trim();
  return /^\d+(\.\d+)?$/.test(trimmed) ? Number(trimmed) : NaN;
}

// ---- Paper form ------------------------------------------------------------

export type PaperField = 'classId' | 'subjectId' | 'date' | 'time' | 'maxMarks' | 'roomNo' | 'invigilatorId';

export type PaperFieldErrors = Partial<Record<PaperField, string>>;

/** Editable paper fields as the form holds them (strings, possibly empty). */
export interface PaperDraft {
  classId: string;
  subjectId: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  maxMarks: string;
  roomNo: string;
  invigilatorId?: string;
  invigilatorName?: string;
}

export interface ExamDateRange {
  startDate?: string | null;
  endDate?: string | null;
}

export function validatePaperDraft(draft: PaperDraft, range: ExamDateRange, t: Translate): PaperFieldErrors {
  const errors: PaperFieldErrors = {};
  if (!draft.classId) {
    errors.classId = t('common_fieldRequired', {field: t('dateSheet_class')});
  }
  if (!draft.subjectId) {
    errors.subjectId = t('common_fieldRequired', {field: t('dateSheet_subject')});
  }
  if (!draft.date) {
    errors.date = t('common_fieldRequired', {field: t('common_date')});
  } else if (range.startDate && draft.date < range.startDate.slice(0, 10)) {
    errors.date = t('dateSheet_dateOutsideRange');
  } else if (range.endDate && draft.date > range.endDate.slice(0, 10)) {
    errors.date = t('dateSheet_dateOutsideRange');
  }
  if (!isValidTime(draft.startTime) || !isValidTime(draft.endTime)) {
    errors.time = t('dateSheet_timeRequired');
  } else if (timeToMinutes(draft.endTime) <= timeToMinutes(draft.startTime)) {
    errors.time = t('dateSheet_endAfterStart');
  }
  const maxMarks = parseMarks(draft.maxMarks);
  if (draft.maxMarks.trim() && !(maxMarks > 0)) {
    errors.maxMarks = t('dateSheet_maxMarksInvalid');
  }
  if (draft.roomNo.trim().length > ROOM_MAX_LENGTH) {
    errors.roomNo = t('dateSheet_roomTooLong', {max: ROOM_MAX_LENGTH});
  }
  return errors;
}

// ---- Backend error → field -------------------------------------------------

const FIELD_BY_CODE: Record<string, PaperField> = {
  CLASS_TIME_CONFLICT: 'time',
  INVALID_TIME_RANGE: 'time',
  INVIGILATOR_TIME_CONFLICT: 'invigilatorId',
  INVIGILATOR_ON_LEAVE: 'invigilatorId',
  INVIGILATOR_INACTIVE: 'invigilatorId',
  INVIGILATOR_NOT_FOUND: 'invigilatorId',
  ROOM_TIME_CONFLICT: 'roomNo',
  SUBJECT_ALREADY_SCHEDULED: 'subjectId',
  SUBJECT_NOT_IN_CLASS: 'subjectId',
  SUBJECT_NOT_FOUND: 'subjectId',
  EXAM_CLASS_NOT_FOUND: 'classId',
  DATE_OUTSIDE_EXAM_RANGE: 'date',
  MAX_MARKS_BELOW_EXISTING: 'maxMarks',
};

/** Ids are stale — the screen should refetch before the user retries. */
export const STALE_ID_CODES = new Set(['EXAM_NOT_FOUND', 'EXAM_SCHEDULE_NOT_FOUND', 'SUBJECT_NOT_FOUND', 'SECTION_NOT_FOUND']);

export interface PaperSaveError {
  code?: string;
  message: string;
  /** Field to show the message under; undefined → show it as a general form error. */
  field?: PaperField;
  conflict?: ExamPaperConflict;
  /** Bulk only — 0-based index of the row that failed. */
  paperIndex?: number;
}

export function toPaperSaveError(e: unknown, fallback: string): PaperSaveError {
  const code = extractErrorCode(e);
  const details = extractErrorDetails(e);
  const conflict = details?.conflictWith as ExamPaperConflict | undefined;
  const paperIndex = typeof details?.paperIndex === 'number' ? details.paperIndex : undefined;
  return {
    code,
    message: extractErrorMessage(e, fallback),
    field: code ? FIELD_BY_CODE[code] : undefined,
    conflict: conflict && typeof conflict === 'object' ? conflict : undefined,
    paperIndex,
  };
}

// ---- Bulk builder ----------------------------------------------------------

/**
 * Rows of ONE class that overlap each other on the same date — the server checks
 * again, this just catches the obvious ones before submitting. Returns
 * rowIndex → index of the first row it clashes with.
 */
export function findRowOverlaps(
  rows: {date?: string; startTime?: string; endTime?: string}[],
): Map<number, number> {
  const clashes = new Map<number, number>();
  rows.forEach((a, i) => {
    if (!a.date || !isValidTime(a.startTime) || !isValidTime(a.endTime)) {
      return;
    }
    rows.forEach((b, j) => {
      if (
        i !== j &&
        !clashes.has(i) &&
        b.date === a.date &&
        isValidTime(b.startTime) &&
        isValidTime(b.endTime) &&
        timesOverlap(a.startTime as string, a.endTime as string, b.startTime, b.endTime)
      ) {
        clashes.set(i, j);
      }
    });
  });
  return clashes;
}
