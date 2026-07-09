/** Teachers service — real backend (Express + Prisma), scoped server-side to the admin's school. */
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {axiosClient} from '../../core/api/axiosClient';
import {Endpoints} from '../../core/api/apiConfig';
import {rethrowApiError} from '../../core/api/apiError';
import type {Paginated, QueryParams, Status, Teacher, TeacherSubjectAssignment} from '../../shared/types';

export interface TeacherInput {
  name: string;
  email: string;
  phone: string;
  gender: Teacher['gender'];
  /** A subject NAME — the backend auto-creates it if it doesn't exist yet. */
  subject: string;
  /** Which class this teacher teaches `subject` in — required by the backend. */
  classId: string;
  salary: number;
  joiningDate: string;
}

export interface CreateTeacherResult {
  teacher: Teacher;
  /** One-time plaintext login password — always present for a new teacher account. */
  defaultPassword: string;
}

/** Raw shape the real backend responds with — gender/status come back upper-case. */
interface TeacherApi {
  id: string;
  employeeId: string;
  name: string;
  gender: string;
  email: string;
  phone: string;
  subjects: TeacherSubjectAssignment[];
  joiningDate: string;
  salary: number;
  status: string;
  performanceScore: number;
}

function toTeacher(raw: TeacherApi): Teacher {
  return {
    id: raw.id,
    employeeId: raw.employeeId,
    name: raw.name,
    gender: raw.gender.toLowerCase() as Teacher['gender'],
    email: raw.email,
    phone: raw.phone,
    subjects: raw.subjects,
    joiningDate: raw.joiningDate,
    salary: raw.salary,
    status: raw.status.toLowerCase() as Status,
    performanceScore: raw.performanceScore,
  };
}

export const teachersApi = {
  list: async (params?: QueryParams): Promise<Paginated<Teacher>> => {
    try {
      const {data} = await axiosClient.get<Paginated<TeacherApi>>(Endpoints.admin.teachers, {params});
      return {...data, items: data.items.map(toTeacher)};
    } catch (e) {
      rethrowApiError(e, 'Failed to load teachers.');
    }
  },

  /** No dedicated get-by-id endpoint — resolved from the (already-cached) list. */
  getById: async (id: string): Promise<Teacher | undefined> => {
    const page = await teachersApi.list({pageSize: 500});
    return page.items.find(t => t.id === id);
  },

  create: async (input: TeacherInput): Promise<CreateTeacherResult> => {
    try {
      const {data} = await axiosClient.post<{teacher: TeacherApi; defaultPassword: string}>(
        Endpoints.admin.teachers,
        {...input, gender: input.gender.toUpperCase()},
      );
      return {teacher: toTeacher(data.teacher), defaultPassword: data.defaultPassword};
    } catch (e) {
      rethrowApiError(e, 'Failed to add teacher.');
    }
  },

  remove: async (id: string): Promise<void> => {
    try {
      await axiosClient.delete(Endpoints.admin.teachers_byId(id));
    } catch (e) {
      rethrowApiError(e, 'Failed to remove teacher.');
    }
  },
};

export const useTeachers = (params?: QueryParams) =>
  useQuery({queryKey: ['teachers', params], queryFn: () => teachersApi.list(params)});

export const useTeacher = (id: string) =>
  useQuery({queryKey: ['teacher', id], queryFn: () => teachersApi.getById(id), enabled: !!id});

export const useCreateTeacher = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: TeacherInput) => teachersApi.create(input),
    onSuccess: () => qc.invalidateQueries({queryKey: ['teachers']}),
  });
};

export const useDeleteTeacher = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => teachersApi.remove(id),
    onSuccess: () => qc.invalidateQueries({queryKey: ['teachers']}),
  });
};
