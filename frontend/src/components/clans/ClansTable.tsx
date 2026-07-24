import { useState } from 'react';
import { useClans } from '../../hooks/useClans';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pencil, Trash2, Plus, Search } from 'lucide-react';
import ClanForm from './ClanForm';
import DeleteClanDialog from './DeleteClanDialog';
import type { Clan } from '../../types';

// Tabla de gestión de Clans con búsqueda, creación, edición y eliminación
export default function ClansTable() {
  const { clans, createClan, updateClan, deleteClan } = useClans();
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedClan, setSelectedClan] = useState<Clan | null>(null);
  const [search, setSearch] = useState('');

  // Filtrado client-side por nombre, descripción o nombre del líder
  const filtered = clans.data?.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.description?.toLowerCase().includes(search.toLowerCase()) ||
      c.teamLeader?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async (data: Record<string, string>) => {
    await createClan.mutateAsync(data as { name: string; description?: string; teamLeader?: string });
    setFormOpen(false);
  };

  const handleUpdate = async (data: Record<string, string>) => {
    if (selectedClan) {
      await updateClan.mutateAsync({ id: selectedClan.id, data });
      setFormOpen(false);
      setSelectedClan(null);
    }
  };

  const handleDelete = async () => {
    if (selectedClan) {
      await deleteClan.mutateAsync(selectedClan.id);
      setDeleteOpen(false);
      setSelectedClan(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Cabecera con título y botón de crear (color magenta para distinción visual) */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Clans</h1>
        <Button onClick={() => setFormOpen(true)} className="bg-neon-magenta text-background hover:bg-neon-magenta/90">
          <Plus className="w-4 h-4 mr-2" /> Add Clan
        </Button>
      </div>

      {/* Barra de búsqueda con acento magenta */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, description or leader..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-input border-border focus:border-neon-magenta focus:ring-neon-magenta/20"
        />
      </div>

      {clans.isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-neon-magenta/30 border-t-neon-magenta rounded-full animate-spin" />
        </div>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border">
                <TableHead className="text-muted-foreground">#</TableHead>
                <TableHead className="text-muted-foreground">Name</TableHead>
                <TableHead className="text-muted-foreground">Description</TableHead>
                <TableHead className="text-muted-foreground">Leader</TableHead>
                <TableHead className="text-muted-foreground">Coders</TableHead>
                <TableHead className="text-muted-foreground text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No clans found
                  </TableCell>
                </TableRow>
              ) : (
                filtered?.map((clan, i) => (
                  <TableRow key={clan.id} className="border-border hover:bg-muted/50">
                    <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                    <TableCell className="font-medium text-foreground">{clan.name}</TableCell>
                    <TableCell className="text-muted-foreground max-w-[200px] truncate">
                      {clan.description || '-'}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {clan.teamLeader?.name || '-'}
                    </TableCell>
                    <TableCell>
                      {/* Badge con contador de coders en color verde */}
                      <span className="px-2 py-1 rounded-full text-xs bg-neon-green/10 text-neon-green border border-neon-green/20">
                        {Array.isArray(clan.coders) ? clan.coders.length : 0}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="hover:text-neon-magenta hover:bg-neon-magenta/10"
                          onClick={() => { setSelectedClan(clan); setFormOpen(true); }}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="hover:text-destructive hover:bg-destructive/10"
                          onClick={() => { setSelectedClan(clan); setDeleteOpen(true); }}
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

      <ClanForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setSelectedClan(null); }}
        onSubmit={selectedClan ? handleUpdate : handleCreate}
        clan={selectedClan}
        isLoading={createClan.isPending || updateClan.isPending}
      />

      <DeleteClanDialog
        open={deleteOpen}
        onClose={() => { setDeleteOpen(false); setSelectedClan(null); }}
        onConfirm={handleDelete}
        clanName={selectedClan?.name || ''}
        isLoading={deleteClan.isPending}
      />
    </div>
  );
}
