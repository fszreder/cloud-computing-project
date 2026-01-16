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
  data: Pick<Client, 'name' | 'email' | 'phone'>
): Promise<Client> => {
  const res = await fetch(`${API}/clients`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error('Failed to add client');
  }

  return res.json();
};

export const uploadPdf = async (
  clientId: string,
  file: File
): Promise<Client> => {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API}/clients/${clientId}/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    throw new Error('Failed to upload PDF');
  }

  return res.json();
};
