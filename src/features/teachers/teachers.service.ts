/** Teachers service — list/create over the mock DB + hooks. */
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {db} from '../../core/mock/db';
import {respond, paginateList} from '../../core/mock/mockApi';
import {generateId} from '../../core/utils/misc';
import type {Paginated, QueryParams, Teacher} from '../../shared/types';

export interface TeacherInput {
  name: string;
  email: string;
  phone: string;
  gender: Teacher['gender'];
  subject: string;
  salary: number;
  joiningDate: string;
}

export const teachersApi = {
  list: (params?: QueryParams): Promise<Paginated<Teacher>> => {
    let items = db.teachers;
    if (params?.subject) {
      items = items.filter(t => t.subjects.includes(String(params.subject)));
    }
    return respond(paginateList(items, params, ['name', 'employeeId', 'email']));
  },

  getById: (id: string): Promise<Teacher | undefined> =>
    respond(db.teachers.find(t => t.id === id)),

  create: (input: TeacherInput): Promise<Teacher> => {
    const teacher: Teacher = {
      id: generateId('tch'),
      employeeId: `EMP${200 + db.teachers.length}`,
      name: input.name,
      gender: input.gender,
      email: input.email,
      phone: input.phone,
      subjectIds: [],
      subjects: [input.subject],
      joiningDate: input.joiningDate,
      salary: input.salary,
      status: 'active',
      performanceScore: 85,
    };
    db.teachers.unshift(teacher);
    return respond(teacher);
  },

  remove: (id: string): Promise<void> => {
    const idx = db.teachers.findIndex(t => t.id === id);
    if (idx >= 0) {
      db.teachers.splice(idx, 1);
    }
    return respond(undefined);
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
