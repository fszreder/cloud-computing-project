import { useState, useMemo } from 'react';
import type { Client } from '../types/Client';

export const useClientSearch = (clients: Client[] | undefined) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredClients = useMemo(() => {
    const safeClients = Array.isArray(clients) ? clients : [];

    if (!searchTerm.trim()) {
      return [...safeClients].sort((a, b) =>
        a.lastName.localeCompare(b.lastName)
      );
    }

    const term = searchTerm.toLowerCase().trim();

    return safeClients
      .filter((client) => {
        const firstName = (client.firstName || '').toLowerCase();
        const lastName = (client.lastName || '').toLowerCase();
        const email = (client.email || '').toLowerCase();
        const phone = client.phone ? client.phone.replace(/\s+/g, '') : '';

        return (
          firstName.includes(term) ||
          lastName.includes(term) ||
          email.includes(term) ||
          phone.includes(term)
        );
      })
      .sort((a, b) => {
        const aFirst = a.firstName.toLowerCase();
        const aLast = a.lastName.toLowerCase();
        const bFirst = b.firstName.toLowerCase();
        const bLast = b.lastName.toLowerCase();
        const aStartsFirst = aFirst.startsWith(term);
        const bStartsFirst = bFirst.startsWith(term);
        if (aStartsFirst && !bStartsFirst) return -1;
        if (!aStartsFirst && bStartsFirst) return 1;
        const aStartsLast = aLast.startsWith(term);
        const bStartsLast = bLast.startsWith(term);
        if (aStartsLast && !bStartsLast) return -1;
        if (!aStartsLast && bStartsLast) return 1;
        return a.lastName.localeCompare(b.lastName);
      });
  }, [clients, searchTerm]);

  return { searchTerm, setSearchTerm, filteredClients };
};
