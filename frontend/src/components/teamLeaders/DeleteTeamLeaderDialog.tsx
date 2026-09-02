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
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Eliminar Team Leader</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            ¿Estás seguro de que deseas eliminar al Team Leader <strong className="text-foreground">{teamLeaderName}</strong>? Esta acción no se puede deshacer.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose} className="border-border text-muted-foreground">
            Cancelar
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
