import { useState } from 'react';
import { useCoders } from '../../hooks/useCoders';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pencil, Trash2, Plus, Search } from 'lucide-react';
import CoderForm from './CoderForm';
import DeleteCoderDialog from './DeleteCoderDialog';
import { useAuthStore } from '../../stores/authStore';
import type { Coder } from '../../types';

// Tabla de coders con búsqueda, creación, edición y eliminación
// Solo admin y teamLeader pueden crear, editar y eliminar coders.
// Los coders solo pueden ver la lista.
export default function CodersTable() {
  const { coders, createCoder, updateCoder, deleteCoder } = useCoders();
  const user = useAuthStore((s) => s.user);
  // Un coder es un usuario sin campo 'role' o con role === 'coder'
  const isCoder = !('role' in (user || {})) || (user as { role?: string }).role === 'coder';
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedCoder, setSelectedCoder] = useState<Coder | null>(null);
  const [search, setSearch] = useState('');

  // Filtrado client-side por nombre, email o nombre de clan
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Coders</h1>
        {/* Botón "Add Coder": solo visible para admin y teamLeader */}
        {!isCoder && (
          <Button onClick={() => setFormOpen(true)} className="bg-neon-cyan text-background hover:bg-neon-cyan/90">
            <Plus className="w-4 h-4 mr-2" /> Add Coder
          </Button>
        )}
      </div>

      {/* Campo de búsqueda */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, email or clan..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-input border-border focus:border-neon-cyan focus:ring-neon-cyan/20"
        />
      </div>

      {/* Spinner de carga o tabla de datos */}
      {coders.isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-neon-cyan/30 border-t-neon-cyan rounded-full animate-spin" />
        </div>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border">
                <TableHead className="text-muted-foreground">#</TableHead>
                <TableHead className="text-muted-foreground">Name</TableHead>
                <TableHead className="text-muted-foreground">Email</TableHead>
                <TableHead className="text-muted-foreground">Clan</TableHead>
                {/* Columna "Actions": solo visible para admin y teamLeader */}
                {!isCoder && <TableHead className="text-muted-foreground text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isCoder ? 4 : 5} className="text-center text-muted-foreground py-8">
                    No coders found
                  </TableCell>
                </TableRow>
              ) : (
                filtered?.map((coder, i) => (
                  <TableRow key={coder.id} className="border-border hover:bg-muted/50">
                    <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                    <TableCell className="font-medium text-foreground">{coder.name}</TableCell>
                    <TableCell className="text-muted-foreground">{coder.email}</TableCell>
                    <TableCell>
                      {coder.clan ? (
                        <span className="px-2 py-1 rounded-full text-xs bg-neon-magenta/10 text-neon-magenta border border-neon-magenta/20">
                          {coder.clan.name}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    {/* Botones editar/eliminar: solo visible para admin y teamLeader */}
                    {!isCoder && (
                      <TableCell className="text-right">
                        <div className="flex gap-1 justify-end">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="hover:text-neon-cyan hover:bg-neon-cyan/10"
                            onClick={() => { setSelectedCoder(coder); setFormOpen(true); }}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="hover:text-destructive hover:bg-destructive/10"
                            onClick={() => { setSelectedCoder(coder); setDeleteOpen(true); }}
                          >
                            <Trash2 className="w-4 h-4" />
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

      {/* Diálogo de formulario: crear o editar coder */}
      <CoderForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setSelectedCoder(null); }}
        onSubmit={selectedCoder ? handleUpdate : handleCreate}
        coder={selectedCoder}
        isLoading={createCoder.isPending || updateCoder.isPending}
      />

      {/* Diálogo de confirmación de eliminación */}
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
