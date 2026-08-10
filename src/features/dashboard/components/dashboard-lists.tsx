import {
  IconArrowRight,
  IconArrowUpRight,
  IconPlus,
} from '@tabler/icons-react'

import { cn } from '@/shared/lib/utils'

export function EmploymentCompliance() {
  const items = [
    {
      id: 'ctr',
      code: 'CTR',
      label: 'Contract expiry',
      count: 5,
      color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    },
    {
      id: 'mcu',
      code: 'MCU',
      label: 'MCU due',
      count: 7,
      color: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    },
    {
      id: 'doc',
      code: 'DOC',
      label: 'Documents incomplete',
      count: 9,
      color:
        'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
    },
  ]

  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-card p-5 shadow-sm ring-1 ring-foreground/5">
      <div>
        <h3 className="text-sm font-semibold">Employment & Compliance</h3>
        <p className="text-xs text-muted-foreground">
          Items needing HR follow-up
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold',
                  item.color
                )}
              >
                {item.code}
              </span>
              <span className="text-sm font-medium">{item.label}</span>
            </div>
            <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">
              {item.count}
            </span>
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">Next reminder window: 14 days</p>
    </div>
  )
}

export function WorkforceMovement() {
  const items = [
    {
      id: 'new-hires',
      icon: IconPlus,
      label: 'New hires',
      count: 12,
      color:
        'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
      countColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      id: 'promotion',
      icon: IconArrowUpRight,
      label: 'Promotion',
      count: 6,
      color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
      countColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      id: 'mutation',
      icon: IconArrowRight,
      label: 'Mutation / transfer',
      count: 4,
      color:
        'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
      countColor: 'text-purple-600 dark:text-purple-400',
    },
  ]

  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-card p-5 shadow-sm ring-1 ring-foreground/5">
      <div>
        <h3 className="text-sm font-semibold">Workforce Movement</h3>
        <p className="text-xs text-muted-foreground">This month</p>
      </div>

      <div className="flex flex-col gap-4">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full',
                  item.color
                )}
              >
                <item.icon size={16} stroke={2.5} />
              </span>
              <span className="text-sm font-medium">{item.label}</span>
            </div>
            <span className={cn('text-sm font-semibold', item.countColor)}>
              {item.count}
            </span>
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">3 resignations this month</p>
    </div>
  )
}

export function PeopleEvents() {
  const items = [
    {
      id: 'bd',
      code: 'BD',
      label: 'Birthdays',
      count: 8,
      color:
        'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
      countColor: 'text-purple-600 dark:text-purple-400',
    },
    {
      id: 'an',
      code: 'AN',
      label: 'Work anniversaries',
      count: 21,
      color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
      countColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      id: 'nj',
      code: 'NJ',
      label: 'New joiners',
      count: 3,
      color:
        'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
      countColor: 'text-emerald-600 dark:text-emerald-400',
    },
  ]

  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-card p-5 shadow-sm ring-1 ring-foreground/5">
      <div>
        <h3 className="text-sm font-semibold">People Events</h3>
        <p className="text-xs text-muted-foreground">
          Upcoming employee moments
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold',
                  item.color
                )}
              >
                {item.code}
              </span>
              <span className="text-sm font-medium">{item.label}</span>
            </div>
            <span className={cn('text-sm font-semibold', item.countColor)}>
              {item.count}
            </span>
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">View people calendar</p>
    </div>
  )
}
