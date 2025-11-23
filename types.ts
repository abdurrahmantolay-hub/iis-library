
export enum UserRole {
  Librarian = 'Librarian',
  Student = 'Student',
}

export enum BookStatus {
  Available = 'Available',
  OnLoan = 'On Loan',
  Reserved = 'Reserved',
}

export interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  pageCount: number;
  status: BookStatus;
  description?: string; // New field for summary
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface NewsArticle {
  id: string;
  title: string;
  excerpt: string;
  imageUrl: string;
  date: string;
}

export interface BorrowRequest {
  id: string;
  bookId: string;
  bookTitle: string;
  studentName: string;
  studentId: string;
  dateRequested: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}
