/** Communication service — announcements, events, notifications, chat + hooks. */
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {db} from '../../core/mock/db';
import {respond} from '../../core/mock/mockApi';
import {generateId} from '../../core/utils/misc';
import type {
  Announcement,
  AppNotification,
  ChatMessage,
  ChatThread,
  SchoolEvent,
  UserRole,
} from '../../shared/types';

// In-memory chat messages keyed by thread.
const chatMessages: Record<string, ChatMessage[]> = {
  ct_1: [
    {id: 'm1', threadId: 'ct_1', senderId: 'other', text: 'Hello, please check the homework submission.', sentAt: '2026-06-30T09:00:00Z', read: true},
    {id: 'm2', threadId: 'ct_1', senderId: 'me', text: 'Sure, I will review it today.', sentAt: '2026-06-30T09:05:00Z', read: true},
  ],
};

export const communicationApi = {
  announcements: (role?: UserRole): Promise<Announcement[]> => {
    const list = role
      ? db.announcements.filter(a => a.audience === 'all' || a.audience.includes(role))
      : db.announcements;
    return respond([...list].sort((a, b) => Number(b.pinned) - Number(a.pinned)));
  },

  createAnnouncement: (input: {title: string; body: string; category: Announcement['category']; audience: Announcement['audience']}): Promise<Announcement> => {
    const announcement: Announcement = {
      id: generateId('an'),
      title: input.title,
      body: input.body,
      audience: input.audience,
      category: input.category,
      publishedAt: new Date().toISOString(),
      publishedBy: 'You',
      pinned: false,
    };
    db.announcements.unshift(announcement);
    return respond(announcement);
  },

  events: (): Promise<SchoolEvent[]> => respond(db.events),

  notifications: (): Promise<AppNotification[]> => respond(db.notifications),

  markNotificationRead: (id: string): Promise<void> => {
    const n = db.notifications.find(x => x.id === id);
    if (n) {
      n.read = true;
    }
    return respond(undefined);
  },

  chatThreads: (): Promise<ChatThread[]> => respond(db.chatThreads),

  chatMessages: (threadId: string): Promise<ChatMessage[]> =>
    respond(chatMessages[threadId] ?? []),

  sendMessage: (threadId: string, text: string): Promise<ChatMessage> => {
    const message: ChatMessage = {
      id: generateId('msg'),
      threadId,
      senderId: 'me',
      text,
      sentAt: new Date().toISOString(),
      read: true,
    };
    (chatMessages[threadId] ??= []).push(message);
    return respond(message);
  },
};

export const useAnnouncements = (role?: UserRole) =>
  useQuery({queryKey: ['announcements', role], queryFn: () => communicationApi.announcements(role)});

export const useEvents = () => useQuery({queryKey: ['events'], queryFn: communicationApi.events});

export const useNotifications = () =>
  useQuery({queryKey: ['notifications'], queryFn: communicationApi.notifications});

export const useMarkNotificationRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: communicationApi.markNotificationRead,
    onSuccess: () => qc.invalidateQueries({queryKey: ['notifications']}),
  });
};

export const useChatThreads = () =>
  useQuery({queryKey: ['chat', 'threads'], queryFn: communicationApi.chatThreads});

export const useChatMessages = (threadId: string) =>
  useQuery({queryKey: ['chat', 'messages', threadId], queryFn: () => communicationApi.chatMessages(threadId), enabled: !!threadId});

export const useSendMessage = (threadId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (text: string) => communicationApi.sendMessage(threadId, text),
    onSuccess: () => qc.invalidateQueries({queryKey: ['chat', 'messages', threadId]}),
  });
};
