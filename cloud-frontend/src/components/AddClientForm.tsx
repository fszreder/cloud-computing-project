import { useState, useRef } from 'react';
import { addClient } from '../api/clients';
import type { Client } from '../types/Client';
import { useClientForm } from '../hooks/useClientForm';
import toast from 'react-hot-toast';

const MILAN_BLACKLIST = [
  'Mike Maignan',
  'Davide Calabria',
  'Fikayo Tomori',
  'Malick Thiaw',
  'Theo Hernández',
  'Ismaël Bennacer',
  'Tijjani Reijnders',
  'Christian Pulisic',
  'Ruben Loftus-Cheek',
  'Rafael Leão',
  'Olivier Giroud',
  'Damian Guz',
];

interface Props {
  onClientAdded: (client: Client) => void;
}

export default function AddClientForm({ onClientAdded }: Props) {
  const [avatar, setAvatar] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { fields, setters, status, reset } = useClientForm({
    initialData: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      isVip: false,
      isBlacklisted: false,
    },
    onSubmitApi: (data) => addClient(data, avatar || undefined),
    onSuccess: (newClient) => {
      onClientAdded(newClient);
      reset();
      setAvatar(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    },
  });

  const fullName = `${fields.firstName} ${fields.lastName}`.trim();
  const isMilanista = MILAN_BLACKLIST.some((player) =>
    fullName.toLowerCase().includes(player.toLowerCase())
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Błąd: Wybierz zdjęcie w formacie JPG, PNG lub WebP!');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Błąd: Zdjęcie jest za duże (maksymalnie 5MB)!');
        return;
      }
      setAvatar(file);
    }
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !fields.firstName.trim() ||
      !fields.lastName.trim() ||
      !fields.email.trim()
    ) {
      toast.error('Imię, nazwisko i email są wymagane!');
      return;
    }

    toast.promise(
      addClient(
        {
          firstName: fields.firstName,
          lastName: fields.lastName,
          email: fields.email,
          phone: fields.phone || null,
          isVip: isMilanista ? false : fields.isVip,
          isBlacklisted: isMilanista,
        },
        avatar || undefined
      ),
      {
        loading: 'Dodawanie klienta do bazy Azure...',
        success: (newClient) => {
          onClientAdded(newClient);
          reset();
          setAvatar(null);
          if (fileInputRef.current) fileInputRef.current.value = '';
          return isMilanista
            ? `Zawodnik AC Milan wykryty. Dodano do Listy Wstydu. 🚫`
            : `Klient ${newClient.firstName} został dodany! 🚀`;
        },
        error: (err) => `Błąd: ${err.message || 'Nie udało się dodać klienta'}`,
      }
    );
  };

  return (
    <form
      onSubmit={handleCustomSubmit}
      className={`bg-white p-6 rounded-2xl shadow-sm mb-10 space-y-4 border-l-8 transition-all duration-500 ${
        isMilanista
          ? 'border-red-600 bg-red-50/20'
          : 'border-blue-600 shadow-blue-50'
      }`}
    >
      <div className="flex justify-between items-center">
        <h2
          className={`text-2xl font-black tracking-tighter uppercase ${isMilanista ? 'text-red-700' : 'text-slate-800'}`}
        >
          {isMilanista
            ? '🚨 Wykryto Milanistę 🚨'
            : 'Rejestracja Nowego Klienta'}
        </h2>
        {isMilanista && (
          <span className="animate-bounce bg-red-600 text-white text-[10px] px-2 py-1 rounded-md font-bold">
            INTER FANS ONLY
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          className="w-full border-2 border-slate-100 p-3 rounded-xl focus:border-blue-500 outline-none transition-all font-medium"
          placeholder="Imię"
          value={fields.firstName}
          onChange={(e) => setters.setFirstName(e.target.value)}
        />
        <input
          className="w-full border-2 border-slate-100 p-3 rounded-xl focus:border-blue-500 outline-none transition-all font-medium"
          placeholder="Nazwisko"
          value={fields.lastName}
          onChange={(e) => setters.setLastName(e.target.value)}
        />
      </div>

      <input
        className="w-full border-2 border-slate-100 p-3 rounded-xl focus:border-blue-500 outline-none transition-all font-medium"
        placeholder="Adres e-mail"
        type="email"
        value={fields.email}
        onChange={(e) => setters.setEmail(e.target.value)}
      />

      <input
        value={fields.phone}
        onChange={(e) => setters.handlePhoneChange(e.target.value)}
        className={`w-full border-2 p-3 rounded-xl outline-none transition-all font-medium ${
          status.phoneError
            ? 'border-red-400 bg-red-50'
            : 'border-slate-100 focus:border-blue-500'
        }`}
        placeholder="Telefon (np. 123456789)"
      />

      <div className="py-2 border-y border-slate-50 space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Wgraj Avatar
        </label>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer w-full"
        />
      </div>

      <div
        className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
          isMilanista
            ? 'bg-slate-100 border-slate-200 opacity-50'
            : 'bg-yellow-50/50 border-yellow-100'
        }`}
      >
        <input
          id="isVip-add"
          type="checkbox"
          checked={isMilanista ? false : fields.isVip}
          onChange={(e) => setters.setIsVip(e.target.checked)}
          disabled={isMilanista}
          className="w-6 h-6 text-yellow-500 border-slate-300 rounded-lg focus:ring-yellow-500 cursor-pointer disabled:cursor-not-allowed"
        />
        <label
          htmlFor="isVip-add"
          className={`text-sm font-black uppercase ${isMilanista ? 'text-slate-400' : 'text-yellow-700 cursor-pointer'}`}
        >
          Status VIP{' '}
          {isMilanista && (
            <span className="text-[9px] text-red-500 ml-2">
              (ZABLOKOWANE DLA AC MILAN)
            </span>
          )}
        </label>
      </div>

      <button
        type="submit"
        disabled={status.loading || !!status.phoneError}
        className={`w-full text-white font-black py-4 rounded-2xl transition-all shadow-lg active:scale-95 disabled:opacity-50 uppercase tracking-tighter ${
          isMilanista
            ? 'bg-red-600 hover:bg-red-700 shadow-red-200'
            : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
        }`}
      >
        {status.loading
          ? 'Łączenie z Azure...'
          : isMilanista
            ? 'Potwierdź wpis na Czarną Listę'
            : 'Zarejestruj Klienta'}
      </button>
    </form>
  );
}
