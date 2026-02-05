import { useState } from 'react';
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

  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'alpha'>(
    'newest'
  );

  const blacklistedClients = clients.filter((c) => c.isBlacklisted);
  const visibleActiveClients = filteredClients.filter((c) => !c.isBlacklisted);

  const sortedClients = [...visibleActiveClients].sort((a, b) => {
    if (sortOrder === 'alpha') {
      return a.lastName.localeCompare(b.lastName);
    }
    const dateA = new Date(a.createdAt || 0).getTime();
    const dateB = new Date(b.createdAt || 0).getTime();
    return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
  });

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
      {blacklistedClients.length > 0 && (
        <div className="mb-12">
          <details className="group border-2 border-red-100 rounded-2xl bg-white shadow-sm overflow-hidden transition-all duration-300 open:shadow-md">
            <summary className="list-none p-4 cursor-pointer flex justify-between items-center bg-red-50/50 hover:bg-red-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="bg-red-600 text-white p-1.5 rounded-lg shadow-sm">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-black text-red-700 tracking-tight uppercase text-sm">
                    Lista Wstydu
                  </h3>
                  <p className="text-[11px] text-red-500 font-medium">
                    {blacklistedClients.length} klientów na czarnej liście
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-red-400 group-open:hidden">
                  ROZWIŃ LISTĘ
                </span>
                <div className="text-red-400 group-open:rotate-180 transition-transform duration-300">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="3"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </summary>
            <div className="p-6 bg-red-50/20 border-t border-red-100">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
                <AnimatePresence>
                  {blacklistedClients.map((c) => (
                    <motion.div
                      key={c.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <ClientCard
                        client={c}
                        onDelete={removeClient}
                        onClientUpdated={updateClientInState}
                        searchTerm=""
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </details>
        </div>
      )}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            Klienci <span className="text-blue-600">Premium</span>
          </h1>
          <p className="text-slate-500 font-medium">
            Zarządzaj autoryzowaną bazą klientów w chmurze Azure.
          </p>
        </div>
        <div className="flex gap-2">
          <div className="bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100 text-blue-700 text-xs font-bold uppercase shadow-sm">
            Aktywni: {visibleActiveClients.length}
          </div>
          <div className="bg-yellow-50 px-3 py-1.5 rounded-full border border-yellow-100 text-yellow-700 text-xs font-bold uppercase shadow-sm">
            VIP: {visibleActiveClients.filter((c) => c.isVip).length}
          </div>
        </div>
      </div>

      <hr className="border-slate-100" />

      <AddClientForm onClientAdded={addClientToState} />
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <ClientSearch
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />
          </div>
          <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-xl border border-slate-100">
            <span className="text-[10px] font-black text-slate-400 uppercase ml-2">
              Sortuj:
            </span>
            <div className="flex bg-white p-1 rounded-lg shadow-sm border border-slate-200">
              <button
                onClick={() => setSortOrder('newest')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${sortOrder === 'newest' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                Nowi
              </button>
              <button
                onClick={() => setSortOrder('oldest')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${sortOrder === 'oldest' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                Starzy
              </button>
              <button
                onClick={() => setSortOrder('alpha')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${sortOrder === 'alpha' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                A-Z
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-6 relative">
          <AnimatePresence mode="popLayout">
            {sortedClients.map((c: Client) => (
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

          {sortedClients.length === 0 && searchTerm && (
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
