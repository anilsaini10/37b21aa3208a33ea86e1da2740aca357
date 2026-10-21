import type {ID} from './common';
import type {AnnouncementAudience, EventType} from './communication';
import type {ScheduleDay} from './academic';

// ---- Academic calendar (real backend, /api/admin/academic-calendar) --------

/** One calendar entry — an admin event, or an exam from the Exams module (`source: "EXAM"`, not editable here). */
export interface CalendarEntry {
  id: ID;
  source: 'EVENT' | 'EXAM';
  type: EventType;
  title: string;
  description: string | null;
  audience: AnnouncementAudience;
  /** "YYYY-MM-DD" — parse as a local date. */
  startDate: string;
  endDate: string;
  days: number;
  schoolClosed: boolean;
  /** Exam entries: the class names it covers. */
  classes: string[];
}

export interface CalendarDayCounts {
  totalDays: number;
  sundays: number;
  schoolClosedDays: number;
  workingDays: number;
  examDays: number;
}

export interface CalendarSummary extends CalendarDayCounts {
  holidayDays: number;
  governmentHolidayDays: number;
  vacationDays: number;
  counts: Record<EventType, number>;
}

export interface CalendarMonth extends CalendarDayCounts {
  /** "YYYY-MM" */
  month: string;
  label: string;
  startDate: string;
  endDate: string;
  /** Entries overlapping this month (a multi-month range appears in each). */
  entries: CalendarEntry[];
}

export interface AcademicCalendarResponse {
  range: {
    from: string;
    to: string;
    session: {year: number; label: string} | null;
    sessionStartMonth: number;
  };
  summary: CalendarSummary;
  months: CalendarMonth[];
  entries: CalendarEntry[];
}

/** One spreadsheet row for the bulk import — values as they come from Excel (labels / various date formats are fine). */
export interface CalendarImportRow {
  title: string;
  description?: string;
  eventType: string;
  audience?: string;
  startDate: string;
  endDate?: string;
}

export interface CalendarImportRowResult {
  /** 0-based position in the request — Excel row = index + 2. */
  index: number;
  status: 'valid' | 'error' | 'created';
  errors?: string[];
  id?: ID;
  title?: string;
  eventType?: EventType;
}

export interface CalendarImportResponse {
  dryRun?: boolean;
  total?: number;
  valid?: number;
  invalid?: number;
  created: number;
  results: CalendarImportRowResult[];
}

// ---- Teacher availability (real backend, /api/admin/teachers/availability | free-slots) ----

export type BusyType = 'CLASS' | 'INVIGILATION' | 'LEAVE' | 'ABSENT';

export interface BusySlot {
  type: BusyType;
  title: string;
  /** "HH:MM", 24h */
  startTime: string;
  endTime: string;
  className?: string | null;
  sectionName?: string | null;
  subjectName?: string | null;
  roomNo?: string | null;
}

export interface SchoolClosedInfo {
  reason: 'SUNDAY' | 'HOLIDAY' | 'GOVERNMENT_HOLIDAY' | 'VACATION' | string;
  title: string | null;
}

export interface TeacherAvailabilityItem {
  teacherId: ID;
  userId?: ID;
  name: string;
  employeeId?: string;
  phone?: string | null;
  subjects?: string[];
  free: boolean;
  busy: BusySlot[];
}

export interface TeacherAvailabilityResponse {
  query: {date: string | null; day: ScheduleDay; startTime: string; endTime: string};
  schoolClosed: SchoolClosedInfo | null;
  summary: {total: number; free: number; busy: number};
  items: TeacherAvailabilityItem[];
}

export interface FreeGap {
  startTime: string;
  endTime: string;
  minutes: number;
}

export interface TeacherDaySlots {
  day: ScheduleDay;
  date: string | null;
  unavailable: {type: 'LEAVE' | 'ABSENT'; title: string} | null;
  busy: BusySlot[];
  free: FreeGap[];
  freeMinutes: number;
}

export interface FreeSlotsDay {
  day: ScheduleDay;
  date: string | null;
  window: {from: string; to: string; source: 'TIMETABLE' | 'DEFAULT' | 'QUERY'};
  schoolClosed: SchoolClosedInfo | null;
}

export interface TeacherFreeSlots {
  teacherId: ID;
  userId?: ID;
  name: string;
  employeeId?: string;
  phone?: string | null;
  subjects?: string[];
  days: TeacherDaySlots[];
}

export interface FreeSlotsResponse {
  days: FreeSlotsDay[];
  teachers: TeacherFreeSlots[];
}
