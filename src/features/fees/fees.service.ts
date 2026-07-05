/** Fees service — invoices, collection summary, payments + hooks. */
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {db} from '../../core/mock/db';
import {respond, paginateList} from '../../core/mock/mockApi';
import {generateId} from '../../core/utils/misc';
import {sumBy} from '../../core/utils/misc';
import type {
  FeeCollectionSummary,
  FeeInvoice,
  FeePayment,
  Paginated,
  QueryParams,
} from '../../shared/types';

export const feesApi = {
  list: (params?: QueryParams): Promise<Paginated<FeeInvoice>> => {
    let items = db.feeInvoices;
    if (params?.classId) {
      // FeeInvoice only carries `className`, not `classId`/`sectionId` — join
      // through the student record to filter by class/section reliably.
      const studentIds = new Set(
        db.students
          .filter(s => s.classId === params.classId && (!params.sectionId || s.sectionId === params.sectionId))
          .map(s => s.id),
      );
      items = items.filter(i => studentIds.has(i.studentId));
    }
    return respond(paginateList(items, params, ['studentName', 'className', 'status']));
  },

  getByStudent: (studentId: string): Promise<FeeInvoice | undefined> =>
    respond(db.feeInvoices.find(i => i.studentId === studentId)),

  summary: (): Promise<FeeCollectionSummary> => {
    const expected = sumBy(db.feeInvoices, i => i.totalAmount);
    const collected = sumBy(db.feeInvoices, i => i.paidAmount);
    const pending = sumBy(db.feeInvoices, i => i.dueAmount);
    return respond({
      totalExpected: expected,
      totalCollected: collected,
      totalPending: pending,
      collectionRate: Math.round((collected / Math.max(1, expected)) * 100),
      monthly: [
        {month: 'Feb', collected: 420000, expected: 500000},
        {month: 'Mar', collected: 510000, expected: 550000},
        {month: 'Apr', collected: 480000, expected: 520000},
        {month: 'May', collected: 600000, expected: 620000},
        {month: 'Jun', collected: collected, expected: expected},
      ],
    });
  },

  pay: ({invoiceId, amount, method}: {invoiceId: string; amount: number; method: FeePayment['method']}): Promise<FeePayment> => {
    const invoice = db.feeInvoices.find(i => i.id === invoiceId);
    if (!invoice) {
      return Promise.reject(new Error('Invoice not found'));
    }
    const applied = Math.min(amount, invoice.dueAmount);
    invoice.paidAmount += applied;
    invoice.dueAmount -= applied;
    invoice.status = invoice.dueAmount === 0 ? 'paid' : 'partial';
    const payment: FeePayment = {
      id: generateId('pay'),
      invoiceId,
      studentId: invoice.studentId,
      amount: applied,
      method,
      paidAt: new Date().toISOString(),
      receiptNo: `RCP${9000 + db.feePayments.length}`,
      transactionId: generateId('txn'),
    };
    db.feePayments.unshift(payment);
    return respond(payment);
  },
};

export const useFees = (params?: QueryParams) =>
  useQuery({queryKey: ['fees', params], queryFn: () => feesApi.list(params)});

export const useFeeSummary = () =>
  useQuery({queryKey: ['fees', 'summary'], queryFn: feesApi.summary});

export const useStudentFee = (studentId: string) =>
  useQuery({queryKey: ['fees', 'student', studentId], queryFn: () => feesApi.getByStudent(studentId), enabled: !!studentId});

export const usePayFee = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: feesApi.pay,
    onSuccess: () => qc.invalidateQueries({queryKey: ['fees']}),
  });
};
