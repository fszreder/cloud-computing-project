import { useState } from 'react';
import { addClient } from '../api/clients';
import type { Client } from '../types/Client';

interface Props {
  onClientAdded: (client: Client) => void;
}

export default function AddClientForm({ onClientAdded }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name || !email) {
      setError('Imię i email są wymagane');
      return;
    }

    try {
      setLoading(true);
      const newClient = await addClient({
        name,
        email,
        phone: phone || null,
      });

      onClientAdded(newClient);

      // reset form
      setName('');
      setEmail('');
      setPhone('');
    } catch {
      setError('Nie udało się dodać klienta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-4 rounded shadow mb-6 space-y-3"
    >
      <h2 className="text-xl font-semibold">Dodaj klienta</h2>

      {error && <div className="text-red-600 text-sm">{error}</div>}

      <input
        className="w-full border p-2 rounded"
        placeholder="Imię"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        className="w-full border p-2 rounded"
        placeholder="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        className="w-full border p-2 rounded"
        placeholder="Telefon (opcjonalnie)"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? 'Dodawanie...' : 'Dodaj'}
      </button>
    </form>
  );
}
