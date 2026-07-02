import type {ID} from './common';

export interface BusRoute {
  id: ID;
  routeName: string;
  busNumber: string;
  driverName: string;
  driverPhone: string;
  stops: string[];
  studentCount: number;
  capacity: number;
}

export interface TransportAssignment {
  id: ID;
  studentId: ID;
  studentName: string;
  routeId: ID;
  routeName: string;
  pickupStop: string;
  dropStop: string;
}

export interface Book {
  id: ID;
  title: string;
  author: string;
  isbn: string;
  category: string;
  totalCopies: number;
  availableCopies: number;
}

export interface BookIssue {
  id: ID;
  bookId: ID;
  bookTitle: string;
  memberName: string;
  issuedAt: string;
  dueDate: string;
  returnedAt?: string;
  fine: number;
  status: 'issued' | 'returned' | 'overdue';
}

export interface InventoryItem {
  id: ID;
  name: string;
  category: 'furniture' | 'electronics' | 'sports' | 'lab' | 'stationery';
  quantity: number;
  condition: 'good' | 'needs_repair' | 'damaged';
  location: string;
  purchaseDate: string;
  value: number;
}
