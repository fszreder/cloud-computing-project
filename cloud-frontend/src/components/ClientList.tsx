import { useEffect, useState } from 'react';
import { getClients } from '../api/clients';
import type { Client } from '../types/Client';
import ClientCard from './ClientCard';
import AddClientForm from './AddClientForm';

export default function ClientList() {
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    getClients().then(setClients).catch(console.error);
  }, []);

  const handleClientAdded = (client: Client) => {
    setClients((prev) => [client, ...prev]);
  };

  return (
    <div>
      <AddClientForm onClientAdded={handleClientAdded} />

      <div className="space-y-4">
        {clients.map((c) => (
          <ClientCard key={c.id} client={c} />
        ))}
      </div>
    </div>
  );
}
