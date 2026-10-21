/**
 * Date helpers for the academic calendar. Dates are "YYYY-MM-DD" strings handled as
 * LOCAL calendar dates — split, never `new Date("YYYY-MM-DD")` (that's UTC and can shift the day).
 */
import {EVENT_TYPE_PRIORITY} from '../events/eventTypes';
import type {CalendarEntry, EventType} from '../../shared/types';

export function parseIsoDate(date: string): {y: number; m: number; d: number} {
  const [y, m, d] = date.slice(0, 10).split('-').map(Number);
  return {y, m, d};
}

export function toIsoDate(y: number, m: number, d: number): string {
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

export function todayIsoDate(): string {
  const now = new Date();
  return toIsoDate(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

/** `m` is 1-based. */
export function daysInMonth(y: number, m: number): number {
  return new Date(y, m, 0).getDate();
}

/** 0 = Sunday. `m` is 1-based. */
export function weekdayOf(y: number, m: number, d: number): number {
  return new Date(y, m - 1, d).getDay();
}

export function addDays(date: string, days: number): string {
  const {y, m, d} = parseIsoDate(date);
  const next = new Date(y, m - 1, d + days);
  return toIsoDate(next.getFullYear(), next.getMonth() + 1, next.getDate());
}

/** "DD/MM/YYYY" */
export function formatDmy(date: string): string {
  const {y, m, d} = parseIsoDate(date);
  return `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`;
}

/** "20/05/2026 – 30/06/2026", or a single date for one-day entries. */
export function formatRange(start: string, end: string): string {
  return start.slice(0, 10) === end.slice(0, 10) ? formatDmy(start) : `${formatDmy(start)} – ${formatDmy(end)}`;
}

/** Session year containing today, e.g. 2026 for 2026-27 when the session starts in April. */
export function currentSessionYear(sessionStartMonth = 4): number {
  const now = new Date();
  return now.getMonth() + 1 >= sessionStartMonth ? now.getFullYear() : now.getFullYear() - 1;
}

export function sessionLabel(year: number): string {
  return `${year}-${String((year + 1) % 100).padStart(2, '0')}`;
}

/**
 * Date → the type that colours it: the highest-priority entry covering that date
 * (school-closed types first, then exam, then the rest).
 */
export function buildDayTypeMap(entries: CalendarEntry[]): Map<string, EventType> {
  const map = new Map<string, EventType>();
  entries.forEach(entry => {
    let date = entry.startDate.slice(0, 10);
    const end = entry.endDate.slice(0, 10);
    // Guard against a bad range looping forever.
    for (let i = 0; date <= end && i < 400; i++) {
      const current = map.get(date);
      if (!current || EVENT_TYPE_PRIORITY[entry.type] > EVENT_TYPE_PRIORITY[current]) {
        map.set(date, entry.type);
      }
      date = addDays(date, 1);
    }
  });
  return map;
}

export function entriesOnDate(entries: CalendarEntry[], date: string): CalendarEntry[] {
  return entries.filter(e => e.startDate.slice(0, 10) <= date && date <= e.endDate.slice(0, 10));
}
