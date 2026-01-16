import type { ReactNode } from 'react';

export interface Client {
  lastName: ReactNode;
  firstName: ReactNode;
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  documentUrl?: string | null;
  createdAt?: string;
}
