import { type Client } from '../types/Client';

const API = '/api';

export const getClients = async (): Promise<Client[]> => {
  const res = await fetch(`${API}/clients`);
  if (!res.ok) {
    throw new Error('Failed to fetch clients');
  }
  return res.json();
};

export const addClient = async (
  data: Pick<Client, 'firstName' | 'lastName' | 'email' | 'phone' | 'isVip'>,
  avatarFile?: File
): Promise<Client> => {
  const formData = new FormData();

  formData.append('firstName', data.firstName);
  formData.append('lastName', data.lastName);
  formData.append('email', data.email);
  if (data.phone) formData.append('phone', data.phone);

  formData.append('isVip', String(data.isVip ?? false));
  if (avatarFile) {
    formData.append('avatar', avatarFile);
  }

  const res = await fetch(`${API}/clients`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || 'Failed to add client');
  }

  return res.json();
};

export async function deleteClientApi(id: string) {
  await fetch(`${API}/clients/${id}`, {
    method: 'DELETE',
  });
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
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const deleteClientDocument = async (
  clientId: string,
  docId: string
): Promise<Client> => {
  const res = await fetch(`${API}/clients/${clientId}/documents/${docId}`, {
    method: 'DELETE',
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const updateClient = async (
  id: string,
  data: Pick<Client, 'firstName' | 'lastName' | 'email' | 'phone' | 'isVip'>
): Promise<Client> => {
  const res = await fetch(`${API}/clients/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const uploadClientAvatar = async (
  clientId: string,
  file: File
): Promise<Client> => {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API}/clients/${clientId}/avatar`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return res.json();
};
