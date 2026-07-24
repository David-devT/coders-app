import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { TeamLeader } from '../../types';

// Props del formulario de team leader (crear o editar)
interface TeamLeaderFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Record<string, string>) => void;
  teamLeader?: TeamLeader | null;
  isLoading?: boolean;
}

// Formulario modal para crear o editar un team leader
export default function TeamLeaderForm({ open, onClose, onSubmit, teamLeader, isLoading }: TeamLeaderFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Sincronizar campos al cambiar de team leader o abrir el modal
  useEffect(() => {
    if (teamLeader) {
      setName(teamLeader.name);
      setEmail(teamLeader.email);
      setPassword(''); // No prellenar password en edición por seguridad
    } else {
      setName('');
      setEmail('');
      setPassword('');
    }
  }, [teamLeader, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data: Record<string, string> = { name, email };
    if (password) data.password = password; // Solo enviar si se cambió
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">{teamLeader ? 'Edit Team Leader' : 'New Team Leader'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-muted-foreground">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-input border-border focus:border-neon-green focus:ring-neon-green/20"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-muted-foreground">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-input border-border focus:border-neon-green focus:ring-neon-green/20"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-muted-foreground">
              {teamLeader ? 'New Password (leave blank to keep)' : 'Password'}
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-input border-border focus:border-neon-green focus:ring-neon-green/20"
              required={!teamLeader}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="border-border text-muted-foreground">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-neon-green text-background hover:bg-neon-green/90"
            >
              {isLoading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
