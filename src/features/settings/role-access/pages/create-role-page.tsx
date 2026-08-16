import { useNavigate } from '@tanstack/react-router'

import { AppMain } from '@/shared/components/app-layout/app-main'
import { snackbar } from '@/shared/lib/snackbar'
import { RoleForm } from '@/features/settings/role-access/components/role-form'
import { useCreateRole, useGetRoleEligibilityOptions } from '@/features/settings/role-access/hooks'
import type { CreateRolePayload } from '@/features/settings/role-access/types'
import { m } from '@/i18n/paraglide/messages'

const getCreateRoleDefaults = (): CreateRolePayload => ({
  name: 'HR Supervisor',
  code: 'HR_SUPERVISOR',
  status: 'Active',
  description: m.role_access_create_default_description(),
  allowMultipleRoles: true,
  accessExpiry: 'No expiry',
  eligibleDepartments: [],
  eligibleBranches: [],
})

export function CreateRolePage() {
  const navigate = useNavigate()
  const createRoleMutation = useCreateRole()
  const eligibilityQuery = useGetRoleEligibilityOptions()
  const eligibilityData = eligibilityQuery.data

  const handleSubmit = (values: CreateRolePayload) => {
    createRoleMutation.mutate(values, {
      onSuccess: () => {
        snackbar.success(m.role_access_create_success())
        navigate({ to: '/settings/role-access' })
      },
      onError: (error) => snackbar.exception(error),
    })
  }

  if (eligibilityQuery.isPending || eligibilityQuery.error || !eligibilityData) {
    return (
      <AppMain
        backTo='/settings/role-access'
        pending={eligibilityQuery.isPending}
        error={eligibilityQuery.error}
        retry={() => void eligibilityQuery.refetch()}
        notFound={!eligibilityQuery.isPending && !eligibilityQuery.error && !eligibilityData}
      />
    )
  }

  return (
    <RoleForm
      mode='create'
      defaultValues={getCreateRoleDefaults()}
      eligibilityOptions={eligibilityData}
      isPending={createRoleMutation.isPending}
      onSubmit={handleSubmit}
    />
  )
}
