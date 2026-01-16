export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  documentUrl?: string | null;
  createdAt?: string;
}
