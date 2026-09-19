import { AppMain } from '@/shared/components/app-layout/app-main'
import { EmployeeCreateForm } from '@/features/employment/employee-profile/components/employee-create-form'
import { useGetEmployeeCreationOptions } from '@/features/employment/employee-profile/hooks'
import { m } from '@/i18n/paraglide/messages'

export function CreateEmployeeInformationPage() {
  const query = useGetEmployeeCreationOptions()

  if (query.isPending || query.error || !query.data) {
    return (
      <AppMain
        pending={query.isPending}
        error={query.error}
        retry={() => void query.refetch()}
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
      <EmployeeCreateForm options={query.data} />
    </AppMain>
  )
}
