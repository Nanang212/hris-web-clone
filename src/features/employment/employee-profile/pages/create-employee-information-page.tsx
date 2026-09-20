import { AppMain } from '@/shared/components/app-layout/app-main'
import { useGetProjects } from '@/features/company/project/hooks'
import { EmployeeCreateForm } from '@/features/employment/employee-profile/components/employee-create-form'
import { useGetEmployeeCreationOptions } from '@/features/employment/employee-profile/hooks'
import { usePayrollComponents } from '@/features/master-data/hooks'
import { m } from '@/i18n/paraglide/messages'

export function CreateEmployeeInformationPage() {
  const query = useGetEmployeeCreationOptions()
  const projectsQuery = useGetProjects({ limit: 100, isActive: true })
  const payrollComponentsQuery = usePayrollComponents()
  const isPending = query.isPending || projectsQuery.isPending || payrollComponentsQuery.isPending
  const error = query.error

  if (isPending || error || !query.data) {
    return (
      <AppMain
        pending={isPending}
        error={error}
        retry={() => {
          void query.refetch()
          void projectsQuery.refetch()
          void payrollComponentsQuery.refetch()
        }}
        notFound={!query.data}
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
        { label: m.employee_information_create_title() },
      ]}
      backTo='/employment/employee-profile'
      title={m.employee_information_create_title()}
      subtitle={m.employee_information_create_new_subtitle()}
    >
      <EmployeeCreateForm
        options={{
          ...query.data,
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
