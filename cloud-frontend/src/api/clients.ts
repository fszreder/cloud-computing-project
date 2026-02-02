import type { Client } from '../types/Client';

const API =
  'https://cloud-backend-fs-enfyewhphxfjaad8.francecentral-01.azurewebsites.net';

export const getClients = async (): Promise<Client[]> => {
  const res = await fetch(`${API}/clients`);
  if (!res.ok) {
    throw new Error('Failed to fetch clients');
  }
  return res.json();
};

export const addClient = async (
  data: Pick<Client, 'firstName' | 'lastName' | 'email' | 'phone'>
): Promise<Client> => {
  const res = await fetch(`${API}/clients`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
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
  data: Pick<Client, 'firstName' | 'lastName' | 'email' | 'phone'>
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
