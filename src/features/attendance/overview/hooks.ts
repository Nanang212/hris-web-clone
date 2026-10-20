import { keepPreviousData, useQuery } from '@tanstack/react-query'

import {
  getAttendanceOverview,
  getAttendanceOverviewRecords,
  type GetAttendanceOverviewInput,
  type GetAttendanceOverviewRecordsInput,
} from './api'

export const attendanceQueryKeys = {
  all: ['attendance'] as const,
  overview: (input: GetAttendanceOverviewInput) =>
    [...attendanceQueryKeys.all, 'overview', input] as const,
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
