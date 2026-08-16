import { useNavigate } from '@tanstack/react-router'

import { AppMain } from '@/shared/components/app-layout/app-main'
import { snackbar } from '@/shared/lib/snackbar'
import { RoleForm } from '@/features/settings/role-access/components/role-form'
import {
  useGetRole,
  useGetRoleEligibilityOptions,
  useUpdateRole,
} from '@/features/settings/role-access/hooks'
import type {
  CreateRolePayload,
  Role,
  RoleEligibilityOptions,
} from '@/features/settings/role-access/types'
import { m } from '@/i18n/paraglide/messages'

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

  const handleSubmit = (values: CreateRolePayload) => {
    updateRoleMutation.mutate(
      { id: role.id, payload: values },
      {
        onSuccess: () => {
          snackbar.success(m.role_access_update_success())
          navigate({ to: '/settings/role-access' })
        },
        onError: (error) => snackbar.exception(error),
      },
    )
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
  const roleQuery = useGetRole(roleId)
  const eligibilityQuery = useGetRoleEligibilityOptions()
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
