import { useState, useEffect } from 'react';
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
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);

    setAvatarLoading(true);
    try {
      const updatedClient = await uploadClientAvatar(client.id, file);
      onClientUpdated(updatedClient);
      setPreviewUrl(null);
    } catch (err) {
      console.error(err);
      setPreviewUrl(null);
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
    <div className="bg-white p-4 rounded shadow border border-gray-100">
      {/* Kluczowa sekcja: 
        Usunęliśmy flex-1, więc elementy zajmują tylko tyle miejsca, ile potrzebują.
      */}
      <div className="flex items-start gap-4">
        {/* Avatar jako pierwszy po lewej - opcjonalnie zamień kolejność divów, jeśli wolisz go po prawej */}
        <UploadAvatar client={client} previewUrl={previewUrl} />

        <div className="min-w-0">
          {' '}
          {/* min-w-0 zapobiega rozjeżdżaniu się długich tekstów */}
          {isEditing ? (
            <EditClientForm
              client={client}
              onSave={handleClientSave}
              onCancel={() => setIsEditing(false)}
            />
          ) : (
            <div className="space-y-1">
              <div className="font-bold text-xl text-gray-900 leading-tight">
                {client.firstName} {client.lastName}
              </div>
              <div className="text-sm text-gray-500 font-medium">
                {client.email}
              </div>

              {client.phone && (
                <div className="text-xs text-gray-400">Tel: {client.phone}</div>
              )}
            </div>
          )}
        </div>
      </div>

      {!isEditing && (
        <>
          <div className="mt-6 border-t border-gray-50 pt-4 space-y-3">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Dokumenty klienta
            </h4>
            <ClientDocuments
              documents={client.documents}
              onDelete={handleDeleteDocument}
            />

            <UploadPdf clientId={client.id} onClientUpdated={onClientUpdated} />
          </div>

          <div className="flex gap-2 mt-6 pt-4 border-t border-gray-50">
            <label
              className={`
                px-4 py-2 text-sm font-medium rounded-md cursor-pointer text-white transition-all
                ${avatarLoading ? 'bg-blue-300' : 'bg-blue-600 hover:bg-blue-700 shadow-sm'}
              `}
            >
              {avatarLoading ? 'Wgrywanie...' : 'Zmień avatar'}
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
              className="bg-gray-100 text-gray-700 px-4 py-2 text-sm font-medium rounded-md hover:bg-gray-200 transition-all border border-gray-200"
            >
              Edytuj dane
            </button>

            <button
              onClick={() => onDelete(client.id)}
              className="bg-white text-red-600 border border-red-200 px-4 py-2 text-sm font-medium rounded-md hover:bg-red-50 transition-all ml-auto"
            >
              Usuń klienta
            </button>
          </div>
        </>
      )}
    </div>
  );
}
