import { IconChevronDown } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import { useState } from 'react'

function Toggle({
  checked,
  label,
  onChange,
}: {
  checked: boolean
  label: string
  onChange: () => void
}) {
  return (
    <label className='inline-flex cursor-pointer items-center'>
      <input
        type='checkbox'
        checked={checked}
        onChange={onChange}
        aria-label={label}
        className='peer sr-only'
      />
      <span
        className={`relative h-6 w-10 rounded-full transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-2 ${checked ? 'bg-primary' : 'bg-muted-foreground/30'}`}
      >
        <span
          className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${checked ? 'translate-x-4' : ''}`}
        />
      </span>
    </label>
  )
}

export function CreateRolePage() {
  const [allowMultipleRoles, setAllowMultipleRoles] = useState(true)
  const [requireReview, setRequireReview] = useState(true)

  return (
    <form className='flex flex-col gap-6 p-5 lg:p-6' onSubmit={(event) => event.preventDefault()}>
      <div className='flex flex-col justify-between gap-4 lg:flex-row lg:items-start'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight text-foreground'>Create Role</h1>
          <p className='mt-1 text-sm text-muted-foreground'>
            Input informasi dasar role baru sebelum mengatur permission.
          </p>
        </div>
        <div className='flex flex-wrap items-center gap-3'>
          <Link
            to='/settings/user-role'
            className='rounded-lg border border-border bg-card px-5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted'
          >
            Cancel
          </Link>
          <button
            type='button'
            className='rounded-lg border border-border bg-card px-5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted'
          >
            Save Draft
          </button>
          <button
            type='submit'
            className='rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90'
          >
            Save Role
          </button>
        </div>
      </div>

      <div className='grid gap-5 xl:grid-cols-[minmax(0,1.9fr)_minmax(320px,0.95fr)]'>
        <section className='rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6'>
          <h2 className='text-base font-bold text-foreground'>Role Information</h2>
          <p className='mt-1 text-sm text-muted-foreground'>
            Identity and basic behavior for this role.
          </p>

          <div className='mt-6 grid gap-5 md:grid-cols-2'>
            <label className='block'>
              <span className='text-sm font-medium text-foreground'>Role Name</span>
              <input
                defaultValue='HR Supervisor'
                className='mt-2 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15'
              />
              <span className='mt-1.5 block text-xs text-muted-foreground'>
                Shown to administrators and assignees.
              </span>
            </label>
            <label className='block'>
              <span className='text-sm font-medium text-foreground'>Role Code</span>
              <input
                defaultValue='HR_SUPERVISOR'
                className='mt-2 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm uppercase outline-none focus:border-primary focus:ring-2 focus:ring-primary/15'
              />
              <span className='mt-1.5 block text-xs text-muted-foreground'>
                Unique code used by API and audit logs.
              </span>
            </label>
          </div>

          <label className='mt-5 block'>
            <span className='text-sm font-medium text-foreground'>Status</span>
            <span className='mt-2 flex h-10 items-center justify-between rounded-lg border border-input bg-background px-3 text-sm'>
              Active <IconChevronDown size={16} />
            </span>
            <span className='mt-1.5 block text-xs text-muted-foreground'>
              Status: Draft = belum digunakan · Active = bisa di-assign · Inactive = tidak dapat
              digunakan.
            </span>
          </label>

          <label className='mt-5 block'>
            <span className='text-sm font-medium text-foreground'>Description</span>
            <textarea
              defaultValue='Supervises HR operations, employee data, attendance approvals, and leave workflows.'
              className='mt-2 min-h-28 w-full resize-none rounded-lg border border-input bg-background p-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15'
            />
          </label>
        </section>

        <section className='rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6'>
          <h2 className='text-base font-bold text-foreground'>Role Governance</h2>
          <p className='mt-1 text-sm text-muted-foreground'>
            Controls for role lifecycle, review, and multi-role behavior.
          </p>

          <div className='mt-6 space-y-6'>
            <div className='flex items-start justify-between gap-4'>
              <div>
                <p className='text-sm font-medium text-foreground'>Allow multiple roles</p>
                <p className='mt-1 text-xs text-muted-foreground'>
                  Users may keep existing roles when this role is assigned.
                </p>
              </div>
              <Toggle
                label='Allow multiple roles'
                checked={allowMultipleRoles}
                onChange={() => setAllowMultipleRoles((value) => !value)}
              />
            </div>
            <div className='flex items-start justify-between gap-4'>
              <div>
                <p className='text-sm font-medium text-foreground'>Require periodic access review</p>
                <p className='mt-1 text-xs text-muted-foreground'>
                  Prompt administrators to review role membership.
                </p>
              </div>
              <Toggle
                label='Require periodic access review'
                checked={requireReview}
                onChange={() => setRequireReview((value) => !value)}
              />
            </div>
          </div>

          <label className='mt-7 block'>
            <span className='text-sm font-medium text-foreground'>Review Frequency</span>
            <input
              defaultValue='90 days'
              className='mt-2 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15'
            />
            <span className='mt-1.5 block text-xs text-muted-foreground'>
              Review Frequency: 30 hari · 60 hari · 90 hari · 180 hari · 1 tahun.
            </span>
          </label>
          <label className='mt-5 block'>
            <span className='text-sm font-medium text-foreground'>Access Expiry</span>
            <span className='mt-2 flex h-10 items-center justify-between rounded-lg border border-input bg-background px-3 text-sm'>
              No expiry <IconChevronDown size={16} />
            </span>
            <span className='mt-1.5 block text-xs text-muted-foreground'>
              Access Expiry: No expiry · 30 hari · 90 hari · Custom date.
            </span>
          </label>

          <div className='mt-7 rounded-xl bg-orange-50 p-4 dark:bg-orange-950/30'>
            <p className='text-sm font-semibold text-orange-600 dark:text-orange-400'>Sensitive access</p>
            <p className='mt-1.5 text-xs leading-relaxed text-orange-600 dark:text-orange-400'>
              Payroll, role configuration, and destructive actions require explicit permission and
              are recorded in Audit Trail.
            </p>
          </div>
          <div className='mt-3 rounded-xl bg-emerald-50 p-4 dark:bg-emerald-950/30'>
            <p className='text-sm font-semibold text-emerald-600 dark:text-emerald-400'>Ready to configure</p>
            <p className='mt-1.5 text-xs leading-relaxed text-emerald-600 dark:text-emerald-400'>
              Role identity is complete. Continue to Permission Matrix after saving.
            </p>
          </div>
          <button
            type='submit'
            className='mt-8 w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90'
          >
            Save &amp; Configure Permissions
          </button>
        </section>
      </div>
    </form>
  )
}
