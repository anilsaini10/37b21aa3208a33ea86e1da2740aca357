import type {ID} from './common';

export type FeeStatus = 'paid' | 'pending' | 'partial' | 'overdue';

export interface FeeCategory {
  id: ID;
  name: string;
  amount: number;
  recurring: boolean;
}

export interface FeeStructure {
  id: ID;
  classId: ID;
  className: string;
  categories: FeeCategory[];
  totalAmount: number;
  academicYear: string;
}

export interface FeeInvoice {
  id: ID;
  studentId: ID;
  studentName: string;
  className: string;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  status: FeeStatus;
  dueDate: string;
  categories: FeeCategory[];
}

export interface FeePayment {
  id: ID;
  invoiceId: ID;
  studentId: ID;
  amount: number;
  method: 'cash' | 'card' | 'upi' | 'netbanking' | 'cheque';
  paidAt: string;
  receiptNo: string;
  transactionId?: string;
}

export interface FeeCollectionSummary {
  totalExpected: number;
  totalCollected: number;
  totalPending: number;
  collectionRate: number;
  monthly: {month: string; collected: number; expected: number}[];
}
