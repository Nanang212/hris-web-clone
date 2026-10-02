import {
  IconArrowsTransferUpDown,
  IconBuildingCommunity,
  IconCalendarMonth,
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
  // ─── Company ──────────────────────────────────────────────────────────
  {
    key: 'company',
    to: '/company',
    icon: IconBuildingCommunity,
    title: m.app_layout_nav_company,
    items: [
      {
        key: 'company-organization',
        title: m.app_layout_nav_company_organization,
        to: '/company/organization',
      },
      {
        key: 'company-position',
        title: m.app_layout_nav_company_position,
        to: '/company/position',
      },
      {
        key: 'company-client',
        title: m.app_layout_nav_company_client,
        to: '/company/client',
      },
      {
        key: 'company-project',
        title: m.app_layout_nav_company_project,
        to: '/company/project',
      },
    ],
  },

  // ─── Employee Data (split from Employment) ────────────────────────────
  {
    key: 'employee-data',
    to: '/employment/employee-profile',
    icon: IconUsers,
    title: () => 'Employee Data',
    items: [
      {
        key: 'employee-directory',
        title: () => 'Employee Information',
        to: '/employment/employee-profile',
      },
      {
        key: 'employee-documents',
        title: () => 'Documents',
        to: '/employment/document',
      },
      {
        key: 'employee-mcu',
        title: () => 'MCU',
        to: '/employment/mcu',
      },
    ],
  },

  // ─── Career & Movement (promoted to top-level) ────────────────────────
  {
    key: 'career-movement',
    to: '/employment',
    icon: IconArrowsTransferUpDown,
    title: () => 'Career & Movement',
    items: [
      {
        key: 'career-overview',
        title: () => 'Overview',
        to: '/employment',
        exact: true,
      },
      {
        key: 'career-contract',
        title: m.app_layout_nav_employment_contract,
        to: '/employment/contract',
      },
      {
        key: 'career-rotation',
        title: m.app_layout_nav_employment_rotation,
        to: '/employment/rotation',
      },
      {
        key: 'career-promotion',
        title: m.app_layout_nav_employment_promotion,
        to: '/employment/promotion',
      },
      {
        key: 'career-demotion',
        title: m.app_layout_nav_employment_demotion,
        to: '/employment/demotion',
      },
      {
        key: 'career-resignation',
        title: m.app_layout_nav_employment_resignation,
        to: '/employment/resignation',
      },
      {
        key: 'career-history',
        title: m.app_layout_nav_employment_history,
        to: '/employment/history',
      },
    ],
  },

  // ─── Attendance (split from Time Management) ──────────────────────────
  {
    key: 'attendance',
    to: '/attendance',
    icon: IconClockHour4,
    title: m.app_layout_nav_attendance,
    items: [
      {
        key: 'attendance-overview',
        to: '/attendance',
        title: m.app_layout_nav_attendance_overview,
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

  // ─── Leave & Overtime ─────────────────────────────────────────────────
  {
    key: 'leave-overtime',
    to: '/leave',
    icon: IconCalendarMonth,
    title: () => 'Leave & Overtime',
    items: [
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

  // ─── Travel & Expense ─────────────────────────────────────────────────
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

  // ─── Payroll ──────────────────────────────────────────────────────────
  {
    key: 'payroll',
    to: '/payroll',
    icon: IconReportMoney,
    title: m.app_layout_nav_payroll,
  },

  // ─── Report ───────────────────────────────────────────────────────────
  {
    key: 'report',
    to: '/report',
    icon: IconReportAnalytics,
    title: m.app_layout_nav_report,
  },

  // ─── Approval ─────────────────────────────────────────────────────────
  {
    key: 'approval',
    to: '/approval',
    icon: IconCircleCheck,
    title: m.app_layout_nav_approval,
  },

  // ─── Settings (+ Attendance Settings moved here) ──────────────────────
  {
    key: 'settings',
    to: '.',
    icon: IconSettings,
    title: m.app_layout_nav_settings,
    items: [
      {
        key: 'settings-company',
        title: m.app_layout_nav_company,
        to: '/settings/company',
      },
      {
        key: 'settings-role-access',
        title: m.app_layout_nav_role_access,
        to: '/settings/role-access',
      },
      {
        key: 'settings-master-data',
        title: m.app_layout_nav_master_data,
        to: '/settings/master-data',
      },
      {
        key: 'settings-scheduler',
        title: () => 'Work Schedule',
        to: '/settings/scheduler',
      },
      {
        key: 'settings-attendance',
        title: m.app_layout_nav_attendance_settings,
        to: '/attendance/settings',
      },
      {
        key: 'settings-approval-workflow',
        title: m.app_layout_nav_approval_workflow,
        to: '/settings/approval-workflow',
      },
      {
        key: 'settings-notification',
        title: m.app_layout_nav_notification,
        to: '/settings/notification',
      },
      {
        key: 'settings-security',
        title: m.app_layout_nav_security,
        to: '/settings/security',
      },
    ],
  },
] as const

export const menu = [...dashboardMenu, ...mainMenu] as const
