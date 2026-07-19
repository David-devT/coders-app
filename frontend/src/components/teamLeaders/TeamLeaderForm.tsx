import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { TeamLeader } from '../../types';

interface TeamLeaderFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Record<string, string>) => void;
  teamLeader?: TeamLeader | null;
  isLoading?: boolean;
}

export default function TeamLeaderForm({ open, onClose, onSubmit, teamLeader, isLoading }: TeamLeaderFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (teamLeader) {
      setName(teamLeader.name);
      setEmail(teamLeader.email);
      setPassword('');
    } else {
      setName('');
      setEmail('');
      setPassword('');
    }
  }, [teamLeader, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data: Record<string, string> = { name, email };
    if (password) data.password = password;
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{teamLeader ? 'Edit Team Leader' : 'New Team Leader'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{teamLeader ? 'New Password (leave blank to keep)' : 'Password'}</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required={!teamLeader} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>{isLoading ? 'Saving...' : 'Save'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
