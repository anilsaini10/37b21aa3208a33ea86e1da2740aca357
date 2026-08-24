/**
 * Communication service — events, chat + hooks.
 *
 * Announcements moved to `announcements.service.ts` and notifications moved to
 * `notifications.service.ts` (both real backend) — this file no longer mocks them.
 */
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {db} from '../../core/mock/db';
import {respond} from '../../core/mock/mockApi';
import {generateId} from '../../core/utils/misc';
import type {ChatMessage, ChatThread, SchoolEvent} from '../../shared/types';

// In-memory chat messages keyed by thread.
const chatMessages: Record<string, ChatMessage[]> = {
  ct_1: [
    {id: 'm1', threadId: 'ct_1', senderId: 'other', text: 'Hello, please check the homework submission.', sentAt: '2026-06-30T09:00:00Z', read: true},
    {id: 'm2', threadId: 'ct_1', senderId: 'me', text: 'Sure, I will review it today.', sentAt: '2026-06-30T09:05:00Z', read: true},
  ],
};

export const communicationApi = {
  events: (): Promise<SchoolEvent[]> => respond(db.events),

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

export const useEvents = () => useQuery({queryKey: ['events'], queryFn: communicationApi.events});

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
