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
  type IconProps,
} from '@tabler/icons-react'
import type { LinkProps } from '@tanstack/react-router'

import { m } from '@/i18n/paraglide/messages'

type Menu = {
  key: string
  to: NonNullable<LinkProps['to']>
  icon?: React.ForwardRefExoticComponent<IconProps & React.RefAttributes<SVGSVGElement>>
  title: () => string
  items?: Menu[]
}

export const dashboardMenu: Menu[] = [
  {
    key: '/dashboard',
    to: '/',
    icon: IconLayoutDashboard,
    title: m.app_layout_nav_dashboard,
    items: [
      {
        key: 'dashboard-employee',
        title: m.app_layout_nav_dashboard_employee,
        to: '/',
      },
      {
        key: 'dashboard-hr',
        title: m.app_layout_nav_dashboard_hr,
        to: '/dashboard/hr',
      },
      {
        key: 'dashboard-manager',
        title: m.app_layout_nav_dashboard_manager,
        to: '/dashboard/manager',
      },
      {
        key: 'dashboard-executive',
        title: m.app_layout_nav_dashboard_executive,
        to: '/dashboard/executive',
      },
      {
        key: 'dashboard-widget',
        title: m.app_layout_nav_widget,
        to: '/dashboard/customize',
      },
    ],
  },
]

export const mainMenu: Menu[] = [
  {
    key: 'company',
    to: '.',
    icon: IconUserCircle,
    title: m.app_layout_nav_company,
    items: [
      {
        key: 'employee',
        title: m.app_layout_nav_employee,
        to: '/company/employee',
      },
      {
        key: 'organization',
        title: m.app_layout_nav_organization,
        to: '/company/organization',
      },
      {
        key: 'document',
        title: m.app_layout_nav_document,
        to: '/company/document',
      },
    ],
  },
  {
    key: 'attendance',
    to: '/attendance',
    icon: IconCalendarCheck,
    title: m.app_layout_nav_attendance,
  },
  {
    key: 'leave',
    to: '/leave',
    icon: IconCalendarWeek,
    title: m.app_layout_nav_leave,
  },
  {
    key: 'payroll',
    to: '/payroll',
    icon: IconReportMoney,
    title: m.app_layout_nav_payroll,
  },
  {
    key: 'performance',
    to: '/performance',
    icon: IconChecklist,
    title: m.app_layout_nav_performance,
  },
  {
    key: 'report',
    to: '/report',
    icon: IconReportAnalytics,
    title: m.app_layout_nav_report,
  },
  {
    key: 'approval',
    to: '/approval',
    icon: IconCircleCheck,
    title: m.app_layout_nav_approval,
  },
  {
    key: 'settings',
    to: '.',
    icon: IconSettings,
    title: m.app_layout_nav_settings,
    items: [
      {
        key: 'approval-workflow',
        title: m.app_layout_nav_approval_workflow,
        to: '/settings/approval-workflow',
        icon: IconGitBranch,
      },
      {
        key: 'company',
        title: m.app_layout_nav_company,
        to: '/settings/company',
        icon: IconBuilding,
      },
      {
        key: 'user-role',
        title: m.app_layout_nav_user_role,
        to: '/settings/user-role',
        icon: IconUsers,
      },
      {
        key: 'master-data',
        title: m.app_layout_nav_master_data,
        to: '/settings/master-data',
        icon: IconDatabase,
      },
      {
        key: 'notification',
        title: m.app_layout_nav_notification,
        to: '/settings/notification',
        icon: IconBell,
      },
      {
        key: 'security',
        title: m.app_layout_nav_security,
        to: '/settings/security',
        icon: IconShield,
      },
    ],
  },
] as const

export const menu = {
  ...dashboardMenu,
  ...mainMenu,
}
