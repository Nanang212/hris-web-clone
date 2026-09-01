// detection-logs-tab.tsx — GPS Security Detection Logs view with Stats, Filters, and Interactive Map Preview Modal
import {
  IconAlertTriangle,
  IconShieldCheck,
  IconSearch,
  IconEye,
  IconShieldX,
  IconMapPin,
  IconDeviceMobile,
} from '@tabler/icons-react'
import { useState } from 'react'
import { DetectionLogPreviewDialog } from './detection-log-preview-dialog'
import type { SecurityEventLog } from './types'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'

const mockLogs: SecurityEventLog[] = [
  {
    id: 'log-1',
    timestamp: '01 Sep 2026, 08:42:15',
    employeeName: 'Budi Santoso',
    employeeCode: 'EMP003',
    department: 'IT & Engineering',
    eventType: 'Outside Geofence',
    locationDetected: 'Radius 420m from Jakarta HQ',
    accuracy: '12m (Good)',
    actionTaken: 'Blocked',
    severity: 'medium',
    officeName: 'Jakarta HQ',
    officeLatitude: -6.2255,
    officeLongitude: 106.8095,
    officeRadius: 150,
    detectedLatitude: -6.2295,
    detectedLongitude: 106.8135,
    deviceModel: 'Samsung Galaxy S23 (Android 14)',
    osVersion: 'Android 14',
    ipAddress: '182.253.14.88',
    distanceFromPerimeter: '420m away from Jakarta HQ perimeter',
    isMockLocation: false,
    isRooted: false,
  },
  {
    id: 'log-2',
    timestamp: '01 Sep 2026, 08:35:02',
    employeeName: 'Siti Aminah',
    employeeCode: 'EMP002',
    department: 'Human Resource',
    eventType: 'Fake GPS Blocked',
    locationDetected: 'Mock Provider Detected (Android Hook)',
    accuracy: '0m (Spoofed)',
    actionTaken: 'Blocked',
    severity: 'high',
    officeName: 'Jakarta HQ',
    officeLatitude: -6.2255,
    officeLongitude: 106.8095,
    officeRadius: 150,
    detectedLatitude: -6.2255,
    detectedLongitude: 106.8095,
    deviceModel: 'Xiaomi Redmi Note 12',
    osVersion: 'Android 13 (MIUI 14)',
    ipAddress: '114.122.20.14',
    distanceFromPerimeter: 'Fake GPS App Hook detected',
    isMockLocation: true,
    isRooted: false,
  },
  {
    id: 'log-3',
    timestamp: '01 Sep 2026, 08:29:44',
    employeeName: 'Rian Wijaya',
    employeeCode: 'EMP001',
    department: 'IT & Engineering',
    eventType: 'Low Accuracy',
    locationDetected: 'GPS Accuracy 85m (> 50m limit)',
    accuracy: '85m (Poor)',
    actionTaken: 'Flagged for Review',
    severity: 'low',
    officeName: 'Bandung Office',
    officeLatitude: -6.9217,
    officeLongitude: 107.6071,
    officeRadius: 120,
    detectedLatitude: -6.9230,
    detectedLongitude: 107.6085,
    deviceModel: 'iPhone 13 (iOS 17.5)',
    osVersion: 'iOS 17.5',
    ipAddress: '36.72.215.110',
    distanceFromPerimeter: 'Inside area but low GPS accuracy',
    isMockLocation: false,
    isRooted: false,
  },
  {
    id: 'log-4',
    timestamp: '31 Aug 2026, 17:15:30',
    employeeName: 'Andi Pratama',
    employeeCode: 'EMP005',
    department: 'Operations',
    eventType: 'Root / Jailbreak',
    locationDetected: 'Magisk Root Binary Found',
    accuracy: '15m (Good)',
    actionTaken: 'Blocked',
    severity: 'high',
    officeName: 'Surabaya Office',
    officeLatitude: -7.2655,
    officeLongitude: 112.7431,
    officeRadius: 150,
    detectedLatitude: -7.2660,
    detectedLongitude: 112.7440,
    deviceModel: 'OnePlus 9 Pro (Rooted)',
    osVersion: 'Android 13 Custom ROM',
    ipAddress: '180.252.88.92',
    distanceFromPerimeter: 'Device integrity check failed',
    isMockLocation: false,
    isRooted: true,
  },
  {
    id: 'log-5',
    timestamp: '31 Aug 2026, 08:50:11',
    employeeName: 'Dewi Lestari',
    employeeCode: 'EMP008',
    department: 'Finance',
    eventType: 'Outside Geofence',
    locationDetected: 'Radius 1.2km from Client Project Yogyakarta',
    accuracy: '8m (Excellent)',
    actionTaken: 'Blocked',
    severity: 'medium',
    officeName: 'Client Project Yogyakarta',
    officeLatitude: -7.7928,
    officeLongitude: 110.3658,
    officeRadius: 250,
    detectedLatitude: -7.8010,
    detectedLongitude: 110.3720,
    deviceModel: 'Samsung Galaxy A54',
    osVersion: 'Android 14',
    ipAddress: '103.111.45.2',
    distanceFromPerimeter: '1.2km away from Malioboro client site',
    isMockLocation: false,
    isRooted: false,
  },
]

export function DetectionLogsTab() {
  const [search, setSearch] = useState('')
  const [severityFilter, setSeverityFilter] = useState<string>('all')
  const [selectedLog, setSelectedLog] = useState<SecurityEventLog | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)

  const handleOpenPreview = (log: SecurityEventLog) => {
    setSelectedLog(log)
    setPreviewOpen(true)
  }

  const filtered = mockLogs.filter((l) => {
    const matchesSearch =
      l.employeeName.toLowerCase().includes(search.toLowerCase()) ||
      l.eventType.toLowerCase().includes(search.toLowerCase()) ||
      l.employeeCode.toLowerCase().includes(search.toLowerCase()) ||
      l.locationDetected.toLowerCase().includes(search.toLowerCase())

    const matchesSeverity =
      severityFilter === 'all' || l.severity === severityFilter

    return matchesSearch && matchesSeverity
  })

  // Stat summary counters
  const totalLogs = mockLogs.length
  const highCount = mockLogs.filter((l) => l.severity === 'high').length
  const outsideCount = mockLogs.filter((l) => l.eventType === 'Outside Geofence').length
  const fakeCount = mockLogs.filter((l) => l.eventType === 'Fake GPS Blocked').length

  return (
    <div className='flex flex-col gap-6'>
      {/* ── 1. Top Summary Stat Cards matching Overview aesthetic ────────── */}
      <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        <div className='rounded-2xl border border-border/80 bg-card p-4 shadow-sm flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <span className='inline-flex rounded-xl bg-slate-100 p-2.5 text-slate-700 dark:bg-slate-800 dark:text-slate-200'>
              <IconAlertTriangle className='size-5' />
            </span>
            <div>
              <p className='text-[11px] font-semibold text-muted-foreground'>Total Incidents</p>
              <b className='text-base font-bold text-foreground'>{totalLogs}</b>
            </div>
          </div>
          <span className='rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-muted-foreground'>
            Today & Yesterday
          </span>
        </div>

        <div className='rounded-2xl border border-border/80 bg-card p-4 shadow-sm flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <span className='inline-flex rounded-xl bg-rose-50 p-2.5 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400'>
              <IconShieldX className='size-5' />
            </span>
            <div>
              <p className='text-[11px] font-semibold text-muted-foreground'>High Severity</p>
              <b className='text-base font-bold text-rose-600 dark:text-rose-400'>{highCount}</b>
            </div>
          </div>
          <span className='rounded-full bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 text-[10px] font-bold text-rose-600 dark:text-rose-400'>
            Blocked
          </span>
        </div>

        <div className='rounded-2xl border border-border/80 bg-card p-4 shadow-sm flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <span className='inline-flex rounded-xl bg-amber-50 p-2.5 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'>
              <IconMapPin className='size-5' />
            </span>
            <div>
              <p className='text-[11px] font-semibold text-muted-foreground'>Outside Geofence</p>
              <b className='text-base font-bold text-amber-600 dark:text-amber-400'>{outsideCount}</b>
            </div>
          </div>
          <span className='rounded-full bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400'>
            Radius Alert
          </span>
        </div>

        <div className='rounded-2xl border border-border/80 bg-card p-4 shadow-sm flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <span className='inline-flex rounded-xl bg-blue-50 p-2.5 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400'>
              <IconDeviceMobile className='size-5' />
            </span>
            <div>
              <p className='text-[11px] font-semibold text-muted-foreground'>Fake GPS / Spoofed</p>
              <b className='text-base font-bold text-blue-600 dark:text-blue-400'>{fakeCount}</b>
            </div>
          </div>
          <span className='rounded-full bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 text-[10px] font-bold text-blue-600 dark:text-blue-400'>
            Anti-Spoofing
          </span>
        </div>
      </div>

      {/* ── 2. Search & Filter Bar ────────────────────────────────────────── */}
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div className='relative w-full max-w-sm'>
          <IconSearch className='absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground' />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder='Search employee, ID, or detection detail...'
            className='pl-9 h-9.5 text-xs bg-card border-border/80 rounded-xl shadow-xs'
          />
        </div>

        <div className='flex items-center gap-2.5'>
          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className='h-9.5 text-xs bg-card border-border/80 rounded-xl min-w-[140px] shadow-xs'>
              <SelectValue placeholder='All Severity' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Severities</SelectItem>
              <SelectItem value='high'>High Severity</SelectItem>
              <SelectItem value='medium'>Medium Severity</SelectItem>
              <SelectItem value='low'>Low Severity</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* ── 3. Detection Logs Table with Action Preview ───────────────────── */}
      <div className='rounded-2xl border border-border/80 bg-card shadow-sm overflow-hidden'>
        <Table>
          <TableHeader>
            <TableRow className='bg-muted/30 hover:bg-muted/30 border-b border-border/70 text-xs'>
              <TableHead className='font-bold text-muted-foreground py-3.5 pl-6'>
                Timestamp
              </TableHead>
              <TableHead className='font-bold text-muted-foreground py-3.5'>
                Employee
              </TableHead>
              <TableHead className='font-bold text-muted-foreground py-3.5'>
                Event Type
              </TableHead>
              <TableHead className='font-bold text-muted-foreground py-3.5'>
                Detection Detail
              </TableHead>
              <TableHead className='font-bold text-muted-foreground py-3.5'>
                Accuracy
              </TableHead>
              <TableHead className='font-bold text-muted-foreground py-3.5'>
                Status
              </TableHead>
              <TableHead className='font-bold text-muted-foreground py-3.5 pr-6 text-right'>
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className='py-8 text-center text-xs text-muted-foreground'>
                  No security detection logs found matching the filter.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((item) => (
                <TableRow
                  key={item.id}
                  className='hover:bg-muted/20 border-b border-border/50 text-xs transition-colors'
                >
                  <TableCell className='text-muted-foreground py-4 pl-6 font-mono text-[11px]'>
                    {item.timestamp}
                  </TableCell>
                  <TableCell className='font-semibold text-foreground py-4'>
                    <div>
                      <p className='text-xs font-bold text-foreground'>{item.employeeName}</p>
                      <p className='text-[10px] text-muted-foreground mt-0.5'>
                        {item.employeeCode} · {item.department}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className='py-4'>
                    <Badge
                      variant={
                        item.severity === 'high'
                          ? 'red'
                          : item.severity === 'medium'
                            ? 'amber'
                            : 'blue'
                      }
                      className='text-[10px] px-2 py-0.5 font-semibold'
                    >
                      {item.eventType}
                    </Badge>
                  </TableCell>
                  <TableCell className='text-muted-foreground py-4 text-xs max-w-[220px] truncate'>
                    {item.locationDetected}
                  </TableCell>
                  <TableCell className='text-muted-foreground py-4 font-mono text-[11px]'>
                    {item.accuracy}
                  </TableCell>
                  <TableCell className='py-4'>
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                        item.actionTaken === 'Blocked'
                          ? 'text-rose-600 dark:text-rose-400'
                          : 'text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      {item.actionTaken === 'Blocked' ? (
                        <IconShieldX size={13} />
                      ) : (
                        <IconShieldCheck size={13} />
                      )}
                      {item.actionTaken}
                    </span>
                  </TableCell>
                  <TableCell className='py-4 pr-6 text-right'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => handleOpenPreview(item)}
                      className='h-7.5 px-2.5 text-xs font-semibold gap-1.5 rounded-lg border-border/80 shadow-2xs hover:bg-primary/5 hover:text-primary'
                    >
                      <IconEye size={14} />
                      Preview
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* ── 4. Interactive Detection Log Preview Modal ────────────────────── */}
      <DetectionLogPreviewDialog
        log={selectedLog}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
      />
    </div>
  )
}
