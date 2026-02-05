import type { Client } from '../types/Client';
import { updateClient } from '../api/clients';
import { useClientForm } from '../hooks/useClientForm';

// Stała lista do weryfikacji przy edycji
const MILAN_BLACKLIST = [
  'Zlatan Ibrahimovic',
  'Theo Hernandez',
  'Rafael Leao',
  'Olivier Giroud',
  'Mike Maignan',
  'Sandro Tonali',
];

interface Props {
  client: Client;
  onSave: (client: Client) => void;
  onCancel: () => void;
}

export default function EditClientForm({ client, onSave, onCancel }: Props) {
  const isMilanista =
    client.isBlacklisted ||
    MILAN_BLACKLIST.some((player) =>
      `${client.firstName} ${client.lastName}`
        .toLowerCase()
        .includes(player.toLowerCase())
    );

  const { fields, setters, status, submit } = useClientForm({
    initialData: client,
    onSubmitApi: (data) =>
      updateClient(client.id, {
        ...data,
        isBlacklisted: isMilanista,
      }),
    onSuccess: onSave,
  });

  return (
    <form
      onSubmit={submit}
      className={`space-y-2 mt-2 p-4 rounded-lg border transition-all ${
        isMilanista
          ? 'bg-red-50 border-red-200'
          : 'bg-slate-50 border-slate-200'
      }`}
    >
      <div className="grid grid-cols-2 gap-2">
        <input
          value={fields.firstName}
          onChange={(e) => setters.setFirstName(e.target.value)}
          className="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="Imię"
          required
        />
        <input
          value={fields.lastName}
          onChange={(e) => setters.setLastName(e.target.value)}
          className="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="Nazwisko"
          required
        />
      </div>

      <input
        type="email"
        value={fields.email}
        onChange={(e) => setters.setEmail(e.target.value)}
        className="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 outline-none"
        placeholder="Email"
        required
      />

      <input
        value={fields.phone}
        onChange={(e) => setters.handlePhoneChange(e.target.value)}
        className={`border rounded px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 outline-none ${status.phoneError ? 'border-red-500' : ''}`}
        placeholder="Telefon"
      />
      {status.phoneError && (
        <div className="text-xs text-red-600 font-medium">
          {status.phoneError}
        </div>
      )}
      {!isMilanista ? (
        <div className="flex items-center gap-2 mt-2 p-2 bg-yellow-100/50 rounded border border-yellow-200">
          <input
            id="edit-isVip"
            type="checkbox"
            checked={fields.isVip}
            onChange={(e) => setters.setIsVip(e.target.checked)}
            className="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
          />
          <label
            htmlFor="edit-isVip"
            className="text-sm font-bold text-yellow-800 cursor-pointer"
          >
            Klient VIP
          </label>
        </div>
      ) : (
        <div className="mt-2 p-2 bg-red-100 text-red-700 text-[10px] font-black uppercase rounded border border-red-200 text-center tracking-wider">
          Blokada: Brak statusu VIP dla AC Milan
        </div>
      )}

      <div className="flex gap-2 pt-3">
        <button
          type="submit"
          disabled={status.loading || !!status.phoneError}
          className={`flex-1 font-bold py-2 rounded shadow-md transition-colors disabled:opacity-50 ${
            isMilanista
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {status.loading ? 'Zapisywanie...' : 'Zapisz zmiany'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-slate-200 text-slate-700 font-semibold rounded hover:bg-slate-300 transition-colors"
        >
          Anuluj
        </button>
      </div>
    </form>
  );
}
