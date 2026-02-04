export interface Client {
  id: string;

  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  avatarUrl?: string;
  avatarThumbnailUrl?: string | null;
  isVip?: boolean;

  documents?: {
    id: string;
    name: string;
    url: string;
    uploadedAt: string;
  }[];

  createdAt?: string;
}
