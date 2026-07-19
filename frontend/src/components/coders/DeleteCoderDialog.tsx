import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface DeleteCoderDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  coderName: string;
  isLoading?: boolean;
}

export default function DeleteCoderDialog({ open, onClose, onConfirm, coderName, isLoading }: DeleteCoderDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Coder</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <strong>{coderName}</strong>? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
