/** Students service — CRUD over the mock DB + React Query hooks. */
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {db} from '../../core/mock/db';
import {respond, paginateList} from '../../core/mock/mockApi';
import {generateId} from '../../core/utils/misc';
import type {Paginated, QueryParams, Student} from '../../shared/types';

export interface StudentInput {
  name: string;
  gender: Student['gender'];
  dateOfBirth: string;
  classId: string;
  sectionId: string;
  rollNo: number;
  parentName: string;
  parentPhone: string;
  bloodGroup?: string;
  address?: string;
}

export const studentsApi = {
  list: (params?: QueryParams): Promise<Paginated<Student>> =>
    respond(paginateList(db.students, params, ['name', 'admissionNo', 'className', 'parentName'])),

  getById: (id: string): Promise<Student | undefined> =>
    respond(db.students.find(s => s.id === id)),

  create: (input: StudentInput): Promise<Student> => {
    const cls = db.classes.find(c => c.id === input.classId);
    const section = db.sections.find(s => s.id === input.sectionId);
    const student: Student = {
      id: generateId('stu'),
      admissionNo: `ADM${2000 + db.students.length}`,
      name: input.name,
      gender: input.gender,
      dateOfBirth: input.dateOfBirth,
      classId: input.classId,
      className: cls?.name ?? '',
      sectionId: input.sectionId,
      sectionName: section?.name ?? '',
      rollNo: input.rollNo,
      parentId: generateId('par'),
      parentName: input.parentName,
      parentPhone: input.parentPhone,
      bloodGroup: input.bloodGroup,
      address: input.address,
      status: 'active',
      attendancePercentage: 100,
      documents: [],
    };
    db.students.unshift(student);
    return respond(student);
  },

  update: (id: string, input: Partial<StudentInput>): Promise<Student> => {
    const student = db.students.find(s => s.id === id);
    if (!student) {
      return Promise.reject(new Error('Student not found'));
    }
    Object.assign(student, input);
    return respond(student);
  },

  remove: (id: string): Promise<void> => {
    const idx = db.students.findIndex(s => s.id === id);
    if (idx >= 0) {
      db.students.splice(idx, 1);
    }
    return respond(undefined);
  },
};

export const useStudents = (params?: QueryParams) =>
  useQuery({queryKey: ['students', params], queryFn: () => studentsApi.list(params)});

export const useStudent = (id: string) =>
  useQuery({queryKey: ['student', id], queryFn: () => studentsApi.getById(id), enabled: !!id});

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
