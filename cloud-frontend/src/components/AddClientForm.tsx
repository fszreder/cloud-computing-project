import { useState, useRef } from 'react';
import { addClient } from '../api/clients';
import type { Client } from '../types/Client';
import { useClientForm } from '../hooks/useClientForm';
import toast from 'react-hot-toast';

interface Props {
  onClientAdded: (client: Client) => void;
}

export default function AddClientForm({ onClientAdded }: Props) {
  const [avatar, setAvatar] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { fields, setters, status, reset } = useClientForm({
    initialData: {},
    onSubmitApi: (data) => addClient(data, avatar || undefined),
    onSuccess: (newClient) => {
      onClientAdded(newClient);
      reset();
      setAvatar(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Błąd: Wybierz zdjęcie w formacie JPG, PNG lub WebP!');
        if (fileInputRef.current) fileInputRef.current.value = '';
        setAvatar(null);
        return;
      }

      const MAX_SIZE = 5 * 1024 * 1024;
      if (file.size > MAX_SIZE) {
        toast.error('Błąd: Zdjęcie jest za duże (maksymalnie 5MB)!');
        if (fileInputRef.current) fileInputRef.current.value = '';
        setAvatar(null);
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
          isVip: fields.isVip,
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
          return `Klient ${newClient.firstName} został dodany! 🚀`;
        },
        error: (err) => `Błąd: ${err.message || 'Nie udało się dodać klienta'}`,
      }
    );
  };

  return (
    <form
      onSubmit={handleCustomSubmit}
      className="bg-white p-4 rounded shadow mb-6 space-y-3 border-l-4 border-blue-500 shadow-sm"
    >
      <h2 className="text-xl font-semibold text-gray-800">
        Dodaj nowego klienta
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input
          className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          placeholder="Imię"
          value={fields.firstName}
          onChange={(e) => setters.setFirstName(e.target.value)}
        />
        <input
          className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          placeholder="Nazwisko"
          value={fields.lastName}
          onChange={(e) => setters.setLastName(e.target.value)}
        />
      </div>

      <input
        className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none transition-all"
        placeholder="Email"
        type="email"
        value={fields.email}
        onChange={(e) => setters.setEmail(e.target.value)}
      />

      <input
        value={fields.phone}
        onChange={(e) => setters.handlePhoneChange(e.target.value)}
        className={`border rounded px-2 py-2 w-full focus:ring-2 focus:ring-blue-500 outline-none ${
          status.phoneError ? 'border-red-500' : ''
        }`}
        placeholder="Telefon (opcjonalnie)"
      />
      {status.phoneError && (
        <div className="text-sm text-red-600 font-medium">
          {status.phoneError}
        </div>
      )}

      <div className="space-y-1 py-2 border-y border-slate-50">
        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
          Zdjęcie profilowe (JPG, PNG, WebP)
        </label>
        <div className="flex items-center gap-3">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
          />
          {avatar && (
            <button
              type="button"
              onClick={() => {
                setAvatar(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              className="text-xs text-red-500 font-bold hover:underline"
            >
              Usuń plik
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg border border-yellow-100">
        <input
          id="isVip-add"
          type="checkbox"
          checked={fields.isVip}
          onChange={(e) => setters.setIsVip(e.target.checked)}
          className="w-5 h-5 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500 cursor-pointer"
        />
        <label
          htmlFor="isVip-add"
          className="text-sm font-bold text-yellow-800 cursor-pointer select-none"
        >
          Oznacz jako Klient VIP
        </label>
      </div>

      <button
        type="submit"
        disabled={status.loading || !!status.phoneError}
        className="w-full bg-blue-600 text-white font-bold px-4 py-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all shadow-md active:scale-95"
      >
        {status.loading ? 'Przetwarzanie...' : 'Zatwierdź i dodaj klienta'}
      </button>
    </form>
  );
}
