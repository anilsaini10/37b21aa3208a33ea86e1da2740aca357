/** Syllabus Management module types — Admin, Teacher, Parent. */

export type PlanStatus = 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
export type ChapterProgressStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
export type ScheduleStatus = 'AHEAD' | 'ON_TRACK' | 'DELAYED';
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

// ---- Subject (Admin) -------------------------------------------------------
export interface SyllabusSubject {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  classIds?: string[];
  createdAt?: string;
  updatedAt?: string;
}

// ---- Chapter (Admin) --------------------------------------------------------
export interface SyllabusChapter {
  id: string;
  name: string;
  chapterNumber: number;
  description?: string;
  subjectId: string;
  classId: string;
  expectedWorkingDays: number;
  sequenceNumber: number;
  isActive: boolean;
  subjectName?: string;
  className?: string;
}

export interface ChapterReorderItem {
  id: string;
  sequenceNumber: number;
}

// ---- Plan (Admin) -----------------------------------------------------------
export interface SyllabusPlanChapter {
  id: string;
  chapterId: string;
  chapterName: string;
  chapterNumber: number;
  sequenceNumber: number;
  expectedWorkingDays: number;
  plannedStartDate?: string;
  plannedEndDate?: string;
  adminRemarks?: string;
  progressStatus: ChapterProgressStatus;
  completionPercentage: number;
  actualWorkingDays: number;
  actualStartDate?: string;
  actualEndDate?: string;
  teacherRemarks?: string;
  scheduleStatus?: ScheduleStatus;
  variance?: number;
}

export interface SyllabusPlanSummary {
  totalChapters: number;
  avgCompletion: number;
  notStarted: number;
  inProgress: number;
  completed: number;
  delayed: number;
}

export interface SyllabusPlan {
  id: string;
  sessionYear: number;
  classId: string;
  className: string;
  sectionId: string;
  sectionName: string;
  subjectId: string;
  subjectName: string;
  teacherId?: string;
  teacherName?: string;
  status: PlanStatus;
  remarks?: string;
  approvalEnabled: boolean;
  avgCompletion?: number;
  totalChapters?: number;
  completedChapters?: number;
  delayedChapters?: number;
  chapters?: SyllabusPlanChapter[];
  summary?: SyllabusPlanSummary;
}

export interface CreatePlanChapterInput {
  chapterId: string;
  sequenceNumber: number;
  expectedWorkingDays: number;
  plannedStartDate?: string;
  plannedEndDate?: string;
  adminRemarks?: string;
}

export interface CreatePlanInput {
  sessionYear: number;
  classId: string;
  sectionId: string;
  subjectId: string;
  teacherId?: string;
  remarks?: string;
  approvalEnabled?: boolean;
  chapters: CreatePlanChapterInput[];
}

export interface UpdatePlanInput {
  teacherId?: string;
  status?: PlanStatus;
  remarks?: string;
  approvalEnabled?: boolean;
}

export interface UpdatePlanChapterInput {
  expectedWorkingDays?: number;
  plannedStartDate?: string;
  plannedEndDate?: string;
  adminRemarks?: string;
  sequenceNumber?: number;
}

// ---- Dashboard / Reports (Admin) --------------------------------------------
export interface SyllabusDashboard {
  totalPlans: number;
  totalChapters: number;
  avgCompletion: number;
  statusBreakdown: Record<ChapterProgressStatus, number>;
  planStatusBreakdown: Record<PlanStatus, number>;
  delayedCount: number;
}

export interface ClassProgressSection {
  sectionId: string;
  sectionName: string;
  subjectId: string;
  subjectName: string;
  avgCompletion: number;
  totalChapters: number;
  completedChapters: number;
  scheduleStatus: ScheduleStatus;
}

export interface ClassProgressItem {
  classId: string;
  className: string;
  sections: ClassProgressSection[];
}

export interface TeacherProgressPlan {
  planId: string;
  className: string;
  sectionName: string;
  subjectName: string;
  avgCompletion: number;
  totalChapters: number;
  completedChapters: number;
  scheduleStatus: ScheduleStatus;
}

export interface TeacherProgressItem {
  teacherId: string;
  teacherName: string;
  plans: TeacherProgressPlan[];
}

export interface DelayedChapterItem {
  planChapterId: string;
  chapterName: string;
  chapterNumber: number;
  className: string;
  sectionName: string;
  subjectName: string;
  teacherName: string;
  completionPercentage: number;
  expectedWorkingDays: number;
  actualWorkingDays: number;
  variance: number;
  plannedEndDate?: string;
  scheduleStatus: ScheduleStatus;
}

// ---- Approvals (Admin) ------------------------------------------------------
export interface SyllabusApproval {
  id: string;
  planChapterId: string;
  chapterName: string;
  chapterNumber: number;
  className: string;
  sectionName: string;
  subjectName: string;
  teacherName: string;
  completionPercentage: number;
  remarks?: string;
  status: ApprovalStatus;
  approvedPercentage?: number;
  rejectionRemarks?: string;
  progressDate?: string;
  createdAt: string;
}

export interface ApproveInput {
  status: 'APPROVED';
  approvedPercentage: number;
}

export interface RejectInput {
  status: 'REJECTED';
  rejectionRemarks: string;
}

export interface CorrectionInput {
  completionPercentage: number;
  correctionRemarks: string;
}

// ---- Teacher ----------------------------------------------------------------
export interface TeacherSyllabusAssignment {
  classId: string;
  className: string;
  sectionId: string;
  sectionName: string;
  subjectId: string;
  subjectName: string;
}

export interface TeacherSyllabusProgress {
  totalPlans: number;
  totalChapters: number;
  completedChapters: number;
  inProgressChapters: number;
  notStartedChapters: number;
  avgCompletion: number;
  aheadCount: number;
  onTrackCount: number;
  delayedCount: number;
}

export interface TeacherPlanChapterHistory {
  id: string;
  completionPercentage: number;
  workingDaysAdded: number;
  remarks?: string;
  progressDate: string;
  createdAt: string;
}

export interface TeacherPlanChapter {
  id: string;
  chapterId: string;
  chapterName: string;
  chapterNumber: number;
  sequenceNumber: number;
  expectedWorkingDays: number;
  plannedStartDate?: string;
  plannedEndDate?: string;
  progressStatus: ChapterProgressStatus;
  completionPercentage: number;
  actualWorkingDays: number;
  actualStartDate?: string;
  actualEndDate?: string;
  teacherRemarks?: string;
  scheduleStatus?: ScheduleStatus;
  recentHistory?: TeacherPlanChapterHistory[];
}

export interface TeacherPlan {
  id: string;
  sessionYear: number;
  classId: string;
  className: string;
  sectionId: string;
  sectionName: string;
  subjectId: string;
  subjectName: string;
  status: PlanStatus;
  remarks?: string;
  approvalEnabled: boolean;
  avgCompletion?: number;
  totalChapters?: number;
  completedChapters?: number;
  chapters?: TeacherPlanChapter[];
}

export interface TeacherChapterDetail extends TeacherPlanChapter {
  progressHistory: TeacherPlanChapterHistory[];
  approvals: SyllabusApproval[];
}

export interface SubmitProgressInput {
  completionPercentage: number;
  workingDaysAdded?: number;
  remarks?: string;
  progressDate: string;
}

// ---- Parent -----------------------------------------------------------------
export interface ParentSubjectSyllabus {
  subjectId: string;
  subjectName: string;
  teacherName?: string;
  totalChapters: number;
  completedChapters: number;
  avgCompletion: number;
  scheduleStatus?: ScheduleStatus;
}

export interface ParentChapterProgress {
  planChapterId: string;
  chapterName: string;
  chapterNumber: number;
  progressStatus: ChapterProgressStatus;
  completionPercentage: number;
  expectedWorkingDays: number;
  actualWorkingDays: number;
  plannedStartDate?: string;
  plannedEndDate?: string;
  actualStartDate?: string;
  actualEndDate?: string;
  teacherRemarks?: string;
  scheduleStatus?: ScheduleStatus;
}

export interface ParentSubjectDetail {
  subjectId: string;
  subjectName: string;
  teacherName?: string;
  chapters: ParentChapterProgress[];
}

export interface ParentChapterDetail {
  planChapterId: string;
  chapterName: string;
  chapterNumber: number;
  progressStatus: ChapterProgressStatus;
  completionPercentage: number;
  expectedWorkingDays: number;
  actualWorkingDays: number;
  plannedStartDate?: string;
  plannedEndDate?: string;
  actualStartDate?: string;
  actualEndDate?: string;
  teacherRemarks?: string;
  scheduleStatus?: ScheduleStatus;
  progressHistory: {
    completionPercentage: number;
    progressDate: string;
    remarks?: string;
  }[];
}

export interface ParentOverallProgress {
  overallCompletion: number;
  subjects: {
    subjectId: string;
    subjectName: string;
    completion: number;
    scheduleStatus?: ScheduleStatus;
  }[];
}
