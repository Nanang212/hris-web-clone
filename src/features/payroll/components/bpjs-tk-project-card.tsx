// src/features/payroll/components/bpjs-tk-project-card.tsx
// Setting program BPJS TK per project (relasi ke master project via projectId) + tanggal berlaku.
// JKK & JKM selalu aktif; JHT & JP bisa aktif/nonaktif per project. Tarif JKK berbeda per project.
import {
  IconAlertTriangle,
  IconBuildingCommunity,
  IconCheck,
  IconPlus,
  IconTrash,
} from '@tabler/icons-react'
import { useMemo, useState } from 'react'
import { usePayrollBpjsStore } from '../store/payroll-bpjs-store'
import type { BpjsTkProjectSetting } from '../types'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import { Input } from '@/shared/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { Switch } from '@/shared/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import { TableActionButton } from '@/shared/components/ui/table-action-button'
import { snackbar } from '@/shared/lib/snackbar'
import { useProjects } from '@/features/company/project/data/dummy-projects'
import dayjs from 'dayjs'
import 'dayjs/locale/en'
import 'dayjs/locale/id'
import { getLocale } from '@/i18n/paraglide/runtime'
import { m } from '@/i18n/paraglide/messages'

const JKK_RATES = [0.24, 0.54, 0.89, 1.24, 1.74]

export function BpjsTkProjectCard() {
  const projects = useProjects()
  const saved = usePayrollBpjsStore((s) => s.tkProjectSettings)
  const setTkProjectSettings = usePayrollBpjsStore((s) => s.setTkProjectSettings)
  const storedSavedAt = usePayrollBpjsStore((s) => s.tkProjectLastSavedAt)

  const [rows, setRows] = useState<BpjsTkProjectSetting[]>(saved)
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(storedSavedAt ?? null)

  const projectName = (id: string) => projects.find((p) => p.id === id)?.name ?? id
  const configuredProjectIds = new Set(rows.map((r) => r.projectId))
  const unconfigured = projects.filter((p) => !configuredProjectIds.has(p.id))

  // Mendeteksi apakah ada perubahan data yang belum disimpan
  const isDirty = useMemo(() => {
    if (rows.length !== saved.length) return true
    const sortedRows = [...rows].sort((a, b) => a.id.localeCompare(b.id))
    const sortedSaved = [...saved].sort((a, b) => a.id.localeCompare(b.id))
    return JSON.stringify(sortedRows) !== JSON.stringify(sortedSaved)
  }, [rows, saved])

  const formatSaveTimestamp = (date: Date = new Date()) =>
    m.payroll_tk_project_timestamp({ timestamp: dayjs(date).locale(getLocale()).format('DD MMMM YYYY HH:mm') })

  const update = (id: string, patch: Partial<BpjsTkProjectSetting>) =>
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, ...patch } : row)))

  const handleAdd = (projectId: string) => {
    const proj = projects.find((p) => p.id === projectId)
    setRows((prev) => [
      ...prev,
      {
        id: `tk-${Date.now()}`,
        projectId,
        effectiveFrom: dayjs().format('YYYY-MM'),
        jkkRatePercent: 0.24,
        jhtActive: true,
        jpActive: true,
      },
    ])
    snackbar.success(m.payroll_tk_project_added({ project: proj?.name ?? projectId }))
  }

  const handleSave = () => {
    const keys = rows.map((r) => `${r.projectId}|${r.effectiveFrom}`)
    if (rows.some((r) => !r.effectiveFrom) || new Set(keys).size !== keys.length) {
      snackbar.error(m.payroll_tk_project_date_required())
      return
    }
    const timestampStr = formatSaveTimestamp()
    setTkProjectSettings(rows, timestampStr)
    setLastSavedAt(timestampStr)
    snackbar.success(m.payroll_tk_project_saved({ timestamp: timestampStr }))
  }

  return (
    <div className='rounded-2xl border border-border/80 bg-card shadow-xs overflow-hidden'>
      <div className='p-5 border-b border-border/60 flex flex-wrap items-start justify-between gap-3'>
        <div>
          <h3 className='text-sm font-bold text-foreground'>{m.payroll_tk_project_title()}</h3>
          <p className='text-xs text-muted-foreground mt-0.5 max-w-xl'>
            {m.payroll_tk_project_description()}
          </p>
        </div>
        {unconfigured.length > 0 ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type='button'
                variant='outline'
                size='sm'
                className='h-9 gap-1.5 text-xs font-semibold rounded-xl'
              >
                <IconPlus size={15} />
                {m.payroll_tk_project_add()}
                <span className='ml-1 rounded-md bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-400'>
                  {unconfigured.length}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-64 rounded-2xl p-1.5'>
              <DropdownMenuGroup>
              {unconfigured.map((project) => (
                <DropdownMenuItem
                  key={project.id}
                  onClick={() => handleAdd(project.id)}
                  className='text-xs py-2 cursor-pointer rounded-xl flex items-center gap-2'
                >
                  <IconPlus size={14} className='text-primary shrink-0' />
                  <span className='font-medium truncate'>{project.name}</span>
                </DropdownMenuItem>
              ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Badge variant='emerald' className='text-xs py-1 px-2.5 font-semibold'>
            {m.payroll_tk_project_all_configured()}
          </Badge>
        )}
      </div>

      <div className='p-5 space-y-4'>
        {/* Banner Peringatan Perubahan Belum Disimpan */}
        {isDirty && (
          <div className='p-3.5 rounded-xl border border-amber-300/80 bg-amber-50/80 dark:bg-amber-950/25 text-xs flex flex-wrap items-center justify-between gap-3 text-amber-900 dark:text-amber-200 animate-in fade-in slide-in-from-top-1 duration-200 shadow-2xs'>
            <div className='flex items-center gap-2.5'>
              <span className='relative flex h-2.5 w-2.5 shrink-0'>
                <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75'></span>
                <span className='relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500'></span>
              </span>
              <IconAlertTriangle size={16} className='text-amber-600 dark:text-amber-400 shrink-0' />
              <span>
                <b className='font-semibold'>{m.payroll_tk_project_unsaved()}</b> {m.payroll_tk_project_unsaved_hint()}
              </span>
            </div>
            <Button
              type='button'
              size='sm'
              className='shrink-0'
              onClick={handleSave}
            >
              {m.payroll_tk_project_save_now()}
            </Button>
          </div>
        )}

        {/* Banner Project yang Belum Dikonfigurasi */}
        {unconfigured.length > 0 && (
          <div className='p-3.5 rounded-xl border border-border/80 bg-muted/20 text-xs flex flex-wrap items-center justify-between gap-2.5'>
            <div className='flex items-center gap-2 text-foreground'>
              <IconAlertTriangle size={16} className='text-amber-600 dark:text-amber-400 shrink-0' />
              <span>
                <b className='font-semibold'>{m.payroll_tk_project_unconfigured({ count: unconfigured.length })}</b>{' '}
                <span className='text-muted-foreground'>
                  {m.payroll_tk_project_unconfigured_hint()}
                </span>
              </span>
            </div>
            <div className='flex flex-wrap items-center gap-1.5'>
              {unconfigured.map((project) => (
                <Button
                  key={project.id}
                  type='button'
                  onClick={() => handleAdd(project.id)}
                  className='inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-100 hover:bg-amber-200/90 dark:bg-amber-900/40 dark:hover:bg-amber-800/50 text-amber-900 dark:text-amber-100 transition-colors border border-amber-300 dark:border-amber-700/60 cursor-pointer shadow-2xs'
                >
                  <IconPlus size={12} className='text-amber-700 dark:text-amber-300' />
                  {project.name}
                </Button>
              ))}
            </div>
          </div>
        )}

        <div className='rounded-xl border border-border/70 overflow-hidden bg-background shadow-2xs'>
          <Table>
            <TableHeader className='bg-muted/40'>
              <TableRow className='hover:bg-transparent border-b border-border/70'>
                <TableHead className='py-3 px-4 font-bold text-foreground text-xs'>{m.payroll_tk_project_col_project()}</TableHead>
                <TableHead className='py-3 px-4 font-bold text-foreground text-xs w-44'>
                  {m.payroll_tk_project_col_effective()}
                </TableHead>
                <TableHead className='py-3 px-4 font-bold text-foreground text-xs w-36'>
                  {m.payroll_tk_project_col_jkk()}
                </TableHead>
                <TableHead className='py-3 px-4 font-bold text-foreground text-xs w-32 text-center'>
                  JHT
                </TableHead>
                <TableHead className='py-3 px-4 font-bold text-foreground text-xs w-32 text-center'>
                  JP
                </TableHead>
                <TableHead className='py-3 px-4 font-bold text-foreground text-xs w-16 text-end'>
                  {m.payroll_tk_project_col_actions()}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className='py-8 text-center text-xs text-muted-foreground'
                  >
                    {m.payroll_tk_project_empty()}
                  </TableCell>
                </TableRow>
              ) : (
                rows
                  .slice()
                  .sort(
                    (a, b) =>
                      projectName(a.projectId).localeCompare(projectName(b.projectId)) ||
                      b.effectiveFrom.localeCompare(a.effectiveFrom),
                  )
                  .map((row) => (
                    <TableRow
                      key={row.id}
                      className='hover:bg-muted/20 transition-colors border-b border-border/50'
                    >
                      <TableCell className='py-3 px-4'>
                        <div className='flex items-center gap-2.5'>
                          <div className='p-1.5 rounded-lg bg-primary/10 text-primary shrink-0'>
                            <IconBuildingCommunity size={16} />
                          </div>
                          <div>
                            <p className='font-bold text-xs text-foreground'>
                              {projectName(row.projectId)}
                            </p>
                            <span className='text-[10px] text-muted-foreground font-mono'>
                              {row.projectId}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className='py-3 px-4'>
                        <Input
                          type='month'
                          value={row.effectiveFrom}
                          onChange={(e) => update(row.id, { effectiveFrom: e.target.value })}
                          className='h-8.5 text-xs rounded-xl w-38 bg-background'
                        />
                      </TableCell>
                      <TableCell className='py-3 px-4'>
                        <Select
                          value={String(row.jkkRatePercent)}
                          onValueChange={(value) => update(row.id, { jkkRatePercent: Number(value) })}
                        >
                          <SelectTrigger className='h-8.5 w-28 text-xs font-semibold rounded-xl bg-background'>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                            {JKK_RATES.map((rate) => (
                              <SelectItem key={rate} value={String(rate)} className='text-xs'>
                                {rate}%
                              </SelectItem>
                            ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className='py-3 px-4 text-center'>
                        <div className='flex items-center justify-center gap-2'>
                          <Switch
                            checked={row.jhtActive}
                            onCheckedChange={(checked) => update(row.id, { jhtActive: checked })}
                          />
                          <span className='text-[11px] font-semibold text-muted-foreground w-12 text-start'>
                            {row.jhtActive ? m.payroll_tk_project_active() : m.payroll_tk_project_off()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className='py-3 px-4 text-center'>
                        <div className='flex items-center justify-center gap-2'>
                          <Switch
                            checked={row.jpActive}
                            onCheckedChange={(checked) => update(row.id, { jpActive: checked })}
                          />
                          <span className='text-[11px] font-semibold text-muted-foreground w-12 text-start'>
                            {row.jpActive ? m.payroll_tk_project_active() : m.payroll_tk_project_off()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className='py-3 px-4 text-end'>
                        <TableActionButton
                          tooltip={m.payroll_tk_project_delete()}
                          icon={<IconTrash size={15} />}
                          intent='danger'
                          onClick={() => setRows((prev) => prev.filter((item) => item.id !== row.id))}
                        />
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Footer dengan Count, Note Status Penyimpanan, dan Tombol Simpan */}
        <div className='flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border/60'>
          <p className='text-xs text-muted-foreground'>
            {m.payroll_tk_project_total({ count: rows.length })}
          </p>

          <div className='flex flex-wrap items-center gap-3'>
            {isDirty ? (
              <div className='inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs font-semibold animate-in fade-in duration-200'>
                <span className='relative flex h-2 w-2'>
                  <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75'></span>
                  <span className='relative inline-flex rounded-full h-2 w-2 bg-amber-500'></span>
                </span>
                <IconAlertTriangle size={15} className='text-amber-600 dark:text-amber-400 shrink-0' />
                <span>{m.payroll_tk_project_unsaved()}</span>
              </div>
            ) : lastSavedAt ? (
              <div className='inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-700 dark:text-emerald-300 text-xs font-semibold animate-in fade-in duration-200'>
                <IconCheck size={15} className='text-emerald-600 dark:text-emerald-400 shrink-0' />
                <span>{m.payroll_tk_project_saved({ timestamp: lastSavedAt })}</span>
              </div>
            ) : null}

            <Button
              type='button'
              size='sm'
              onClick={handleSave}
            >
              {m.payroll_tk_project_save()}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
