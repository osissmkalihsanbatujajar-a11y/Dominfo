import { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { useToast } from './Toast';
import { toMessage } from '@/services/errors';

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => Promise<void>;
}

export function ConfirmDialog({ open, onClose, title, message, confirmLabel = 'Hapus', onConfirm }: Props) {
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  async function run() {
    setBusy(true);
    try {
      await onConfirm();
      onClose();
    } catch (e) {
      toast.error(toMessage(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open={open} onClose={busy ? () => undefined : onClose} title={title}>
      <p className="text-sm text-ink-300">{message}</p>
      <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button onClick={onClose} disabled={busy}>Batal</Button>
        <Button variant="danger" onClick={run} loading={busy}>{confirmLabel}</Button>
      </div>
    </Modal>
  );
}
