import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createNotificationTemplate,
  getNotificationOverview,
  getNotificationTemplateOptions,
  getNotificationTemplates,
  updateNotificationTemplate,
} from '@/features/settings/notification/api'
import type {
  CreateNotificationTemplatePayload,
  NotificationOverviewPeriod,
  NotificationTemplatePayload,
} from '@/features/settings/notification/types'

export const notificationQueryKeys = {
  all: ['notifications'] as const,
  overview: (period: NotificationOverviewPeriod) =>
    [...notificationQueryKeys.all, 'overview', period] as const,
  templates: () => [...notificationQueryKeys.all, 'templates'] as const,
  templateOptions: () => [...notificationQueryKeys.all, 'template-options'] as const,
}

export function useGetNotificationTemplateOptions() {
  return useQuery({
    queryKey: notificationQueryKeys.templateOptions(),
    queryFn: getNotificationTemplateOptions,
    select: (response) => response.data,
  })
}

export function useGetNotificationTemplates() {
  return useQuery({
    queryKey: notificationQueryKeys.templates(),
    queryFn: getNotificationTemplates,
    select: (response) => response.data,
  })
}

export function useCreateNotificationTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateNotificationTemplatePayload) => createNotificationTemplate(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationQueryKeys.all })
    },
  })
}

export function useUpdateNotificationTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: NotificationTemplatePayload }) =>
      updateNotificationTemplate(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationQueryKeys.all })
    },
  })
}

export function useGetNotificationOverview(period: NotificationOverviewPeriod) {
  return useQuery({
    queryKey: notificationQueryKeys.overview(period),
    queryFn: () => getNotificationOverview(period),
    select: (response) => response.data,
    placeholderData: keepPreviousData,
  })
}
