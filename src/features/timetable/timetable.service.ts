/** Timetable service (read) — weekly timetable for a class+section, sourced from the mock DB's mutable period store. */
import {useQuery} from '@tanstack/react-query';
import {db} from '../../core/mock/db';
import {respond} from '../../core/mock/mockApi';
import type {Timetable, WeekDay} from '../../shared/types';

const DAYS: WeekDay[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

export const timetableApi = {
  forClass: (classId: string, sectionId: string): Promise<Timetable> => {
    const periods = db.timetablePeriods
      .filter(p => p.classId === classId && p.sectionId === sectionId)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
    return respond({classId, sectionId, periods});
  },
};

export const useTimetable = (classId: string, sectionId: string) =>
  useQuery({
    queryKey: ['timetable', classId, sectionId],
    queryFn: () => timetableApi.forClass(classId, sectionId),
    enabled: !!classId && !!sectionId,
  });

export {DAYS};
