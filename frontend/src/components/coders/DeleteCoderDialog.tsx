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
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Eliminar Perfil de Coder</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            ¿Estás seguro de que deseas eliminar a <strong className="text-foreground">{coderName}</strong>? Esta acción no se puede deshacer.
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
