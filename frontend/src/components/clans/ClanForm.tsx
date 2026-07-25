import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useTeamLeaders } from '../../hooks/useTeamLeaders';
import { useClans } from '../../hooks/useClans';
import type { Clan } from '../../types';

// Props del formulario de clan (crear o editar)
interface ClanFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Record<string, string>) => void;
  clan?: Clan | null;
  isLoading?: boolean;
}

// Formulario modal para crear o editar un clan.
// Incluye selector de team leader con validación de máximo 2 clans por líder.
export default function ClanForm({ open, onClose, onSubmit, clan, isLoading }: ClanFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [teamLeaderId, setTeamLeaderId] = useState('');
  const [error, setError] = useState('');

  const { teamLeaders } = useTeamLeaders();
  const { clans } = useClans();

  // Sincronizar campos al cambiar de clan o abrir el modal
  useEffect(() => {
    if (clan) {
      setName(clan.name);
      setDescription(clan.description || '');
      setTeamLeaderId(clan.teamLeader?.id || '');
    } else {
      setName('');
      setDescription('');
      setTeamLeaderId('');
    }
    setError('');
  }, [clan, open]);

  // Validar límite de 2 clans por team leader al seleccionar uno
  const handleLeaderChange = (tlId: string) => {
    setTeamLeaderId(tlId);
    setError('');

    if (tlId) {
      // Contar clans actuales de este team leader (excluyendo el clan actual si estamos editando)
      const tlClans = (clans.data || []).filter(
        (c) => c.teamLeader?.id === tlId && c.id !== clan?.id
      );
      if (tlClans.length >= 2) {
        setError('This Team Leader already leads 2 clans (maximum)');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (error) return;
    const data: Record<string, string> = { name, description };
    if (teamLeaderId) data.teamLeader = teamLeaderId;
    onSubmit(data);
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
          <div className="space-y-2">
            <Label htmlFor="leader" className="text-muted-foreground">Team Leader</Label>
            <select
              id="leader"
              value={teamLeaderId}
              onChange={(e) => handleLeaderChange(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-input border border-border text-foreground focus:border-neon-magenta focus:ring-1 focus:ring-neon-magenta/20"
            >
              <option value="">No leader assigned</option>
              {teamLeaders.data?.map((tl) => (
                <option key={tl.id} value={tl.id}>
                  {tl.name} ({tl.role})
                </option>
              ))}
            </select>
            {/* Mensaje de error si el líder ya tiene 2 clans */}
            {error && (
              <p className="text-xs text-destructive mt-1">{error}</p>
            )}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="border-border text-muted-foreground">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !!error}
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
