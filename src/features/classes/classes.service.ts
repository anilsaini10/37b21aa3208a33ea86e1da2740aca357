/** Classes service — real backend (Express + Prisma), scoped server-side to the admin's school. */
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {axiosClient} from '../../core/api/axiosClient';
import {Endpoints} from '../../core/api/apiConfig';
import {rethrowApiError} from '../../core/api/apiError';
import type {ClassSubjectRef, SchoolClass, Section} from '../../shared/types';

export interface CreateClassSectionInput {
  name: string;
  capacity: number;
}

export interface CreateClassInput {
  name: string;
  numericLevel: number;
  sections: CreateClassSectionInput[];
}

/** Any subset of the class's editable fields — at least one required. */
export type UpdateClassInput = Partial<{name: string; numericLevel: number}>;

export interface UpdateSectionInput {
  name?: string;
  capacity?: number;
  /** `null` clears the Class Teacher; omit the key entirely to leave it unchanged. */
  classTeacherId?: string | null;
}

export const classesApi = {
  list: async (): Promise<SchoolClass[]> => {
    try {
      const {data} = await axiosClient.get<SchoolClass[]>(Endpoints.classes.list);
      return data;
    } catch (e) {
      rethrowApiError(e, 'Failed to load classes.');
    }
  },

  create: async (input: CreateClassInput): Promise<SchoolClass> => {
    try {
      const {data} = await axiosClient.post<SchoolClass>(Endpoints.classes.create, input);
      return data;
    } catch (e) {
      rethrowApiError(e, 'Failed to create class.');
    }
  },

  update: async (classId: string, input: UpdateClassInput): Promise<SchoolClass> => {
    try {
      const {data} = await axiosClient.patch<SchoolClass>(Endpoints.classes.byId(classId), input);
      return data;
    } catch (e) {
      console.error('classesApi.update failed', e);
      rethrowApiError(e, 'Failed to update class.');
    }
  },

  remove: async (classId: string): Promise<void> => {
    try {
      await axiosClient.delete(Endpoints.classes.byId(classId));
    } catch (e) {
      console.error('classesApi.remove failed', e);
      rethrowApiError(e, 'Failed to delete class.');
    }
  },

  addSection: async (classId: string, input: CreateClassSectionInput): Promise<Section> => {
    try {
      const {data} = await axiosClient.post<Section>(Endpoints.classes.addSection(classId), input);
      return data;
    } catch (e) {
      rethrowApiError(e, 'Failed to add section.');
    }
  },

  updateSection: async (classId: string, sectionId: string, input: UpdateSectionInput): Promise<Section> => {
    try {
      const {data} = await axiosClient.patch<Section>(Endpoints.classes.sectionById(classId, sectionId), input);
      return data;
    } catch (e) {
      console.error('classesApi.updateSection failed', e);
      rethrowApiError(e, 'Failed to update section.');
    }
  },

  removeSection: async (classId: string, sectionId: string): Promise<void> => {
    try {
      await axiosClient.delete(Endpoints.classes.sectionById(classId, sectionId));
    } catch (e) {
      console.error('classesApi.removeSection failed', e);
      rethrowApiError(e, 'Failed to delete section.');
    }
  },

  /** Idempotent — linking an already-linked subject is a no-op on the backend. */
  linkSubject: async (classId: string, subjectId: string): Promise<{classId: string; subjects: ClassSubjectRef[]}> => {
    try {
      const {data} = await axiosClient.post<{classId: string; subjects: ClassSubjectRef[]}>(
        Endpoints.classes.linkSubject(classId),
        {subjectId},
      );
      return data;
    } catch (e) {
      rethrowApiError(e, 'Failed to link subject to class.');
    }
  },
};

export const useClasses = () => useQuery({queryKey: ['classes'], queryFn: classesApi.list});

export const useCreateClass = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateClassInput) => classesApi.create(input),
    onSuccess: () => qc.invalidateQueries({queryKey: ['classes']}),
  });
};

export const useUpdateClass = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({classId, input}: {classId: string; input: UpdateClassInput}) => classesApi.update(classId, input),
    onSuccess: () => qc.invalidateQueries({queryKey: ['classes']}),
  });
};

export const useDeleteClass = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (classId: string) => classesApi.remove(classId),
    onSuccess: () => qc.invalidateQueries({queryKey: ['classes']}),
  });
};

export const useUpdateSection = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({classId, sectionId, input}: {classId: string; sectionId: string; input: UpdateSectionInput}) =>
      classesApi.updateSection(classId, sectionId, input),
    onSuccess: () => qc.invalidateQueries({queryKey: ['classes']}),
  });
};

export const useDeleteSection = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({classId, sectionId}: {classId: string; sectionId: string}) =>
      classesApi.removeSection(classId, sectionId),
    onSuccess: () => qc.invalidateQueries({queryKey: ['classes']}),
  });
};

export const useAddSection = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({classId, input}: {classId: string; input: CreateClassSectionInput}) =>
      classesApi.addSection(classId, input),
    onSuccess: () => qc.invalidateQueries({queryKey: ['classes']}),
  });
};

export const useLinkSubjectToClass = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({classId, subjectId}: {classId: string; subjectId: string}) =>
      classesApi.linkSubject(classId, subjectId),
    onSuccess: () => {
      qc.invalidateQueries({queryKey: ['classes']});
      qc.invalidateQueries({queryKey: ['subjects']});
    },
  });
};
