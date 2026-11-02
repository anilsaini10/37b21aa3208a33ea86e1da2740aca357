export type RecoveryRequestStatus = 'PENDING' | 'RESOLVED' | 'REJECTED';

export interface RecoveryRequestSubmitted {
  name: string;
  email: string | null;
  phones: string[];
}

export interface RecoveryRequestAccount {
  id: string;
  name: string;
  role: 'TEACHER' | 'PARENT';
  email: string | null;
  phone: string | null;
  username: string | null;
  isActive: boolean;
}

export interface RecoveryRequest {
  id: string;
  status: RecoveryRequestStatus;
  submitted: RecoveryRequestSubmitted;
  account: RecoveryRequestAccount;
  resolvedBy: {id: string; name: string} | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RecoveryRequestListResponse {
  items: RecoveryRequest[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  statusCounts: {PENDING: number; RESOLVED: number; REJECTED: number};
}

export interface RecoveryResetResponse extends RecoveryRequest {
  message: string;
  defaultPassword: string;
}
