import { useEffect, useState } from 'react';
import { getClients, deleteClientApi } from '../api/clients';
import type { Client } from '../types/Client';
import ClientCard from './ClientCard';
import AddClientForm from './AddClientForm';

export default function ClientList() {
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    getClients().then(setClients).catch(console.error);
  }, []);

  const deleteClient = async (id: string) => {
    if (!confirm('Na pewno usunąć klienta?')) return;

    await deleteClientApi(id);
    setClients((prev) => prev.filter((c) => c.id !== id));
  };

  const handleClientAdded = (client: Client) => {
    setClients((prev) => [client, ...prev]);
  };

  const handleClientUpdated = (updatedClient: Client) => {
    setClients((prev) =>
      prev.map((c) => (c.id === updatedClient.id ? updatedClient : c))
    );
  };

  return (
    <div>
      <AddClientForm onClientAdded={handleClientAdded} />

      <div className="space-y-4">
        {clients.map((c) => (
          <ClientCard
            key={c.id}
            client={c}
            onDelete={deleteClient}
            onClientUpdated={handleClientUpdated}
          />
        ))}
      </div>
    </div>
  );
}
