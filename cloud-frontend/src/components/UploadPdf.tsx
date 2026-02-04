import { useState } from 'react';

interface Props {
  loading: boolean;
  onUpload: (file: File) => void;
}

export default function UploadPdf({ loading, onUpload }: Props) {
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    onUpload(file);
  };

  return (
    <div className="mt-3 flex items-center gap-2">
      <label
        className={`${loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} text-white px-3 py-1 rounded cursor-pointer transition-colors text-sm`}
      >
        {loading ? 'Wysyłanie…' : 'Dodaj dokument PDF'}
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
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
