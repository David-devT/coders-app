import { useState } from 'react';
import { useClans } from '../../hooks/useClans';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Plus } from 'lucide-react';
import ClanForm from './ClanForm';
import DeleteClanDialog from './DeleteClanDialog';
import type { Clan } from '../../types';

export default function ClansTable() {
  const { clans, createClan, updateClan, deleteClan } = useClans();
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedClan, setSelectedClan] = useState<Clan | null>(null);

  const handleCreate = async (data: Record<string, string>) => {
    await createClan.mutateAsync(data);
    setFormOpen(false);
  };

  const handleUpdate = async (data: Record<string, string>) => {
    if (selectedClan) {
      await updateClan.mutateAsync({ id: selectedClan._id, data });
      setFormOpen(false);
      setSelectedClan(null);
    }
  };

  const handleDelete = async () => {
    if (selectedClan) {
      await deleteClan.mutateAsync(selectedClan._id);
      setDeleteOpen(false);
      setSelectedClan(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Clans</h1>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> Add Clan
        </Button>
      </div>

      {clans.isLoading ? (
        <p>Loading...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Coders</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clans.data?.map((clan, i) => (
              <TableRow key={clan._id}>
                <TableCell>{i + 1}</TableCell>
                <TableCell>{clan.name}</TableCell>
                <TableCell>{clan.description || '-'}</TableCell>
                <TableCell>{clan.coders?.length || 0}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => { setSelectedClan(clan); setFormOpen(true); }}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => { setSelectedClan(clan); setDeleteOpen(true); }}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <ClanForm open={formOpen} onClose={() => { setFormOpen(false); setSelectedClan(null); }} onSubmit={selectedClan ? handleUpdate : handleCreate} clan={selectedClan} isLoading={createClan.isPending || updateClan.isPending} />

      <DeleteClanDialog open={deleteOpen} onClose={() => { setDeleteOpen(false); setSelectedClan(null); }} onConfirm={handleDelete} clanName={selectedClan?.name || ''} isLoading={deleteClan.isPending} />
    </div>
  );
}
