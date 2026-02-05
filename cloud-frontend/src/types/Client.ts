export interface Client {
  id: string;

  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  avatarUrl?: string;
  avatarThumbnailUrl?: string | null;
  aiDescription?: string;
  isVip?: boolean;
  isBlacklisted: boolean;

  documents?: {
    id: string;
    name: string;
    url: string;
    uploadedAt: string;
  }[];

  createdAt?: string;
}
