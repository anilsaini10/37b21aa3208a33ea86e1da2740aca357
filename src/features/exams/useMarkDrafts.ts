/**
 * Shared marks-entry state for the admin (override) and teacher grids.
 *
 * Holds per-student drafts (original vs current), validates them live
 * (GRADED needs 0..maxMarks; ABSENT/PENDING never carry marks), builds the
 * "only changed rows" PUT payload, and guards against leaving with unsaved changes.
 */
import {useEffect, useRef, useState} from 'react';
import type {NavigationProp, ParamListBase} from '@react-navigation/native';
import type {TranslationKey} from '../../core/i18n';
import type {ExamResultStatus, PaperStudentRow} from '../../shared/types';
import type {PaperMarkInput} from './examSchedule.service';
import {GRADE_MAX_LENGTH, REMARKS_MAX_LENGTH, parseMarks} from './examSchedule.utils';

type Translate = (key: TranslationKey, params?: Record<string, string | number>) => string;

/** One row as the grid edits it — strings, so a half-typed "12." survives re-renders. */
export interface MarkValues {
  status: ExamResultStatus;
  marks: string;
  grade: string;
  remarks: string;
}

interface MarkDraft {
  original: MarkValues;
  current: MarkValues;
}

export function markValuesFromRow(row: PaperStudentRow): MarkValues {
  return {
    // No mark yet → default to GRADED so marks can just be typed.
    status: row.mark?.status ?? 'GRADED',
    marks: row.mark?.marksObtained != null ? String(row.mark.marksObtained) : '',
    grade: row.mark?.grade ?? '',
    remarks: row.mark?.remarks ?? '',
  };
}

function isChanged(d: MarkDraft): boolean {
  const a = d.original;
  const b = d.current;
  return (
    a.status !== b.status ||
    a.marks.trim() !== b.marks.trim() ||
    a.grade.trim() !== b.grade.trim() ||
    a.remarks.trim() !== b.remarks.trim()
  );
}

export function validateMarkValues(v: MarkValues, maxMarks: number, t: Translate): string | undefined {
  if (v.status === 'GRADED') {
    if (!v.marks.trim()) {
      return t('paperMarks_marksRequired');
    }
    const n = parseMarks(v.marks);
    if (isNaN(n) || n < 0 || n > maxMarks) {
      return t('examResult_invalidMarksError', {max: maxMarks});
    }
  }
  if (v.grade.trim().length > GRADE_MAX_LENGTH) {
    return t('examResult_gradeLengthError');
  }
  if (v.remarks.trim().length > REMARKS_MAX_LENGTH) {
    return t('paperMarks_remarksTooLong', {max: REMARKS_MAX_LENGTH});
  }
  return undefined;
}

export function useMarkDrafts(maxMarks: number, t: Translate) {
  const [drafts, setDrafts] = useState<Record<string, MarkDraft>>({});
  /** Row errors the server reported (INVALID_MARKS, STUDENT_NOT_IN_*) — cleared when that row is edited. */
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({});

  const changedIds = Object.keys(drafts).filter(id => isChanged(drafts[id]));
  /** Live validation of every changed row. */
  const invalidIds = changedIds.filter(id => !!validateMarkValues(drafts[id].current, maxMarks, t));

  const valuesFor = (row: PaperStudentRow): MarkValues => drafts[row.studentId]?.current ?? markValuesFromRow(row);

  const isRowChanged = (studentId: string): boolean => !!drafts[studentId] && isChanged(drafts[studentId]);

  const errorFor = (studentId: string): string | undefined => {
    if (serverErrors[studentId]) {
      return serverErrors[studentId];
    }
    const d = drafts[studentId];
    return d && isChanged(d) ? validateMarkValues(d.current, maxMarks, t) : undefined;
  };

  const editRow = (row: PaperStudentRow, patch: Partial<MarkValues>): void => {
    setDrafts(prev => {
      const existing = prev[row.studentId] ?? {original: markValuesFromRow(row), current: markValuesFromRow(row)};
      const current = {...existing.current, ...patch};
      // ABSENT / PENDING never carry marks.
      if (current.status !== 'GRADED') {
        current.marks = '';
      }
      return {...prev, [row.studentId]: {...existing, current}};
    });
    setServerErrors(prev => {
      if (!prev[row.studentId]) {
        return prev;
      }
      const next = {...prev};
      delete next[row.studentId];
      return next;
    });
  };

  /** Only changed rows; grade/remarks only when they changed — a field left out keeps its saved value. */
  const buildEntries = (): PaperMarkInput[] =>
    changedIds.map(studentId => {
      const {original: o, current: c} = drafts[studentId];
      const entry: PaperMarkInput = {studentId, status: c.status};
      if (c.status === 'GRADED') {
        entry.marksObtained = parseMarks(c.marks);
      }
      if (c.grade.trim() !== o.grade.trim()) {
        entry.grade = c.grade.trim();
      }
      if (c.remarks.trim() !== o.remarks.trim()) {
        entry.remarks = c.remarks.trim();
      }
      return entry;
    });

  const clearDrafts = (studentIds?: Iterable<string>): void => {
    if (!studentIds) {
      setDrafts({});
      return;
    }
    const done = new Set(studentIds);
    setDrafts(prev => Object.fromEntries(Object.entries(prev).filter(([id]) => !done.has(id))));
  };

  /** Marks rows from a backend `details.studentIds` array. */
  const highlightRows = (studentIds: unknown, message: string): void => {
    if (!Array.isArray(studentIds)) {
      return;
    }
    setServerErrors(prev => {
      const next = {...prev};
      studentIds.forEach(id => {
        if (typeof id === 'string') {
          next[id] = message;
        }
      });
      return next;
    });
  };

  return {
    changedIds,
    invalidIds,
    hasUnsaved: changedIds.length > 0,
    valuesFor,
    isRowChanged,
    errorFor,
    editRow,
    buildEntries,
    clearDrafts,
    highlightRows,
  };
}

/**
 * Blocks leaving the screen while there are unsaved changes. `pendingLeave` is set
 * when a leave was blocked — show a confirm, then `confirmLeave()` or `cancelLeave()`.
 */
export function useUnsavedChangesGuard(navigation: NavigationProp<ParamListBase>, hasUnsaved: boolean, busy: boolean) {
  const [pendingLeave, setPendingLeave] = useState<(() => void) | null>(null);
  /** Set once the user chose to discard — lets the blocked navigation through. */
  const allowLeaveRef = useRef(false);

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', e => {
      if (!hasUnsaved || busy || allowLeaveRef.current) {
        return;
      }
      e.preventDefault();
      setPendingLeave(() => () => navigation.dispatch(e.data.action));
    });
    return unsubscribe;
  }, [navigation, hasUnsaved, busy]);

  return {
    pendingLeave: !!pendingLeave,
    cancelLeave: () => setPendingLeave(null),
    confirmLeave: () => {
      allowLeaveRef.current = true;
      const leave = pendingLeave;
      setPendingLeave(null);
      leave?.();
    },
    /** Leave without the prompt (e.g. after a "paper deleted" error). */
    forceLeave: () => {
      allowLeaveRef.current = true;
      navigation.goBack();
    },
  };
}
