import { useState } from 'react';
import { useClans } from '../../hooks/useClans';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pencil, Trash2, Plus, Search, Shield, Users } from 'lucide-react';
import ClanForm from './ClanForm';
import DeleteClanDialog from './DeleteClanDialog';
import { useAuthStore } from '../../stores/authStore';
import type { Clan } from '../../types';

export default function ClansTable() {
  const { clans, createClan, updateClan, deleteClan } = useClans();
  const user = useAuthStore((s) => s.user);
  const isCoder = !('role' in (user || {})) || (user as { role?: string }).role === 'coder';
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedClan, setSelectedClan] = useState<Clan | null>(null);
  const [search, setSearch] = useState('');

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-4 rounded-2xl border border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-neon-magenta/15 border border-neon-magenta/30 flex items-center justify-center glow-magenta">
            <Shield className="w-6 h-6 text-neon-magenta" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-foreground tracking-tight">Gestión de Clans</h1>
            <p className="text-xs text-muted-foreground">Unidades técnicas lideradas por Team Leaders</p>
          </div>
        </div>

        {!isCoder && (
          <Button
            onClick={() => setFormOpen(true)}
            className="h-10 bg-gradient-to-r from-neon-magenta to-purple-600 hover:from-neon-magenta/90 text-background font-bold text-xs rounded-xl shadow-lg glow-magenta"
          >
            <Plus className="w-4 h-4 mr-2" /> Agregar Clan
          </Button>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre, descripción o Team Leader..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="glass-input h-11 pl-10 rounded-xl text-xs"
        />
      </div>

      {/* Table Container */}
      {clans.isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-neon-magenta/30 border-t-neon-magenta rounded-full animate-spin glow-magenta" />
        </div>
      ) : (
        <div className="glass-panel rounded-2xl overflow-hidden border border-white/5 shadow-2xl">
          <Table>
            <TableHeader className="bg-white/5">
              <TableRow className="hover:bg-transparent border-white/5">
                <TableHead className="text-xs font-bold text-muted-foreground w-12">#</TableHead>
                <TableHead className="text-xs font-bold text-muted-foreground">Nombre del Clan</TableHead>
                <TableHead className="text-xs font-bold text-muted-foreground">Descripción</TableHead>
                <TableHead className="text-xs font-bold text-muted-foreground">Team Leader</TableHead>
                <TableHead className="text-xs font-bold text-muted-foreground">Coders Activos</TableHead>
                {!isCoder && <TableHead className="text-xs font-bold text-muted-foreground text-right">Acciones</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isCoder ? 5 : 6} className="text-center text-muted-foreground py-12 text-xs">
                    No se encontraron Clans que coincidan con la búsqueda
                  </TableCell>
                </TableRow>
              ) : (
                filtered?.map((clan, i) => (
                  <TableRow key={clan.id} className="border-white/5 hover:bg-white/5 transition-colors">
                    <TableCell className="text-xs font-medium text-muted-foreground">{i + 1}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-neon-magenta/15 border border-neon-magenta/30 flex items-center justify-center font-bold text-xs text-neon-magenta">
                          {clan.name.charAt(0)}
                        </div>
                        <span className="font-bold text-xs text-foreground">{clan.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[240px] truncate">
                      {clan.description || '-'}
                    </TableCell>
                    <TableCell>
                      {clan.teamLeader?.name ? (
                        <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-neon-green" />
                          {clan.teamLeader.name}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground/60 italic">Sin Asignar</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-neon-green/15 text-neon-green border border-neon-green/30">
                        <Users className="w-3 h-3" />
                        {Array.isArray(clan.coders) ? clan.coders.length : 0} miembros
                      </span>
                    </TableCell>
                    {!isCoder && (
                      <TableCell className="text-right">
                        <div className="flex gap-1 justify-end">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-8 h-8 text-muted-foreground hover:text-neon-magenta hover:bg-neon-magenta/15 rounded-xl"
                            onClick={() => { setSelectedClan(clan); setFormOpen(true); }}
                            title="Editar Clan"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-8 h-8 text-muted-foreground hover:text-destructive hover:bg-destructive/15 rounded-xl"
                            onClick={() => { setSelectedClan(clan); setDeleteOpen(true); }}
                            title="Eliminar Clan"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Form Modal */}
      <ClanForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setSelectedClan(null); }}
        onSubmit={selectedClan ? handleUpdate : handleCreate}
        clan={selectedClan}
        isLoading={createClan.isPending || updateClan.isPending}
      />

      {/* Delete Dialog */}
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
