/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect, useCallback } from 'react';
import { getClients } from '../api/clients';
import type { Client } from '../types/Client';
import toast from 'react-hot-toast';

const BACKEND_URL =
  'https://cloud-backend-fs-enfyewhphxfjaad8.francecentral-01.azurewebsites.net';

export const useClients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchClients = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getClients();
      setClients(data);
    } catch (err) {
      toast.error('Błąd podczas ładowania bazy');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const addClientToState = (client: Client) => {
    setClients((prev) => [client, ...prev]);
  };

  const updateClientInState = (updatedClient: Client) => {
    setClients((prev) =>
      prev.map((c) => (c.id === updatedClient.id ? updatedClient : c))
    );
  };

  const removeClient = async (id: string) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/clients/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (res.ok) {
        setClients((prev) => prev.filter((c) => c.id !== id));
        toast.success('Klient został usunięty');
      } else if (res.status === 403) {
        toast.error('Błąd 403: Nie masz uprawnień administratora!');
      } else {
        toast.error('Serwer odrzucił żądanie (Błąd ' + res.status + ')');
      }
    } catch (error) {
      console.error('Błąd połączenia:', error);
      toast.error('Błąd krytyczny połączenia z API');
    }
  };

  return {
    clients,
    isLoading,
    removeClient,
    addClientToState,
    updateClientInState,
    refreshClients: fetchClients,
  };
};
