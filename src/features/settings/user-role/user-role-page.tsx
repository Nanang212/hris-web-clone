import { useState } from 'react'
import {
  IconAlertCircle,
  IconChevronDown,
  IconDots,
  IconLock,
  IconPlus,
  IconSearch,
  IconShieldCheck,
  IconSparkles,
  IconUsers,
} from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'

import { Button } from '@/shared/components/ui/button'
import { useRoles, useRoleStats } from '@/features/settings/user-role/data/hooks'

function StatCard({
  icon: Icon,
  label,
  value,
  note,
  tone,
}: {
  icon: typeof IconUsers
  label: string
  value: string | number
  note: string
  tone: 'violet' | 'blue' | 'orange' | 'red'
}) {
  const tones = {
    violet: 'bg-violet-50 text-violet-500 dark:bg-violet-950/40',
    blue: 'bg-blue-50 text-blue-500 dark:bg-blue-950/40',
    orange: 'bg-orange-50 text-orange-500 dark:bg-orange-950/40',
    red: 'bg-red-50 text-red-500 dark:bg-red-950/40',
  }

  return (
    <div className='rounded-xl border border-border bg-card p-4 shadow-sm'>
      <div className='flex items-start gap-3'>
        <div className={`rounded-lg p-2.5 ${tones[tone]}`}>
          <Icon size={18} stroke={1.75} />
        </div>
        <div>
          <p className='text-xs font-medium text-muted-foreground'>{label}</p>
          <p className='mt-1 text-2xl font-bold tracking-tight text-foreground'>{value}</p>
          <p
            className={`mt-1.5 text-xs font-medium ${tone === 'red' ? 'text-red-500' : tone === 'orange' ? 'text-orange-500' : 'text-violet-500'}`}
          >
            {note}
          </p>
        </div>
      </div>
    </div>
  )
}

export default function UserRolePage() {
  const [searchRole, setSearchRole] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  const { data: stats, isLoading: isStatsLoading } = useRoleStats()
  const { data: roles = [], isLoading: isRolesLoading } = useRoles({
    search: searchRole,
    status: statusFilter,
  })

  return (
    <div className='flex flex-col gap-5 p-5 lg:p-6'>
      <div className='flex flex-col justify-between gap-4 sm:flex-row sm:items-start'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight text-foreground'>User &amp; Role</h1>
          <p className='mt-1 text-sm text-muted-foreground'>
            Kelola role, assignment user, scope data, dan permission setiap modul.
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <Button variant='outline'>Export Roles</Button>
          <Button asChild>
            <Link to='/settings/user-role/create-role'>
              <IconPlus size={16} /> Create Role
            </Link>
          </Button>
        </div>
      </div>

      <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4'>
        <StatCard
          icon={IconShieldCheck}
          label='Active Roles'
          value={isStatsLoading ? '...' : (stats?.activeRoles ?? 0)}
          note='Configured roles'
          tone='violet'
        />
        <StatCard
          icon={IconUsers}
          label='User Assignments'
          value={isStatsLoading ? '...' : (stats?.userAssignments ?? 0)}
          note='Across all roles'
          tone='blue'
        />
        <StatCard
          icon={IconSparkles}
          label='Permission Sets'
          value={isStatsLoading ? '...' : (stats?.permissionSets ?? 0)}
          note='Across all modules'
          tone='orange'
        />
        <StatCard
          icon={IconAlertCircle}
          label='Access Reviews'
          value={isStatsLoading ? '...' : (stats?.accessReviews ?? 0)}
          note='Need review'
          tone='red'
        />
      </div>

      <section className='rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5'>
        <div className='flex flex-col justify-between gap-3 lg:flex-row lg:items-start'>
          <div>
            <h2 className='text-base font-bold text-foreground'>Role Directory</h2>
            <p className='mt-1 text-sm text-muted-foreground'>
              Cari role, cek scope data, permission coverage, dan assignment user.
            </p>
          </div>
          <Button variant='outline'>Permission Matrix</Button>
        </div>

        <div className='mt-4 flex flex-col gap-2 sm:flex-row'>
          <label className='flex h-10 flex-1 items-center gap-2 rounded-lg border border-input bg-background px-3 text-muted-foreground'>
            <IconSearch size={16} />
            <input
              className='w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground'
              placeholder='Search role...'
              value={searchRole}
              onChange={(e) => setSearchRole(e.target.value)}
            />
          </label>
          <div className='relative sm:w-44'>
            <select
              className='flex h-10 w-full appearance-none items-center justify-between rounded-lg border border-input bg-background px-3 pr-8 text-sm text-muted-foreground outline-none focus:border-primary'
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value='All'>Status: All</option>
              <option value='Active'>Status: Active</option>
              <option value='Inactive'>Status: Inactive</option>
              <option value='Draft'>Status: Draft</option>
            </select>
            <IconChevronDown
              size={16}
              className='pointer-events-none absolute top-3 right-3 text-muted-foreground'
            />
          </div>
        </div>

        <div className='mt-4 overflow-x-auto rounded-lg border border-border'>
          <table className='w-full min-w-190 text-left text-sm'>
            <thead className='border-b border-border/60 bg-muted/40 text-xs font-semibold tracking-wide text-muted-foreground uppercase'>
              <tr>
                <th className='px-4 py-3'>Role</th>
                <th className='px-4 py-3'>Users</th>
                <th className='px-4 py-3'>Data Scope</th>
                <th className='px-4 py-3'>Coverage</th>
                <th className='px-4 py-3'>Last Updated</th>
                <th className='px-4 py-3'>Status</th>
                <th className='px-4 py-3 text-center'>Action</th>
              </tr>
            </thead>
            <tbody>
              {isRolesLoading ? (
                <tr>
                  <td colSpan={7} className='py-8 text-center text-sm text-muted-foreground'>
                    Loading user roles...
                  </td>
                </tr>
              ) : roles.length === 0 ? (
                <tr>
                  <td colSpan={7} className='py-8 text-center text-sm text-muted-foreground'>
                    No roles found.
                  </td>
                </tr>
              ) : (
                roles.map((role) => (
                  <tr
                    key={role.id || role.name}
                    className='border-t border-border/80 text-sm text-foreground transition-colors hover:bg-muted/30'
                  >
                    <td className='px-4 py-3 font-semibold'>
                      <span className='mr-2.5 inline-flex rounded-md bg-blue-50 p-1 text-blue-500 dark:bg-blue-950/40'>
                        <IconShieldCheck size={15} />
                      </span>
                      {role.name}
                    </td>
                    <td className='px-4 py-3'>{role.users}</td>
                    <td className='px-4 py-3'>
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${role.scope === 'Company' ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400' : role.scope === 'Team' ? 'bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400' : 'bg-fuchsia-50 text-fuchsia-600 dark:bg-fuchsia-950/40 dark:text-fuchsia-400'}`}
                      >
                        {role.scope}
                      </span>
                    </td>
                    <td className='px-4 py-3 font-medium text-blue-600 dark:text-blue-400'>
                      {role.coverage}
                    </td>
                    <td className='px-4 py-3 text-muted-foreground'>{role.updatedAt}</td>
                    <td className='px-4 py-3'>
                      <span className='inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'>
                        {role.status}
                      </span>
                    </td>
                    <td className='px-4 py-3 text-center'>
                      <Button variant='outline' size='xs' className='min-w-16'>
                        {role.action ?? <IconDots size={16} />}
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className='mt-4 flex items-center gap-2 rounded-lg bg-blue-50 px-3.5 py-2.5 text-xs font-medium text-blue-600 dark:bg-blue-950/40 dark:text-blue-400'>
          <IconLock size={15} /> Role changes, permission updates, dan assignments are recorded in
          Audit Trail.
        </div>
      </section>
    </div>
  )
}
