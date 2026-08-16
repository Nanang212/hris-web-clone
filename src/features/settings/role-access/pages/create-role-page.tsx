import { useNavigate } from '@tanstack/react-router'

import { m } from '@/i18n/paraglide/messages'
import { AppMain } from '@/shared/components/app-layout/app-main'
import { snackbar } from '@/shared/lib/snackbar'
import { RoleForm } from '@/features/settings/role-access/components/role-form'
import {
  useCreateRole,
  useRoleEligibilityOptions,
} from '@/features/settings/role-access/data/hooks'
import type { CreateRolePayload } from '@/features/settings/role-access/data/types'

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
  const eligibilityQuery = useRoleEligibilityOptions()
  const eligibilityData = (
    eligibilityQuery as { data?: Awaited<ReturnType<typeof useRoleEligibilityOptions>>['data'] }
  )?.data

  const handleSubmit = async (values: CreateRolePayload) => {
    try {
      await createRoleMutation.mutateAsync(values)
      snackbar.success(m.role_access_create_success())
      navigate({ to: '/settings/role-access' })
    } catch (error) {
      snackbar.exception(error, m.role_access_create_error())
    }
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
