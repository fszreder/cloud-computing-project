import type { Client } from '../types/Client';

interface Props {
  client: Client;
  previewUrl?: string | null;
}

export default function UploadAvatar({ client, previewUrl }: Props) {
  const initialSrc =
    previewUrl || client.avatarThumbnailUrl || client.avatarUrl;

  return (
    <div
      className={`
      w-24 h-24 rounded overflow-hidden flex items-center justify-center transition-all duration-300
      ${
        client.isVip
          ? 'ring-4 ring-yellow-400 border-2 border-white shadow-lg'
          : 'bg-gray-200 border border-gray-100 shadow-inner'
      }
    `}
    >
      {initialSrc ? (
        <img
          src={initialSrc}
          alt={`${client.firstName} avatar`}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            if (client.avatarUrl && target.src !== client.avatarUrl) {
              console.log('Thumbnail jeszcze niedostępny, ładuję oryginał...');
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
