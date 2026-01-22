import type { Client } from '../types/Client';
import UploadPdf from './UploadPdf';

interface Props {
  client: Client;
  onDelete: (id: string) => void;
  onClientUpdated: (client: Client) => void;
}

export default function ClientCard({ client, onDelete }: Props) {
  return (
    <div className="bg-white p-4 rounded shadow space-y-1">
      <div className="font-semibold">
        {client.firstName} {client.lastName}
      </div>

      <div className="text-sm text-gray-600">{client.email}</div>

      {client.phone && (
        <div className="text-sm text-gray-600">Tel: {client.phone}</div>
      )}

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

      <UploadPdf
        clientId={client.id}
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        onClientUpdated={function (_client: Client): void {
          throw new Error('Function not implemented.');
        }}
      />
      <button
        onClick={() => onDelete(client.id)}
        className="
    bg-red-600
    text-white
    px-3
    py-1
    rounded
    hover:bg-red-700
    cursor-pointer
    transition-colors
  "
      >
        Usuń
      </button>
    </div>
  );
}
