import type { Client } from '../types/Client';

interface Props {
  documents: Client['documents'];
  onDelete: (docId: string) => void;
}

export default function ClientDocuments({ documents, onDelete }: Props) {
  if (!documents || documents.length === 0) {
    return <div className="text-sm text-gray-400">Brak dokumentów</div>;
  }

  return (
    <ul className="mt-2 space-y-1">
      {documents.map((doc) => (
        <li
          key={doc.id}
          className="flex items-center items-center gap-2 text-sm"
        >
          <a
            href={doc.url}
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 underline truncate max-w-[220px]"
          >
            {doc.name}
          </a>

          <button
            onClick={() => onDelete(doc.id)}
            className="text-red-600 text-sm hover:underline cursor-pointer"
          >
            Usuń
          </button>
        </li>
      ))}
    </ul>
  );
}
