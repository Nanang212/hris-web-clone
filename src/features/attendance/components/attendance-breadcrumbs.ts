import { m } from '@/i18n/paraglide/messages'

export function getAttendanceBreadcrumbs(currentPage?: string) {
  return [
    { label: m.app_layout_nav_time_management() },
    ...(currentPage
      ? [
          { to: '/attendance' as const, label: m.app_layout_nav_attendance() },
          { label: currentPage },
        ]
      : [{ label: m.app_layout_nav_attendance() }]),
  ]
}
