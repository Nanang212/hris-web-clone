import {
  IconArrowRight,
  IconArrowUpRight,
  IconPlus,
} from '@tabler/icons-react'

import { cn } from '@/shared/lib/utils'

export function ContractProbation() {
  const items = [
    {
      id: 'ctr',
      code: 'CTR',
      label: 'Contracts expiring',
      count: 2,
      color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
      countColor: 'text-amber-600 dark:text-amber-400',
    },
    {
      id: 'pro',
      code: 'PRO',
      label: 'Probation reviews',
      count: 2,
      color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
      countColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      id: 'ren',
      code: 'REN',
      label: 'Renewal decisions',
      count: 1,
      color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
      countColor: 'text-purple-600 dark:text-purple-400',
    },
  ]

  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-card p-5 shadow-sm ring-1 ring-foreground/5">
      <div>
        <h3 className="text-sm font-semibold">Contract & Probation</h3>
        <p className="text-xs text-muted-foreground">
          Upcoming team milestones
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
            <span className={cn('text-sm font-semibold', item.countColor)}>
              {item.count}
            </span>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">Next due: 19 May</p>
    </div>
  )
}

export function TeamMovement() {
  const items = [
    {
      id: 'promo',
      icon: IconArrowUpRight,
      label: 'Promotion',
      count: 1,
      color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
      countColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      id: 'transfer',
      icon: IconArrowRight,
      label: 'Mutation / transfer',
      count: 1,
      color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
      countColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      id: 'joiner',
      icon: IconPlus,
      label: 'New joiner',
      count: 2,
      color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
      countColor: 'text-purple-600 dark:text-purple-400',
    },
  ]

  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-card p-5 shadow-sm ring-1 ring-foreground/5">
      <div>
        <h3 className="text-sm font-semibold">Team Movement</h3>
        <p className="text-xs text-muted-foreground">Recent staffing changes</p>
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
      <p className="text-xs text-muted-foreground">No resignations this month</p>
    </div>
  )
}

export function TeamEvents() {
  const items = [
    {
      id: 'bd',
      code: 'BD',
      label: 'Birthdays',
      count: 2,
      color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
      countColor: 'text-purple-600 dark:text-purple-400',
    },
    {
      id: 'an',
      code: 'AN',
      label: 'Anniversaries',
      count: 4,
      color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
      countColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      id: 'cal',
      code: 'CAL',
      label: 'Planned leave',
      count: 5,
      color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
      countColor: 'text-amber-600 dark:text-amber-400',
    },
  ]

  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-card p-5 shadow-sm ring-1 ring-foreground/5">
      <div>
        <h3 className="text-sm font-semibold">Team Events</h3>
        <p className="text-xs text-muted-foreground">
          Upcoming people moments
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
      <p className="text-xs text-muted-foreground">View team calendar</p>
    </div>
  )
}
