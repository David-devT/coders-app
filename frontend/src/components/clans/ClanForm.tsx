import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useTeamLeaders } from '../../hooks/useTeamLeaders';
import { useClans } from '../../hooks/useClans';
import type { Clan } from '../../types';

interface ClanFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Record<string, string>) => void;
  clan?: Clan | null;
  isLoading?: boolean;
}

export default function ClanForm({ open, onClose, onSubmit, clan, isLoading }: ClanFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [teamLeaderId, setTeamLeaderId] = useState('');
  const [error, setError] = useState('');

  const { teamLeaders } = useTeamLeaders();
  const { clans } = useClans();

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

  const handleLeaderChange = (tlId: string) => {
    setTeamLeaderId(tlId);
    setError('');

    if (tlId) {
      const tlClans = (clans.data || []).filter(
        (c) => c.teamLeader?.id === tlId && c.id !== clan?.id
      );
      if (tlClans.length >= 2) {
        setError('Este Team Leader ya lidera 2 clans (límite máximo permitido)');
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
      <DialogContent className="glass-card border-white/10 p-6 rounded-2xl max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-foreground">
            {clan ? 'Editar Detalles del Clan' : 'Crear Nuevo Clan'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-xs font-semibold text-muted-foreground">Nombre del Clan</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Cyber Dragons"
              className="glass-input h-10 rounded-xl text-xs"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-xs font-semibold text-muted-foreground">Descripción</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción corta de la unidad..."
              className="glass-input h-10 rounded-xl text-xs"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="leader" className="text-xs font-semibold text-muted-foreground">Team Leader Asignado</Label>
            <select
              id="leader"
              value={teamLeaderId}
              onChange={(e) => handleLeaderChange(e.target.value)}
              className="w-full h-10 px-3 rounded-xl glass-input text-xs text-foreground focus:border-neon-magenta focus:ring-1 focus:ring-neon-magenta/20"
            >
              <option value="" className="bg-card">Sin líder asignado</option>
              {teamLeaders.data?.map((tl) => (
                <option key={tl.id} value={tl.id} className="bg-card text-foreground">
                  {tl.name} ({tl.role})
                </option>
              ))}
            </select>
            {error && (
              <p className="text-xs text-destructive mt-1 font-semibold">{error}</p>
            )}
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-white/5">
            <Button type="button" variant="outline" onClick={onClose} className="h-9 glass-panel border-white/10 text-xs font-semibold">
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !!error}
              className="h-9 bg-gradient-to-r from-neon-magenta to-purple-600 hover:from-neon-magenta/90 text-background font-bold text-xs rounded-xl shadow-lg glow-magenta"
            >
              {isLoading ? 'Guardando...' : 'Guardar Clan'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
