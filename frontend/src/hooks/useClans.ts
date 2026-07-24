import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clansApi } from '../api/clans.api';

// Hook personalizado para operaciones CRUD de clans con React Query
export const useClans = () => {
  const queryClient = useQueryClient();

  // Query: listar todos los clans (key: 'clans')
  const clans = useQuery({
    queryKey: ['clans'],
    queryFn: clansApi.getAll,
  });

  // Mutación: crear clan -> invalida caché de clans
  const createClan = useMutation({
    mutationFn: clansApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clans'] }),
  });

  // Mutación: actualizar clan -> invalida caché de clans
  const updateClan = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) => clansApi.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clans'] }),
  });

  // Mutación: eliminar clan -> invalida caché de clans y coders (se desasocian)
  const deleteClan = useMutation({
    mutationFn: clansApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clans'] });
      queryClient.invalidateQueries({ queryKey: ['coders'] });
    },
  });

  return { clans, createClan, updateClan, deleteClan };
};
