/**
 * Events service — real backend (Express + Prisma). Create/update/delete are
 * admin-only (`/api/admin/events`). Reading the feed is role-aware: admin/
 * teacher/parent each hit a different, role-scoped endpoint that's already
 * filtered server-side by audience (teacher only ever sees ALL/TEACHER
 * events, parent only ALL/PARENT) — the client never filters by audience itself.
 */
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {axiosClient} from '../../core/api/axiosClient';
import {Endpoints} from '../../core/api/apiConfig';
import {rethrowApiError} from '../../core/api/apiError';
import type {AdminEvent, AnnouncementAudience, EventType, Paginated, QueryParams, UserRole} from '../../shared/types';

function feedEndpointForRole(role: UserRole): string {
  switch (role) {
    case 'teacher':
      return Endpoints.teacher.events;
    case 'parent':
      return Endpoints.students.events;
    case 'admin':
    default:
      return Endpoints.admin.events;
  }
}

export interface CreateEventInput {
  title: string;
  description?: string;
  eventType: EventType;
  /** Defaults to 'ALL' server-side when omitted. */
  audience?: AnnouncementAudience;
  /** ISO date ("YYYY-MM-DD"). */
  startDate: string;
  /** ISO date — defaults to startDate server-side when omitted. */
  endDate?: string;
}

/** Any subset of the create fields — at least one required. */
export type UpdateEventInput = Partial<CreateEventInput>;

export const eventsApi = {
  /** Admin's own management list — same endpoint create/update/delete act on. */
  list: async (params?: QueryParams): Promise<Paginated<AdminEvent>> => {
    try {
      const {data} = await axiosClient.get<Paginated<AdminEvent>>(Endpoints.admin.events, {params});
      return data;
    } catch (e) {
      console.error('eventsApi.list failed', e);
      rethrowApiError(e, 'Failed to load events.');
    }
  },

  /** Role-scoped read-only feed — teacher/parent only ever see ALL + their own audience, filtered server-side. */
  feed: async (role: UserRole, params?: QueryParams): Promise<Paginated<AdminEvent>> => {
    try {
      const {data} = await axiosClient.get<Paginated<AdminEvent>>(feedEndpointForRole(role), {params});
      return data;
    } catch (e) {
      console.error('eventsApi.feed failed', e);
      rethrowApiError(e, 'Failed to load events.');
    }
  },

  getById: async (id: string): Promise<AdminEvent> => {
    try {
      const {data} = await axiosClient.get<AdminEvent>(Endpoints.admin.events_byId(id));
      return data;
    } catch (e) {
      console.error('eventsApi.getById failed', e);
      rethrowApiError(e, 'Failed to load event.');
    }
  },

  create: async (input: CreateEventInput): Promise<AdminEvent> => {
    try {
      const {data} = await axiosClient.post<AdminEvent>(Endpoints.admin.events, input);
      return data;
    } catch (e) {
      console.error('eventsApi.create failed', e);
      rethrowApiError(e, 'Failed to create event.');
    }
  },

  update: async (id: string, input: UpdateEventInput): Promise<AdminEvent> => {
    try {
      const {data} = await axiosClient.patch<AdminEvent>(Endpoints.admin.events_byId(id), input);
      return data;
    } catch (e) {
      console.error('eventsApi.update failed', e);
      rethrowApiError(e, 'Failed to update event.');
    }
  },

  remove: async (id: string): Promise<void> => {
    try {
      await axiosClient.delete(Endpoints.admin.events_byId(id));
    } catch (e) {
      console.error('eventsApi.remove failed', e);
      rethrowApiError(e, 'Failed to delete event.');
    }
  },
};

export const useAdminEvents = (params?: QueryParams) =>
  useQuery({queryKey: ['adminEvents', params], queryFn: () => eventsApi.list(params)});

/** Single hook for the common Events screen — one `useQuery` call regardless of role, so it never violates the rules of hooks. */
export const useEventsFeed = (role: UserRole, params?: QueryParams) =>
  useQuery({
    queryKey: ['eventsFeed', role, params],
    queryFn: () => eventsApi.feed(role, params),
    enabled: !!role,
  });

/** `initial` (e.g. the row already shown in the list) renders instantly while a fresh copy refetches in the background. */
export const useAdminEvent = (id: string, initial?: AdminEvent) =>
  useQuery({
    queryKey: ['adminEvent', id],
    queryFn: () => eventsApi.getById(id),
    enabled: !!id,
    initialData: initial,
  });

export const useCreateEvent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateEventInput) => eventsApi.create(input),
    onSuccess: () => qc.invalidateQueries({queryKey: ['adminEvents']}),
  });
};

export const useUpdateEvent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({id, input}: {id: string; input: UpdateEventInput}) => eventsApi.update(id, input),
    onSuccess: (_data, {id}) => {
      qc.invalidateQueries({queryKey: ['adminEvents']});
      qc.invalidateQueries({queryKey: ['adminEvent', id]});
    },
  });
};

export const useDeleteEvent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => eventsApi.remove(id),
    onSuccess: () => qc.invalidateQueries({queryKey: ['adminEvents']}),
  });
};
