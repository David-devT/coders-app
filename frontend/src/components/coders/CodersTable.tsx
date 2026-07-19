import { useState } from 'react';
import { useCoders } from '../../hooks/useCoders';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Plus } from 'lucide-react';
import CoderForm from './CoderForm';
import DeleteCoderDialog from './DeleteCoderDialog';
import type { Coder } from '../../types';

export default function CodersTable() {
  const { coders, createCoder, updateCoder, deleteCoder } = useCoders();
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedCoder, setSelectedCoder] = useState<Coder | null>(null);

  const handleCreate = async (data: Record<string, string>) => {
    await createCoder.mutateAsync(data as { name: string; email: string; password: string });
    setFormOpen(false);
  };

  const handleUpdate = async (data: Record<string, string>) => {
    if (selectedCoder) {
      await updateCoder.mutateAsync({ id: selectedCoder._id, data });
      setFormOpen(false);
      setSelectedCoder(null);
    }
  };

  const handleDelete = async () => {
    if (selectedCoder) {
      await deleteCoder.mutateAsync(selectedCoder._id);
      setDeleteOpen(false);
      setSelectedCoder(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Coders</h1>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> Add Coder
        </Button>
      </div>

      {coders.isLoading ? (
        <p>Loading...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Clan</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {coders.data?.map((coder, i) => (
              <TableRow key={coder._id}>
                <TableCell>{i + 1}</TableCell>
                <TableCell>{coder.name}</TableCell>
                <TableCell>{coder.email}</TableCell>
                <TableCell>{coder.clan?.name || '-'}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => { setSelectedCoder(coder); setFormOpen(true); }}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => { setSelectedCoder(coder); setDeleteOpen(true); }}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <CoderForm open={formOpen} onClose={() => { setFormOpen(false); setSelectedCoder(null); }} onSubmit={selectedCoder ? handleUpdate : handleCreate} coder={selectedCoder} isLoading={createCoder.isPending || updateCoder.isPending} />

      <DeleteCoderDialog open={deleteOpen} onClose={() => { setDeleteOpen(false); setSelectedCoder(null); }} onConfirm={handleDelete} coderName={selectedCoder?.name || ''} isLoading={deleteCoder.isPending} />
    </div>
  );
}
