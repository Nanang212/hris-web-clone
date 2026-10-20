import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { getAttendanceSettings, updateAttendanceSettings } from './api'
import type { UpdateAttendanceSettingsInput } from './types'

export const attendanceSettingsQueryKeys = {
  all: ['attendance'] as const,
  settings: () => [...attendanceSettingsQueryKeys.all, 'settings'] as const,
}

export function useGetAttendanceSettings() {
  return useQuery({
    queryKey: attendanceSettingsQueryKeys.settings(),
    queryFn: getAttendanceSettings,
    select: (response) => response.data,
  })
}

export function useUpdateAttendanceSettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateAttendanceSettingsInput) => updateAttendanceSettings(input),
    onSuccess: (response) => {
      queryClient.setQueryData(attendanceSettingsQueryKeys.settings(), response)
      queryClient.invalidateQueries({ queryKey: attendanceSettingsQueryKeys.all })
    },
  })
}
