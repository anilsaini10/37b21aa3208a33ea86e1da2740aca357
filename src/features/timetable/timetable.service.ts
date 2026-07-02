/** Timetable service — generates a weekly timetable from the mock DB. */
import {useQuery} from '@tanstack/react-query';
import {db} from '../../core/mock/db';
import {respond} from '../../core/mock/mockApi';
import type {Timetable, TimetablePeriod, WeekDay} from '../../shared/types';

const DAYS: WeekDay[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const SLOTS = [
  {periodNo: 1, startTime: '09:00', endTime: '09:45'},
  {periodNo: 2, startTime: '09:45', endTime: '10:30'},
  {periodNo: 3, startTime: '11:00', endTime: '11:45'},
  {periodNo: 4, startTime: '11:45', endTime: '12:30'},
  {periodNo: 5, startTime: '13:15', endTime: '14:00'},
];

function buildTimetable(classId: string, sectionId: string): Timetable {
  const periods: TimetablePeriod[] = [];
  DAYS.forEach((day, dIdx) => {
    SLOTS.forEach((slot, sIdx) => {
      const subject = db.subjects[(dIdx + sIdx) % db.subjects.length];
      const teacher = db.teachers[(dIdx + sIdx) % db.teachers.length];
      periods.push({
        id: `tt_${classId}_${sectionId}_${day}_${slot.periodNo}`,
        day,
        periodNo: slot.periodNo,
        startTime: slot.startTime,
        endTime: slot.endTime,
        subjectId: subject.id,
        subjectName: subject.name,
        teacherId: teacher.id,
        teacherName: teacher.name,
        classId,
        sectionId,
        room: `R${101 + (sIdx % 6)}`,
      });
    });
  });
  return {classId, sectionId, periods};
}

export const timetableApi = {
  forClass: (classId: string, sectionId: string): Promise<Timetable> =>
    respond(buildTimetable(classId, sectionId)),
};

export const useTimetable = (classId: string, sectionId: string) =>
  useQuery({
    queryKey: ['timetable', classId, sectionId],
    queryFn: () => timetableApi.forClass(classId, sectionId),
    enabled: !!classId && !!sectionId,
  });

export {DAYS, SLOTS};
