import type {ID} from './common';

export interface Exam {
  id: ID;
  name: string;
  type: 'unit_test' | 'midterm' | 'final' | 'assignment';
  /** An exam can span multiple classes (e.g. a school-wide Half Yearly Exam). */
  classes: {classId: ID; className: string}[];
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
  classId: ID;
  className: string;
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

// ---- Admin exams (real backend, /api/admin/exams) --------------------------

export type ExamResultStatus = 'PENDING' | 'GRADED' | 'ABSENT';

export interface AdminExamClassRef {
  classId: ID;
  className: string;
  /** Per-class max marks — e.g. Class 5 out of 100, Class 10 out of 80. */
  maxMarks: number;
}

/** Exam (real backend) — admin manages via `/api/admin/exams`. */
export interface AdminExam {
  id: ID;
  title: string;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  classes: AdminExamClassRef[];
  createdBy: {id: ID; name: string};
  createdAt: string;
  updatedAt: string;
}

/** One class assigned to an exam, with grading progress — feeds the Classes-in-Exam screen. */
export interface ExamClassProgress {
  classId: ID;
  className: string;
  maxMarks: number;
  studentCount: number;
  gradedCount: number;
}

export interface ExamResult {
  id: ID;
  marksObtained: number | null;
  grade: string | null;
  remarks: string | null;
  status: ExamResultStatus;
}

/** One student row under Exam → Class — feeds the Students-in-Class screen. */
export interface ExamClassStudentRow {
  studentId: ID;
  name: string;
  admissionNo: string;
  rollNo: number;
  result: ExamResult | null;
}

/** Full result record returned by create/get/update — includes denormalised names or context. */
export interface ExamResultDetail {
  id: ID;
  examId: ID;
  studentId: ID;
  studentName: string;
  classId: ID;
  className: string;
  maxMarks: number;
  marksObtained: number | null;
  grade: string | null;
  remarks: string | null;
  status: ExamResultStatus;
  createdAt: string;
  updatedAt: string;
}
