/** Cross-cutting types used by API responses and lists. */

export type ID = string;

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface Paginated<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface QueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  [key: string]: string | number | undefined;
}

export type Status = 'active' | 'inactive' | 'pending' | 'archived';

export interface SelectOption {
  label: string;
  value: string;
}

export interface Money {
  amount: number;
  currency: 'INR' | 'USD';
}
