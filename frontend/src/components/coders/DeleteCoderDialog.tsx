import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

// Props del diálogo de eliminación de coder
interface DeleteCoderDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  coderName: string;
  isLoading?: boolean;
}

// Diálogo de confirmación para eliminar un coder (acción irreversible)
export default function DeleteCoderDialog({ open, onClose, onConfirm, coderName, isLoading }: DeleteCoderDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Delete Coder</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Are you sure you want to delete <strong className="text-foreground">{coderName}</strong>? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose} className="border-border text-muted-foreground">
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
