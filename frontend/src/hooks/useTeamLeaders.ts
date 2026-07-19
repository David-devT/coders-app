import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { teamLeadersApi } from '../api/teamLeaders.api';

export const useTeamLeaders = () => {
  const queryClient = useQueryClient();

  const teamLeaders = useQuery({
    queryKey: ['teamLeaders'],
    queryFn: teamLeadersApi.getAll,
  });

  const createTeamLeader = useMutation({
    mutationFn: teamLeadersApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['teamLeaders'] }),
  });

  const updateTeamLeader = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) => teamLeadersApi.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['teamLeaders'] }),
  });

  const deleteTeamLeader = useMutation({
    mutationFn: teamLeadersApi.remove,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['teamLeaders'] }),
  });

  return { teamLeaders, createTeamLeader, updateTeamLeader, deleteTeamLeader };
};
