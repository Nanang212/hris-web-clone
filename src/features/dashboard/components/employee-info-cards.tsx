import { cn } from '@/shared/lib/utils'

export function MyDocuments() {
  const docs = [
    {
      id: 'doc',
      code: 'DOC',
      label: 'Required documents',
      value: '6 / 6',
      valueColor: 'text-emerald-600 dark:text-emerald-400',
      color:
        'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
    },
    {
      id: 'mcu',
      code: 'MCU',
      label: 'MCU valid until',
      value: 'Jul 2027',
      valueColor: 'text-emerald-600 dark:text-emerald-400',
      color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    },
    {
      id: 'np',
      code: 'NP',
      label: 'NPWP status',
      value: 'Active',
      valueColor: 'text-emerald-600 dark:text-emerald-400',
      color:
        'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    },
  ]

  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-card p-5 shadow-sm ring-1 ring-foreground/5">
      <div>
        <h3 className="text-sm font-semibold">My Documents</h3>
        <p className="text-xs text-muted-foreground">
          Employee document status
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {docs.map((doc) => (
          <div key={doc.id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold',
                  doc.color
                )}
              >
                {doc.code}
              </span>
              <span className="text-sm font-medium">{doc.label}</span>
            </div>
            <span className={cn('text-sm font-semibold', doc.valueColor)}>
              {doc.value}
            </span>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        No documents expiring soon
      </p>
    </div>
  )
}

export function PayrollTax() {
  const items = [
    {
      id: 'pay',
      code: 'PAY',
      label: 'Latest payslip',
      value: 'Apr 2025',
      valueColor: 'text-blue-600 dark:text-blue-400',
      color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    },
    {
      id: 'thr',
      code: 'THR',
      label: 'THR status',
      value: 'Paid',
      valueColor: 'text-emerald-600 dark:text-emerald-400',
      color:
        'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    },
    {
      id: 'tax',
      code: 'TAX',
      label: 'Tax document',
      value: '1721-A1',
      valueColor: 'text-foreground',
      color:
        'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    },
  ]

  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-card p-5 shadow-sm ring-1 ring-foreground/5">
      <div>
        <h3 className="text-sm font-semibold">Payroll & Tax</h3>
        <p className="text-xs text-muted-foreground">Latest available data</p>
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
            <span className={cn('text-sm font-semibold', item.valueColor)}>
              {item.value}
            </span>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Salary data visible only to you
      </p>
    </div>
  )
}

export function UpcomingEvents() {
  const events = [
    {
      id: 'cal',
      code: 'CAL',
      label: 'Company holiday',
      value: '29 May',
      valueColor: 'text-blue-600 dark:text-blue-400',
      color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    },
    {
      id: 'ann',
      code: 'ANN',
      label: 'Town Hall',
      value: '15 May',
      valueColor: 'text-amber-600 dark:text-amber-400',
      color:
        'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    },
    {
      id: 'bd',
      code: 'BD',
      label: 'Birthday reminder',
      value: '17 May',
      valueColor: 'text-purple-600 dark:text-purple-400',
      color:
        'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
    },
  ]

  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-card p-5 shadow-sm ring-1 ring-foreground/5">
      <div>
        <h3 className="text-sm font-semibold">Upcoming</h3>
        <p className="text-xs text-muted-foreground">
          My schedule & people events
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {events.map((ev) => (
          <div key={ev.id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold',
                  ev.color
                )}
              >
                {ev.code}
              </span>
              <span className="text-sm font-medium">{ev.label}</span>
            </div>
            <span className={cn('text-sm font-semibold', ev.valueColor)}>
              {ev.value}
            </span>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">Open people calendar</p>
    </div>
  )
}
