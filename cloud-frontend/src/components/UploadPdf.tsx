import { uploadPdf } from '../api/clients';

interface Props {
  clientId: string;
}

export default function UploadPdf({ clientId }: Props) {
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await uploadPdf(clientId, file);
      window.location.reload();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <input
      type="file"
      accept="application/pdf"
      onChange={handleUpload}
      className="mt-3 text-sm"
    />
  );
}
