import { useState, useEffect } from 'react';
import type { Client } from '../types/Client';
import {
  uploadClientAvatar,
  deleteClientDocument,
  uploadClientDocument,
} from '../api/clients';
import toast from 'react-hot-toast';

export const useClientActions = (
  client: Client,
  onClientUpdated: (client: Client) => void,
  onDelete: (id: string) => void
) => {
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

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

    toast.promise(uploadClientAvatar(client.id, file), {
      loading: 'Wysyłanie zdjęcia do Azure...',
      success: (updated) => {
        onClientUpdated(updated);
        setPreviewUrl(null);
        setAvatarLoading(false);
        return 'Avatar zaktualizowany!';
      },
      error: (err) => {
        setPreviewUrl(null);
        setAvatarLoading(false);
        return `Błąd: ${err.message}`;
      },
    });
  };

  const handleDeleteDocument = async (docId: string) => {
    if (!confirm('Czy na pewno chcesz usunąć ten dokument?')) return;

    toast.promise(deleteClientDocument(client.id, docId), {
      loading: 'Usuwanie z chmury...',
      success: (updated) => {
        onClientUpdated(updated);
        return 'Dokument usunięty.';
      },
      error: 'Błąd usuwania.',
    });
  };

  const handleClientSave = (updated: Client) => {
    onClientUpdated(updated);
    setIsEditing(false);
    toast.success('Dane zaktualizowane.');
  };

  const confirmDelete = () => {
    onDelete(client.id);
    setIsDeleteModalOpen(false);
    toast.success(`Klient ${client.firstName} usunięty.`);
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
        return 'Błąd uploadu PDF';
      },
    });
  };

  return {
    state: {
      avatarLoading,
      isEditing,
      previewUrl,
      isDeleteModalOpen,
      pdfLoading,
    },
    actions: {
      setIsEditing,
      setIsDeleteModalOpen,
      handleAvatarUpload,
      handleDeleteDocument,
      handleClientSave,
      confirmDelete,
      handlePdfUpload,
    },
  };
};
