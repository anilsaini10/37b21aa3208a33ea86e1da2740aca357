/**
 * Non-teaching staff directory — real backend (Express + Prisma), admin-only.
 *
 * A plain HR record, not an account — no login/password, so this is a much
 * simpler CRUD than `teachers.service.ts` (no default password, no subject
 * assignment).
 */
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {axiosClient} from '../../core/api/axiosClient';
import {Endpoints} from '../../core/api/apiConfig';
import {rethrowApiError} from '../../core/api/apiError';
import type {Paginated, QueryParams, Staff, Status} from '../../shared/types';

export interface StaffInput {
  name: string;
  /** Optional — many support staff won't have one. */
  email?: string;
  phone: string;
  gender: Staff['gender'];
  designation: string;
  salary: number;
  qualification: string;
  experienceYears: number;
  experienceMonths: number;
  joiningDate: string;
}

export type UpdateStaffInput = Partial<StaffInput> & {status?: Extract<Status, 'active' | 'inactive'>};

export interface StaffFilters extends QueryParams {
  designation?: string;
  status?: Extract<Status, 'active' | 'inactive'>;
}

/** Raw shape the real backend responds with — gender/status come back upper-case, email nullable. */
interface StaffApi {
  id: string;
  employeeId: string;
  name: string;
  email: string | null;
  phone: string;
  gender: string;
  designation: string;
  salary: number;
  qualification: string;
  experienceYears: number;
  experienceMonths: number;
  joiningDate: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

function toStaff(raw: StaffApi): Staff {
  return {
    id: raw.id,
    employeeId: raw.employeeId,
    name: raw.name,
    email: raw.email ?? undefined,
    phone: raw.phone,
    gender: raw.gender.toLowerCase() as Staff['gender'],
    designation: raw.designation,
    salary: raw.salary,
    qualification: raw.qualification,
    experienceYears: raw.experienceYears,
    experienceMonths: raw.experienceMonths,
    joiningDate: raw.joiningDate,
    status: raw.status.toLowerCase() as Status,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

export const adminStaffApi = {
  list: async (filters?: StaffFilters): Promise<Paginated<Staff>> => {
    try {
      const params = filters?.status ? {...filters, status: filters.status.toUpperCase()} : filters;
      const {data} = await axiosClient.get<Paginated<StaffApi>>(Endpoints.admin.staff, {params});
      return {...data, items: data.items.map(toStaff)};
    } catch (e) {
      console.error('adminStaffApi.list failed', e);
      rethrowApiError(e, 'Failed to load staff.');
    }
  },

  getById: async (staffId: string): Promise<Staff> => {
    try {
      const {data} = await axiosClient.get<StaffApi>(Endpoints.admin.staff_byId(staffId));
      return toStaff(data);
    } catch (e) {
      console.error('adminStaffApi.getById failed', e);
      rethrowApiError(e, 'Failed to load staff member.');
    }
  },

  create: async (input: StaffInput): Promise<Staff> => {
    try {
      const {data} = await axiosClient.post<StaffApi>(Endpoints.admin.staff, {
        ...input,
        gender: input.gender.toUpperCase(),
      });
      return toStaff(data);
    } catch (e) {
      console.error('adminStaffApi.create failed', e);
      rethrowApiError(e, 'Failed to add staff member.');
    }
  },

  update: async (staffId: string, input: UpdateStaffInput): Promise<Staff> => {
    try {
      const body: Record<string, unknown> = {...input};
      if (input.gender) {
        body.gender = input.gender.toUpperCase();
      }
      if (input.status) {
        body.status = input.status.toUpperCase();
      }
      const {data} = await axiosClient.patch<StaffApi>(Endpoints.admin.staff_byId(staffId), body);
      return toStaff(data);
    } catch (e) {
      console.error('adminStaffApi.update failed', e);
      rethrowApiError(e, 'Failed to update staff member.');
    }
  },

  remove: async (staffId: string): Promise<void> => {
    try {
      await axiosClient.delete(Endpoints.admin.staff_byId(staffId));
    } catch (e) {
      console.error('adminStaffApi.remove failed', e);
      rethrowApiError(e, 'Failed to delete staff member.');
    }
  },
};

export const useStaffList = (filters?: StaffFilters) =>
  useQuery({queryKey: ['staff', filters], queryFn: () => adminStaffApi.list(filters)});

/** `initial` (e.g. the row already shown in the list) renders instantly while a fresh copy refetches in the background. */
export const useStaffMember = (staffId: string, initial?: Staff) =>
  useQuery({
    queryKey: ['staff-member', staffId],
    queryFn: () => adminStaffApi.getById(staffId),
    enabled: !!staffId,
    initialData: initial,
  });

export const useCreateStaff = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: StaffInput) => adminStaffApi.create(input),
    onSuccess: () => qc.invalidateQueries({queryKey: ['staff']}),
  });
};

export const useUpdateStaff = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({staffId, input}: {staffId: string; input: UpdateStaffInput}) => adminStaffApi.update(staffId, input),
    onSuccess: (updated, {staffId}) => {
      qc.setQueryData(['staff-member', staffId], updated);
      qc.invalidateQueries({queryKey: ['staff']});
    },
  });
};

export const useDeleteStaff = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (staffId: string) => adminStaffApi.remove(staffId),
    onSuccess: () => qc.invalidateQueries({queryKey: ['staff']}),
  });
};
