import type { Client } from '../types/Client';

interface Props {
  client: Client;
}

export default function UploadAvatar({ client }: Props) {
  return (
    <div className="w-24 h-24 rounded overflow-hidden bg-gray-200 flex items-center justify-center">
      {client.avatarUrl ? (
        <img
          src={client.avatarThumbnailUrl ?? client.avatarUrl}
          className="w-16 h-16 rounded-full object-cover"
        />
      ) : (
        <span className="text-gray-400 text-sm">Brak zdjęcia</span>
      )}
    </div>
  );
}
