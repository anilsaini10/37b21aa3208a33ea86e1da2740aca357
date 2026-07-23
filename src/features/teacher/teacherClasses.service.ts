/** Teacher's own classes service — real backend (Express + Prisma). Scopes class/section/subject pickers to what this teacher actually teaches or is Class Teacher of. */
import {useQuery} from '@tanstack/react-query';
import {axiosClient} from '../../core/api/axiosClient';
import {Endpoints} from '../../core/api/apiConfig';
import {rethrowApiError} from '../../core/api/apiError';
import type {TeacherClassSummary} from '../../shared/types';

/** Raw shape the real backend responds with — flattened `id`/`name`, not the app's `classId`/`className` naming. */
interface TeacherClassSectionApi {
  id: string;
  name: string;
  classId: string;
  classTeacherId: string | null;
  classTeacherName: string | null;
  capacity: number;
  studentCount: number;
}

interface TeacherClassSubjectApi {
  subjectId: string;
  name: string;
}

interface TeacherClassSummaryApi {
  id: string;
  name: string;
  numericLevel: number;
  totalStudents: number;
  sections: TeacherClassSectionApi[];
  mySubjects: TeacherClassSubjectApi[];
}

function toTeacherClassSummary(raw: TeacherClassSummaryApi): TeacherClassSummary {
  return {
    classId: raw.id,
    className: raw.name,
    numericLevel: raw.numericLevel,
    totalStudents: raw.totalStudents,
    sections: raw.sections.map(s => ({
      sectionId: s.id,
      sectionName: s.name,
      classTeacherId: s.classTeacherId,
      classTeacherName: s.classTeacherName,
      capacity: s.capacity,
      studentCount: s.studentCount,
    })),
    mySubjects: raw.mySubjects.map(s => ({subjectId: s.subjectId, subjectName: s.name})),
  };
}

export const teacherClassesApi = {
  list: async (): Promise<TeacherClassSummary[]> => {
    try {
      const {data} = await axiosClient.get<TeacherClassSummaryApi[]>(Endpoints.teacher.classes);
      return data.map(toTeacherClassSummary);
    } catch (e) {
      console.error('teacherClassesApi.list failed', e);
      rethrowApiError(e, 'Failed to load your classes.');
    }
  },
};

export const useTeacherClasses = () =>
  useQuery({queryKey: ['teacherClasses'], queryFn: teacherClassesApi.list});
