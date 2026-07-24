import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { codersApi } from '../api/coders.api';

// Hook personalizado para operaciones CRUD de Coders con React Query
export const useCoders = () => {
  const queryClient = useQueryClient();

  // Query: obtener lista de coders (se cachea con key 'coders')
  const coders = useQuery({
    queryKey: ['coders'],
    queryFn: codersApi.getAll,
  });

  // Mutación: crear coder → invalida caché de 'coders' para refrescar lista
  const createCoder = useMutation({
    mutationFn: codersApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['coders'] }),
  });

  // Mutación: actualizar coder → invalida caché de 'coders'
  const updateCoder = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) => codersApi.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['coders'] }),
  });

  // Mutación: eliminar coder → invalida caché de 'coders' y 'clans' (relación bidireccional)
  const deleteCoder = useMutation({
    mutationFn: codersApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coders'] });
      queryClient.invalidateQueries({ queryKey: ['clans'] });
    },
  });

  return { coders, createCoder, updateCoder, deleteCoder };
};
