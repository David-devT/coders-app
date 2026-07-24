import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { teamLeadersApi } from '../api/teamLeaders.api';

// Hook personalizado para operaciones CRUD de team leaders con React Query
export const useTeamLeaders = () => {
  const queryClient = useQueryClient();

  // Query: listar todos los team leaders (key: 'teamLeaders')
  const teamLeaders = useQuery({
    queryKey: ['teamLeaders'],
    queryFn: teamLeadersApi.getAll,
  });

  // Mutación: crear team leader -> invalida caché de teamLeaders
  const createTeamLeader = useMutation({
    mutationFn: teamLeadersApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['teamLeaders'] }),
  });

  // Mutación: actualizar team leader -> invalida caché de teamLeaders
  const updateTeamLeader = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) => teamLeadersApi.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['teamLeaders'] }),
  });

  // Mutación: eliminar team leader -> invalida caché de teamLeaders y clans (se desasocian)
  const deleteTeamLeader = useMutation({
    mutationFn: teamLeadersApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teamLeaders'] });
      queryClient.invalidateQueries({ queryKey: ['clans'] });
    },
  });

  return { teamLeaders, createTeamLeader, updateTeamLeader, deleteTeamLeader };
};
