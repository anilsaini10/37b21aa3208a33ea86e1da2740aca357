/** Teachers service — real backend (Express + Prisma), scoped server-side to the admin's school. */
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {axiosClient} from '../../core/api/axiosClient';
import {Endpoints} from '../../core/api/apiConfig';
import {rethrowApiError} from '../../core/api/apiError';
import type {
  Paginated,
  QueryParams,
  Status,
  Teacher,
  TeacherHomeroomSection,
  TeacherSubjectAssignment,
} from '../../shared/types';

export interface TeacherInput {
  name: string;
  email: string;
  phone: string;
  gender: Teacher['gender'];
  qualification: string;
  /** Whole years of experience. */
  experienceYears: number;
  /** Additional months (0-11). */
  experienceMonths: number;
  /** General subject expertise (names only) — the backend auto-creates any it doesn't recognise yet. Doesn't bind a subject to any class; use `useAssignTeacherSubject` for that. */
  subjects: string[];
  salary: number;
  joiningDate: string;
  /** Optional — makes this teacher the homeroom Class Teacher of one section. */
  classTeacherSectionId?: string;
}

export interface CreateTeacherResult {
  teacher: Teacher;
  /** One-time plaintext login password — always present for a new teacher account. */
  defaultPassword: string;
}

export interface AssignTeacherSubjectInput {
  subject: string;
  classId: string;
}

/**
 * Full profile/HR edit — separate from subject-class scheduling (`assignSubject`/`removeSubject`)
 * and from homeroom assignment (Classes/Sections edit screen). Any subset is a valid PATCH body.
 */
export type UpdateTeacherInput = Partial<{
  name: string;
  email: string;
  phone: string;
  gender: Teacher['gender'];
  joiningDate: string;
  salary: number;
  qualification: string;
  experienceYears: number;
  experienceMonths: number;
  /** General expertise list — min 1 item if included. Doesn't touch class-scheduling assignments. */
  subjectsTaught: string[];
  status: Extract<Status, 'active' | 'inactive'>;
  /** Assigns this teacher as Class Teacher (homeroom in-charge) of a section. Omit entirely when untouched — the backend has no way to clear an existing assignment through this field (do that via the section's own edit, `useUpdateSection`). */
  classTeacherSectionId: string;
}>;

/** Raw shape the real backend responds with — gender/status come back upper-case. Exported so the teacher's own-profile endpoint (identical shape) can reuse this normalisation. */
export interface TeacherApi {
  id: string;
  employeeId: string;
  name: string;
  gender: string;
  email: string;
  phone: string;
  subjects: TeacherSubjectAssignment[];
  classTeacherOf?: TeacherHomeroomSection[];
  joiningDate: string;
  salary: number;
  status: string;
  performanceScore: number;
  qualification: string;
  experienceYears: number;
  experienceMonths: number;
  subjectsTaught: string[];
}

export function toTeacher(raw: TeacherApi): Teacher {
  return {
    id: raw.id,
    employeeId: raw.employeeId,
    name: raw.name,
    gender: raw.gender.toLowerCase() as Teacher['gender'],
    email: raw.email,
    phone: raw.phone,
    subjects: raw.subjects,
    classTeacherOf: raw.classTeacherOf ?? [],
    joiningDate: raw.joiningDate,
    salary: raw.salary,
    status: raw.status.toLowerCase() as Status,
    performanceScore: raw.performanceScore,
    qualification: raw.qualification,
    experienceYears: raw.experienceYears,
    experienceMonths: raw.experienceMonths,
    subjectsTaught: raw.subjectsTaught ?? [],
  };
}

export const teachersApi = {
  list: async (params?: QueryParams): Promise<Paginated<Teacher>> => {
    try {
      const {data} = await axiosClient.get<Paginated<TeacherApi>>(Endpoints.admin.teachers, {params});
      return {...data, items: data.items.map(toTeacher)};
    } catch (e) {
      console.error('teachersApi.list failed', e);
      rethrowApiError(e, 'Failed to load teachers.');
    }
  },

  getById: async (id: string): Promise<Teacher> => {
    try {
      const {data} = await axiosClient.get<TeacherApi>(Endpoints.admin.teachers_byId(id));
      return toTeacher(data);
    } catch (e) {
      console.error('teachersApi.getById failed', e);
      rethrowApiError(e, 'Failed to load teacher.');
    }
  },

  create: async (input: TeacherInput): Promise<CreateTeacherResult> => {
    try {
      const {data} = await axiosClient.post<{teacher: TeacherApi; defaultPassword: string}>(
        Endpoints.admin.teachers,
        {...input, gender: input.gender.toUpperCase()},
      );
      return {teacher: toTeacher(data.teacher), defaultPassword: data.defaultPassword};
    } catch (e) {
      console.error('teachersApi.create failed', e);
      rethrowApiError(e, 'Failed to add teacher.');
    }
  },

  update: async (id: string, input: UpdateTeacherInput): Promise<Teacher> => {
    try {
      const body: Record<string, unknown> = {...input};
      if (input.gender) {
        body.gender = input.gender.toUpperCase();
      }
      if (input.status) {
        body.status = input.status.toUpperCase();
      }
      const {data} = await axiosClient.patch<TeacherApi>(Endpoints.admin.teachers_byId(id), body);
      return toTeacher(data);
    } catch (e) {
      console.error('teachersApi.update failed', e);
      rethrowApiError(e, 'Failed to update teacher.');
    }
  },

  remove: async (id: string): Promise<void> => {
    try {
      await axiosClient.delete(Endpoints.admin.teachers_byId(id));
    } catch (e) {
      console.error('teachersApi.remove failed', e);
      rethrowApiError(e, 'Failed to remove teacher.');
    }
  },

  /** Binds one subject+class combo to a teacher's actual schedule — can be called multiple times (once per combo). Separate from the general `subjects` expertise list sent at create time. Returns the updated teacher (subjects/subjectsTaught/etc. all included). */
  assignSubject: async (teacherId: string, input: AssignTeacherSubjectInput): Promise<Teacher> => {
    try {
      const {data} = await axiosClient.post<TeacherApi>(Endpoints.admin.teachers_subjects(teacherId), input);
      return toTeacher(data);
    } catch (e) {
      console.error('teachersApi.assignSubject failed', e);
      rethrowApiError(e, 'Failed to assign subject to class.');
    }
  },

  /** Removes one subject+class assignment. Returns the updated teacher, same shape as assignSubject. */
  removeSubject: async (teacherId: string, subjectId: string, classId: string): Promise<Teacher> => {
    try {
      const {data} = await axiosClient.delete<TeacherApi>(
        Endpoints.admin.teachers_subject_byId(teacherId, subjectId, classId),
      );
      return toTeacher(data);
    } catch (e) {
      console.error('teachersApi.removeSubject failed', e);
      rethrowApiError(e, 'Failed to remove subject assignment.');
    }
  },
};

export const useTeachers = (params?: QueryParams) =>
  useQuery({queryKey: ['teachers', params], queryFn: () => teachersApi.list(params)});

/** `initial` (e.g. the row already shown in the list) renders instantly while a fresh copy refetches in the background. */
export const useTeacher = (id: string, initial?: Teacher) =>
  useQuery({
    queryKey: ['teacher', id],
    queryFn: () => teachersApi.getById(id),
    enabled: !!id,
    initialData: initial,
  });

export const useCreateTeacher = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: TeacherInput) => teachersApi.create(input),
    onSuccess: () => qc.invalidateQueries({queryKey: ['teachers']}),
  });
};

export const useUpdateTeacher = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({id, input}: {id: string; input: UpdateTeacherInput}) => teachersApi.update(id, input),
    onSuccess: (updated, {id}) => {
      qc.setQueryData(['teacher', id], updated);
      qc.invalidateQueries({queryKey: ['teachers']});
    },
  });
};

export const useAssignTeacherSubject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({teacherId, input}: {teacherId: string; input: AssignTeacherSubjectInput}) =>
      teachersApi.assignSubject(teacherId, input),
    onSuccess: (updated, {teacherId}) => {
      qc.setQueryData(['teacher', teacherId], updated);
      qc.invalidateQueries({queryKey: ['teachers']});
    },
  });
};

export const useRemoveTeacherSubject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({teacherId, subjectId, classId}: {teacherId: string; subjectId: string; classId: string}) =>
      teachersApi.removeSubject(teacherId, subjectId, classId),
    onSuccess: (updated, {teacherId}) => {
      qc.setQueryData(['teacher', teacherId], updated);
      qc.invalidateQueries({queryKey: ['teachers']});
    },
  });
};

export const useDeleteTeacher = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => teachersApi.remove(id),
    onSuccess: () => qc.invalidateQueries({queryKey: ['teachers']}),
  });
};
