import { useState } from 'react';
import { useTeamLeaders } from '../../hooks/useTeamLeaders';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, Plus, Search } from 'lucide-react';
import TeamLeaderForm from './TeamLeaderForm';
import DeleteTeamLeaderDialog from './DeleteTeamLeaderDialog';
import type { TeamLeader } from '../../types';

// Tabla de gestión de Team Leaders (solo visible para admins)
export default function TeamLeadersTable() {
  const { teamLeaders, createTeamLeader, updateTeamLeader, deleteTeamLeader } = useTeamLeaders();
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedTL, setSelectedTL] = useState<TeamLeader | null>(null);
  const [search, setSearch] = useState('');

  // Filtrado client-side por nombre, email o rol
  const filtered = teamLeaders.data?.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.email.toLowerCase().includes(search.toLowerCase()) ||
      t.role.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async (data: Record<string, string>) => {
    await createTeamLeader.mutateAsync(data as { name: string; email: string; password: string });
    setFormOpen(false);
  };

  const handleUpdate = async (data: Record<string, string>) => {
    if (selectedTL) {
      await updateTeamLeader.mutateAsync({ id: selectedTL.id, data });
      setFormOpen(false);
      setSelectedTL(null);
    }
  };

  const handleDelete = async () => {
    if (selectedTL) {
      await deleteTeamLeader.mutateAsync(selectedTL.id);
      setDeleteOpen(false);
      setSelectedTL(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Cabecera con color verde para distinción visual */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Team Leaders</h1>
        <Button onClick={() => setFormOpen(true)} className="bg-neon-green text-background hover:bg-neon-green/90">
          <Plus className="w-4 h-4 mr-2" /> Add Team Leader
        </Button>
      </div>

      {/* Barra de búsqueda con acento verde */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, email or role..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-input border-border focus:border-neon-green focus:ring-neon-green/20"
        />
      </div>

      {teamLeaders.isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-neon-green/30 border-t-neon-green rounded-full animate-spin" />
        </div>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border">
                <TableHead className="text-muted-foreground">#</TableHead>
                <TableHead className="text-muted-foreground">Name</TableHead>
                <TableHead className="text-muted-foreground">Email</TableHead>
                <TableHead className="text-muted-foreground">Role</TableHead>
                <TableHead className="text-muted-foreground">Clans</TableHead>
                <TableHead className="text-muted-foreground text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No team leaders found
                  </TableCell>
                </TableRow>
              ) : (
                filtered?.map((tl, i) => (
                  <TableRow key={tl.id} className="border-border hover:bg-muted/50">
                    <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                    <TableCell className="font-medium text-foreground">{tl.name}</TableCell>
                    <TableCell className="text-muted-foreground">{tl.email}</TableCell>
                    <TableCell>
                      {/* Badge de rol: admin=verde, teamLeader=default */}
                      <Badge
                        variant={tl.role === 'admin' ? 'default' : 'secondary'}
                        className={tl.role === 'admin' ? 'bg-neon-green/10 text-neon-green border border-neon-green/20' : ''}
                      >
                        {tl.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {/* Lista de clans liderados con badges magenta */}
                      {tl.clans && tl.clans.length > 0 ? (
                        <div className="flex gap-1 flex-wrap">
                          {tl.clans.map((c) => (
                            <span key={c.id} className="px-2 py-0.5 rounded-full text-xs bg-neon-magenta/10 text-neon-magenta border border-neon-magenta/20">
                              {c.name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="hover:text-neon-green hover:bg-neon-green/10"
                          onClick={() => { setSelectedTL(tl); setFormOpen(true); }}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="hover:text-destructive hover:bg-destructive/10"
                          onClick={() => { setSelectedTL(tl); setDeleteOpen(true); }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <TeamLeaderForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setSelectedTL(null); }}
        onSubmit={selectedTL ? handleUpdate : handleCreate}
        teamLeader={selectedTL}
        isLoading={createTeamLeader.isPending || updateTeamLeader.isPending}
      />

      <DeleteTeamLeaderDialog
        open={deleteOpen}
        onClose={() => { setDeleteOpen(false); setSelectedTL(null); }}
        onConfirm={handleDelete}
        teamLeaderName={selectedTL?.name || ''}
        isLoading={deleteTeamLeader.isPending}
      />
    </div>
  );
}
