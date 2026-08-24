// history-detail-view.tsx — Employment history timeline & related documents view
import {
  IconDownload,
  IconFileText,
  IconFileTypePdf,
  IconFileSpreadsheet,
} from '@tabler/icons-react'
import type { EmployeeEmploymentHistory } from '@/features/employment/types'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import { snackbar } from '@/shared/lib/snackbar'

interface HistoryDetailViewProps {
  history: EmployeeEmploymentHistory
  onExport?: (format: 'pdf' | 'excel' | 'csv') => void
}

const DOT_COLOR_MAP: Record<string, string> = {
  violet: 'bg-purple-600 border-purple-200 dark:border-purple-900',
  emerald: 'bg-emerald-500 border-emerald-200 dark:border-emerald-900',
  blue: 'bg-blue-600 border-blue-200 dark:border-blue-900',
  amber: 'bg-amber-500 border-amber-200 dark:border-amber-900',
  rose: 'bg-rose-500 border-rose-200 dark:border-rose-900',
  sky: 'bg-sky-500 border-sky-200 dark:border-sky-900',
}

export function HistoryDetailView({ history, onExport }: HistoryDetailViewProps) {
  const handleExportFormat = (format: 'pdf' | 'excel' | 'csv') => {
    if (onExport) {
      onExport(format)
    } else {
      snackbar.success(`Exporting history for ${history.fullName} as ${format.toUpperCase()}...`)
    }
  }

  const handleDownloadDoc = (docName: string) => {
    snackbar.success(`Downloading ${docName}...`)
  }

  return (
    <div className='flex flex-col gap-6'>
      {/* ── Employee Header Banner ────────────────────────────────────────── */}
      <div className='flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border/60 bg-card p-6 shadow-sm'>
        <div className='flex items-center gap-4'>
          <Avatar className='size-14 border border-border/60 shadow-sm'>
            <AvatarImage src={history.photo ?? undefined} />
            <AvatarFallback className='text-base bg-purple-100 text-purple-700 font-bold dark:bg-purple-950 dark:text-purple-300'>
              {history.fullName
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className='flex items-center gap-3'>
              <h3 className='text-lg font-bold text-foreground'>{history.fullName}</h3>
            </div>
            <p className='text-xs text-muted-foreground mt-0.5'>
              {history.position} · {history.department} · Joined {history.joinDate}
            </p>
            <div className='mt-2'>
              <Badge variant='green' className='text-[11px] px-2.5 py-0.5 font-semibold capitalize'>
                {history.status}
              </Badge>
            </div>
          </div>
        </div>

        {/* Top Right: Export History Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='outline' size='sm' className='gap-2 text-xs font-semibold'>
              <IconDownload size={15} />
              Export History
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='w-48 text-xs'>
            <DropdownMenuItem onClick={() => handleExportFormat('pdf')}>
              <IconFileTypePdf size={16} className='mr-2 text-rose-500' />
              Export PDF (.pdf)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExportFormat('excel')}>
              <IconFileSpreadsheet size={16} className='mr-2 text-emerald-600' />
              Export Excel (.xlsx)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExportFormat('csv')}>
              <IconFileText size={16} className='mr-2 text-blue-500' />
              Export CSV (.csv)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* ── Main 2-Column Content ─────────────────────────────────────────── */}
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
        {/* Left Column (2/3): Employment Timeline */}
        <div className='lg:col-span-2 rounded-2xl border border-border/60 bg-card p-6 shadow-sm'>
          <h3 className='text-base font-bold text-foreground mb-6'>Employment Timeline</h3>

          <div className='relative pl-4 space-y-8'>
            {/* Vertical timeline line */}
            <div className='absolute left-[21px] top-3 bottom-3 w-0.5 bg-border/80' />

            {history.timeline.map((item, idx) => {
              const dotStyle = DOT_COLOR_MAP[item.color] ?? 'bg-purple-600 border-purple-200'
              return (
                <div key={item.id || idx} className='relative flex items-start gap-4 group'>
                  {/* Timeline dot */}
                  <div
                    className={`relative z-10 size-3.5 rounded-full border-2 ${dotStyle} ring-4 ring-background flex-shrink-0 mt-1 transition-transform group-hover:scale-125`}
                  />

                  {/* Content */}
                  <div className='flex flex-col gap-0.5 text-xs'>
                    <h4 className='text-sm font-bold text-foreground'>{item.title}</h4>
                    <p className='text-xs font-semibold text-muted-foreground/80'>{item.date}</p>
                    <p className='text-xs text-muted-foreground mt-1'>{item.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right Column (1/3): Related Documents */}
        <div className='flex flex-col gap-4'>
          <div className='rounded-2xl border border-border/60 bg-card p-6 shadow-sm'>
            <h3 className='text-base font-bold text-foreground mb-4'>Related Documents</h3>

            <div className='flex flex-col gap-3'>
              {history.documents.map((doc) => (
                <div
                  key={doc.id}
                  className='flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-background/50 p-3.5 hover:bg-muted/30 transition-colors'
                >
                  <div className='flex items-center gap-3 min-w-0'>
                    <div className='flex size-10 flex-shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400'>
                      <IconFileTypePdf size={20} />
                    </div>
                    <div className='truncate'>
                      <p className='text-xs font-semibold text-foreground truncate'>{doc.name}</p>
                      <p className='text-[11px] text-muted-foreground'>
                        {doc.format} · {doc.size}
                      </p>
                    </div>
                  </div>

                  <Button
                    variant='ghost'
                    size='icon'
                    className='size-8 text-muted-foreground hover:text-foreground flex-shrink-0'
                    onClick={() => handleDownloadDoc(doc.name)}
                  >
                    <IconDownload size={15} />
                  </Button>
                </div>
              ))}

              {history.documents.length === 0 && (
                <p className='text-xs text-muted-foreground py-4 text-center'>
                  No related documents attached.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
