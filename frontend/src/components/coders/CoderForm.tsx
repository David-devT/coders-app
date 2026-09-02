import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { Coder } from '../../types';

interface CoderFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Record<string, string>) => void;
  coder?: Coder | null;
  isLoading?: boolean;
}

export default function CoderForm({ open, onClose, onSubmit, coder, isLoading }: CoderFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (coder) {
      setName(coder.name);
      setEmail(coder.email);
      setPassword('');
    } else {
      setName('');
      setEmail('');
      setPassword('');
    }
  }, [coder, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data: Record<string, string> = { name, email };
    if (password) data.password = password;
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="glass-card border-white/10 p-6 rounded-2xl max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-foreground">
            {coder ? 'Editar Perfil de Coder' : 'Nuevo Perfil de Coder'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-xs font-semibold text-muted-foreground">Nombre Completo</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="glass-input h-10 rounded-xl text-xs"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-semibold text-muted-foreground">Correo Electrónico</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="glass-input h-10 rounded-xl text-xs"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs font-semibold text-muted-foreground">
              {coder ? 'Nueva Contraseña (dejar en blanco para conservar)' : 'Contraseña'}
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="glass-input h-10 rounded-xl text-xs"
              required={!coder}
            />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-white/5">
            <Button type="button" variant="outline" onClick={onClose} className="h-9 glass-panel border-white/10 text-xs font-semibold">
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="h-9 bg-gradient-to-r from-neon-cyan to-blue-600 hover:from-neon-cyan/90 text-background font-bold text-xs rounded-xl shadow-lg glow-cyan"
            >
              {isLoading ? 'Guardando...' : 'Guardar Perfil'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
