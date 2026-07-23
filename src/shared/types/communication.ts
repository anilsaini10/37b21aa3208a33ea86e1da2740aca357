import type {ID} from './common';
import type {UserRole} from './user';

export interface Homework {
  id: ID;
  title: string;
  description: string;
  subjectId: ID;
  subjectName: string;
  classId: ID;
  className: string;
  sectionId: ID;
  assignedByTeacherId: ID;
  assignedByName: string;
  assignedDate: string;
  dueDate: string;
  status: 'pending' | 'submitted' | 'graded';
  attachmentUrl?: string;
}

export interface HomeworkSubmission {
  id: ID;
  homeworkId: ID;
  studentId: ID;
  studentName: string;
  rollNo: number;
  status: 'completed' | 'pending';
  completedAt?: string;
}

// ---- Teacher homework (real backend, /api/teacher/homework) ---------------

export type HomeworkType = 'ASSIGNMENT' | 'PROJECT' | 'READING' | 'PRACTICE' | 'OTHER';

/** Homework (real backend) — a teacher creates/manages via `/api/teacher/homework`. */
export interface TeacherHomework {
  id: ID;
  classId: ID;
  className: string;
  sectionId: ID;
  sectionName: string;
  subjectId: ID;
  subjectName: string;
  title: string;
  description: string | null;
  type: HomeworkType;
  dueDate: string;
  createdBy: {id: ID; name: string};
  createdAt: string;
  updatedAt: string;
}

// ---- Parent's child homework (real backend, /api/students/homework) -------
// Read-only — no submission/upload flow exists for parents, just visibility
// into what's assigned to the child's class + section.

export interface ParentHomeworkItem {
  id: ID;
  classId: ID;
  className: string;
  sectionId: ID;
  sectionName: string;
  subjectId: ID;
  subjectName: string;
  title: string;
  description: string | null;
  type: HomeworkType;
  dueDate: string;
  teacherName: string;
  createdAt: string;
  updatedAt: string;
}

export type AnnouncementAudience = 'ALL' | 'TEACHER' | 'PARENT';

/** Derived server-side from publishAt/expiresAt vs now — only ever present on admin GET responses. */
export type AnnouncementStatus = 'SCHEDULED' | 'ACTIVE' | 'EXPIRED';

/** Announcement (real backend) — admin manages via `/api/admin/announcements`; teacher/parent read via their own role-scoped feed endpoints. */
export interface AdminAnnouncement {
  id: ID;
  title: string;
  message: string;
  audience: AnnouncementAudience;
  /** Date this announcement is ABOUT (e.g. "Sports Day on Dec 25") — display only, doesn't affect visibility. */
  eventDate: string | null;
  /** Hidden from teacher/parent feeds until this moment; null = visible immediately. */
  publishAt: string | null;
  /** Disappears from teacher/parent feeds after this moment; null = never expires. */
  expiresAt: string | null;
  /** Admin-view only; absent on the teacher/parent feed (everything there is implicitly ACTIVE) and on create/update responses. */
  status?: AnnouncementStatus;
  createdBy: {id: ID; name: string};
  createdAt: string;
  updatedAt: string;
}

export interface SchoolEvent {
  id: ID;
  title: string;
  description: string;
  date: string;
  endDate?: string;
  location?: string;
  type: 'holiday' | 'exam' | 'function' | 'meeting' | 'sports';
}

export type EventType = 'HOLIDAY' | 'EXAM' | 'MEETING' | 'ACTIVITY' | 'OTHER';

/** School event (real backend) — admin manages via `/api/admin/events`. */
export interface AdminEvent {
  id: ID;
  title: string;
  description: string | null;
  eventType: EventType;
  audience: AnnouncementAudience;
  /** ISO date — single-day events have startDate === endDate. */
  startDate: string;
  endDate: string;
  createdBy: {id: ID; name: string};
  createdAt: string;
  updatedAt: string;
}

export interface ChatThread {
  id: ID;
  participantId: ID;
  participantName: string;
  participantRole: UserRole;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  avatarUrl?: string;
}

export interface ChatMessage {
  id: ID;
  threadId: ID;
  senderId: ID;
  text: string;
  sentAt: string;
  read: boolean;
}

export interface AppNotification {
  id: ID;
  title: string;
  body: string;
  type: 'fee' | 'attendance' | 'exam' | 'homework' | 'announcement' | 'general';
  createdAt: string;
  read: boolean;
}

