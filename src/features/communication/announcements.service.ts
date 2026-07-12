/**
 * Announcements service — real backend (Express + Prisma).
 *
 * Create/update/delete are admin-only (`/api/admin/announcements`). Reading the
 * feed is role-aware: admin/teacher/parent each hit a different, role-scoped
 * endpoint that's already filtered server-side to the audiences they're allowed
 * to see — the client never needs to filter by audience itself.
 */
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {axiosClient} from '../../core/api/axiosClient';
import {Endpoints} from '../../core/api/apiConfig';
import {rethrowApiError} from '../../core/api/apiError';
import type {AdminAnnouncement, AnnouncementAudience, Paginated, QueryParams, UserRole} from '../../shared/types';

export interface CreateAnnouncementInput {
  title: string;
  message: string;
  /** Defaults to 'ALL' server-side when omitted. */
  audience?: AnnouncementAudience;
  /** ISO date ("YYYY-MM-DD") — what the announcement is about, display only. */
  eventDate?: string;
  /** ISO datetime — hidden from teacher/parent feeds until this moment. */
  publishAt?: string;
  /** ISO datetime — disappears from teacher/parent feeds after this moment. */
  expiresAt?: string;
}

/**
 * Partial + the 3 date fields also accept an explicit `null` — omitting a key means
 * "don't touch it", while `null` means "clear it" (there's a real stored value to remove).
 */
export type UpdateAnnouncementInput = Partial<Omit<CreateAnnouncementInput, 'eventDate' | 'publishAt' | 'expiresAt'>> & {
  eventDate?: string | null;
  publishAt?: string | null;
  expiresAt?: string | null;
};

function feedEndpointForRole(role: UserRole): string {
  switch (role) {
    case 'teacher':
      return Endpoints.teacher.announcements;
    case 'parent':
      return Endpoints.students.announcements;
    case 'admin':
    default:
      return Endpoints.admin.announcements;
  }
}

export const announcementsApi = {
  /** Admin's own management list — supports the `audience` filter, unlike the read-only role feeds below. */
  list: async (params?: QueryParams): Promise<Paginated<AdminAnnouncement>> => {
    try {
      const {data} = await axiosClient.get<Paginated<AdminAnnouncement>>(Endpoints.admin.announcements, {params});
      return data;
    } catch (e) {
      console.error('announcementsApi.list failed', e);
      rethrowApiError(e, 'Failed to load announcements.');
    }
  },

  /** Role-scoped read-only feed — teacher/parent only ever see ALL + their own audience, filtered server-side. */
  feed: async (role: UserRole, params?: QueryParams): Promise<Paginated<AdminAnnouncement>> => {
    try {
      const {data} = await axiosClient.get<Paginated<AdminAnnouncement>>(feedEndpointForRole(role), {params});
      return data;
    } catch (e) {
      console.error('announcementsApi.feed failed', e);
      rethrowApiError(e, 'Failed to load announcements.');
    }
  },

  getById: async (id: string): Promise<AdminAnnouncement> => {
    try {
      const {data} = await axiosClient.get<AdminAnnouncement>(Endpoints.admin.announcements_byId(id));
      return data;
    } catch (e) {
      console.error('announcementsApi.getById failed', e);
      rethrowApiError(e, 'Failed to load announcement.');
    }
  },

  create: async (input: CreateAnnouncementInput): Promise<AdminAnnouncement> => {
    try {
      const {data} = await axiosClient.post<AdminAnnouncement>(Endpoints.admin.announcements, input);
      return data;
    } catch (e) {
      console.error('announcementsApi.create failed', e);
      rethrowApiError(e, 'Failed to create announcement.');
    }
  },

  update: async (id: string, input: UpdateAnnouncementInput): Promise<AdminAnnouncement> => {
    try {
      const {data} = await axiosClient.patch<AdminAnnouncement>(Endpoints.admin.announcements_byId(id), input);
      return data;
    } catch (e) {
      console.error('announcementsApi.update failed', e);
      rethrowApiError(e, 'Failed to update announcement.');
    }
  },

  remove: async (id: string): Promise<void> => {
    try {
      await axiosClient.delete(Endpoints.admin.announcements_byId(id));
    } catch (e) {
      console.error('announcementsApi.remove failed', e);
      rethrowApiError(e, 'Failed to delete announcement.');
    }
  },
};

export const useAdminAnnouncements = (params?: QueryParams) =>
  useQuery({queryKey: ['adminAnnouncements', params], queryFn: () => announcementsApi.list(params)});

/** Single hook for the common Announcements screen — one `useQuery` call regardless of role, so it never violates the rules of hooks. */
export const useAnnouncementsFeed = (role: UserRole, params?: QueryParams) =>
  useQuery({
    queryKey: ['announcementsFeed', role, params],
    queryFn: () => announcementsApi.feed(role, params),
    enabled: !!role,
  });

/** `initial` (e.g. the row already shown in the list) renders instantly while a fresh copy refetches in the background. */
export const useAdminAnnouncement = (id: string, initial?: AdminAnnouncement) =>
  useQuery({
    queryKey: ['adminAnnouncement', id],
    queryFn: () => announcementsApi.getById(id),
    enabled: !!id,
    initialData: initial,
  });

export const useCreateAnnouncement = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateAnnouncementInput) => announcementsApi.create(input),
    onSuccess: () => qc.invalidateQueries({queryKey: ['adminAnnouncements']}),
  });
};

export const useUpdateAnnouncement = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({id, input}: {id: string; input: UpdateAnnouncementInput}) => announcementsApi.update(id, input),
    onSuccess: (_data, {id}) => {
      qc.invalidateQueries({queryKey: ['adminAnnouncements']});
      qc.invalidateQueries({queryKey: ['adminAnnouncement', id]});
    },
  });
};

export const useDeleteAnnouncement = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => announcementsApi.remove(id),
    onSuccess: () => qc.invalidateQueries({queryKey: ['adminAnnouncements']}),
  });
};
