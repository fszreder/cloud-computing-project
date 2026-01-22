import { useState } from 'react';
import { uploadPdf } from '../api/clients';
import type { Client } from '../types/Client';

interface Props {
  clientId: string;
  onClientUpdated: (client: Client) => void;
}

export default function UploadPdf({ clientId, onClientUpdated }: Props) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setLoading(true);

    try {
      const updatedClient = await uploadPdf(clientId, file);
      onClientUpdated(updatedClient); // ← KLUCZ
    } catch (err) {
      console.error(err);
      alert('Błąd uploadu PDF');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-3 flex items-center gap-2">
      <label
        className={`
          ${loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}
          text-white
          px-3
          py-1
          rounded
          cursor-pointer
          transition-colors
          text-sm
        `}
      >
        {loading ? 'Wysyłanie…' : 'Wybierz plik'}
        <input
          type="file"
          accept="application/pdf"
          onChange={handleUpload}
          className="hidden"
          disabled={loading}
        />
      </label>

      {fileName && (
        <span className="text-sm text-gray-600 truncate max-w-[200px]">
          {fileName}
        </span>
      )}
    </div>
  );
}
