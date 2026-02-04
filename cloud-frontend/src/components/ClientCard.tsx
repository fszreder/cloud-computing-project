/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from 'react';
import type { Client } from '../types/Client';
import UploadPdf from './UploadPdf';
import ClientDocuments from './ClientDocuments';
import UploadAvatar from './UploadAvatar';
import EditClientForm from './EditClientForm';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import { useClientActions } from '../hooks/useClientActions';
import DocumentPreviewModal from './DocumentPreviewModal';

interface Props {
  client: Client;
  onDelete: (id: string) => void;
  onClientUpdated: (client: Client) => void;
  searchTerm: string;
}

export default function ClientCard({
  client,
  onDelete,
  onClientUpdated,
  searchTerm,
}: Props) {
  const { state, actions } = useClientActions(
    client,
    onClientUpdated,
    onDelete
  );

  useEffect(() => {
    let interval: any;

    if (client.avatarUrl && !client.aiDescription) {
      console.log(`[AI Polling] Start dla: ${client.lastName}`);

      interval = setInterval(async () => {
        try {
          const response = await fetch(`/api/clients/${client.id}`);

          if (response.ok) {
            const updatedClient = await response.json();
            console.log(
              `[AI Polling] Sprawdzam... Status opisu:`,
              updatedClient.aiDescription
            );

            if (
              updatedClient.aiDescription &&
              updatedClient.aiDescription !== 'Brak opisu'
            ) {
              onClientUpdated(updatedClient);
              console.log(`[AI Sync] Sukces dla ${client.lastName}!`);
              clearInterval(interval);
            }
          }
        } catch (error) {
          console.warn('Czekam na połączenie z API...');
        }
      }, 3000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [
    client.id,
    client.avatarUrl,
    client.aiDescription,
    client.lastName,
    onClientUpdated,
  ]);

  const highlightText = (text: string, highlight: string) => {
    if (!highlight.trim()) return text;
    const regex = new RegExp(`(${highlight})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark
          key={i}
          className="bg-yellow-200 text-yellow-900 rounded-sm px-0.5 border-b border-yellow-400"
        >
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div
      className={`p-4 rounded-xl shadow-sm transition-all duration-300 ${
        client.isVip
          ? 'bg-gradient-to-br from-yellow-50 to-white border-2 border-yellow-400'
          : 'bg-white border border-gray-100'
      }`}
    >
      <div className="flex items-start gap-4">
        <UploadAvatar client={client} previewUrl={state.previewUrl} />

        <div className="min-w-0 flex-1">
          {state.isEditing ? (
            <EditClientForm
              client={client}
              onSave={actions.handleClientSave}
              onCancel={() => actions.setIsEditing(false)}
            />
          ) : (
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="font-bold text-xl text-gray-900 leading-tight">
                  {highlightText(
                    `${client.firstName} ${client.lastName}`,
                    searchTerm
                  )}
                </div>
                {client.isVip && (
                  <span className="bg-yellow-400 text-yellow-900 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                    VIP
                  </span>
                )}
              </div>
              {client.aiDescription ? (
                <div className="flex items-center gap-1.5 py-0.5">
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                  <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100 italic shadow-sm">
                    AI: {client.aiDescription}
                  </span>
                </div>
              ) : client.avatarUrl ? (
                <div className="flex items-center gap-1.5 py-0.5 opacity-90">
                  <div className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                  </div>
                  <span className="text-[11px] font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100 animate-pulse">
                    Analiza AI w toku...
                  </span>
                </div>
              ) : null}

              <div className="text-sm text-gray-500 font-medium">
                {highlightText(client.email, searchTerm)}
              </div>
            </div>
          )}
        </div>
      </div>
      {!state.isEditing && (
        <div className="mt-6 border-t border-gray-50 pt-4 space-y-3">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Dokumenty klienta
          </h4>
          <ClientDocuments
            documents={client.documents}
            onDelete={(docId) => actions.openDeleteDocModal(docId, 'dokument')}
            onPreview={actions.setPreviewDocUrl}
          />
          <UploadPdf
            loading={state.pdfLoading}
            onUpload={actions.handlePdfUpload}
          />

          <div className="flex gap-2 mt-4">
            <label className="bg-blue-600 text-white px-4 py-2 text-sm font-medium rounded-md cursor-pointer hover:bg-blue-700">
              {state.avatarLoading ? 'Przetwarzanie...' : 'Zmień avatar'}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={actions.handleAvatarUpload}
                disabled={state.avatarLoading}
              />
            </label>
            <button
              onClick={() => actions.setIsEditing(true)}
              className="bg-gray-100 px-4 py-2 text-sm font-medium rounded-md hover:bg-gray-200"
            >
              Edytuj dane
            </button>
            <button
              onClick={() => actions.setIsDeleteModalOpen(true)}
              className="bg-white text-red-600 border border-red-200 px-4 py-2 text-sm font-medium rounded-md hover:bg-red-50 ml-auto"
            >
              Usuń klienta
            </button>
          </div>
        </div>
      )}

      <DeleteConfirmationModal
        isOpen={state.isDeleteModalOpen}
        onClose={() => actions.setIsDeleteModalOpen(false)}
        onConfirm={actions.confirmDelete}
        title="Usuń klienta"
        message="Czy na pewno?"
      />
      <DocumentPreviewModal
        url={state.previewDocUrl}
        onClose={() => actions.setPreviewDocUrl(null)}
      />
    </div>
  );
}
