import { useState } from 'react';
import { toast } from 'react-hot-toast';

interface Props {
  loading: boolean;
  onUpload: (file: File) => void;
}

export default function UploadPdf({ loading, onUpload }: Props) {
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;
    if (file.type !== 'application/pdf') {
      toast.error('Błąd: Wybierz poprawny plik PDF!');
      e.target.value = '';
      return;
    }
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      toast.error('Plik jest zbyt duży! Maksymalny rozmiar to 10MB.');
      e.target.value = '';
      return;
    }

    setSelectedFileName(file.name);
    onUpload(file);

    e.target.value = '';
  };

  return (
    <div className="mt-3 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <label
          className={`${
            loading
              ? 'bg-blue-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 cursor-pointer shadow-md active:scale-95'
          } text-white px-4 py-1.5 rounded-lg transition-all text-sm font-semibold flex items-center gap-2`}
        >
          {loading ? (
            <>
              <svg
                className="animate-spin h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Przetwarzanie...
            </>
          ) : (
            'Dodaj dokument PDF'
          )}
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="hidden"
            disabled={loading}
          />
        </label>

        {loading && (
          <span className="text-xs text-blue-500 font-medium animate-pulse">
            Wysyłanie do Azure...
          </span>
        )}
      </div>

      {selectedFileName && !loading && (
        <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 w-fit px-2 py-1 rounded border border-gray-100">
          <svg
            className="w-3 h-3 text-red-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M4 4a2 2 0 012-2h4.586A1 1 0 0111 2.293l4.707 4.707A1 1 0 0116 7.707V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
          </svg>
          <span className="truncate max-w-[180px] italic">
            {selectedFileName}
          </span>
          <button
            onClick={() => setSelectedFileName(null)}
            className="ml-1 text-gray-400 hover:text-red-500"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
