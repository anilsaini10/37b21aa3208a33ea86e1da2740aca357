/** Operations service — transport, library, inventory read APIs + hooks. */
import {useQuery} from '@tanstack/react-query';
import {db} from '../../core/mock/db';
import {respond} from '../../core/mock/mockApi';
import type {BusRoute, Book, BookIssue, InventoryItem} from '../../shared/types';

export const operationsApi = {
  busRoutes: (): Promise<BusRoute[]> => respond(db.busRoutes),
  books: (): Promise<Book[]> => respond(db.books),
  bookIssues: (): Promise<BookIssue[]> => respond(db.bookIssues),
  inventory: (): Promise<InventoryItem[]> => respond(db.inventory),
};

export const useBusRoutes = () => useQuery({queryKey: ['transport'], queryFn: operationsApi.busRoutes});
export const useBooks = () => useQuery({queryKey: ['library', 'books'], queryFn: operationsApi.books});
export const useBookIssues = () => useQuery({queryKey: ['library', 'issues'], queryFn: operationsApi.bookIssues});
export const useInventory = () => useQuery({queryKey: ['inventory'], queryFn: operationsApi.inventory});
