/**
 * Admin schedule service — real backend (Express + Prisma).
 *
 * One row = one period (or break) for a section, on a day of week. A section's
 * timetable and a teacher's personal schedule are both just filtered/grouped
 * views of this same data (endpoints 6/7 below).
 */
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {axiosClient} from '../../core/api/axiosClient';
import {Endpoints} from '../../core/api/apiConfig';
import {rethrowApiError} from '../../core/api/apiError';
import type {
  QueryParams,
  ScheduleDay,
  ScheduleEntry,
  ScheduleEntryType,
  SectionTimetable,
  TeacherTimetable,
} from '../../shared/types';

export interface CreateScheduleInput {
  classId: string;
  sectionId: string;
  day: ScheduleDay;
  type: ScheduleEntryType;
  periodNo: number;
  /** Required for CLASS_PERIOD, must be omitted for BREAK. */
  subjectId?: string;
  teacherId?: string;
  roomNo?: string;
  /** Required for BREAK, must be omitted for CLASS_PERIOD. */
  title?: string;
  startTime: string;
  endTime: string;
}

/** classId/sectionId/type are immutable — delete + recreate instead of trying to change them. */
export type UpdateScheduleInput = Partial<{
  day: ScheduleDay;
  periodNo: number;
  subjectId: string;
  teacherId: string;
  roomNo: string;
  title: string;
  startTime: string;
  endTime: string;
}>;

export const adminScheduleApi = {
  list: async (params?: QueryParams): Promise<ScheduleEntry[]> => {
    try {
      const {data} = await axiosClient.get<ScheduleEntry[]>(Endpoints.admin.schedule, {params});
      return data;
    } catch (e) {
      console.error('adminScheduleApi.list failed', e);
      rethrowApiError(e, 'Failed to load schedule.');
    }
  },

  getById: async (scheduleId: string): Promise<ScheduleEntry> => {
    try {
      const {data} = await axiosClient.get<ScheduleEntry>(Endpoints.admin.schedule_byId(scheduleId));
      return data;
    } catch (e) {
      console.error('adminScheduleApi.getById failed', e);
      rethrowApiError(e, 'Failed to load schedule entry.');
    }
  },

  create: async (input: CreateScheduleInput): Promise<ScheduleEntry> => {
    try {
      const {data} = await axiosClient.post<ScheduleEntry>(Endpoints.admin.schedule, input);
      return data;
    } catch (e) {
      console.error('adminScheduleApi.create failed', e);
      rethrowApiError(e, 'Failed to create schedule entry.');
    }
  },

  update: async (scheduleId: string, input: UpdateScheduleInput): Promise<ScheduleEntry> => {
    try {
      const {data} = await axiosClient.patch<ScheduleEntry>(Endpoints.admin.schedule_byId(scheduleId), input);
      return data;
    } catch (e) {
      console.error('adminScheduleApi.update failed', e);
      rethrowApiError(e, 'Failed to update schedule entry.');
    }
  },

  remove: async (scheduleId: string): Promise<void> => {
    try {
      await axiosClient.delete(Endpoints.admin.schedule_byId(scheduleId));
    } catch (e) {
      console.error('adminScheduleApi.remove failed', e);
      rethrowApiError(e, 'Failed to delete schedule entry.');
    }
  },

  sectionTimetable: async (sectionId: string): Promise<SectionTimetable> => {
    try {
      const {data} = await axiosClient.get<SectionTimetable>(Endpoints.admin.schedule_bySection(sectionId));
      return data;
    } catch (e) {
      console.error('adminScheduleApi.sectionTimetable failed', e);
      rethrowApiError(e, 'Failed to load class timetable.');
    }
  },

  teacherTimetable: async (teacherId: string): Promise<TeacherTimetable> => {
    try {
      const {data} = await axiosClient.get<TeacherTimetable>(Endpoints.admin.schedule_byTeacher(teacherId));
      return data;
    } catch (e) {
      console.error('adminScheduleApi.teacherTimetable failed', e);
      rethrowApiError(e, 'Failed to load teacher schedule.');
    }
  },
};

/** Full, unfiltered schedule for the school — small/bounded per school, so client-side filtering on top is cheap. */
export const useSchedules = () =>
  useQuery({
    queryKey: ['schedules'],
    queryFn: () => adminScheduleApi.list(),
  });

export const useSectionTimetable = (sectionId: string) =>
  useQuery({
    queryKey: ['sectionTimetable', sectionId],
    queryFn: () => adminScheduleApi.sectionTimetable(sectionId),
    enabled: !!sectionId,
  });

export const useTeacherTimetable = (teacherId: string) =>
  useQuery({
    queryKey: ['teacherTimetable', teacherId],
    queryFn: () => adminScheduleApi.teacherTimetable(teacherId),
    enabled: !!teacherId,
  });

/** `initial` (e.g. the row already tapped in the timetable) renders instantly while a fresh copy refetches in the background. */
export const useScheduleEntry = (scheduleId: string, initial?: ScheduleEntry) =>
  useQuery({
    queryKey: ['scheduleEntry', scheduleId],
    queryFn: () => adminScheduleApi.getById(scheduleId),
    enabled: !!scheduleId,
    initialData: initial,
  });

/** Schedule data is small/bounded per school — invalidating broadly on any mutation is cheap and always correct. */
function invalidateSchedule(qc: ReturnType<typeof useQueryClient>): void {
  qc.invalidateQueries({queryKey: ['schedules']});
  qc.invalidateQueries({queryKey: ['sectionTimetable']});
  qc.invalidateQueries({queryKey: ['teacherTimetable']});
}

export const useCreateSchedule = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateScheduleInput) => adminScheduleApi.create(input),
    onSuccess: () => invalidateSchedule(qc),
  });
};

export const useUpdateSchedule = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({scheduleId, input}: {scheduleId: string; input: UpdateScheduleInput}) =>
      adminScheduleApi.update(scheduleId, input),
    onSuccess: (_data, {scheduleId}) => {
      qc.invalidateQueries({queryKey: ['scheduleEntry', scheduleId]});
      invalidateSchedule(qc);
    },
  });
};

export const useDeleteSchedule = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (scheduleId: string) => adminScheduleApi.remove(scheduleId),
    onSuccess: () => invalidateSchedule(qc),
  });
};
