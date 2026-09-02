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
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Eliminar Clan</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            ¿Estás seguro de que deseas eliminar el Clan <strong className="text-foreground">{clanName}</strong>? Esta acción desvinculará a sus miembros y no se puede deshacer.
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
