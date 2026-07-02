import type {ID} from './common';

export interface SchoolClass {
  id: ID;
  name: string;
  numericLevel: number;
  sections: Section[];
  totalStudents: number;
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
  code: string;
  classIds: ID[];
}

export type WeekDay =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday';

export interface TimetablePeriod {
  id: ID;
  day: WeekDay;
  periodNo: number;
  startTime: string;
  endTime: string;
  subjectId: ID;
  subjectName: string;
  teacherId: ID;
  teacherName: string;
  classId: ID;
  sectionId: ID;
  room?: string;
}

export interface Timetable {
  classId: ID;
  sectionId: ID;
  periods: TimetablePeriod[];
}
