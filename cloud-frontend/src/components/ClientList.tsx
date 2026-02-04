import { useClients } from '../hooks/useClients';
import { useClientSearch } from '../hooks/useClientSearch';
import { ClientSearch } from './ClientSearch';
import ClientCard from './ClientCard';
import AddClientForm from './AddClientForm';
import type { Client } from '../types/Client';
import ClientSkeleton from './ClientSkeleton';
import { motion, AnimatePresence } from 'framer-motion';

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
      <div className="space-y-8">
        <div className="h-10 w-48 bg-slate-200 animate-pulse rounded-lg" />
        <div className="grid gap-6">
          {[1, 2, 3].map((n) => (
            <ClientSkeleton key={n} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Klienci
          </h1>
          <p className="text-slate-500 font-medium">
            Zarządzaj swoją bazą i dokumentami Azure.
          </p>
        </div>
        <div className="flex gap-2">
          <div className="bg-blue-50 px-3 py-1 rounded-full border border-blue-100 text-blue-700 text-xs font-bold uppercase">
            Suma: {clients.length}
          </div>
          <div className="bg-yellow-50 px-3 py-1 rounded-full border border-yellow-100 text-yellow-700 text-xs font-bold uppercase">
            VIP: {clients.filter((c) => c.isVip).length}
          </div>
        </div>
      </div>

      <hr className="border-slate-100" />

      <AddClientForm onClientAdded={addClientToState} />

      <div className="space-y-6">
        <ClientSearch searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

        <div className="grid gap-6 relative">
          <AnimatePresence mode="popLayout">
            {filteredClients.map((c: Client) => (
              <motion.div
                key={c.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <ClientCard
                  client={c}
                  onDelete={removeClient}
                  onClientUpdated={updateClientInState}
                  searchTerm={searchTerm}
                />
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredClients.length === 0 && searchTerm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 text-center"
            >
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-slate-700">
                Pusto tu jakoś...
              </h3>
              <p className="text-slate-500 max-w-xs mx-auto">
                Nie znaleźliśmy nikogo pasującego do frazy{' '}
                <span className="text-blue-600 font-bold">"{searchTerm}"</span>
              </p>
              <button
                onClick={() => setSearchTerm('')}
                className="mt-6 text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors uppercase tracking-wider"
              >
                Wyczyść filtry
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
