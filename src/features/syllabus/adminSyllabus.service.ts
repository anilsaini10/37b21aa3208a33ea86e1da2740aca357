/** Admin Syllabus service — subjects, chapters, plans, reports, approvals. */
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {axiosClient} from '../../core/api/axiosClient';
import {Endpoints} from '../../core/api/apiConfig';
import {rethrowApiError} from '../../core/api/apiError';
import type {Paginated} from '../../shared/types';
import type {
  SyllabusSubject,
  SyllabusChapter,
  SyllabusPlan,
  SyllabusDashboard,
  ClassProgressItem,
  TeacherProgressItem,
  DelayedChapterItem,
  SyllabusApproval,
  CreatePlanInput,
  UpdatePlanInput,
  UpdatePlanChapterInput,
  ChapterReorderItem,
  ApproveInput,
  RejectInput,
  CorrectionInput,
} from '../../shared/types';

// ---- Subjects ---------------------------------------------------------------
export const adminSubjectsApi = {
  list: async (): Promise<SyllabusSubject[]> => {
    try {
      const {data} = await axiosClient.get<SyllabusSubject[]>(Endpoints.subjects.list);
      return data;
    } catch (e) {
      rethrowApiError(e, 'Failed to load subjects.');
    }
  },
  getById: async (subjectId: string): Promise<SyllabusSubject> => {
    try {
      const {data} = await axiosClient.get<SyllabusSubject>(Endpoints.subjects.byId(subjectId));
      return data;
    } catch (e) {
      rethrowApiError(e, 'Failed to load subject.');
    }
  },
  create: async (input: {name: string; description?: string; classIds?: string[]}): Promise<SyllabusSubject> => {
    try {
      const {data} = await axiosClient.post<SyllabusSubject>(Endpoints.subjects.create, input);
      return data;
    } catch (e) {
      rethrowApiError(e, 'Failed to create subject.');
    }
  },
  update: async (subjectId: string, input: {name?: string; description?: string}): Promise<SyllabusSubject> => {
    try {
      const {data} = await axiosClient.patch<SyllabusSubject>(Endpoints.subjects.byId(subjectId), input);
      return data;
    } catch (e) {
      rethrowApiError(e, 'Failed to update subject.');
    }
  },
  delete: async (subjectId: string): Promise<void> => {
    try {
      await axiosClient.delete(Endpoints.subjects.byId(subjectId));
    } catch (e) {
      rethrowApiError(e, 'Failed to delete subject.');
    }
  },
  toggleStatus: async (subjectId: string): Promise<SyllabusSubject> => {
    try {
      const {data} = await axiosClient.patch<SyllabusSubject>(Endpoints.subjects.toggleStatus(subjectId));
      return data;
    } catch (e) {
      rethrowApiError(e, 'Failed to toggle subject status.');
    }
  },
  assignClasses: async (subjectId: string, classIds: string[]): Promise<void> => {
    try {
      await axiosClient.post(Endpoints.subjects.assignClasses(subjectId), {classIds});
    } catch (e) {
      rethrowApiError(e, 'Failed to assign classes.');
    }
  },
  byClass: async (classId: string): Promise<SyllabusSubject[]> => {
    try {
      const {data} = await axiosClient.get<SyllabusSubject[]>(Endpoints.subjects.byClass(classId));
      return data;
    } catch (e) {
      rethrowApiError(e, 'Failed to load subjects for class.');
    }
  },
};

export const useAdminSubjects = () =>
  useQuery({queryKey: ['adminSubjects'], queryFn: adminSubjectsApi.list});

export const useSubjectsByClass = (classId: string | undefined) =>
  useQuery({
    queryKey: ['subjectsByClass', classId],
    queryFn: () => adminSubjectsApi.byClass(classId!),
    enabled: !!classId,
  });

export const useCreateAdminSubject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: {name: string; description?: string; classIds?: string[]}) =>
      adminSubjectsApi.create(input),
    onSuccess: () => {
      qc.invalidateQueries({queryKey: ['adminSubjects']});
      qc.invalidateQueries({queryKey: ['subjectsByClass']});
    },
  });
};

export const useUpdateAdminSubject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({subjectId, ...input}: {subjectId: string; name?: string; description?: string}) =>
      adminSubjectsApi.update(subjectId, input),
    onSuccess: () => qc.invalidateQueries({queryKey: ['adminSubjects']}),
  });
};

export const useDeleteAdminSubject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (subjectId: string) => adminSubjectsApi.delete(subjectId),
    onSuccess: () => qc.invalidateQueries({queryKey: ['adminSubjects']}),
  });
};

export const useToggleSubjectStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (subjectId: string) => adminSubjectsApi.toggleStatus(subjectId),
    onSuccess: () => qc.invalidateQueries({queryKey: ['adminSubjects']}),
  });
};

export const useAssignSubjectClasses = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({subjectId, classIds}: {subjectId: string; classIds: string[]}) =>
      adminSubjectsApi.assignClasses(subjectId, classIds),
    onSuccess: () => {
      qc.invalidateQueries({queryKey: ['adminSubjects']});
      qc.invalidateQueries({queryKey: ['subjectsByClass']});
    },
  });
};

// ---- Chapters ---------------------------------------------------------------
interface ChapterQuery {
  subjectId?: string;
  classId?: string;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
}

export const adminChaptersApi = {
  list: async (params: ChapterQuery = {}): Promise<Paginated<SyllabusChapter>> => {
    try {
      const {data} = await axiosClient.get<Paginated<SyllabusChapter>>(Endpoints.adminSyllabus.chapters, {params});
      return data;
    } catch (e) {
      rethrowApiError(e, 'Failed to load chapters.');
    }
  },
  getById: async (chapterId: string): Promise<SyllabusChapter> => {
    try {
      const {data} = await axiosClient.get<SyllabusChapter>(Endpoints.adminSyllabus.chapterById(chapterId));
      return data;
    } catch (e) {
      rethrowApiError(e, 'Failed to load chapter.');
    }
  },
  create: async (input: Omit<SyllabusChapter, 'id' | 'isActive' | 'subjectName' | 'className'>): Promise<SyllabusChapter> => {
    try {
      const {data} = await axiosClient.post<SyllabusChapter>(Endpoints.adminSyllabus.chapters, input);
      return data;
    } catch (e) {
      rethrowApiError(e, 'Failed to create chapter.');
    }
  },
  update: async (chapterId: string, input: Partial<Omit<SyllabusChapter, 'id' | 'isActive'>>): Promise<SyllabusChapter> => {
    try {
      const {data} = await axiosClient.patch<SyllabusChapter>(Endpoints.adminSyllabus.chapterById(chapterId), input);
      return data;
    } catch (e) {
      rethrowApiError(e, 'Failed to update chapter.');
    }
  },
  delete: async (chapterId: string): Promise<void> => {
    try {
      await axiosClient.delete(Endpoints.adminSyllabus.chapterById(chapterId));
    } catch (e) {
      rethrowApiError(e, 'Failed to delete chapter.');
    }
  },
  toggleStatus: async (chapterId: string): Promise<SyllabusChapter> => {
    try {
      const {data} = await axiosClient.patch<SyllabusChapter>(Endpoints.adminSyllabus.chapterStatus(chapterId));
      return data;
    } catch (e) {
      rethrowApiError(e, 'Failed to toggle chapter status.');
    }
  },
  reorder: async (chapters: ChapterReorderItem[]): Promise<void> => {
    try {
      await axiosClient.patch(Endpoints.adminSyllabus.chaptersReorder, {chapters});
    } catch (e) {
      rethrowApiError(e, 'Failed to reorder chapters.');
    }
  },
};

export const useAdminChapters = (params: ChapterQuery = {}) =>
  useQuery({
    queryKey: ['adminChapters', params],
    queryFn: () => adminChaptersApi.list(params),
  });

export const useCreateChapter = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<SyllabusChapter, 'id' | 'isActive' | 'subjectName' | 'className'>) =>
      adminChaptersApi.create(input),
    onSuccess: () => qc.invalidateQueries({queryKey: ['adminChapters']}),
  });
};

export const useUpdateChapter = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({chapterId, ...input}: {chapterId: string} & Partial<Omit<SyllabusChapter, 'id' | 'isActive'>>) =>
      adminChaptersApi.update(chapterId, input),
    onSuccess: () => qc.invalidateQueries({queryKey: ['adminChapters']}),
  });
};

export const useDeleteChapter = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (chapterId: string) => adminChaptersApi.delete(chapterId),
    onSuccess: () => qc.invalidateQueries({queryKey: ['adminChapters']}),
  });
};

export const useToggleChapterStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (chapterId: string) => adminChaptersApi.toggleStatus(chapterId),
    onSuccess: () => qc.invalidateQueries({queryKey: ['adminChapters']}),
  });
};

export const useReorderChapters = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (chapters: ChapterReorderItem[]) => adminChaptersApi.reorder(chapters),
    onSuccess: () => qc.invalidateQueries({queryKey: ['adminChapters']}),
  });
};

// ---- Plans ------------------------------------------------------------------
interface PlanQuery {
  sessionYear?: number;
  classId?: string;
  sectionId?: string;
  subjectId?: string;
  teacherId?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}

export const adminPlansApi = {
  list: async (params: PlanQuery = {}): Promise<Paginated<SyllabusPlan>> => {
    try {
      const {data} = await axiosClient.get<Paginated<SyllabusPlan>>(Endpoints.adminSyllabus.plans, {params});
      return data;
    } catch (e) {
      rethrowApiError(e, 'Failed to load plans.');
    }
  },
  getById: async (planId: string): Promise<SyllabusPlan> => {
    try {
      const {data} = await axiosClient.get<SyllabusPlan>(Endpoints.adminSyllabus.planById(planId));
      return data;
    } catch (e) {
      rethrowApiError(e, 'Failed to load plan.');
    }
  },
  create: async (input: CreatePlanInput): Promise<SyllabusPlan> => {
    try {
      const {data} = await axiosClient.post<SyllabusPlan>(Endpoints.adminSyllabus.plans, input);
      return data;
    } catch (e) {
      rethrowApiError(e, 'Failed to create plan.');
    }
  },
  update: async (planId: string, input: UpdatePlanInput): Promise<SyllabusPlan> => {
    try {
      const {data} = await axiosClient.patch<SyllabusPlan>(Endpoints.adminSyllabus.planById(planId), input);
      return data;
    } catch (e) {
      rethrowApiError(e, 'Failed to update plan.');
    }
  },
  delete: async (planId: string): Promise<void> => {
    try {
      await axiosClient.delete(Endpoints.adminSyllabus.planById(planId));
    } catch (e) {
      rethrowApiError(e, 'Failed to delete plan.');
    }
  },
  updateChapter: async (planId: string, chapterId: string, input: UpdatePlanChapterInput): Promise<void> => {
    try {
      await axiosClient.patch(Endpoints.adminSyllabus.planChapter(planId, chapterId), input);
    } catch (e) {
      rethrowApiError(e, 'Failed to update plan chapter.');
    }
  },
};

export const useAdminPlans = (params: PlanQuery = {}) =>
  useQuery({
    queryKey: ['adminPlans', params],
    queryFn: () => adminPlansApi.list(params),
  });

export const useAdminPlanDetail = (planId: string | undefined) =>
  useQuery({
    queryKey: ['adminPlanDetail', planId],
    queryFn: () => adminPlansApi.getById(planId!),
    enabled: !!planId,
  });

export const useCreatePlan = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreatePlanInput) => adminPlansApi.create(input),
    onSuccess: () => qc.invalidateQueries({queryKey: ['adminPlans']}),
  });
};

export const useUpdatePlan = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({planId, ...input}: {planId: string} & UpdatePlanInput) =>
      adminPlansApi.update(planId, input),
    onSuccess: () => {
      qc.invalidateQueries({queryKey: ['adminPlans']});
      qc.invalidateQueries({queryKey: ['adminPlanDetail']});
    },
  });
};

export const useDeletePlan = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (planId: string) => adminPlansApi.delete(planId),
    onSuccess: () => qc.invalidateQueries({queryKey: ['adminPlans']}),
  });
};

export const useUpdatePlanChapter = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({planId, chapterId, ...input}: {planId: string; chapterId: string} & UpdatePlanChapterInput) =>
      adminPlansApi.updateChapter(planId, chapterId, input),
    onSuccess: () => qc.invalidateQueries({queryKey: ['adminPlanDetail']}),
  });
};

// ---- Dashboard / Reports ----------------------------------------------------
interface ReportQuery {
  sessionYear: number;
  classId?: string;
  sectionId?: string;
  subjectId?: string;
  teacherId?: string;
}

export const adminSyllabusReportsApi = {
  dashboard: async (params: ReportQuery): Promise<SyllabusDashboard> => {
    try {
      const {data} = await axiosClient.get<SyllabusDashboard>(Endpoints.adminSyllabus.dashboard, {params});
      return data;
    } catch (e) {
      rethrowApiError(e, 'Failed to load syllabus dashboard.');
    }
  },
  classProgress: async (params: ReportQuery): Promise<ClassProgressItem[]> => {
    try {
      const {data} = await axiosClient.get<ClassProgressItem[]>(Endpoints.adminSyllabus.classProgress, {params});
      return data;
    } catch (e) {
      rethrowApiError(e, 'Failed to load class progress.');
    }
  },
  teacherProgress: async (params: ReportQuery): Promise<TeacherProgressItem[]> => {
    try {
      const {data} = await axiosClient.get<TeacherProgressItem[]>(Endpoints.adminSyllabus.teacherProgress, {params});
      return data;
    } catch (e) {
      rethrowApiError(e, 'Failed to load teacher progress.');
    }
  },
  delayedChapters: async (params: ReportQuery): Promise<DelayedChapterItem[]> => {
    try {
      const {data} = await axiosClient.get<DelayedChapterItem[]>(Endpoints.adminSyllabus.delayedChapters, {params});
      return data;
    } catch (e) {
      rethrowApiError(e, 'Failed to load delayed chapters.');
    }
  },
};

export const useSyllabusDashboard = (params: ReportQuery) =>
  useQuery({
    queryKey: ['syllabusDashboard', params],
    queryFn: () => adminSyllabusReportsApi.dashboard(params),
    enabled: !!params.sessionYear,
  });

export const useClassProgress = (params: ReportQuery) =>
  useQuery({
    queryKey: ['syllabusClassProgress', params],
    queryFn: () => adminSyllabusReportsApi.classProgress(params),
    enabled: !!params.sessionYear,
  });

export const useTeacherProgress = (params: ReportQuery) =>
  useQuery({
    queryKey: ['syllabusTeacherProgress', params],
    queryFn: () => adminSyllabusReportsApi.teacherProgress(params),
    enabled: !!params.sessionYear,
  });

export const useDelayedChapters = (params: ReportQuery) =>
  useQuery({
    queryKey: ['syllabusDelayedChapters', params],
    queryFn: () => adminSyllabusReportsApi.delayedChapters(params),
    enabled: !!params.sessionYear,
  });

// ---- Approvals --------------------------------------------------------------
export const adminApprovalsApi = {
  list: async (sessionYear: number): Promise<SyllabusApproval[]> => {
    try {
      const {data} = await axiosClient.get<SyllabusApproval[]>(Endpoints.adminSyllabus.approvals, {params: {sessionYear}});
      return data;
    } catch (e) {
      rethrowApiError(e, 'Failed to load approvals.');
    }
  },
  approve: async (approvalId: string, input: ApproveInput): Promise<void> => {
    try {
      await axiosClient.patch(Endpoints.adminSyllabus.approvalById(approvalId), input);
    } catch (e) {
      rethrowApiError(e, 'Failed to approve.');
    }
  },
  reject: async (approvalId: string, input: RejectInput): Promise<void> => {
    try {
      await axiosClient.patch(Endpoints.adminSyllabus.approvalById(approvalId), input);
    } catch (e) {
      rethrowApiError(e, 'Failed to reject.');
    }
  },
  correct: async (planChapterId: string, input: CorrectionInput): Promise<void> => {
    try {
      await axiosClient.patch(Endpoints.adminSyllabus.approvalCorrect(planChapterId), input);
    } catch (e) {
      rethrowApiError(e, 'Failed to apply correction.');
    }
  },
};

export const useAdminApprovals = (sessionYear: number) =>
  useQuery({
    queryKey: ['adminApprovals', sessionYear],
    queryFn: () => adminApprovalsApi.list(sessionYear),
    enabled: !!sessionYear,
  });

export const useApproveProgress = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({approvalId, ...input}: {approvalId: string} & ApproveInput) =>
      adminApprovalsApi.approve(approvalId, input),
    onSuccess: () => {
      qc.invalidateQueries({queryKey: ['adminApprovals']});
      qc.invalidateQueries({queryKey: ['adminPlanDetail']});
    },
  });
};

export const useRejectProgress = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({approvalId, ...input}: {approvalId: string} & RejectInput) =>
      adminApprovalsApi.reject(approvalId, input),
    onSuccess: () => {
      qc.invalidateQueries({queryKey: ['adminApprovals']});
      qc.invalidateQueries({queryKey: ['adminPlanDetail']});
    },
  });
};

export const useCorrectProgress = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({planChapterId, ...input}: {planChapterId: string} & CorrectionInput) =>
      adminApprovalsApi.correct(planChapterId, input),
    onSuccess: () => {
      qc.invalidateQueries({queryKey: ['adminApprovals']});
      qc.invalidateQueries({queryKey: ['adminPlanDetail']});
    },
  });
};
