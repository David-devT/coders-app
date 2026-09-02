import { useState } from 'react';
import { useTeamLeaders } from '../../hooks/useTeamLeaders';
import { useCoders } from '../../hooks/useCoders';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, Plus, Search, ArrowUp, ArrowDown, Users, ShieldCheck, Shield } from 'lucide-react';
import TeamLeaderForm from './TeamLeaderForm';
import DeleteTeamLeaderDialog from './DeleteTeamLeaderDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import type { TeamLeader } from '../../types';

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

  const handlePromote = async () => {
    if (!selectedCoderId) return;
    await promoteCoder.mutateAsync(selectedCoderId);
    setPromoteOpen(false);
    setSelectedCoderId('');
  };

  const handleDemote = async () => {
    if (!selectedTL) return;
    await demoteTL.mutateAsync(selectedTL.id);
    setDemoteOpen(false);
    setSelectedTL(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-4 rounded-2xl border border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-neon-green/15 border border-neon-green/30 flex items-center justify-center glow-green">
            <Users className="w-6 h-6 text-neon-green" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-foreground tracking-tight">Directorio de Team Leaders</h1>
            <p className="text-xs text-muted-foreground">Gestiona líderes, promueve Coders y supervisa la asignación de Clans</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setPromoteOpen(true)}
            className="h-10 glass-panel border border-neon-cyan/40 text-neon-cyan hover:bg-neon-cyan/15 font-bold text-xs rounded-xl"
          >
            <ArrowUp className="w-4 h-4 mr-2" /> Promover Coder
          </Button>
          <Button
            onClick={() => setFormOpen(true)}
            className="h-10 bg-gradient-to-r from-neon-green to-emerald-600 hover:from-neon-green/90 text-background font-bold text-xs rounded-xl shadow-lg glow-green"
          >
            <Plus className="w-4 h-4 mr-2" /> Agregar Team Leader
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre, correo o rol..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="glass-input h-11 pl-10 rounded-xl text-xs"
        />
      </div>

      {/* Table Container */}
      {teamLeaders.isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-neon-green/30 border-t-neon-green rounded-full animate-spin glow-green" />
        </div>
      ) : (
        <div className="glass-panel rounded-2xl overflow-hidden border border-white/5 shadow-2xl">
          <Table>
            <TableHeader className="bg-white/5">
              <TableRow className="hover:bg-transparent border-white/5">
                <TableHead className="text-xs font-bold text-muted-foreground w-12">#</TableHead>
                <TableHead className="text-xs font-bold text-muted-foreground">Perfil del Leader</TableHead>
                <TableHead className="text-xs font-bold text-muted-foreground">Correo</TableHead>
                <TableHead className="text-xs font-bold text-muted-foreground">Rol de Acceso</TableHead>
                <TableHead className="text-xs font-bold text-muted-foreground">Clans Liderados</TableHead>
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
                filtered?.map((tl, i) => (
                  <TableRow key={tl.id} className="border-white/5 hover:bg-white/5 transition-colors">
                    <TableCell className="text-xs font-medium text-muted-foreground">{i + 1}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-neon-green/15 border border-neon-green/30 flex items-center justify-center font-bold text-xs text-neon-green">
                          {tl.name.charAt(0)}
                        </div>
                        <span className="font-bold text-xs text-foreground">{tl.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{tl.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant={tl.role === 'admin' ? 'default' : 'secondary'}
                        className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                          tl.role === 'admin'
                            ? 'bg-neon-green/15 text-neon-green border border-neon-green/30'
                            : 'bg-white/10 text-foreground border border-white/10'
                        }`}
                      >
                        {tl.role === 'admin' && <ShieldCheck className="w-3 h-3 mr-1 inline" />}
                        {tl.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {tl.clans && tl.clans.length > 0 ? (
                        <div className="flex gap-1.5 flex-wrap">
                          {tl.clans.map((c) => (
                            <span key={c.id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-neon-magenta/15 text-neon-magenta border border-neon-magenta/30">
                              <Shield className="w-2.5 h-2.5" />
                              {c.name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground/60 italic">Sin Clans asignados</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end">
                        {tl.role !== 'admin' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-8 h-8 text-muted-foreground hover:text-amber-400 hover:bg-amber-500/15 rounded-xl"
                            title="Degradar a Coder"
                            onClick={() => { setSelectedTL(tl); setDemoteOpen(true); }}
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-8 h-8 text-muted-foreground hover:text-neon-green hover:bg-neon-green/15 rounded-xl"
                          title="Editar Team Leader"
                          onClick={() => { setSelectedTL(tl); setFormOpen(true); }}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-8 h-8 text-muted-foreground hover:text-destructive hover:bg-destructive/15 rounded-xl"
                          title="Eliminar Team Leader"
                          onClick={() => { setSelectedTL(tl); setDeleteOpen(true); }}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* Form Modal */}
      <TeamLeaderForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setSelectedTL(null); }}
        onSubmit={selectedTL ? handleUpdate : handleCreate}
        teamLeader={selectedTL}
        isLoading={createTeamLeader.isPending || updateTeamLeader.isPending}
      />

      {/* Delete Dialog */}
      <DeleteTeamLeaderDialog
        open={deleteOpen}
        onClose={() => { setDeleteOpen(false); setSelectedTL(null); }}
        onConfirm={handleDelete}
        teamLeaderName={selectedTL?.name || ''}
        isLoading={deleteTeamLeader.isPending}
      />

      {/* Promote Coder Modal */}
      <Dialog open={promoteOpen} onOpenChange={setPromoteOpen}>
        <DialogContent className="glass-card border-white/10 p-6 rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground">Promover Coder a Team Leader</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              El Coder seleccionado obtendrá privilegios de Team Leader y saldrá de la lista de Coders.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Seleccionar Coder</label>
              <select
                value={selectedCoderId}
                onChange={(e) => setSelectedCoderId(e.target.value)}
                className="w-full h-10 px-3 rounded-xl glass-input text-xs text-foreground focus:border-neon-green focus:ring-1 focus:ring-neon-green/20"
              >
                <option value="" className="bg-card">Selecciona un Coder para promover...</option>
                {coders.data?.map((coder) => (
                  <option key={coder.id} value={coder.id} className="bg-card text-foreground">
                    {coder.name} ({coder.email})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-white/5">
              <Button variant="outline" onClick={() => { setPromoteOpen(false); setSelectedCoderId(''); }} className="h-9 glass-panel border-white/10 text-xs font-semibold">
                Cancelar
              </Button>
              <Button
                onClick={handlePromote}
                disabled={!selectedCoderId || promoteCoder.isPending}
                className="h-9 bg-gradient-to-r from-neon-green to-emerald-600 hover:from-neon-green/90 text-background font-bold text-xs rounded-xl shadow-lg glow-green"
              >
                {promoteCoder.isPending ? 'Promoviendo...' : 'Promover Coder'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Demote Modal */}
      <Dialog open={demoteOpen} onOpenChange={setDemoteOpen}>
        <DialogContent className="glass-card border-white/10 p-6 rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground">Degradar Team Leader</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              ¿Estás seguro de que deseas degradar a <strong className="text-foreground">{selectedTL?.name}</strong> al rol de Coder?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-3 border-t border-white/5">
            <Button variant="outline" onClick={() => { setDemoteOpen(false); setSelectedTL(null); }} className="h-9 glass-panel border-white/10 text-xs font-semibold">
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDemote} disabled={demoteTL.isPending} className="h-9 font-bold text-xs rounded-xl">
              {demoteTL.isPending ? 'Degradando...' : 'Confirmar Degradación'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
