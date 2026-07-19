import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface DeleteClanDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  clanName: string;
  isLoading?: boolean;
}

export default function DeleteClanDialog({ open, onClose, onConfirm, clanName, isLoading }: DeleteClanDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Clan</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <strong>{clanName}</strong>? This action cannot be undone.
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
