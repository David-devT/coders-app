import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useTeamLeaders } from '../../hooks/useTeamLeaders';
import { useCoders } from '../../hooks/useCoders';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, Plus, Search, ArrowUp, ArrowDown, Users, ShieldCheck, Shield, ChevronLeft, ChevronRight } from 'lucide-react';
import TeamLeaderForm from './TeamLeaderForm';
import DeleteTeamLeaderDialog from './DeleteTeamLeaderDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import type { TeamLeader } from '../../types';

// Tabla administrativa exclusiva para la gestión de líderes de equipo, promociones y degradaciones
export default function TeamLeadersTable() {
  const { teamLeaders, createTeamLeader, updateTeamLeader, deleteTeamLeader, promoteCoder, demoteTL } = useTeamLeaders();
  const { coders } = useCoders();
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [promoteOpen, setPromoteOpen] = useState(false);
  const [demoteOpen, setDemoteOpen] = useState(false);
  const [selectedTL, setSelectedTL] = useState<TeamLeader | null>(null);
  const [selectedCoderId, setSelectedCoderId] = useState('');
  const [search, setSearch] = useState('');

  // Control de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Reinicia paginación si se busca
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // Filtra líderes por nombre, correo o rol
  const filtered = teamLeaders.data?.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.email.toLowerCase().includes(search.toLowerCase()) ||
      t.role.toLowerCase().includes(search.toLowerCase())
  );

  const totalItems = filtered?.length || 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const paginatedItems = filtered?.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Registra un nuevo Team Leader
  const handleCreate = async (data: Record<string, string>) => {
    try {
      await createTeamLeader.mutateAsync(data as { name: string; email: string; password: string });
      toast.success('¡Team Leader creado exitosamente!');
      setFormOpen(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Error al crear Team Leader');
    }
  };

  // Actualiza los datos de un líder existente
  const handleUpdate = async (data: Record<string, string>) => {
    if (selectedTL) {
      try {
        await updateTeamLeader.mutateAsync({ id: selectedTL.id, data });
        toast.success('¡Team Leader actualizado exitosamente!');
        setFormOpen(false);
        setSelectedTL(null);
      } catch (err: any) {
        toast.error(err?.response?.data?.message || 'Error al actualizar Team Leader');
      }
    }
  };

  // Elimina un Team Leader
  const handleDelete = async () => {
    if (selectedTL) {
      try {
        await deleteTeamLeader.mutateAsync(selectedTL.id);
        toast.success('Team Leader eliminado exitosamente');
        setDeleteOpen(false);
        setSelectedTL(null);
      } catch (err: any) {
        toast.error(err?.response?.data?.message || 'Error al eliminar Team Leader');
      }
    }
  };

  // Promociona a un Coder existente al rol de Team Leader
  const handlePromote = async () => {
    if (!selectedCoderId) {
      toast.error('Selecciona un coder para promover');
      return;
    }
    try {
      await promoteCoder.mutateAsync(selectedCoderId);
      toast.success('¡Coder promovido a Team Leader exitosamente!');
      setPromoteOpen(false);
      setSelectedCoderId('');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Error al promover coder');
    }
  };

  // Degrada a un Team Leader al rol de Coder
  const handleDemote = async () => {
    if (!selectedTL) return;
    try {
      await demoteTL.mutateAsync(selectedTL.id);
      toast.success('¡Team Leader degradado a Coder exitosamente!');
      setDemoteOpen(false);
      setSelectedTL(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Error al degradar Team Leader');
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado con título y acciones de creación y promoción */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-4 rounded-2xl border border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#AB978C]/15 border border-[#AB978C]/30 flex items-center justify-center glow-bronze">
            <Users className="w-6 h-6 text-[#AB978C]" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-foreground tracking-tight">Directorio de Team Leaders</h1>
            <p className="text-xs text-muted-foreground">Líderes técnicos, roles jerárquicos y asignación de clanes</p>
          </div>
        </div>

        <div className="flex gap-2">
          {/* Modal de ascenso de Coder */}
          <Button
            variant="outline"
            onClick={() => setPromoteOpen(true)}
            className="h-10 border-[#6B7C98]/40 text-[#6B7C98] hover:bg-[#6B7C98]/15 rounded-xl font-bold text-xs"
          >
            <ArrowUp className="w-4 h-4 mr-1.5" /> Promover Coder
          </Button>

          {/* Modal de creación directa */}
          <Button
            onClick={() => setFormOpen(true)}
            className="h-10 bg-[#AB978C] hover:bg-[#AB978C]/90 text-[#0E1015] font-extrabold text-xs rounded-xl shadow-lg glow-bronze transition-all"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Agregar Leader
          </Button>
        </div>
      </div>

      {/* Barra de búsqueda */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre, correo o rol..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="glass-input h-11 pl-10 rounded-xl text-xs"
        />
      </div>

      {/* Tabla de líderes de equipo */}
      {teamLeaders.isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-[#AB978C]/30 border-t-[#AB978C] rounded-full animate-spin glow-bronze" />
        </div>
      ) : (
        <div className="glass-panel rounded-2xl overflow-hidden border border-white/5 shadow-2xl">
          <Table>
            <TableHeader className="bg-white/5">
              <TableRow className="hover:bg-transparent border-white/5">
                <TableHead className="text-xs font-bold text-muted-foreground w-12">#</TableHead>
                <TableHead className="text-xs font-bold text-muted-foreground">Líder de Equipo</TableHead>
                <TableHead className="text-xs font-bold text-muted-foreground">Correo</TableHead>
                <TableHead className="text-xs font-bold text-muted-foreground">Rol</TableHead>
                <TableHead className="text-xs font-bold text-muted-foreground">Clans a Cargo</TableHead>
                <TableHead className="text-xs font-bold text-muted-foreground text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-12 text-xs">
                    No se encontraron Team Leaders que coincidan con la búsqueda
                  </TableCell>
                </TableRow>
              ) : (
                paginatedItems?.map((tl, i) => (
                  <TableRow key={tl.id} className="border-white/5 hover:bg-white/5 transition-colors">
                    <TableCell className="text-xs font-medium text-muted-foreground">{(currentPage - 1) * pageSize + i + 1}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#AB978C] to-[#6B7C98] flex items-center justify-center font-bold text-xs text-[#0E1015]">
                          {tl.name.charAt(0)}
                        </div>
                        <span className="font-bold text-xs text-foreground">{tl.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{tl.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full uppercase ${
                          tl.role === 'admin'
                            ? 'bg-[#AB978C]/15 text-[#AB978C] border-[#AB978C]/40'
                            : 'bg-[#6B7C98]/15 text-[#6B7C98] border-[#6B7C98]/40'
                        }`}
                      >
                        {tl.role === 'admin' ? (
                          <><ShieldCheck className="w-3 h-3 mr-1 inline" /> Admin</>
                        ) : (
                          <><Shield className="w-3 h-3 mr-1 inline" /> Team Leader</>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {tl.clans && tl.clans.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {tl.clans.map((c) => (
                            <span key={c.id} className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#6B7C98]/15 text-[#6B7C98] border border-[#6B7C98]/30">
                              {c.name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground/60 italic">Sin Clans</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end">
                        {tl.role !== 'admin' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-8 h-8 text-muted-foreground hover:text-amber-400 hover:bg-amber-400/10 rounded-xl"
                            onClick={() => { setSelectedTL(tl); setDemoteOpen(true); }}
                            title="Degradar a Coder"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-8 h-8 text-muted-foreground hover:text-[#AB978C] hover:bg-[#AB978C]/15 rounded-xl"
                          onClick={() => { setSelectedTL(tl); setFormOpen(true); }}
                          title="Editar Leader"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        {tl.role !== 'admin' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-8 h-8 text-muted-foreground hover:text-destructive hover:bg-destructive/15 rounded-xl"
                            onClick={() => { setSelectedTL(tl); setDeleteOpen(true); }}
                            title="Eliminar Leader"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-white/5 bg-white/[0.02]">
              <span className="text-xs text-muted-foreground">
                Mostrando <span className="font-semibold text-foreground">{(currentPage - 1) * pageSize + 1}</span> -{' '}
                <span className="font-semibold text-foreground">{Math.min(currentPage * pageSize, totalItems)}</span> de{' '}
                <span className="font-semibold text-[#AB978C]">{totalItems}</span> líderes
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

      {/* Modal de formulario para Team Leader */}
      <TeamLeaderForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setSelectedTL(null); }}
        onSubmit={selectedTL ? handleUpdate : handleCreate}
        teamLeader={selectedTL}
        isLoading={createTeamLeader.isPending || updateTeamLeader.isPending}
      />

      {/* Modal de confirmación de eliminación */}
      <DeleteTeamLeaderDialog
        open={deleteOpen}
        onClose={() => { setDeleteOpen(false); setSelectedTL(null); }}
        onConfirm={handleDelete}
        teamLeaderName={selectedTL?.name || ''}
        isLoading={deleteTeamLeader.isPending}
      />

      {/* Diálogo modal para promover Coder a Team Leader */}
      <Dialog open={promoteOpen} onOpenChange={setPromoteOpen}>
        <DialogContent className="glass-card border-white/10 p-6 rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground">Promover Coder a Team Leader</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Selecciona un coder para otorgarle permisos de líder de equipo.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <select
              value={selectedCoderId}
              onChange={(e) => setSelectedCoderId(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl glass-input text-xs text-foreground focus:border-[#AB978C] focus:ring-1 focus:ring-[#AB978C]/30"
            >
              <option value="">Selecciona un coder...</option>
              {coders.data?.map((c) => (
                <option key={c.id} value={c.id} className="bg-card text-foreground">
                  {c.name} ({c.email})
                </option>
              ))}
            </select>
            <Button
              onClick={handlePromote}
              disabled={!selectedCoderId || promoteCoder.isPending}
              className="w-full h-11 bg-[#AB978C] hover:bg-[#AB978C]/90 text-[#0E1015] font-extrabold text-xs rounded-xl shadow-lg glow-bronze"
            >
              Confirmar Promoción
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Diálogo modal para degradar Team Leader a Coder */}
      <Dialog open={demoteOpen} onOpenChange={setDemoteOpen}>
        <DialogContent className="glass-card border-white/10 p-6 rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground">Degradar Team Leader</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              ¿Estás seguro de que deseas degradar a <strong>{selectedTL?.name}</strong> al rol de Coder? Perderá los permisos de administración y gestión de clanes.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setDemoteOpen(false)}
              className="flex-1 h-10 border-white/10 glass-panel text-xs"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleDemote}
              disabled={demoteTL.isPending}
              className="flex-1 h-10 bg-destructive hover:bg-destructive/90 text-white font-bold text-xs rounded-xl"
            >
              Confirmar Degradación
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
