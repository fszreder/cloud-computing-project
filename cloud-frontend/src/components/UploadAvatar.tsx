import type { Client } from '../types/Client';

interface Props {
  client: Client;
  previewUrl?: string | null;
}

export default function UploadAvatar({ client, previewUrl }: Props) {
  const initialSrc =
    previewUrl || client.avatarThumbnailUrl || client.avatarUrl;

  return (
    <div className="w-24 h-24 rounded overflow-hidden bg-gray-200 flex items-center justify-center border border-gray-100 shadow-inner">
      {initialSrc ? (
        <img
          src={initialSrc}
          alt={`${client.firstName} avatar`}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            if (client.avatarUrl && target.src !== client.avatarUrl) {
              console.warn(
                'Fallback: Ładowanie oryginału zamiast miniatury/podglądu'
              );
              target.src = client.avatarUrl;
            }
          }}
        />
      ) : (
        <span className="text-gray-400 text-xs text-center px-1">
          Brak zdjęcia
        </span>
      )}
    </div>
  );
}
