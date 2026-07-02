/** Homework service — list/create + hooks. */
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {db} from '../../core/mock/db';
import {respond} from '../../core/mock/mockApi';
import {generateId} from '../../core/utils/misc';
import type {Homework} from '../../shared/types';

export interface HomeworkInput {
  title: string;
  description: string;
  subjectName: string;
  classId: string;
  sectionId: string;
  dueDate: string;
}

export const homeworkApi = {
  list: (): Promise<Homework[]> => respond(db.homework),

  forClass: (classId: string): Promise<Homework[]> =>
    respond(db.homework.filter(h => h.classId === classId)),

  create: (input: HomeworkInput, teacherName: string): Promise<Homework> => {
    const cls = db.classes.find(c => c.id === input.classId);
    const hw: Homework = {
      id: generateId('hw'),
      title: input.title,
      description: input.description,
      subjectId: generateId('sub'),
      subjectName: input.subjectName,
      classId: input.classId,
      className: cls?.name ?? '',
      sectionId: input.sectionId,
      assignedByTeacherId: 'me',
      assignedByName: teacherName,
      assignedDate: new Date().toISOString().slice(0, 10),
      dueDate: input.dueDate,
      status: 'pending',
    };
    db.homework.unshift(hw);
    return respond(hw);
  },
};

export const useHomework = () => useQuery({queryKey: ['homework'], queryFn: homeworkApi.list});

export const useCreateHomework = (teacherName: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: HomeworkInput) => homeworkApi.create(input, teacherName),
    onSuccess: () => qc.invalidateQueries({queryKey: ['homework']}),
  });
};
