import {
  IconBell,
  IconBuilding,
  IconCalendarCheck,
  IconCalendarWeek,
  IconChecklist,
  IconCircleCheck,
  IconDatabase,
  IconGitBranch,
  IconLayoutDashboard,
  IconReportAnalytics,
  IconReportMoney,
  IconSettings,
  IconShield,
  IconUserCircle,
  IconUsers,
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
        key: 'employee',
        title: m.app_layout_nav_employee,
        url: '/company/employee',
      },
      {
        key: 'organization',
        title: m.app_layout_nav_organization,
        url: '/company/organization',
      },
      {
        key: 'document',
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
      {
        key: 'company',
        title: m.app_layout_nav_company,
        url: '/settings/company',
        icon: IconBuilding,
      },
      {
        key: 'user-role',
        title: m.app_layout_nav_user_role,
        url: '/settings/user-role',
        icon: IconUsers,
      },
      {
        key: 'master-data',
        title: m.app_layout_nav_master_data,
        url: '/settings/master-data',
        icon: IconDatabase,
      },
      {
        key: 'notification',
        title: m.app_layout_nav_notification,
        url: '/settings/notification',
        icon: IconBell,
      },
      {
        key: 'security',
        title: m.app_layout_nav_security,
        url: '/settings/security',
        icon: IconShield,
      },
    ],
  },
] as const

export const menu = {
  ...dashboardMenu,
  ...mainMenu,
}
