import { useNavigate } from '@tanstack/react-router'

import { AppMain } from '@/shared/components/app-layout/app-main'
import { snackbar } from '@/shared/lib/snackbar'
import { RoleForm } from '@/features/settings/role-access/components/role-form'
import {
  useRole,
  useRoleEligibilityOptions,
  useUpdateRole,
} from '@/features/settings/role-access/data/hooks'
import type {
  CreateRolePayload,
  Role,
  RoleEligibilityOptions,
} from '@/features/settings/role-access/data/types'

type EditRolePageProps = Readonly<{
  roleId: string
}>

function toRoleFormValues(role: Role): CreateRolePayload {
  return {
    name: role.name,
    code: role.code,
    status: role.status,
    description: role.description ?? '',
    allowMultipleRoles: role.allowMultipleRoles ?? false,
    accessExpiry: role.accessExpiry ?? 'No expiry',
    eligibleDepartments: role.eligibleDepartments ?? [],
    eligibleBranches: role.eligibleBranches ?? [],
  }
}

function EditRoleForm({
  role,
  eligibilityOptions,
}: Readonly<{ role: Role; eligibilityOptions: RoleEligibilityOptions }>) {
  const navigate = useNavigate()
  const updateRoleMutation = useUpdateRole()

  const handleSubmit = async (values: CreateRolePayload) => {
    try {
      await updateRoleMutation.mutateAsync({ id: role.id, payload: values })
      snackbar.success('Role updated successfully!')
      navigate({ to: '/settings/role-access' })
    } catch (error) {
      snackbar.exception(error, 'Failed to update role. Please try again.')
    }
  }

  return (
    <RoleForm
      mode='edit'
      defaultValues={toRoleFormValues(role)}
      eligibilityOptions={eligibilityOptions}
      isPending={updateRoleMutation.isPending}
      onSubmit={handleSubmit}
    />
  )
}

export function EditRolePage({ roleId }: EditRolePageProps) {
  const roleQuery = useRole(roleId)
  const eligibilityQuery = useRoleEligibilityOptions()
  const pending = roleQuery.isPending || eligibilityQuery.isPending
  const error = roleQuery.error ?? eligibilityQuery.error
  const notFound = !pending && !error && (!roleQuery.data || !eligibilityQuery.data)

  if (pending || error || notFound) {
    return (
      <AppMain
        backTo='/settings/role-access'
        pending={pending}
        error={error}
        retry={() => {
          void roleQuery.refetch()
          void eligibilityQuery.refetch()
        }}
        notFound={notFound}
      />
    )
  }

  return (
    <EditRoleForm
      key={roleQuery.data!.id}
      role={roleQuery.data!}
      eligibilityOptions={eligibilityQuery.data!}
    />
  )
}
