import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createClient,
  deleteClient,
  getClient,
  getClients,
  updateClient,
  type CreateClientInput,
  type DeleteClientInput,
  type GetClientInput,
  type GetClientsInput,
  type UpdateClientInput,
} from '@/features/company/client/api'

export const clientQueryKeys = {
  all: ['company-clients'] as const,
  lists: () => [...clientQueryKeys.all, 'list'] as const,
  list: (input?: GetClientsInput) => [...clientQueryKeys.lists(), input] as const,
  details: () => [...clientQueryKeys.all, 'detail'] as const,
  detail: (clientId: string) => [...clientQueryKeys.details(), clientId] as const,
}

export function useGetClients(input: GetClientsInput = {}) {
  return useQuery({
    queryKey: clientQueryKeys.list(input),
    queryFn: () => getClients(input),
    select: (res) => res.data,
    placeholderData: keepPreviousData,
  })
}

export function useGetClient(input: GetClientInput) {
  return useQuery({
    queryKey: clientQueryKeys.detail(input.clientId),
    queryFn: () => getClient(input),
    select: (res) => res.data,
    enabled: Boolean(input.clientId),
  })
}

export function useCreateClient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateClientInput) => createClient(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientQueryKeys.all })
    },
  })
}

export function useUpdateClient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateClientInput) => updateClient(input),
    onSuccess: (_, input) => {
      queryClient.invalidateQueries({ queryKey: clientQueryKeys.all })
      queryClient.invalidateQueries({ queryKey: clientQueryKeys.detail(input.clientId) })
    },
  })
}

export function useDeleteClient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: DeleteClientInput) => deleteClient(input),
    onSuccess: (_, input) => {
      queryClient.invalidateQueries({ queryKey: clientQueryKeys.all })
      queryClient.removeQueries({ queryKey: clientQueryKeys.detail(input.clientId) })
    },
  })
}
