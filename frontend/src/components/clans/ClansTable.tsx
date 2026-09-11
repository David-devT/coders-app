import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useClans } from '../../hooks/useClans';
import { useTasks } from '../../hooks/useTasks';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pencil, Trash2, Plus, Search, Shield, Users, CheckSquare, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import ClanForm from './ClanForm';
import DeleteClanDialog from './DeleteClanDialog';
import { useAuthStore } from '../../stores/authStore';
import type { Clan } from '../../types';

// Tabla de administración de clanes técnicos y asignación de líderes y miembros
export default function ClansTable() {
  const { clans, createClan, updateClan, deleteClan } = useClans();
  const { tasks } = useTasks();
  const user = useAuthStore((s) => s.user);
  const isCoder = !('role' in (user || {})) || (user as { role?: string }).role === 'coder';
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedClan, setSelectedClan] = useState<Clan | null>(null);
  const [search, setSearch] = useState('');

  // Control de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Reinicia a la primera página al escribir en el buscador
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // Filtrado de clanes por nombre, descripción o nombre del líder
  const filtered = clans.data?.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.description?.toLowerCase().includes(search.toLowerCase()) ||
      c.teamLeader?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const totalItems = filtered?.length || 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const paginatedItems = filtered?.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Registra un nuevo clan
  const handleCreate = async (data: Record<string, string>) => {
    try {
      await createClan.mutateAsync(data as { name: string; description?: string; teamLeader?: string });
      toast.success('¡Clan creado exitosamente!');
      setFormOpen(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Error al crear clan');
    }
  };

  // Actualiza los datos de un clan existente
  const handleUpdate = async (data: Record<string, string>) => {
    if (selectedClan) {
      try {
        await updateClan.mutateAsync({ id: selectedClan.id, data });
        toast.success('¡Clan actualizado exitosamente!');
        setFormOpen(false);
        setSelectedClan(null);
      } catch (err: any) {
        toast.error(err?.response?.data?.message || 'Error al actualizar clan');
      }
    }
  };

  // Elimina el clan seleccionado
  const handleDelete = async () => {
    if (selectedClan) {
      try {
        await deleteClan.mutateAsync(selectedClan.id);
        toast.success('Clan eliminado exitosamente');
        setDeleteOpen(false);
        setSelectedClan(null);
      } catch (err: any) {
        toast.error(err?.response?.data?.message || 'Error al eliminar clan');
      }
    }
  };

  // Exporta el directorio de clanes con sus métricas y líderes a CSV
  const handleExportClansCSV = () => {
    if (!filtered || filtered.length === 0) {
      toast.error('No hay clanes para exportar');
      return;
    }

    const headers = ['ID', 'Nombre Clan', 'Descripción', 'Team Leader', 'Total Coders', 'Tasks Activas'];
    const rows = filtered.map((clan) => {
      const activeTasksCount = tasks.data?.filter(
        (t) => t.clan?.id === clan.id && (t.status === 'pending' || t.status === 'review')
      ).length || 0;

      return [
        `"${clan.id}"`,
        `"${clan.name.replace(/"/g, '""')}"`,
        `"${(clan.description || '').replace(/"/g, '""')}"`,
        `"${clan.teamLeader ? clan.teamLeader.name : 'Sin Asignar'}"`,
        `"${clan.coders?.length || 0}"`,
        `"${activeTasksCount}"`,
      ];
    });

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `clans-report-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Directorio de clanes exportado a CSV');
  };

  return (
    <div className="flex-1 flex flex-col space-y-4 sm:space-y-6">
      {/* Encabezado con título del directorio y acciones */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 glass-panel p-3.5 sm:p-4 rounded-2xl border border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#AB978C]/15 border border-[#AB978C]/30 flex items-center justify-center glow-bronze shrink-0">
            <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-[#AB978C]" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold text-foreground tracking-tight">Directorio de Clanes</h1>
            <p className="text-[11px] sm:text-xs text-muted-foreground">Grupos de desarrollo y asignación de líderes de equipo</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Botón para exportar el listado a formato CSV */}
          <Button
            onClick={handleExportClansCSV}
            variant="outline"
            className="flex-1 sm:flex-initial h-10 text-xs font-bold rounded-xl border border-white/10 glass-panel text-muted-foreground hover:text-foreground hover:bg-white/5 cursor-pointer"
            title="Exportar clanes a CSV"
          >
            <Download className="w-4 h-4 mr-1.5 sm:mr-2 text-[#6B7C98]" />
            <span className="truncate">Exportar CSV</span>
          </Button>

          {/* Solo administradores y team leaders pueden crear nuevos clanes */}
          {!isCoder && (
            <Button
              onClick={() => setFormOpen(true)}
              className="flex-1 sm:flex-initial h-10 bg-[#AB978C] hover:bg-[#AB978C]/90 text-[#0E1015] font-extrabold text-xs rounded-xl shadow-lg glow-bronze transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 mr-2" /> Agregar Clan
            </Button>
          )}
        </div>
      </div>

      {/* Barra de búsqueda predictiva */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar clan por nombre, descripción o líder..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="glass-input h-11 pl-10 rounded-xl text-xs"
        />
      </div>

      {/* Tabla con listado de clanes y sus miembros */}
      {clans.isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-[#6B7C98]/30 border-t-[#6B7C98] rounded-full animate-spin glow-slate" />
        </div>
      ) : (
        <div className="flex-1 flex flex-col justify-between glass-panel rounded-2xl overflow-hidden border border-white/5 shadow-2xl min-h-[360px] sm:min-h-0">
          <div className="overflow-x-auto touch-scroll">
            <Table className="min-w-[650px] sm:min-w-full">
              <TableHeader className="bg-white/5">
                <TableRow className="hover:bg-transparent border-white/5">
                  <TableHead className="text-xs font-bold text-muted-foreground w-12">#</TableHead>
                  <TableHead className="text-xs font-bold text-muted-foreground">Nombre Clan</TableHead>
                  <TableHead className="text-xs font-bold text-muted-foreground">Descripción</TableHead>
                  <TableHead className="text-xs font-bold text-muted-foreground">Team Leader</TableHead>
                  <TableHead className="text-xs font-bold text-muted-foreground text-center">Coders</TableHead>
                  <TableHead className="text-xs font-bold text-muted-foreground text-center">Tasks Activas</TableHead>
                  {!isCoder && <TableHead className="text-xs font-bold text-muted-foreground text-right">Acciones</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={isCoder ? 6 : 7} className="text-center text-muted-foreground py-12 text-xs">
                      No se encontraron Clans que coincidan con la búsqueda
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedItems?.map((clan, i) => {
                    // Conteo de tareas técnicas activas en pipeline para este clan
                    const activeTasksCount = tasks.data?.filter(
                      (t) => t.clan?.id === clan.id && (t.status === 'pending' || t.status === 'review')
                    ).length || 0;

                    return (
                      <TableRow key={clan.id} className="border-white/5 hover:bg-white/5 transition-colors">
                        <TableCell className="text-xs font-medium text-muted-foreground">{(currentPage - 1) * pageSize + i + 1}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-[#AB978C]/15 border border-[#AB978C]/30 flex items-center justify-center font-bold text-xs text-[#AB978C]">
                              {clan.name.charAt(0)}
                            </div>
                            <span className="font-bold text-xs text-foreground">{clan.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-xs truncate">
                          {clan.description || <span className="italic text-muted-foreground/50">Sin descripción</span>}
                        </TableCell>
                        <TableCell>
                          {clan.teamLeader ? (
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-bold text-[#6B7C98]">
                                {clan.teamLeader.name.charAt(0)}
                              </div>
                              <span className="text-xs font-semibold text-foreground">{clan.teamLeader.name}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground/60 italic">Sin Líder Asignado</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-muted-foreground">
                            <Users className="w-3 h-3 text-[#AB978C]" />
                            {clan.coders?.length || 0}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-[#6B7C98]">
                            <CheckSquare className="w-3 h-3" />
                            {activeTasksCount}
                          </span>
                        </TableCell>
                        {!isCoder && (
                          <TableCell className="text-right">
                            <div className="flex gap-1 justify-end">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="w-9 h-9 sm:w-8 sm:h-8 text-muted-foreground hover:text-[#AB978C] hover:bg-[#AB978C]/15 rounded-xl cursor-pointer"
                                onClick={() => { setSelectedClan(clan); setFormOpen(true); }}
                                title="Editar Clan"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="w-9 h-9 sm:w-8 sm:h-8 text-muted-foreground hover:text-destructive hover:bg-destructive/15 rounded-xl cursor-pointer"
                                onClick={() => { setSelectedClan(clan); setDeleteOpen(true); }}
                                title="Eliminar Clan"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Paginación de clanes responsiva */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-white/5 bg-white/[0.02]">
              <span className="text-xs text-muted-foreground text-center sm:text-left">
                Mostrando <span className="font-semibold text-foreground">{(currentPage - 1) * pageSize + 1}</span> -{' '}
                <span className="font-semibold text-foreground">{Math.min(currentPage * pageSize, totalItems)}</span> de{' '}
                <span className="font-semibold text-[#6B7C98]">{totalItems}</span> clanes
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="h-9 sm:h-8 px-3 text-xs bg-white/5 border-white/10 hover:bg-white/10 text-foreground disabled:opacity-40 cursor-pointer"
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
                  className="h-9 sm:h-8 px-3 text-xs bg-white/5 border-white/10 hover:bg-white/10 text-foreground disabled:opacity-40 cursor-pointer"
                >
                  Siguiente <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Diálogo modal para alta y edición de clanes */}
      <ClanForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setSelectedClan(null); }}
        onSubmit={selectedClan ? handleUpdate : handleCreate}
        clan={selectedClan}
        isLoading={createClan.isPending || updateClan.isPending}
      />

      {/* Diálogo modal de confirmación de eliminación de clan */}
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
