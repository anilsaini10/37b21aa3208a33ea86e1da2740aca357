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

// ---- Parent's own child's exams (real backend, /api/students/exams) -------
// Read-only, always scoped to one child (`studentId`) — schedule/details only;
// marks live in `result` on the detail endpoint, never on the list.

export interface ParentExam {
  examId: ID;
  title: string;
  description: string | null;
  /** ISO datetime — only the date part (first 10 chars) is meaningful. */
  startDate: string | null;
  endDate: string | null;
  maxMarks: number;
}

export interface ParentExamResult {
  marksObtained: number | null;
  grade: string | null;
  remarks: string | null;
  status: ExamResultStatus;
}

/** One subject paper on the child's date sheet, with the child's marks for it. */
export interface ParentExamSubject {
  scheduleId: ID;
  subjectId: ID;
  subjectName: string;
  /** "YYYY-MM-DD" — parse as a local date. */
  date: string;
  startTime: string;
  endTime: string;
  roomNo: string | null;
  maxMarks: number;
  marksObtained: number | null;
  grade: string | null;
  remarks: string | null;
  status: ExamResultStatus;
}

export interface ParentExamSummary {
  totalSubjects: number;
  gradedSubjects: number;
  absentSubjects: number;
  /** All subjects. */
  totalMaxMarks: number;
  /** Only GRADED subjects. */
  gradedMaxMarks: number;
  /** Sum over GRADED subjects. */
  obtainedMarks: number;
  /** obtainedMarks / gradedMaxMarks × 100 — null until something is graded. */
  percentage: number | null;
}

export interface ParentExamDetail extends ParentExam {
  /** Overall result (admin) — may stay PENDING. */
  result: ParentExamResult;
  /** The date sheet, sorted by date then time — `[]` until the school publishes one. */
  subjects: ParentExamSubject[];
  summary: ParentExamSummary;
}

// ---- Exam date sheet + subject-wise marks (real backend, /api/admin/exams/:examId/schedule) ----

/** One paper on an exam's date sheet — one class + subject at a date/time slot. */
export interface ExamPaper {
  id: ID;
  examId: ID;
  examTitle: string;
  classId: ID;
  className: string;
  subjectId: ID;
  subjectName: string;
  /** "YYYY-MM-DD" */
  date: string;
  /** "HH:MM", 24h */
  startTime: string;
  endTime: string;
  maxMarks: number;
  roomNo: string | null;
  invigilator: {id: ID; name: string} | null;
  createdAt: string;
  updatedAt: string;
}

/** Paper as returned by the schedule list — `markedCount` = students graded or marked absent. */
export interface ExamPaperListItem extends ExamPaper {
  markedCount: number;
}

export interface ExamScheduleResponse {
  exam: {id: ID; title: string; startDate: string | null; endDate: string | null};
  items: ExamPaperListItem[];
}

/** The clashing paper the backend reports on a `*_CONFLICT` / `SUBJECT_ALREADY_SCHEDULED` error. */
export interface ExamPaperConflict {
  scheduleId: ID;
  examId: ID;
  examTitle: string;
  className: string;
  subjectName: string;
  date: string;
  startTime: string;
  endTime: string;
  roomNo: string | null;
  invigilatorName: string | null;
}

export interface PaperMark {
  id: ID;
  marksObtained: number | null;
  grade: string | null;
  remarks: string | null;
  status: ExamResultStatus;
  updatedAt: string;
}

export interface PaperStudentRow {
  studentId: ID;
  name: string;
  admissionNo: string;
  rollNo: number;
  sectionId: ID;
  sectionName: string;
  mark: PaperMark | null;
}

export interface PaperMarksSummary {
  totalStudents: number;
  graded: number;
  absent: number;
  pending: number;
}

export interface PaperMarksResponse {
  paper: ExamPaper;
  summary: PaperMarksSummary;
  items: PaperStudentRow[];
}

// ---- Teacher's exam papers (real backend, /api/teacher/exams) ---------------

/** A paper shown to a teacher — they teach its subject in ≥1 section (`canEnterMarks`) and/or invigilate it. */
export interface TeacherExamPaper extends ExamPaper {
  canEnterMarks: boolean;
  isInvigilator: boolean;
  /** Sections this teacher may grade — `[]` when invigilator-only. */
  mySections: {id: ID; name: string}[];
  /** Students in `mySections` (the whole class when invigilator-only). */
  studentCount: number;
  /** Of those, graded or marked absent. */
  markedCount: number;
}

export interface TeacherExam {
  examId: ID;
  title: string;
  startDate: string | null;
  endDate: string | null;
  papers: TeacherExamPaper[];
}
