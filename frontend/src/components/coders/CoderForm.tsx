import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { Coder } from '../../types';

// Props del formulario: modo crear/editar según presencia de `coder`
interface CoderFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Record<string, string>) => void;
  coder?: Coder | null;
  isLoading?: boolean;
}

// Formulario modal para crear o editar un coder
export default function CoderForm({ open, onClose, onSubmit, coder, isLoading }: CoderFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Sincronizar campos del formulario al cambiar el coder seleccionado o abrirse
  useEffect(() => {
    if (coder) {
      setName(coder.name);
      setEmail(coder.email);
      setPassword(''); // No prellenar password en edición por seguridad
    } else {
      setName('');
      setEmail('');
      setPassword('');
    }
  }, [coder, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data: Record<string, string> = { name, email };
    if (password) data.password = password; // Solo enviar password si se cambió
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">{coder ? 'Edit Coder' : 'New Coder'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-muted-foreground">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-input border-border focus:border-neon-cyan focus:ring-neon-cyan/20"
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
              className="bg-input border-border focus:border-neon-cyan focus:ring-neon-cyan/20"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-muted-foreground">
              {coder ? 'New Password (leave blank to keep)' : 'Password'}
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-input border-border focus:border-neon-cyan focus:ring-neon-cyan/20"
              required={!coder}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="border-border text-muted-foreground">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-neon-cyan text-background hover:bg-neon-cyan/90"
            >
              {isLoading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
