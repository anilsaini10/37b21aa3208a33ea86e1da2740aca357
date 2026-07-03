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

export interface Announcement {
  id: ID;
  title: string;
  body: string;
  audience: UserRole[] | 'all';
  category: 'notice' | 'circular' | 'event' | 'urgent';
  publishedAt: string;
  publishedBy: string;
  pinned: boolean;
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

export interface LeaveApplication {
  id: ID;
  applicantId: ID;
  applicantName: string;
  applicantRole: UserRole;
  fromDate: string;
  toDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedAt: string;
}
