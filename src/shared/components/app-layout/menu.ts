import {
  IconCalendarCheck,
  IconCalendarWeek,
  IconChecklist,
  IconCircleCheck,
  IconClockHour4,
  IconLayoutDashboard,
  IconReportAnalytics,
  IconReportMoney,
  IconSettings,
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
        key: 'employee-information',
        title: m.app_layout_nav_employee_information,
        to: '/company/employee-info',
      },
      {
        key: 'employment',
        title: m.app_layout_nav_employment,
        to: '/company/employee',
        items: [
          {
            key: 'employment-contract',
            title: m.app_layout_nav_employment_contract,
            to: '/company/employee/contract',
          },
          {
            key: 'employment-mutation',
            title: m.app_layout_nav_employment_mutation,
            to: '/company/employee/mutation',
          },
          {
            key: 'employment-promotion',
            title: m.app_layout_nav_employment_promotion,
            to: '/company/employee/promotion',
          },
          {
            key: 'employment-resignation',
            title: m.app_layout_nav_employment_resignation,
            to: '/company/employee/resignation',
          },
          {
            key: 'employment-history',
            title: m.app_layout_nav_employment_history,
            to: '/company/employee/history',
          },
        ],
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
    items: [
      {
        key: 'attendance-overview',
        to: '/attendance',
        title: m.app_layout_nav_attendance_overview,
      },
      {
        key: 'attendance-settings',
        to: '/attendance/settings',
        title: m.app_layout_nav_attendance_settings,
      },
      {
        key: 'shift-management',
        to: '/attendance/management/shifts',
        title: m.app_layout_nav_shift_management,
      },
      {
        key: 'working-calendar',
        to: '/attendance/calendar',
        title: m.app_layout_nav_working_calendar,
      },
      {
        key: 'face-recognition',
        to: '/attendance/face-recognition',
        title: m.app_layout_nav_face_recognition,
      },
      {
        key: 'gps-security',
        to: '/attendance/gps-security',
        title: m.app_layout_nav_gps_security,
      },
    ],
  },
  {
    key: 'leave',
    to: '/leave',
    icon: IconCalendarWeek,
    title: m.app_layout_nav_leave,
  },
  {
    key: 'overtime',
    to: '/overtime',
    icon: IconClockHour4,
    title: m.app_layout_nav_overtime,
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
      },
      {
        key: 'company',
        title: m.app_layout_nav_company,
        to: '/settings/company',
      },
      {
        key: 'role-access',
        title: m.app_layout_nav_role_access,
        to: '/settings/role-access',
        icon: IconUsers,
      },
      {
        key: 'master-data',
        title: m.app_layout_nav_master_data,
        to: '/settings/master-data',
      },
      {
        key: 'notification',
        title: m.app_layout_nav_notification,
        to: '/settings/notification',
      },
      {
        key: 'security',
        title: m.app_layout_nav_security,
        to: '/settings/security',
      },
    ],
  },
] as const

export const menu = [...dashboardMenu, ...mainMenu] as const
