/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import type { Client } from '../types/Client';
import toast from 'react-hot-toast';

interface UseClientFormProps {
  initialData: Partial<Client>;
  onSubmitApi: (data: any) => Promise<Client>;
  onSuccess: (client: Client) => void;
}

export const useClientForm = ({
  initialData,
  onSubmitApi,
  onSuccess,
}: UseClientFormProps) => {
  const [firstName, setFirstName] = useState(initialData.firstName || '');
  const [lastName, setLastName] = useState(initialData.lastName || '');
  const [email, setEmail] = useState(initialData.email || '');
  const [phone, setPhone] = useState(initialData.phone || '');
  const [isVip, setIsVip] = useState(initialData.isVip || false);
  const [loading, setLoading] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  const isValidPhone = (value: string) => {
    if (!value) return true;
    return /^\d{9,15}$/.test(value);
  };

  const handlePhoneChange = (value: string) => {
    setPhone(value);
    if (!isValidPhone(value)) {
      setPhoneError('Numer telefonu musi zawierać 9–15 cyfr');
    } else {
      setPhoneError(null);
    }
  };

  const reset = () => {
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhone('');
    setIsVip(false);
    setPhoneError(null);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneError) return;

    setLoading(true);
    try {
      const result = await onSubmitApi({
        firstName,
        lastName,
        email,
        phone: phone || null,
        isVip,
      });

      onSuccess(result);
      toast.success('Dane zapisane pomyślnie!');
      reset();
    } catch (err: any) {
      console.error('Błąd zapisu (detale):', err);
      const isForbidden =
        err.status === 403 || JSON.stringify(err).includes('403');

      if (isForbidden) {
        toast.error('Tylko administrator może modyfikować te dane.');
      } else {
        const cleanMsg =
          err.message?.replace(/^Error: /i, '') || 'Wystąpił błąd zapisu.';
        toast.error(cleanMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    fields: { firstName, lastName, email, phone, isVip },
    setters: {
      setFirstName,
      setLastName,
      setEmail,
      handlePhoneChange,
      setIsVip,
    },
    status: { loading, phoneError, setLoading },
    submit,
    reset,
  };
};
