import type {ID} from './common';

export interface Exam {
  id: ID;
  name: string;
  type: 'unit_test' | 'midterm' | 'final' | 'assignment';
  classId: ID;
  className: string;
  startDate: string;
  endDate: string;
  status: 'scheduled' | 'ongoing' | 'completed';
  schedule: ExamScheduleEntry[];
}

export interface ExamScheduleEntry {
  id: ID;
  subjectId: ID;
  subjectName: string;
  date: string;
  startTime: string;
  endTime: string;
  maxMarks: number;
  room?: string;
}

export interface MarkEntry {
  id: ID;
  examId: ID;
  studentId: ID;
  studentName: string;
  subjectId: ID;
  subjectName: string;
  marksObtained: number;
  maxMarks: number;
  grade: string;
}

export interface ReportCard {
  id: ID;
  examId: ID;
  examName: string;
  studentId: ID;
  studentName: string;
  className: string;
  subjects: {subjectName: string; marks: number; maxMarks: number; grade: string}[];
  totalMarks: number;
  totalMaxMarks: number;
  percentage: number;
  overallGrade: string;
  rank?: number;
}

export interface GradeBand {
  grade: string;
  minPercentage: number;
  maxPercentage: number;
  point: number;
}
