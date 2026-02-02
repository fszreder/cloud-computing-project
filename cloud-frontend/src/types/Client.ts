export interface Client {
  id: string;

  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  avatarUrl?: string;

  documents?: {
    id: string;
    name: string;
    url: string;
    uploadedAt: string;
  }[];

  createdAt?: string;
}
