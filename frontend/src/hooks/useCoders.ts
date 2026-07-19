import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { codersApi } from '../api/coders.api';

export const useCoders = () => {
  const queryClient = useQueryClient();

  const coders = useQuery({
    queryKey: ['coders'],
    queryFn: codersApi.getAll,
  });

  const createCoder = useMutation({
    mutationFn: codersApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['coders'] }),
  });

  const updateCoder = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) => codersApi.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['coders'] }),
  });

  const deleteCoder = useMutation({
    mutationFn: codersApi.remove,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['coders'] }),
  });

  return { coders, createCoder, updateCoder, deleteCoder };
};
