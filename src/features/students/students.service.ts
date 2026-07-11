/** Students service — real backend (Express + Prisma), scoped server-side to the admin's school. */
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {axiosClient} from '../../core/api/axiosClient';
import {Endpoints} from '../../core/api/apiConfig';
import {rethrowApiError} from '../../core/api/apiError';
import {generateId} from '../../core/utils/misc';
import type {Paginated, QueryParams, Status, Student} from '../../shared/types';

export interface StudentInput {
  name: string;
  gender: Student['gender'];
  dateOfBirth: string;
  classId: string;
  sectionId: string;
  rollNo: number;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  bloodGroup?: string;
  address?: string;
}

export interface ParentAccountResult {
  isNew: boolean;
  email: string;
  /** One-time plaintext password — only present when `isNew` is true. */
  defaultPassword?: string;
}

export interface CreateStudentResult {
  student: Student;
  parentAccount: ParentAccountResult;
}

/** Raw shapes the real backend responds with — gender/status come back upper-case. */
interface StudentApi {
  id: string;
  admissionNo: string;
  name: string;
  gender: string;
  dateOfBirth: string;
  classId: string;
  className: string;
  sectionId: string;
  sectionName: string;
  rollNo: number;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  bloodGroup?: string;
  address?: string;
  status: string;
  attendancePercentage: number;
}

function toStudent(raw: StudentApi): Student {
  return {
    id: raw.id,
    admissionNo: raw.admissionNo,
    name: raw.name,
    gender: raw.gender.toLowerCase() as Student['gender'],
    dateOfBirth: raw.dateOfBirth,
    classId: raw.classId,
    className: raw.className,
    sectionId: raw.sectionId,
    sectionName: raw.sectionName,
    rollNo: raw.rollNo,
    // The backend links the parent by account, not a standalone parentId — this is
    // only used as a local list key, never sent back to the server.
    parentId: generateId('par'),
    parentName: raw.parentName,
    parentPhone: raw.parentPhone,
    parentEmail: raw.parentEmail,
    bloodGroup: raw.bloodGroup,
    address: raw.address,
    status: raw.status.toLowerCase() as Status,
    attendancePercentage: raw.attendancePercentage,
    // Document uploads aren't part of this API yet.
    documents: [],
  };
}

export const studentsApi = {
  list: async (params?: QueryParams): Promise<Paginated<Student>> => {
    try {
      const {data} = await axiosClient.get<Paginated<StudentApi>>(Endpoints.admin.students, {params});
      return {...data, items: data.items.map(toStudent)};
    } catch (e) {
      console.error('studentsApi.list failed', e);
      rethrowApiError(e, 'Failed to load students.');
    }
  },

  getById: async (id: string): Promise<Student> => {
    try {
      const {data} = await axiosClient.get<StudentApi>(Endpoints.admin.students_byId(id));
      return toStudent(data);
    } catch (e) {
      console.error('studentsApi.getById failed', e);
      rethrowApiError(e, 'Failed to load student.');
    }
  },

  create: async (input: StudentInput): Promise<CreateStudentResult> => {
    try {
      const {data} = await axiosClient.post<{student: StudentApi; parentAccount: ParentAccountResult}>(
        Endpoints.admin.students,
        {...input, gender: input.gender.toUpperCase()},
      );
      return {student: toStudent(data.student), parentAccount: data.parentAccount};
    } catch (e) {
      rethrowApiError(e, 'Failed to add student.');
    }
  },

  update: async (id: string, input: Partial<StudentInput>): Promise<Student> => {
    try {
      const {data} = await axiosClient.put<StudentApi>(Endpoints.admin.students_byId(id), input);
      return toStudent(data);
    } catch (e) {
      console.error('studentsApi.update failed', e);
      rethrowApiError(e, 'Failed to update student.');
    }
  },

  remove: async (id: string): Promise<void> => {
    try {
      await axiosClient.delete(Endpoints.admin.students_byId(id));
    } catch (e) {
      console.error('studentsApi.remove failed', e);
      rethrowApiError(e, 'Failed to remove student.');
    }
  },
};

export const useStudents = (params?: QueryParams) =>
  useQuery({queryKey: ['students', params], queryFn: () => studentsApi.list(params)});

/** `initial` (e.g. the row already shown in the list) renders instantly while a fresh copy refetches in the background. */
export const useStudent = (id: string, initial?: Student) =>
  useQuery({
    queryKey: ['student', id],
    queryFn: () => studentsApi.getById(id),
    enabled: !!id,
    initialData: initial,
  });

export const useCreateStudent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: StudentInput) => studentsApi.create(input),
    onSuccess: () => qc.invalidateQueries({queryKey: ['students']}),
  });
};

export const useUpdateStudent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({id, input}: {id: string; input: Partial<StudentInput>}) =>
      studentsApi.update(id, input),
    onSuccess: () => qc.invalidateQueries({queryKey: ['students']}),
  });
};

export const useDeleteStudent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => studentsApi.remove(id),
    onSuccess: () => qc.invalidateQueries({queryKey: ['students']}),
  });
};
