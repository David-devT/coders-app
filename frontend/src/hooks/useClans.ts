import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clansApi } from '../api/clans.api';

export const useClans = () => {
  const queryClient = useQueryClient();

  const clans = useQuery({
    queryKey: ['clans'],
    queryFn: clansApi.getAll,
  });

  const createClan = useMutation({
    mutationFn: clansApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clans'] }),
  });

  const updateClan = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) => clansApi.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clans'] }),
  });

  const deleteClan = useMutation({
    mutationFn: clansApi.remove,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clans'] }),
  });

  return { clans, createClan, updateClan, deleteClan };
};
