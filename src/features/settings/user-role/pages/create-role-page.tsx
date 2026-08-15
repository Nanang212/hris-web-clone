import { useNavigate } from '@tanstack/react-router'

import { AppMain } from '@/shared/components/app-layout/app-main'
import { snackbar } from '@/shared/lib/snackbar'
import { RoleForm } from '@/features/settings/user-role/components/role-form'
import { useCreateRole, useRoleEligibilityOptions } from '@/features/settings/user-role/data/hooks'
import type { CreateRolePayload } from '@/features/settings/user-role/data/types'

const createRoleDefaults: CreateRolePayload = {
  name: 'HR Supervisor',
  code: 'HR_SUPERVISOR',
  status: 'Active',
  description:
    'Supervises HR operations, employee data, attendance approvals, and leave workflows.',
  allowMultipleRoles: true,
  accessExpiry: 'No expiry',
  eligibleDepartments: [],
  eligibleBranches: [],
}

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
      snackbar.success('Role created successfully!')
      navigate({ to: '/settings/user-role' })
    } catch (error) {
      snackbar.exception(error, 'Failed to create role. Please try again.')
    }
  }

  if (eligibilityQuery.isPending || eligibilityQuery.error || !eligibilityData) {
    return (
      <AppMain
        backTo='/settings/user-role'
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
      defaultValues={createRoleDefaults}
      eligibilityOptions={eligibilityData}
      isPending={createRoleMutation.isPending}
      onSubmit={handleSubmit}
    />
  )
}
