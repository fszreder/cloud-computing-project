import type { Client } from '../types/Client';

interface Props {
  documents: Client['documents'];
  onDelete: (docId: string) => void;
  onPreview: (url: string) => void; // Dodajemy to pole do interface
}

export default function ClientDocuments({
  documents,
  onDelete,
  onPreview,
}: Props) {
  if (!documents || documents.length === 0) {
    return <p className="text-sm text-gray-500 italic">Brak dokumentów</p>;
  }

  return (
    <ul className="space-y-2">
      {documents.map((doc) => (
        <li
          key={doc.id}
          className="flex items-center justify-between bg-gray-50 p-2 rounded border border-gray-100 group"
        >
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium text-gray-700 truncate">
              {doc.name}
            </span>
            <span className="text-[10px] text-gray-400">
              {new Date(doc.uploadedAt).toLocaleDateString()}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onPreview(doc.url)}
              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
              title="Podgląd dokumentu"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            </button>

            <a
              href={doc.url}
              download
              className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors"
              title="Pobierz"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
            </a>

            <button
              onClick={() => onDelete(doc.id)}
              className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
              title="Usuń"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
