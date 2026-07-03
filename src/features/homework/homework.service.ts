/** Homework service — list/create + hooks. */
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {db} from '../../core/mock/db';
import {respond} from '../../core/mock/mockApi';
import {generateId} from '../../core/utils/misc';
import type {Homework, HomeworkSubmission} from '../../shared/types';

export interface HomeworkInput {
  title: string;
  description: string;
  subjectName: string;
  classId: string;
  sectionId: string;
  dueDate: string;
}

export interface HomeworkFilter {
  classId?: string;
  sectionId?: string;
}

export const homeworkApi = {
  list: (filter?: HomeworkFilter): Promise<Homework[]> => {
    let items = db.homework;
    if (filter?.classId) {
      items = items.filter(h => h.classId === filter.classId);
    }
    if (filter?.sectionId) {
      items = items.filter(h => h.sectionId === filter.sectionId);
    }
    return respond(items);
  },

  getById: (id: string): Promise<Homework | undefined> =>
    respond(db.homework.find(h => h.id === id)),

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

    const roster = db.students.filter(s => s.classId === hw.classId && s.sectionId === hw.sectionId);
    roster.forEach(s => {
      db.homeworkSubmissions.push({
        id: generateId('hws'),
        homeworkId: hw.id,
        studentId: s.id,
        studentName: s.name,
        rollNo: s.rollNo,
        status: 'pending',
      });
    });

    return respond(hw);
  },
};

export const homeworkSubmissionsApi = {
  forHomework: (homeworkId: string): Promise<HomeworkSubmission[]> =>
    respond(
      db.homeworkSubmissions
        .filter(s => s.homeworkId === homeworkId)
        .sort((a, b) => a.rollNo - b.rollNo),
    ),

  updateStatus: (id: string, status: HomeworkSubmission['status']): Promise<HomeworkSubmission> => {
    const submission = db.homeworkSubmissions.find(s => s.id === id);
    if (!submission) {
      return Promise.reject(new Error('Submission not found'));
    }
    submission.status = status;
    submission.completedAt = status === 'completed' ? new Date().toISOString().slice(0, 10) : undefined;
    return respond(submission);
  },
};

export const useHomework = (filter?: HomeworkFilter) =>
  useQuery({queryKey: ['homework', filter], queryFn: () => homeworkApi.list(filter)});

export const useHomeworkItem = (id: string) =>
  useQuery({queryKey: ['homework-item', id], queryFn: () => homeworkApi.getById(id), enabled: !!id});

export const useCreateHomework = (teacherName: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: HomeworkInput) => homeworkApi.create(input, teacherName),
    onSuccess: () => qc.invalidateQueries({queryKey: ['homework']}),
  });
};

export const useHomeworkSubmissions = (homeworkId: string) =>
  useQuery({
    queryKey: ['homework-submissions', homeworkId],
    queryFn: () => homeworkSubmissionsApi.forHomework(homeworkId),
    enabled: !!homeworkId,
  });

export const useUpdateHomeworkSubmission = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({id, status}: {id: string; status: HomeworkSubmission['status']}) =>
      homeworkSubmissionsApi.updateStatus(id, status),
    onSuccess: () => qc.invalidateQueries({queryKey: ['homework-submissions']}),
  });
};
