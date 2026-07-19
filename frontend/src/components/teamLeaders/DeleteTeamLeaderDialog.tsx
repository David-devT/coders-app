import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface DeleteTeamLeaderDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  teamLeaderName: string;
  isLoading?: boolean;
}

export default function DeleteTeamLeaderDialog({ open, onClose, onConfirm, teamLeaderName, isLoading }: DeleteTeamLeaderDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Team Leader</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <strong>{teamLeaderName}</strong>? This action cannot be undone.
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
