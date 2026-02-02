import { useState } from 'react';
import { addClient } from '../api/clients';
import type { Client } from '../types/Client';

interface Props {
  onClientAdded: (client: Client) => void;
}

const isValidPhone = (value: string) => {
  if (!value) return true;
  return /^\d{9,15}$/.test(value);
};

export default function AddClientForm({ onClientAdded }: Props) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!firstName || !lastName || !email) {
      setError('Imię, nazwisko i email są wymagane');
      return;
    }

    try {
      setLoading(true);
      const newClient = await addClient({
        firstName,
        lastName,
        email,
        phone: phone || null,
      });

      onClientAdded(newClient);

      // reset form
      setFirstName('');
      setLastName('');
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
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
      />

      <input
        className="w-full border p-2 rounded"
        placeholder="Nazwisko"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
      />

      <input
        className="w-full border p-2 rounded"
        placeholder="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        value={phone}
        onChange={(e) => {
          const value = e.target.value;
          setPhone(value);

          if (!isValidPhone(value)) {
            setPhoneError('Numer telefonu musi zawierać 9–15 cyfr');
          } else {
            setPhoneError(null);
          }
        }}
        className={`
    border
    rounded
    px-2
    py-1
    w-full
    ${phoneError ? 'border-red-500' : ''}
  `}
        placeholder="Telefon"
      />

      {phoneError && <div className="text-sm text-red-600">{phoneError}</div>}

      <button
        type="submit"
        disabled={!!phoneError}
        className="
    bg-blue-600
    text-white
    px-3
    py-1
    rounded
    hover:bg-blue-700
    disabled:opacity-50
    disabled:cursor-not-allowed
    cursor-pointer
  "
      >
        {loading ? 'Dodawanie...' : 'Dodaj'}
      </button>
    </form>
  );
}
