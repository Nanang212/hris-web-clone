import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  getAttendanceOverview,
  getAttendanceOverviewRecords,
  getAttendanceSettings,
  updateAttendanceSettings,
} from '@/features/attendance/api'
import type {
  GetAttendanceOverviewInput,
  GetAttendanceOverviewRecordsInput,
} from '@/features/attendance/api'
import type { UpdateAttendanceSettingsInput } from './types'

export const attendanceQueryKeys = {
  all: ['attendance'] as const,
  settings: () => [...attendanceQueryKeys.all, 'settings'] as const,
  overview: (input: GetAttendanceOverviewInput) => [...attendanceQueryKeys.all, 'overview', input] as const,
  overviewRecords: (input: GetAttendanceOverviewRecordsInput) =>
    [...attendanceQueryKeys.all, 'overview-records', input] as const,
}

export function useGetAttendanceOverview(input: GetAttendanceOverviewInput) {
  return useQuery({
    queryKey: attendanceQueryKeys.overview(input),
    queryFn: ({ signal }) => getAttendanceOverview(input, signal),
    select: (response) => response.data,
  })
}

export function useGetAttendanceOverviewRecords(input: GetAttendanceOverviewRecordsInput) {
  return useQuery({
    queryKey: attendanceQueryKeys.overviewRecords(input),
    queryFn: ({ signal }) => getAttendanceOverviewRecords(input, signal),
    select: (response) => response.data,
    placeholderData: keepPreviousData,
  })
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
