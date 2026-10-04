import type {ID} from './common';

export interface SchoolClass {
  id: ID;
  name: string;
  numericLevel: number;
  sections: Section[];
  /** Subjects taught in this class's curriculum. */
  subjects: ClassSubjectRef[];
  totalStudents: number;
}

export interface ClassSubjectRef {
  id: ID;
  name: string;
}

export interface Section {
  id: ID;
  name: string;
  classId: ID;
  classTeacherId?: ID;
  classTeacherName?: string;
  capacity: number;
  studentCount: number;
}

export interface Subject {
  id: ID;
  name: string;
  /** Classes that currently teach this subject. */
  classes: {id: ID; name: string}[];
}

export type WeekDay =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday';

export type PeriodType = 'class' | 'break';

export interface TimetablePeriod {
  id: ID;
  day: WeekDay;
  periodNo: number;
  startTime: string;
  endTime: string;
  type: PeriodType;
  /** Only present when `type === 'class'`. */
  subjectId?: ID;
  subjectName?: string;
  teacherId?: ID;
  teacherName?: string;
  room?: string;
  /** Only present when `type === 'break'` — e.g. "Lunch Break", "Assembly". */
  label?: string;
  classId: ID;
  sectionId: ID;
}

export interface Timetable {
  classId: ID;
  sectionId: ID;
  periods: TimetablePeriod[];
}

// ---- Admin schedule (real backend, /api/admin/schedule) --------------------
// Distinct from the mock Timetable/TimetablePeriod above, which still backs the
// Teacher/Parent read-only timetable view — there's no teacher-facing schedule
// endpoint yet, so that view stays on mock data until one exists.

export type ScheduleDay = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
export type ScheduleEntryType = 'CLASS_PERIOD' | 'BREAK';

export interface ScheduleEntry {
  id: ID;
  classId: ID;
  className: string;
  sectionId: ID;
  sectionName: string;
  day: ScheduleDay;
  type: ScheduleEntryType;
  periodNo: number;
  /** Only present when `type === 'CLASS_PERIOD'`. */
  subjectId: ID | null;
  subjectName: string | null;
  teacherId: ID | null;
  teacherName: string | null;
  roomNo: string | null;
  /** Only present when `type === 'BREAK'`. */
  title: string | null;
  startTime: string;
  endTime: string;
  createdBy: {id: ID; name: string};
  createdAt: string;
  updatedAt: string;
}

export interface SectionTimetable {
  sectionId: ID;
  sectionName: string;
  className: string;
  timetable: Partial<Record<ScheduleDay, ScheduleEntry[]>>;
}

export interface TeacherTimetable {
  teacherId: ID;
  teacherName: string;
  timetable: Partial<Record<ScheduleDay, ScheduleEntry[]>>;
}

// ---- Teacher's own schedule (real backend, /api/teacher/schedule) ---------
// Read-only, self-service: the teacher is always resolved from the JWT, never
// a client-supplied id. BREAK rows can appear here too — subjectId/subjectName
// are null for them, and `title` (e.g. "Lunch Break") is the only meaningful
// content besides the time range.

export interface TeacherPeriod {
  id: ID;
  day: ScheduleDay;
  type: ScheduleEntryType;
  periodNo: number;
  classId: ID;
  className: string;
  sectionId: ID;
  sectionName: string;
  /** Null for type === 'BREAK'. */
  subjectId: ID | null;
  subjectName: string | null;
  roomNo: string | null;
  /** Only meaningful for type === 'BREAK' (e.g. "Lunch Break"); null for CLASS_PERIOD. */
  title: string | null;
  startTime: string;
  endTime: string;
}

/** Backend treats Sunday as a non-school day — the week endpoint never includes it. */
export type TeacherWeekDay = Exclude<ScheduleDay, 'SUNDAY'>;

export interface TeacherTodaySchedule {
  day: ScheduleDay;
  date: string;
  periods: TeacherPeriod[];
}

export interface TeacherWeekSchedule {
  teacherId: ID;
  timetable: Record<TeacherWeekDay, TeacherPeriod[]>;
}

// ---- Parent's child timetable (real backend, /api/students/timetable) -----
// Read-only, always scoped to one child (`studentId`) — a single fixed
// class/section, so (unlike the teacher's own schedule) periods don't carry
// their own classId/className. Breaks CAN appear here (title, no subject/teacher).

export interface ChildTimetablePeriod {
  id: ID;
  day: ScheduleDay;
  type: ScheduleEntryType;
  periodNo: number;
  subjectId: ID | null;
  subjectName: string | null;
  teacherId: ID | null;
  teacherName: string | null;
  roomNo: string | null;
  title: string | null;
  startTime: string;
  endTime: string;
}

export interface ChildTimetable {
  studentId: ID;
  className: string;
  sectionName: string;
  timetable: Record<TeacherWeekDay, ChildTimetablePeriod[]>;
}

// ---- Teacher's own classes (real backend, /api/teacher/classes) -----------
// Scopes class/section/subject pickers (Homework, Attendance) to only what
// this teacher actually teaches or is Class Teacher of.

export interface TeacherClassSection {
  sectionId: ID;
  sectionName: string;
  classTeacherId: ID | null;
  classTeacherName: string | null;
  capacity: number;
  studentCount: number;
}

export interface TeacherClassSubject {
  subjectId: ID;
  subjectName: string;
}

export interface TeacherClassSummary {
  classId: ID;
  className: string;
  numericLevel: number;
  totalStudents: number;
  sections: TeacherClassSection[];
  /** Only subjects THIS teacher is assigned to teach in this class. */
  mySubjects: TeacherClassSubject[];
}
