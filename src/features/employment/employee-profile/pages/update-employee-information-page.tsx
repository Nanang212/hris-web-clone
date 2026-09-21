import { AppMain } from '@/shared/components/app-layout/app-main'
import { useGetProjects } from '@/features/company/project/hooks'
import { EmployeeCreateForm } from '@/features/employment/employee-profile/components/employee-create-form'
import {
  useGetEmployeeCreationOptions,
  useGetEmployeeInformationDetail,
} from '@/features/employment/employee-profile/hooks'
import { usePayrollComponents } from '@/features/master-data/hooks'
import { m } from '@/i18n/paraglide/messages'

interface UpdateEmployeeInformationPageProps {
  employeeId: string
}

export function UpdateEmployeeInformationPage({ employeeId }: UpdateEmployeeInformationPageProps) {
  const detailQuery = useGetEmployeeInformationDetail(employeeId)
  const optionsQuery = useGetEmployeeCreationOptions()
  const projectsQuery = useGetProjects({ limit: 100, isActive: true })
  const payrollComponentsQuery = usePayrollComponents()
  const isPending =
    detailQuery.isPending ||
    optionsQuery.isPending ||
    projectsQuery.isPending ||
    payrollComponentsQuery.isPending
  const error = detailQuery.error || optionsQuery.error

  if (isPending || error || !detailQuery.data || !optionsQuery.data) {
    return (
      <AppMain
        pending={isPending}
        error={error}
        retry={() => {
          void detailQuery.refetch()
          void optionsQuery.refetch()
          void projectsQuery.refetch()
          void payrollComponentsQuery.refetch()
        }}
        notFound={!detailQuery.data}
      />
    )
  }

  return (
    <AppMain
      breadcrumbs={[
        {
          to: '/employment/employee-profile',
          label: m.app_layout_nav_employee_information(),
        },
        { label: m.employee_information_edit_title() },
      ]}
      backTo='/employment/employee-profile'
      title={m.employee_information_edit_title()}
      subtitle={m.employee_information_edit_description({
        name: detailQuery.data.fullName,
        employeeNumber: detailQuery.data.employeeNumber,
      })}
    >
      <EmployeeCreateForm
        mode='update'
        employee={detailQuery.data}
        options={{
          ...optionsQuery.data,
          projects: projectsQuery.data?.items?.map(({ id, name }) => ({ id, name })),
          payrollComponents: payrollComponentsQuery.data?.map(
            ({ id, code, name, calculationMethod, formulaExpression }) => ({
              id,
              code,
              name,
              calculationMethod,
              formulaExpression,
            }),
          ),
        }}
      />
    </AppMain>
  )
}
