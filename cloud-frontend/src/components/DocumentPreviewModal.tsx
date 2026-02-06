interface Props {
  url: string | null;
  onClose: () => void;
}

export default function DocumentPreviewModal({ url, onClose }: Props) {
  if (!url) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl h-[90vh] bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-gray-700">Podgląd dokumentu</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500 font-bold"
          >
            ✕ Zamknij
          </button>
        </div>

        <div className="flex-1 bg-gray-800">
          <iframe
            src={`${url}#toolbar=0`}
            className="w-full h-full border-none"
            title="PDF Preview"
          />
        </div>
      </div>
    </div>
  );
}
