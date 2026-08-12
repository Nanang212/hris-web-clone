// const BASE_URL = 'http://localhost:8080/api/v1'

export interface DashboardQueryRequest {
  role: 'HR' | 'EMPLOYEE' | 'MANAGER' | 'EXECUTIVE'
  location?: string
  company?: string
  date?: string
}

export async function fetchDashboard(req: DashboardQueryRequest) {
  // Simulasikan delay jaringan agar loading spinner kelihatan keren
  await new Promise((resolve) => setTimeout(resolve, 800))

  switch (req.role) {
    case 'HR':
      return {
        hrDashboard: {
          totalEmployees: 156,
          presentToday: 142,
          presentPercentage: 91,
          pendingApprovals: 31,
          overdueApprovals: 5,
          employmentAlerts: 14,
          compliance: [
            { id: 'cmp-1', label: 'Contracts expiring', count: '6', countColor: 'text-amber-600 dark:text-amber-400', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
            { id: 'cmp-2', label: 'MCU due dates', count: '4', countColor: 'text-blue-600 dark:text-blue-400', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
            { id: 'cmp-3', label: 'Incomplete documents', count: '4', countColor: 'text-red-600 dark:text-red-400', color: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400' }
          ],
          movement: [
            { id: 'mov-1', label: 'New hires', count: '8', countColor: 'text-emerald-600 dark:text-emerald-400', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' },
            { id: 'mov-2', label: 'Promotions', count: '3', countColor: 'text-blue-600 dark:text-blue-400', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
            { id: 'mov-3', label: 'Mutations / transfers', count: '2', countColor: 'text-purple-600 dark:text-purple-400', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' }
          ],
          events: [
            { id: 'evt-1', label: 'Birthdays this week', count: '5', countColor: 'text-purple-600 dark:text-purple-400', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' },
            { id: 'evt-2', label: 'Work anniversaries', count: '12', countColor: 'text-blue-600 dark:text-blue-400', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
            { id: 'evt-3', label: 'New joiners orientation', count: '8', countColor: 'text-emerald-600 dark:text-emerald-400', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' }
          ]
        }
      }
    case 'EMPLOYEE':
      return {
        employeeDashboard: {
          attendanceStatus: 'Present',
          checkInTime: '08:42',
          workEndTime: '17:30',
          leaveBalance: 18,
          nextPayrollDate: '25 May',
          pendingRequests: 2,
          attendanceStats: {
            presentDays: 18,
            leaveDays: 2,
            lateDays: 1,
            wfhDays: 3,
            attendanceRate: 94.7
          },
          requests: [
            { id: 'req-1', category: 'Annual leave', detail: '20-21 May', status: 'Pending', dateRange: '20 May - 21 May' },
            { id: 'req-2', category: 'Claim CLM-0B12', detail: 'Medical reimbursement', status: 'Review', dateRange: '15 May' },
            { id: 'req-3', category: 'Overtime', detail: '12 May · 2 hours', status: 'Approved', dateRange: '12 May' },
            { id: 'req-4', category: 'Business trip', detail: 'Jakarta → Surabaya', status: 'Done', dateRange: '01 May - 04 May' }
          ],
          documents: [
            { id: 'doc-1', label: 'Identity Card (KTP)', value: 'Verified', statusColor: 'text-emerald-600 dark:text-emerald-400' },
            { id: 'doc-2', label: 'Tax ID (NPWP)', value: 'Verified', statusColor: 'text-emerald-600 dark:text-emerald-400' },
            { id: 'doc-3', label: 'MCU Certificate', value: 'Expires in 3 months', statusColor: 'text-amber-600 dark:text-amber-400' }
          ],
          payrollTax: [
            { id: 'pay-1', label: 'April Payslip', value: 'Paid on 25 Apr', statusColor: 'text-emerald-600 dark:text-emerald-400' },
            { id: 'pay-2', label: 'Form 1721-A1 (Tax)', value: 'Tax Year 2024', statusColor: 'text-emerald-600 dark:text-emerald-400' },
            { id: 'pay-3', label: 'THR Allowance', value: 'Paid on 08 Apr', statusColor: 'text-emerald-600 dark:text-emerald-400' }
          ],
          upcomingEvents: [
            { id: 'ue-1', label: 'National Holiday', value: '18 May', statusColor: 'text-muted-foreground' },
            { id: 'ue-2', label: 'Q2 Town Hall Meeting', value: '22 May', statusColor: 'text-primary' },
            { id: 'ue-3', label: 'Performance Check-in', value: '26 May', statusColor: 'text-amber-600 dark:text-amber-400' }
          ],
          announcement: {
            tag: 'ANN',
            title: 'Company Announcement',
            summary: 'Hybrid Work Policy has been updated. Please review the effective date and employee guidelines.',
            readTime: 'Read announcement'
          }
        }
      }
    case 'MANAGER':
      return {
        managerDashboard: {
          teamMembers: 18,
          activeMembers: 17,
          probationMembers: 1,
          teamAttendance: 94.7,
          pendingApprovals: 9,
          overdueApprovals: 3,
          onLeaveToday: 3,
          leavePlanned: 2,
          leaveSick: 1,
          approvalQueue: [
            { id: 'q-1', label: 'Leave requests', subLabel: '3 employees', count: 3, variant: 'info' as const },
            { id: 'q-2', label: 'Attendance correction', subLabel: '2 employees', count: 2, variant: 'warning' as const },
            { id: 'q-3', label: 'Overtime requests', subLabel: '2 employees', count: 2, variant: 'danger' as const },
            { id: 'q-4', label: 'Claim approvals', subLabel: '2 employees', count: 2, variant: 'success' as const }
          ],
          contractProbation: [
            { id: 'cp-1', label: 'Contracts expiring', count: '2', countColor: 'text-amber-600 dark:text-amber-400', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
            { id: 'cp-2', label: 'Probation reviews', count: '2', countColor: 'text-blue-600 dark:text-blue-400', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
            { id: 'cp-3', label: 'Renewal decisions', count: '1', countColor: 'text-purple-600 dark:text-purple-400', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' }
          ],
          teamMovement: [
            { id: 'tm-1', label: 'Promotion', count: '1', countColor: 'text-emerald-600 dark:text-emerald-400', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' },
            { id: 'tm-2', label: 'Mutation / transfer', count: '1', countColor: 'text-blue-600 dark:text-blue-400', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
            { id: 'tm-3', label: 'New joiner', count: '2', countColor: 'text-purple-600 dark:text-purple-400', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' }
          ],
          teamEvents: [
            { id: 'te-1', label: 'Birthdays', count: '2', countColor: 'text-purple-600 dark:text-purple-400', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' },
            { id: 'te-2', label: 'Anniversaries', count: '4', countColor: 'text-blue-600 dark:text-blue-400', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
            { id: 'te-3', label: 'Planned leave', count: '5', countColor: 'text-amber-600 dark:text-amber-400', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' }
          ],
          healthInsight: 'Attendance improved 1.8% this month and there are no high-risk absence patterns.'
        }
      }
    case 'EXECUTIVE':
      return {
        executiveDashboard: {
          headcount: 156,
          headcountGrowth: 5.2,
          attendanceRate: 95.4,
          attendanceRateChange: 1.1,
          payrollCost: 'Rp12.8B',
          payrollCostChange: 3.4,
          turnover: 3.8,
          turnoverChange: -0.6,
          attention: [
            { id: 'att-1', label: 'Turnover hotspots', subLabel: '2 departments above threshold', count: 2, variant: 'danger' as const },
            { id: 'att-2', label: 'Critical vacancies', subLabel: '7 open positions', count: 7, variant: 'warning' as const },
            { id: 'att-3', label: 'Compliance alerts', subLabel: '14 open HR items', count: 14, variant: 'info' as const },
            { id: 'att-4', label: 'Overtime concentration', subLabel: '3 teams above trend', count: 3, variant: 'success' as const }
          ],
          workforceMovement: [
            { id: 'wfm-1', label: 'New hires', count: '86', countColor: 'text-emerald-600 dark:text-emerald-400', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' },
            { id: 'wfm-2', label: 'Promotions', count: '28', countColor: 'text-blue-600 dark:text-blue-400', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
            { id: 'wfm-3', label: 'Resignations', count: '41', countColor: 'text-red-600 dark:text-red-400', color: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' }
          ],
          distribution: [
            { key: 'ops', label: 'Operations', percentage: 34, color: '#3b82f6' },
            { key: 'tech', label: 'Technology', percentage: 21, color: '#10b981' },
            { key: 'sales', label: 'Sales', percentage: 18, color: '#f59e0b' },
            { key: 'other', label: 'Others', percentage: 27, color: '#e5e7eb' }
          ],
          risk: [
            { id: 'risk-1', label: 'Critical vacancies', count: '7', countColor: 'text-red-600 dark:text-red-400', color: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' },
            { id: 'risk-2', label: 'Contracts < 30d', count: '18', countColor: 'text-amber-600 dark:text-amber-400', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
            { id: 'risk-3', label: 'Absence risk', count: '3 teams', countColor: 'text-purple-600 dark:text-purple-400', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' }
          ],
          highlight: 'Headcount growth remains within plan; payroll cost is 3.4% above budget due to hiring concentration in Technology.'
        }
      }
  }
}
