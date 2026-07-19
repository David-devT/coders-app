import { useState } from 'react';
import { useTeamLeaders } from '../../hooks/useTeamLeaders';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, Plus } from 'lucide-react';
import TeamLeaderForm from './TeamLeaderForm';
import DeleteTeamLeaderDialog from './DeleteTeamLeaderDialog';
import type { TeamLeader } from '../../types';

export default function TeamLeadersTable() {
  const { teamLeaders, createTeamLeader, updateTeamLeader, deleteTeamLeader } = useTeamLeaders();
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedTL, setSelectedTL] = useState<TeamLeader | null>(null);

  const handleCreate = async (data: Record<string, string>) => {
    await createTeamLeader.mutateAsync(data as { name: string; email: string; password: string });
    setFormOpen(false);
  };

  const handleUpdate = async (data: Record<string, string>) => {
    if (selectedTL) {
      await updateTeamLeader.mutateAsync({ id: selectedTL._id, data });
      setFormOpen(false);
      setSelectedTL(null);
    }
  };

  const handleDelete = async () => {
    if (selectedTL) {
      await deleteTeamLeader.mutateAsync(selectedTL._id);
      setDeleteOpen(false);
      setSelectedTL(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Team Leaders</h1>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> Add Team Leader
        </Button>
      </div>

      {teamLeaders.isLoading ? (
        <p>Loading...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teamLeaders.data?.map((tl, i) => (
              <TableRow key={tl._id}>
                <TableCell>{i + 1}</TableCell>
                <TableCell>{tl.name}</TableCell>
                <TableCell>{tl.email}</TableCell>
                <TableCell><Badge variant={tl.role === 'admin' ? 'default' : 'secondary'}>{tl.role}</Badge></TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => { setSelectedTL(tl); setFormOpen(true); }}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => { setSelectedTL(tl); setDeleteOpen(true); }}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <TeamLeaderForm open={formOpen} onClose={() => { setFormOpen(false); setSelectedTL(null); }} onSubmit={selectedTL ? handleUpdate : handleCreate} teamLeader={selectedTL} isLoading={createTeamLeader.isPending || updateTeamLeader.isPending} />

      <DeleteTeamLeaderDialog open={deleteOpen} onClose={() => { setDeleteOpen(false); setSelectedTL(null); }} onConfirm={handleDelete} teamLeaderName={selectedTL?.name || ''} isLoading={deleteTeamLeader.isPending} />
    </div>
  );
}
