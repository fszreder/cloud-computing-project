import { useClients } from '../hooks/useClients';
import { useClientSearch } from '../hooks/useClientSearch';
import { ClientSearch } from './ClientSearch';
import ClientCard from './ClientCard';
import AddClientForm from './AddClientForm';
import type { Client } from '../types/Client';

export default function ClientList() {
  const {
    clients,
    isLoading,
    removeClient,
    addClientToState,
    updateClientInState,
  } = useClients();

  const { searchTerm, setSearchTerm, filteredClients } =
    useClientSearch(clients);

  if (isLoading && clients.length === 0) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-slate-500 font-medium">
          Ładowanie bazy...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <AddClientForm onClientAdded={addClientToState} />

      <div className="space-y-6">
        <ClientSearch searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

        <div className="grid gap-6">
          {filteredClients.map((c: Client) => (
            <ClientCard
              key={c.id}
              client={c}
              onDelete={removeClient}
              onClientUpdated={updateClientInState}
            />
          ))}

          {filteredClients.length === 0 && searchTerm && (
            <div className="text-center py-10 bg-white rounded-xl border-2 border-dashed border-slate-200">
              <p className="text-slate-400 font-medium">
                Nie znaleziono klienta: "{searchTerm}"
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
