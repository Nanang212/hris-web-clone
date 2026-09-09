import {
  IconBuildingCommunity,
  IconCircleCheck,
  IconClockHour4,
  IconLayoutDashboard,
  IconPlaneTilt,
  IconReportAnalytics,
  IconReportMoney,
  IconSettings,
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
  exact?: boolean
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
    key: 'organization',
    to: '/organization',
    icon: IconBuildingCommunity,
    title: m.app_layout_nav_organization,
    items: [
      {
        key: 'organization-unit-structure',
        title: m.app_layout_nav_organization_unit_structure,
        to: '/organization/unit',
      },
      {
        key: 'organization-position',
        title: m.app_layout_nav_organization_position,
        to: '/organization/position',
      },
      {
        key: 'organization-client',
        title: m.app_layout_nav_organization_client,
        to: '/organization/client',
      },
      {
        key: 'organization-project',
        title: m.app_layout_nav_organization_project,
        to: '/organization/project',
      },
    ],
  },
  {
    key: 'employment',
    to: '/employment',
    icon: IconUsers,
    title: m.app_layout_nav_employment,
    items: [
      {
        key: 'employment-overview',
        title: m.app_layout_nav_employment_overview,
        to: '/employment',
        exact: true,
      },
      {
        key: 'employee-profile',
        title: m.app_layout_nav_employee_information,
        to: '/employment/employee-profile',
      },
      {
        key: 'employment-contract',
        title: m.app_layout_nav_employment_contract,
        to: '/employment/contract',
      },
      {
        key: 'employment-movement',
        title: m.app_layout_nav_employment_movement,
        to: '/employment/rotation',
        items: [
          {
            key: 'employment-rotation',
            title: m.app_layout_nav_employment_rotation,
            to: '/employment/rotation',
          },
          {
            key: 'employment-demotion',
            title: m.app_layout_nav_employment_demotion,
            to: '/employment/demotion',
          },
          {
            key: 'employment-promotion',
            title: m.app_layout_nav_employment_promotion,
            to: '/employment/promotion',
          },
        ],
      },
      {
        key: 'employment-resignation',
        title: m.app_layout_nav_employment_resignation,
        to: '/employment/resignation',
      },
      {
        key: 'employment-history',
        title: m.app_layout_nav_employment_history,
        to: '/employment/history',
      },
      {
        key: 'employment-document',
        title: m.app_layout_nav_document,
        to: '/employment/document',
      },
      {
        key: 'employment-mcu',
        title: () => 'MCU Management',
        to: '/employment/mcu',
      },
    ],
  },

  {
    key: 'time-management',
    to: '.',
    icon: IconClockHour4,
    title: m.app_layout_nav_time_management,
    items: [
      {
        key: 'attendance',
        to: '/attendance',
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
        title: m.app_layout_nav_leave,
      },
      {
        key: 'overtime',
        to: '/overtime',
        title: m.app_layout_nav_overtime,
      },
    ],
  },
  {
    key: 'travel-expense',
    to: '.',
    icon: IconPlaneTilt,
    title: () => 'Travel & Expense',
    items: [
      {
        key: 'claim',
        title: () => 'Claim',
        to: '/travel-expense/claim',
      },
      {
        key: 'business-trip',
        title: () => 'Business Trip',
        to: '/travel-expense/business-trip',
      },
    ],
  },
  {
    key: 'payroll',
    to: '/payroll',
    icon: IconReportMoney,
    title: m.app_layout_nav_payroll,
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
        key: 'company',
        title: m.app_layout_nav_company,
        to: '/settings/company',
      },
      {
        key: 'role-access',
        title: m.app_layout_nav_role_access,
        to: '/settings/role-access',
      },
      {
        key: 'master-data',
        title: m.app_layout_nav_master_data,
        to: '/settings/master-data',
      },
      {
        key: 'approval-workflow',
        title: m.app_layout_nav_approval_workflow,
        to: '/settings/approval-workflow',
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
