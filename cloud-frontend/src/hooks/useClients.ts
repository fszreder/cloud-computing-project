/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect, useCallback } from 'react';
import { getClients, deleteClientApi } from '../api/clients';
import type { Client } from '../types/Client';
import toast from 'react-hot-toast';

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

  const removeClient = async (id: string) => {
    try {
      await deleteClientApi(id);
      setClients((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      toast.error('Nie udało się usunąć klienta z Azure');
    }
  };
  const addClientToState = (newClient: Client) => {
    setClients((prev) => [newClient, ...prev]);
  };

  const updateClientInState = (updatedClient: Client) => {
    setClients((prev) =>
      prev.map((c) => (c.id === updatedClient.id ? updatedClient : c))
    );
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
