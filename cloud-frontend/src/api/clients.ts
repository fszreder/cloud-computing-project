/* eslint-disable @typescript-eslint/no-explicit-any */
import { type Client } from '../types/Client';

const isDevelopment = import.meta.env.MODE === 'development';
const API = isDevelopment
  ? '/api'
  : 'https://cloud-backend-fs-enfyewhphxfjaad8.francecentral-01.azurewebsites.net/api';

const handleResponse = async (res: Response) => {
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    const error: any = new Error(errorBody.message || 'Błąd serwera');
    error.status = res.status;
    throw error;
  }
  return res.json();
};

export const getClients = async (): Promise<Client[]> => {
  const res = await fetch(`${API}/clients`, { credentials: 'include' });
  return handleResponse(res);
};

export const addClient = async (
  data: Pick<
    Client,
    'firstName' | 'lastName' | 'email' | 'phone' | 'isVip' | 'isBlacklisted'
  >,
  avatarFile?: File
): Promise<Client> => {
  const formData = new FormData();
  formData.append('firstName', data.firstName);
  formData.append('lastName', data.lastName);
  formData.append('email', data.email);
  if (data.phone) formData.append('phone', data.phone);
  formData.append('isVip', String(data.isVip ?? false));
  formData.append('isBlacklisted', String(data.isBlacklisted ?? false));

  if (avatarFile) formData.append('avatar', avatarFile);

  const res = await fetch(`${API}/clients`, {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });

  return handleResponse(res);
};

export async function deleteClientApi(id: string) {
  const res = await fetch(`${API}/clients/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  return handleResponse(res);
}

export const uploadClientDocument = async (
  clientId: string,
  file: File
): Promise<Client> => {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API}/clients/${clientId}/documents`, {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });

  return handleResponse(res);
};

export const deleteClientDocument = async (
  clientId: string,
  docId: string
): Promise<Client> => {
  const res = await fetch(`${API}/clients/${clientId}/documents/${docId}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  return handleResponse(res);
};

export const updateClient = async (
  id: string,
  data: Pick<
    Client,
    'firstName' | 'lastName' | 'email' | 'phone' | 'isVip' | 'isBlacklisted'
  >
): Promise<Client> => {
  const res = await fetch(`${API}/clients/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: 'include',
  });

  return handleResponse(res);
};

export const uploadClientAvatar = async (
  clientId: string,
  file: File
): Promise<Client> => {
  const formData = new FormData();
  formData.append('avatar', file);

  const res = await fetch(`${API}/clients/${clientId}/avatar`, {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });

  return handleResponse(res);
};

export const summarizeDocument = async (
  clientId: string,
  docId: string
): Promise<{ summary: string }> => {
  const res = await fetch(
    `${API}/clients/${clientId}/documents/${docId}/summarize`,
    {
      method: 'POST',
      credentials: 'include',
    }
  );

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const error: any = new Error(errorData.message || 'Błąd streszczania');
    error.status = res.status;
    throw error;
  }
  return res.json();
};
