import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { Clan } from '../../types';

// Props del formulario de clan (crear o editar)
interface ClanFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Record<string, string>) => void;
  clan?: Clan | null;
  isLoading?: boolean;
}

// Formulario modal para crear o editar un clan
export default function ClanForm({ open, onClose, onSubmit, clan, isLoading }: ClanFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  // Sincronizar campos al cambiar de clan o abrir el modal
  useEffect(() => {
    if (clan) {
      setName(clan.name);
      setDescription(clan.description || '');
    } else {
      setName('');
      setDescription('');
    }
  }, [clan, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, description });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">{clan ? 'Edit Clan' : 'New Clan'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-muted-foreground">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-input border-border focus:border-neon-magenta focus:ring-neon-magenta/20"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description" className="text-muted-foreground">Description</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-input border-border focus:border-neon-magenta focus:ring-neon-magenta/20"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="border-border text-muted-foreground">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-neon-magenta text-background hover:bg-neon-magenta/90"
            >
              {isLoading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
