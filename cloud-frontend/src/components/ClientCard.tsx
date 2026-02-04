import type { Client } from '../types/Client';
import UploadPdf from './UploadPdf';
import ClientDocuments from './ClientDocuments';
import UploadAvatar from './UploadAvatar';
import EditClientForm from './EditClientForm';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import { useClientActions } from '../hooks/useClientActions';

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
  const { state, actions } = useClientActions(
    client,
    onClientUpdated,
    onDelete
  );

  return (
    <div
      className={`p-4 rounded shadow transition-all duration-300 ${
        client.isVip
          ? 'bg-gradient-to-br from-yellow-50 to-white border-2 border-yellow-400 shadow-yellow-100'
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
              <div className="flex items-center gap-2">
                <div className="font-bold text-xl text-gray-900 leading-tight">
                  {client.firstName} {client.lastName}
                </div>
                {client.isVip && (
                  <span className="bg-yellow-400 text-yellow-900 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                    VIP
                  </span>
                )}
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
      {!state.isEditing && (
        <>
          <div className="mt-6 border-t border-gray-50 pt-4 space-y-3">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Dokumenty klienta
            </h4>
            <ClientDocuments
              documents={client.documents}
              onDelete={actions.handleDeleteDocument}
            />
            <UploadPdf
              loading={state.pdfLoading}
              onUpload={actions.handlePdfUpload}
            />
          </div>

          <div className="flex gap-2 mt-6 pt-4 border-t border-gray-50">
            <label
              className={`px-4 py-2 text-sm font-medium rounded-md cursor-pointer text-white transition-all ${
                state.avatarLoading
                  ? 'bg-blue-300'
                  : 'bg-blue-600 hover:bg-blue-700 shadow-sm'
              }`}
            >
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
              className="bg-gray-100 text-gray-700 px-4 py-2 text-sm font-medium rounded-md hover:bg-gray-200 border border-gray-200 transition-all shadow-sm"
            >
              Edytuj dane
            </button>

            <button
              onClick={() => actions.setIsDeleteModalOpen(true)}
              className="bg-white text-red-600 border border-red-200 px-4 py-2 text-sm font-medium rounded-md hover:bg-red-50 ml-auto font-semibold shadow-sm transition-all"
            >
              Usuń klienta
            </button>
          </div>
        </>
      )}

      <DeleteConfirmationModal
        isOpen={state.isDeleteModalOpen}
        onClose={() => actions.setIsDeleteModalOpen(false)}
        onConfirm={actions.confirmDelete}
        title="Usuń klienta"
        message={`Czy na pewno chcesz usunąć klienta ${client.firstName} ${client.lastName}?`}
      />
    </div>
  );
}
