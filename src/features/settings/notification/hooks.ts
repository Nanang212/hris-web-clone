import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { getNotificationOverview } from '@/features/settings/notification/api'
import type { NotificationOverviewPeriod } from '@/features/settings/notification/types'

export const notificationQueryKeys = {
  all: ['notifications'] as const,
  overview: (period: NotificationOverviewPeriod) =>
    [...notificationQueryKeys.all, 'overview', period] as const,
}

export function useGetNotificationOverview(period: NotificationOverviewPeriod) {
  return useQuery({
    queryKey: notificationQueryKeys.overview(period),
    queryFn: () => getNotificationOverview(period),
    select: (response) => response.data,
    placeholderData: keepPreviousData,
  })
}
