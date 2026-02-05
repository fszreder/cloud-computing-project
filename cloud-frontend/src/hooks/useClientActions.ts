import { useState } from 'react';
import type { Client } from '../types/Client';
import { deleteClientDocument, uploadClientDocument } from '../api/clients';
import toast from 'react-hot-toast';

const BACKEND_URL =
  'https://cloud-backend-fs-enfyewhphxfjaad8.francecentral-01.azurewebsites.net';

export const useClientActions = (
  client: Client,
  onClientUpdated: (client: Client) => void,
  onDelete: (id: string) => void
) => {
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [previewDocUrl, setPreviewDocUrl] = useState<string | null>(null);

  const [docToDelete, setDocToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      setAvatarLoading(true);
      const res = await fetch(
        `${BACKEND_URL}/api/clients/${client.id}/avatar`,
        {
          method: 'POST',
          body: formData,
          credentials: 'include',
        }
      );

      if (res.ok) {
        const updatedClient = await res.json();
        onClientUpdated(updatedClient);
        toast.success('Avatar został zaktualizowany');
      } else if (res.status === 403) {
        toast.error(
          'Brak uprawnień: Tylko administrator może zmieniać zdjęcia.'
        );
      } else {
        const errorData = await res.json().catch(() => ({}));
        toast.error(errorData.message || 'Nie udało się przesłać zdjęcia');
      }
    } catch (error) {
      console.error('Błąd uploadu:', error);
      toast.error('Błąd połączenia z serwerem');
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleClientSave = (updated: Client) => {
    onClientUpdated(updated);
    setIsEditing(false);
    toast.success('Dane zaktualizowane.');
  };

  const confirmDelete = () => {
    onDelete(client.id);
    setIsDeleteModalOpen(false);
  };

  const handlePdfUpload = async (file: File) => {
    setPdfLoading(true);
    toast.promise(uploadClientDocument(client.id, file), {
      loading: 'Wysyłanie dokumentu PDF...',
      success: (updated) => {
        onClientUpdated(updated);
        setPdfLoading(false);
        return 'Dokument PDF został dodany!';
      },
      error: () => {
        setPdfLoading(false);
        return 'Błąd uploadu PDF (sprawdź uprawnienia)';
      },
    });
  };

  const openDeleteDocModal = (docId: string, docName: string) => {
    setDocToDelete({ id: docId, name: docName });
  };

  const confirmDeleteDocument = async () => {
    if (!docToDelete) return;

    toast.promise(deleteClientDocument(client.id, docToDelete.id), {
      loading: 'Usuwanie dokumentu z chmury...',
      success: (updated) => {
        onClientUpdated(updated);
        setDocToDelete(null);
        return `Dokument "${docToDelete.name}" usunięty.`;
      },
      error: 'Nie udało się usunąć dokumentu (brak uprawnień).',
    });
  };

  return {
    state: {
      avatarLoading,
      isEditing,
      previewUrl: null,
      isDeleteModalOpen,
      pdfLoading,
      previewDocUrl,
      docToDelete,
    },
    actions: {
      setIsEditing,
      setIsDeleteModalOpen,
      handleAvatarUpload,
      handleClientSave,
      confirmDelete,
      handlePdfUpload,
      setPreviewDocUrl,
      openDeleteDocModal,
      confirmDeleteDocument,
      closeDeleteDocModal: () => setDocToDelete(null),
    },
  };
};
