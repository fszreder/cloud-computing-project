import type { Client } from '../types/Client';
import UploadPdf from './UploadPdf';

interface Props {
  client: Client;
}

export default function ClientCard({ client }: Props) {
  return (
    <div className="bg-white p-4 rounded shadow">
      <div className="font-semibold">{client.name}</div>
      <div className="text-sm text-gray-600">{client.email}</div>

      {client.documentUrl ? (
        <a
          href={client.documentUrl}
          target="_blank"
          rel="noreferrer"
          className="text-blue-600 underline block mt-2"
        >
          Pobierz PDF
        </a>
      ) : (
        <div className="text-gray-400 text-sm mt-2">Brak dokumentu</div>
      )}

      <UploadPdf clientId={client.id} />
    </div>
  );
}
