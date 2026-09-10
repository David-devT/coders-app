import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useCoders } from '../../hooks/useCoders';
import { useAuthStore } from '../../stores/authStore';
import CoderForm from './CoderForm';
import DeleteCoderDialog from './DeleteCoderDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Pencil, Trash2, Code2, Shield, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Coder } from '../../types';

export default function CodersTable() {
  const user = useAuthStore((s) => s.user);
  const isCoder = 'role' in (user || {}) && (user as { role: string }).role === 'coder';

  const { coders, createCoder, updateCoder, deleteCoder } = useCoders();

  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedCoder, setSelectedCoder] = useState<Coder | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const filtered = coders.data?.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.clan?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const totalItems = filtered?.length || 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const paginatedItems = filtered?.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleCreate = async (data: Record<string, string>) => {
    try {
      await createCoder.mutateAsync(data as { name: string; email: string; password: string });
      toast.success('¡Coder creado exitosamente!');
      setFormOpen(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Error al crear Coder');
    }
  };

  const handleUpdate = async (data: Record<string, string>) => {
    if (selectedCoder) {
      try {
        await updateCoder.mutateAsync({ id: selectedCoder.id, data });
        toast.success('¡Perfil de Coder actualizado!');
        setFormOpen(false);
        setSelectedCoder(null);
      } catch (err: any) {
        toast.error(err?.response?.data?.message || 'Error al actualizar Coder');
      }
    }
  };

  const handleDelete = async () => {
    if (selectedCoder) {
      try {
        await deleteCoder.mutateAsync(selectedCoder.id);
        toast.success('Coder eliminado exitosamente');
        setDeleteOpen(false);
        setSelectedCoder(null);
      } catch (err: any) {
        toast.error(err?.response?.data?.message || 'Error al eliminar Coder');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-4 rounded-2xl border border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#AB978C]/15 border border-[#AB978C]/30 flex items-center justify-center glow-bronze">
            <Code2 className="w-6 h-6 text-[#AB978C]" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-foreground tracking-tight">Directorio de Coders</h1>
            <p className="text-xs text-muted-foreground">Desarrolladores registrados y miembros de equipo</p>
          </div>
        </div>

        {!isCoder && (
          <Button
            onClick={() => setFormOpen(true)}
            className="h-10 bg-[#AB978C] hover:bg-[#AB978C]/90 text-[#0E1015] font-extrabold text-xs rounded-xl shadow-lg glow-bronze transition-all"
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
          <div className="w-8 h-8 border-2 border-[#AB978C]/30 border-t-[#AB978C] rounded-full animate-spin glow-bronze" />
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
                paginatedItems?.map((coder, i) => (
                  <TableRow key={coder.id} className="border-white/5 hover:bg-white/5 transition-colors">
                    <TableCell className="text-xs font-medium text-muted-foreground">{(currentPage - 1) * pageSize + i + 1}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-[#6B7C98]/20 border border-[#6B7C98]/35 flex items-center justify-center font-bold text-xs text-[#E9E6E7]">
                          {coder.name.charAt(0)}
                        </div>
                        <span className="font-bold text-xs text-foreground">{coder.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{coder.email}</TableCell>
                    <TableCell>
                      {coder.clan ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#6B7C98]/15 text-[#6B7C98] border border-[#6B7C98]/30">
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
                            className="w-8 h-8 text-muted-foreground hover:text-[#AB978C] hover:bg-[#AB978C]/15 rounded-xl"
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

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-white/5 bg-white/[0.02]">
              <span className="text-xs text-muted-foreground">
                Mostrando <span className="font-semibold text-foreground">{(currentPage - 1) * pageSize + 1}</span> -{' '}
                <span className="font-semibold text-foreground">{Math.min(currentPage * pageSize, totalItems)}</span> de{' '}
                <span className="font-semibold text-[#AB978C]">{totalItems}</span> coders
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="h-8 px-2.5 text-xs bg-white/5 border-white/10 hover:bg-white/10 text-foreground disabled:opacity-40"
                >
                  <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Anterior
                </Button>
                <span className="text-xs font-medium px-2 text-[#E9E6E7]">
                  {currentPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="h-8 px-2.5 text-xs bg-white/5 border-white/10 hover:bg-white/10 text-foreground disabled:opacity-40"
                >
                  Siguiente <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            </div>
          )}
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
