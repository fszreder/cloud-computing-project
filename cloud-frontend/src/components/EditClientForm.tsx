import { useState } from 'react';
import type { Client } from '../types/Client';
import { updateClient } from '../api/clients';

interface Props {
  client: Client;
  onSave: (client: Client) => void;
  onCancel: () => void;
}

const isValidPhone = (value: string) => {
  if (!value) return true; // pole opcjonalne
  return /^\d{9,15}$/.test(value);
};

export default function EditClientForm({ client, onSave, onCancel }: Props) {
  const [firstName, setFirstName] = useState(client.firstName || '');
  const [lastName, setLastName] = useState(client.lastName || '');
  const [email, setEmail] = useState(client.email || '');
  const [phone, setPhone] = useState<string>(client.phone || '');
  const [loading, setLoading] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updatedClient = await updateClient(client.id, {
        firstName,
        lastName,
        email,
        phone: phone || null,
      });

      onSave(updatedClient);
    } catch (err) {
      console.error(err);
      alert('Błąd zapisu danych klienta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2 mt-2">
      <input
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
        className="border rounded px-2 py-1 w-full"
        placeholder="Imię"
        required
      />

      <input
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
        className="border rounded px-2 py-1 w-full"
        placeholder="Nazwisko"
        required
      />

      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border rounded px-2 py-1 w-full"
        placeholder="Email"
        required
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

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={loading || !!phoneError}
          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Zapisz
        </button>

        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300 cursor-pointer"
        >
          Anuluj
        </button>
      </div>
    </form>
  );
}
