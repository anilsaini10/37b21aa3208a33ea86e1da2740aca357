/** Admin timetable service (mock) — create/edit/delete a class's periods (including breaks). */
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {db} from '../../core/mock/db';
import {respond} from '../../core/mock/mockApi';
import {generateId} from '../../core/utils/misc';
import type {PeriodType, TimetablePeriod, WeekDay} from '../../shared/types';

export interface PeriodInput {
  classId: string;
  sectionId: string;
  day: WeekDay;
  periodNo: number;
  startTime: string;
  endTime: string;
  type: PeriodType;
  /** Required when type is 'class'. */
  subjectId?: string;
  teacherId?: string;
  room?: string;
  /** Required when type is 'break'. */
  label?: string;
}

function buildPeriod(id: string, input: PeriodInput): TimetablePeriod {
  const base = {
    id,
    day: input.day,
    periodNo: input.periodNo,
    startTime: input.startTime,
    endTime: input.endTime,
    classId: input.classId,
    sectionId: input.sectionId,
  };
  if (input.type === 'break') {
    return {...base, type: 'break', label: input.label ?? 'Break'};
  }
  const subject = db.subjects.find(s => s.id === input.subjectId);
  const teacher = db.teachers.find(t => t.id === input.teacherId);
  return {
    ...base,
    type: 'class',
    subjectId: subject?.id,
    subjectName: subject?.name,
    teacherId: teacher?.id,
    teacherName: teacher?.name,
    room: input.room,
  };
}

export const adminTimetableApi = {
  list: (classId: string, sectionId: string): Promise<TimetablePeriod[]> =>
    respond(
      db.timetablePeriods
        .filter(p => p.classId === classId && p.sectionId === sectionId)
        .sort((a, b) => a.startTime.localeCompare(b.startTime)),
    ),

  create: (input: PeriodInput): Promise<TimetablePeriod> => {
    const period = buildPeriod(generateId('tt'), input);
    db.timetablePeriods.push(period);
    return respond(period);
  },

  update: (id: string, input: PeriodInput): Promise<TimetablePeriod> => {
    const index = db.timetablePeriods.findIndex(p => p.id === id);
    if (index === -1) {
      return Promise.reject(new Error('Period not found'));
    }
    const period = buildPeriod(id, input);
    db.timetablePeriods[index] = period;
    return respond(period);
  },

  remove: (id: string): Promise<void> => {
    const index = db.timetablePeriods.findIndex(p => p.id === id);
    if (index !== -1) {
      db.timetablePeriods.splice(index, 1);
    }
    return respond(undefined);
  },
};

export const useAdminTimetable = (classId: string, sectionId: string) =>
  useQuery({
    queryKey: ['adminTimetable', classId, sectionId],
    queryFn: () => adminTimetableApi.list(classId, sectionId),
    enabled: !!classId && !!sectionId,
  });

function invalidateBoth(qc: ReturnType<typeof useQueryClient>, classId: string, sectionId: string): void {
  qc.invalidateQueries({queryKey: ['adminTimetable', classId, sectionId]});
  qc.invalidateQueries({queryKey: ['timetable', classId, sectionId]});
}

export const useCreatePeriod = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: PeriodInput) => adminTimetableApi.create(input),
    onSuccess: (_data, input) => invalidateBoth(qc, input.classId, input.sectionId),
  });
};

export const useUpdatePeriod = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({id, input}: {id: string; input: PeriodInput}) => adminTimetableApi.update(id, input),
    onSuccess: (_data, {input}) => invalidateBoth(qc, input.classId, input.sectionId),
  });
};

export const useDeletePeriod = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({id}: {id: string; classId: string; sectionId: string}) => adminTimetableApi.remove(id),
    onSuccess: (_data, {classId, sectionId}) => invalidateBoth(qc, classId, sectionId),
  });
};
