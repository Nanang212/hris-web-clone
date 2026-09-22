import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { getAttendanceSettings, updateAttendanceSettings } from '@/features/attendance/api'
import type { UpdateAttendanceSettingsInput } from './types'

export const attendanceQueryKeys = {
  all: ['attendance'] as const,
  settings: () => [...attendanceQueryKeys.all, 'settings'] as const,
}

export function useGetAttendanceSettings() {
  return useQuery({
    queryKey: attendanceQueryKeys.settings(),
    queryFn: getAttendanceSettings,
    select: (response) => response.data,
  })
}

export function useUpdateAttendanceSettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateAttendanceSettingsInput) => updateAttendanceSettings(input),
    onSuccess: (response) => {
      queryClient.setQueryData(attendanceQueryKeys.settings(), response)
      queryClient.invalidateQueries({ queryKey: attendanceQueryKeys.all })
    },
  })
}
