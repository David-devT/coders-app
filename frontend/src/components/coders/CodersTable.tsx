import { useState } from 'react';
import { useCoders } from '../../hooks/useCoders';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pencil, Trash2, Plus, Search, Code2, Shield } from 'lucide-react';
import CoderForm from './CoderForm';
import DeleteCoderDialog from './DeleteCoderDialog';
import { useAuthStore } from '../../stores/authStore';
import type { Coder } from '../../types';

export default function CodersTable() {
  const { coders, createCoder, updateCoder, deleteCoder } = useCoders();
  const user = useAuthStore((s) => s.user);
  const isCoder = !('role' in (user || {})) || (user as { role?: string }).role === 'coder';
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedCoder, setSelectedCoder] = useState<Coder | null>(null);
  const [search, setSearch] = useState('');

  const filtered = coders.data?.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.clan?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async (data: Record<string, string>) => {
    await createCoder.mutateAsync(data as { name: string; email: string; password: string });
    setFormOpen(false);
  };

  const handleUpdate = async (data: Record<string, string>) => {
    if (selectedCoder) {
      await updateCoder.mutateAsync({ id: selectedCoder.id, data });
      setFormOpen(false);
      setSelectedCoder(null);
    }
  };

  const handleDelete = async () => {
    if (selectedCoder) {
      await deleteCoder.mutateAsync(selectedCoder.id);
      setDeleteOpen(false);
      setSelectedCoder(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-4 rounded-2xl border border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-neon-cyan/15 border border-neon-cyan/30 flex items-center justify-center glow-cyan">
            <Code2 className="w-6 h-6 text-neon-cyan" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-foreground tracking-tight">Directorio de Coders</h1>
            <p className="text-xs text-muted-foreground">Desarrolladores registrados y miembros de equipo</p>
          </div>
        </div>

        {!isCoder && (
          <Button
            onClick={() => setFormOpen(true)}
            className="h-10 bg-gradient-to-r from-neon-cyan to-blue-600 hover:from-neon-cyan/90 text-background font-bold text-xs rounded-xl shadow-lg glow-cyan"
          >
            <Plus className="w-4 h-4 mr-2" /> Agregar Coder
          </Button>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre, correo o Clan..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="glass-input h-11 pl-10 rounded-xl text-xs"
        />
      </div>

      {/* Table Container */}
      {coders.isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-neon-cyan/30 border-t-neon-cyan rounded-full animate-spin glow-cyan" />
        </div>
      ) : (
        <div className="glass-panel rounded-2xl overflow-hidden border border-white/5 shadow-2xl">
          <Table>
            <TableHeader className="bg-white/5">
              <TableRow className="hover:bg-transparent border-white/5">
                <TableHead className="text-xs font-bold text-muted-foreground w-12">#</TableHead>
                <TableHead className="text-xs font-bold text-muted-foreground">Perfil Coder</TableHead>
                <TableHead className="text-xs font-bold text-muted-foreground">Correo</TableHead>
                <TableHead className="text-xs font-bold text-muted-foreground">Clan Asignado</TableHead>
                {!isCoder && <TableHead className="text-xs font-bold text-muted-foreground text-right">Acciones</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isCoder ? 4 : 5} className="text-center text-muted-foreground py-12 text-xs">
                    No se encontraron Coders que coincidan con la búsqueda
                  </TableCell>
                </TableRow>
              ) : (
                filtered?.map((coder, i) => (
                  <TableRow key={coder.id} className="border-white/5 hover:bg-white/5 transition-colors">
                    <TableCell className="text-xs font-medium text-muted-foreground">{i + 1}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-neon-cyan/15 border border-neon-cyan/30 flex items-center justify-center font-bold text-xs text-neon-cyan">
                          {coder.name.charAt(0)}
                        </div>
                        <span className="font-bold text-xs text-foreground">{coder.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{coder.email}</TableCell>
                    <TableCell>
                      {coder.clan ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-neon-magenta/15 text-neon-magenta border border-neon-magenta/30">
                          <Shield className="w-3 h-3" />
                          {coder.clan.name}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground/60 italic">Sin Asignar</span>
                      )}
                    </TableCell>
                    {!isCoder && (
                      <TableCell className="text-right">
                        <div className="flex gap-1 justify-end">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-8 h-8 text-muted-foreground hover:text-neon-cyan hover:bg-neon-cyan/15 rounded-xl"
                            onClick={() => { setSelectedCoder(coder); setFormOpen(true); }}
                            title="Editar Coder"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-8 h-8 text-muted-foreground hover:text-destructive hover:bg-destructive/15 rounded-xl"
                            onClick={() => { setSelectedCoder(coder); setDeleteOpen(true); }}
                            title="Eliminar Coder"
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

      {/* Form Dialog */}
      <CoderForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setSelectedCoder(null); }}
        onSubmit={selectedCoder ? handleUpdate : handleCreate}
        coder={selectedCoder}
        isLoading={createCoder.isPending || updateCoder.isPending}
      />

      {/* Delete Dialog */}
      <DeleteCoderDialog
        open={deleteOpen}
        onClose={() => { setDeleteOpen(false); setSelectedCoder(null); }}
        onConfirm={handleDelete}
        coderName={selectedCoder?.name || ''}
        isLoading={deleteCoder.isPending}
      />
    </div>
  );
}
