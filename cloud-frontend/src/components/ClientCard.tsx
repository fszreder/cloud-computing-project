import { useState } from 'react';
import type { Client } from '../types/Client';
import UploadPdf from './UploadPdf';
import ClientDocuments from './ClientDocuments';
import UploadAvatar from './UploadAvatar';
import { deleteClientDocument, uploadClientAvatar } from '../api/clients';
import EditClientForm from './EditClientForm';

interface Props {
  client: Client;
  onDelete: (id: string) => void;
  onClientUpdated: (client: Client) => void;
}

export default function ClientCard({
  client,
  onDelete,
  onClientUpdated,
}: Props) {
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarLoading(true);
    try {
      const updatedClient = await uploadClientAvatar(client.id, file);
      onClientUpdated(updatedClient);
    } catch (err) {
      console.error(err);
      alert('Błąd uploadu zdjęcia');
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    if (!confirm('Usunąć dokument?')) return;

    try {
      const updatedClient = await deleteClientDocument(client.id, docId);
      onClientUpdated(updatedClient);
    } catch (err) {
      console.error(err);
      alert('Błąd usuwania dokumentu');
    }
  };

  const handleClientSave = (updatedClient: Client) => {
    onClientUpdated(updatedClient);
    setIsEditing(false);
  };

  return (
    <div className="bg-white p-4 rounded shadow">
      <div className="flex items-start gap-4">
        <div className="">
          {isEditing ? (
            <EditClientForm
              client={client}
              onSave={handleClientSave}
              onCancel={() => setIsEditing(false)}
            />
          ) : (
            <div className="space-y-1">
              <div className="font-semibold text-lg">
                {client.firstName} {client.lastName}
              </div>
              <div className="text-sm text-gray-600">{client.email}</div>

              {client.phone && (
                <div className="text-sm text-gray-600">Tel: {client.phone}</div>
              )}
            </div>
          )}
        </div>

        <UploadAvatar client={client} />
      </div>

      {!isEditing && (
        <>
          <div className="mt-4 space-y-2">
            <ClientDocuments
              documents={client.documents}
              onDelete={handleDeleteDocument}
            />

            <UploadPdf clientId={client.id} onClientUpdated={onClientUpdated} />
          </div>

          <div className="flex gap-2 pt-4">
            <label
              className={`
              px-3 py-1 rounded cursor-pointer text-white
              ${avatarLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}
            `}
            >
              Zmień zdjęcie
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
                disabled={avatarLoading}
              />
            </label>

            <button
              onClick={() => setIsEditing(true)}
              className="bg-yellow-500 text-white px-3 py-1 rounded cursor-pointer hover:bg-yellow-600"
            >
              Edytuj
            </button>

            <button
              onClick={() => onDelete(client.id)}
              className="bg-red-600 text-white px-3 py-1 rounded cursor-pointer hover:bg-red-700"
            >
              Usuń
            </button>
          </div>
        </>
      )}
    </div>
  );
}
