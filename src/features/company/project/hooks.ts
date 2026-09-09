import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createProject,
  deleteProject,
  getProjects,
  updateProject,
  type CreateProjectInput,
  type DeleteProjectInput,
  type GetProjectsInput,
  type UpdateProjectInput,
} from '@/features/company/project/api'

export const projectQueryKeys = {
  all: ['company-projects'] as const,
  lists: () => [...projectQueryKeys.all, 'list'] as const,
  list: (input?: GetProjectsInput) => [...projectQueryKeys.lists(), input] as const,
}

export function useGetProjects(input: GetProjectsInput = {}) {
  return useQuery({
    queryKey: projectQueryKeys.list(input),
    queryFn: () => getProjects(input),
    select: (res) => res.data,
    placeholderData: keepPreviousData,
  })
}

export function useCreateProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateProjectInput) => createProject(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.all })
    },
  })
}

export function useUpdateProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateProjectInput) => updateProject(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.all })
    },
  })
}

export function useDeleteProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: DeleteProjectInput) => deleteProject(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.all })
    },
  })
}
