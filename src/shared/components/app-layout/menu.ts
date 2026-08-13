import {
  IconCalendarCheck,
  IconCalendarWeek,
  IconChecklist,
  IconCircleCheck,
  IconGitBranch,
  IconLayoutDashboard,
  IconReportAnalytics,
  IconReportMoney,
  IconSettings,
  IconUserCircle,
} from '@tabler/icons-react'

import { m } from '@/i18n/paraglide/messages'

export const dashboardMenu = [
  {
    key: '/dashboard',
    url: '/',
    icon: IconLayoutDashboard,
    title: m.app_layout_nav_dashboard,
    items: [
      {
        key: 'dashboard-home',
        title: m.app_layout_nav_dashboard,
        url: '/',
      },
      {
        key: 'dashboard-widget',
        title: m.app_layout_nav_widget,
        url: '/dashboard-customize',
      },
    ],
  },
]

export const mainMenu = [
  {
    key: 'company',
    url: '.',
    icon: IconUserCircle,
    title: m.app_layout_nav_company,
    items: [
      {
        title: m.app_layout_nav_employee,
        url: '/company/employee',
      },
      {
        title: m.app_layout_nav_organization,
        url: '/company/organization',
      },
      {
        title: m.app_layout_nav_document,
        url: '/company/document',
      },
    ],
  },
  {
    key: 'attendance',
    url: '/attendance',
    icon: IconCalendarCheck,
    title: m.app_layout_nav_attendance,
  },
  {
    key: 'leave',
    url: '/leave',
    icon: IconCalendarWeek,
    title: m.app_layout_nav_leave,
  },
  {
    key: 'payroll',
    url: '/payroll',
    icon: IconReportMoney,
    title: m.app_layout_nav_payroll,
  },
  {
    key: 'performance',
    url: '/performance',
    icon: IconChecklist,
    title: m.app_layout_nav_performance,
  },
  {
    key: 'report',
    url: '/report',
    icon: IconReportAnalytics,
    title: m.app_layout_nav_report,
  },
  {
    key: 'approval',
    url: '/approval',
    icon: IconCircleCheck,
    title: m.app_layout_nav_approval,
  },
  {
    key: 'settings',
    url: '/settings',
    icon: IconSettings,
    title: m.app_layout_nav_settings,
    items: [
      {
        key: 'approval-workflow',
        title: m.app_layout_nav_approval_workflow,
        url: '/settings/approval-workflow',
        icon: IconGitBranch,
      },
    ],
  },
] as const

export const menu = {
  ...dashboardMenu,
  ...mainMenu,
}
