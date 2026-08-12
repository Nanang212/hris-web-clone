import { cn } from '@/shared/lib/utils'

interface CardItem {
  id: string
  code?: string
  label: string
  value: string
  valueColor?: string
  color?: string
  statusColor?: string
}

export function MyDocuments({ items: propItems }: { items?: CardItem[] }) {
  const defaultDocs: CardItem[] = [
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

  const docs = propItems || defaultDocs

  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-card p-5 shadow-sm ring-1 ring-foreground/5">
      <div>
        <h3 className="text-sm font-semibold">My Documents</h3>
        <p className="text-xs text-muted-foreground">
          Employee document status
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {docs.map((doc) => {
          let codeVal = doc.code
          if (!codeVal) {
            if (doc.id === 'doc-1') codeVal = 'KTP'
            else if (doc.id === 'doc-2') codeVal = 'NPW'
            else if (doc.id === 'doc-3') codeVal = 'MCU'
            else codeVal = 'DOC'
          }
          let bgCol = doc.color
          if (!bgCol) {
            if (doc.id === 'doc-1') bgCol = 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'
            else if (doc.id === 'doc-2') bgCol = 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
            else bgCol = 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
          }
          return (
            <div key={doc.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold',
                    bgCol
                  )}
                >
                  {codeVal}
                </span>
                <span className="text-sm font-medium">{doc.label}</span>
              </div>
              <span className={cn('text-sm font-semibold', doc.valueColor || doc.statusColor || 'text-foreground')}>
                {doc.value}
              </span>
            </div>
          )
        })}
      </div>
      <p className="text-xs text-muted-foreground">
        No documents expiring soon
      </p>
    </div>
  )
}

export function PayrollTax({ items: propItems }: { items?: CardItem[] }) {
  const defaultItems: CardItem[] = [
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

  const items = propItems || defaultItems

  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-card p-5 shadow-sm ring-1 ring-foreground/5">
      <div>
        <h3 className="text-sm font-semibold">Payroll & Tax</h3>
        <p className="text-xs text-muted-foreground">Latest available data</p>
      </div>

      <div className="flex flex-col gap-4">
        {items.map((item) => {
          let codeVal = item.code
          if (!codeVal) {
            if (item.id === 'pay-1') codeVal = 'PAY'
            else if (item.id === 'pay-2') codeVal = 'TAX'
            else if (item.id === 'pay-3') codeVal = 'THR'
            else codeVal = 'PAY'
          }
          let bgCol = item.color
          if (!bgCol) {
            if (item.id === 'pay-1') bgCol = 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
            else if (item.id === 'pay-2') bgCol = 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
            else bgCol = 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
          }
          return (
            <div key={item.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold',
                    bgCol
                  )}
                >
                  {codeVal}
                </span>
                <span className="text-sm font-medium">{item.label}</span>
              </div>
              <span className={cn('text-sm font-semibold', item.valueColor || item.statusColor || 'text-foreground')}>
                {item.value}
              </span>
            </div>
          )
        })}
      </div>
      <p className="text-xs text-muted-foreground">
        Salary data visible only to you
      </p>
    </div>
  )
}

export function UpcomingEvents({ items: propItems }: { items?: CardItem[] }) {
  const defaultEvents: CardItem[] = [
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

  const events = propItems || defaultEvents

  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-card p-5 shadow-sm ring-1 ring-foreground/5">
      <div>
        <h3 className="text-sm font-semibold">Upcoming</h3>
        <p className="text-xs text-muted-foreground">
          My schedule & people events
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {events.map((ev) => {
          let codeVal = ev.code
          if (!codeVal) {
            if (ev.id === 'ue-1' || ev.id === 'cal') codeVal = 'HLD'
            else if (ev.id === 'ue-2' || ev.id === 'ann') codeVal = 'TH'
            else if (ev.id === 'ue-3' || ev.id === 'bd') codeVal = 'EVT'
            else codeVal = 'CAL'
          }
          let bgCol = ev.color
          if (!bgCol) {
            if (ev.id === 'ue-1' || ev.id === 'cal') bgCol = 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
            else if (ev.id === 'ue-2' || ev.id === 'ann') bgCol = 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
            else bgCol = 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'
          }
          return (
            <div key={ev.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold',
                    bgCol
                  )}
                >
                  {codeVal}
                </span>
                <span className="text-sm font-medium">{ev.label}</span>
              </div>
              <span className={cn('text-sm font-semibold', ev.valueColor || ev.statusColor || 'text-foreground')}>
                {ev.value}
              </span>
            </div>
          )
        })}
      </div>
      <p className="text-xs text-muted-foreground">Open people calendar</p>
    </div>
  )
}
