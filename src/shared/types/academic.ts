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

// ---- Teacher's own classes (real backend, /api/teacher/classes) -----------
// Scopes class/section/subject pickers (Homework, Attendance) to only what
// this teacher actually teaches or is Class Teacher of.

export interface TeacherClassSection {
  sectionId: ID;
  sectionName: string;
  classTeacherId: ID | null;
  studentCount: number;
}

export interface TeacherClassSubject {
  subjectId: ID;
  subjectName: string;
}

export interface TeacherClassSummary {
  classId: ID;
  className: string;
  sections: TeacherClassSection[];
  /** Only subjects THIS teacher is assigned to teach in this class. */
  mySubjects: TeacherClassSubject[];
}
