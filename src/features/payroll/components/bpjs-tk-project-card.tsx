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
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import { Input } from '@/shared/components/ui/input'
import {
  Select,
  SelectContent,
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

  const formatSaveTimestamp = (date: Date = new Date()) => {
    const day = String(date.getDate()).padStart(2, '0')
    const months = [
      'Januari',
      'Februari',
      'Maret',
      'April',
      'Mei',
      'Juni',
      'Juli',
      'Agustus',
      'September',
      'Oktober',
      'November',
      'Desember',
    ]
    const month = months[date.getMonth()]
    const year = date.getFullYear()
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${day} ${month} ${year} pukul ${hours}:${minutes} WIB`
  }

  const update = (id: string, patch: Partial<BpjsTkProjectSetting>) =>
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, ...patch } : row)))

  const handleAdd = (projectId: string) => {
    const proj = projects.find((p) => p.id === projectId)
    setRows((prev) => [
      ...prev,
      {
        id: `tk-${Date.now()}`,
        projectId,
        effectiveFrom: new Date().toISOString().slice(0, 7),
        jkkRatePercent: 0.24,
        jhtActive: true,
        jpActive: true,
      },
    ])
    snackbar.success(`Project ${proj?.name ?? projectId} ditambahkan. Klik Simpan untuk menyimpan permanen.`)
  }

  const handleSave = () => {
    const keys = rows.map((r) => `${r.projectId}|${r.effectiveFrom}`)
    if (rows.some((r) => !r.effectiveFrom) || new Set(keys).size !== keys.length) {
      snackbar.error('Tanggal berlaku harus diisi dan tidak boleh sama untuk project yang sama.')
      return
    }
    const timestampStr = formatSaveTimestamp()
    setTkProjectSettings(rows, timestampStr)
    setLastSavedAt(timestampStr)
    snackbar.success(`Data berhasil disimpan pada ${timestampStr}.`)
  }

  return (
    <div className='rounded-2xl border border-border/80 bg-card shadow-xs overflow-hidden'>
      <div className='p-5 border-b border-border/60 flex flex-wrap items-start justify-between gap-3'>
        <div>
          <h3 className='text-sm font-bold text-foreground'>Program BPJS TK per Project</h3>
          <p className='text-xs text-muted-foreground mt-0.5 max-w-xl'>
            JKK (tarif spesifik per project) dan JKM wajib untuk seluruh project. JHT dan JP
            diaktifkan sesuai ketentuan kontrak project. Karyawan memakai setting project yang
            berlaku di periode payroll.
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
                Tambah Project
                <span className='ml-1 rounded-md bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-400'>
                  {unconfigured.length}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-64 rounded-2xl p-1.5'>
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
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Badge variant='emerald' className='text-xs py-1 px-2.5 font-semibold'>
            Semua Project Sudah Diatur
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
                <b className='font-semibold'>Perubahan belum disimpan.</b> Terdapat penambahan atau perubahan setting project. Klik tombol <i>"Simpan setting project"</i> di bawah untuk menyimpan.
              </span>
            </div>
            <Button
              type='button'
              size='sm'
              className='h-7.5 px-3 text-xs font-semibold rounded-lg bg-amber-600 hover:bg-amber-700 text-white shrink-0 shadow-2xs cursor-pointer'
              onClick={handleSave}
            >
              Simpan Sekarang
            </Button>
          </div>
        )}

        {/* Banner Project yang Belum Dikonfigurasi */}
        {unconfigured.length > 0 && (
          <div className='p-3.5 rounded-xl border border-border/80 bg-muted/20 text-xs flex flex-wrap items-center justify-between gap-2.5'>
            <div className='flex items-center gap-2 text-foreground'>
              <IconAlertTriangle size={16} className='text-amber-600 dark:text-amber-400 shrink-0' />
              <span>
                <b className='font-semibold'>{unconfigured.length} Project belum diatur:</b>{' '}
                <span className='text-muted-foreground'>
                  Klik nama project untuk langsung menambahkan ke tabel:
                </span>
              </span>
            </div>
            <div className='flex flex-wrap items-center gap-1.5'>
              {unconfigured.map((project) => (
                <button
                  key={project.id}
                  type='button'
                  onClick={() => handleAdd(project.id)}
                  className='inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-100 hover:bg-amber-200/90 dark:bg-amber-900/40 dark:hover:bg-amber-800/50 text-amber-900 dark:text-amber-100 transition-colors border border-amber-300 dark:border-amber-700/60 cursor-pointer shadow-2xs'
                >
                  <IconPlus size={12} className='text-amber-700 dark:text-amber-300' />
                  {project.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className='rounded-xl border border-border/70 overflow-hidden bg-background shadow-2xs'>
          <Table>
            <TableHeader className='bg-muted/40'>
              <TableRow className='hover:bg-transparent border-b border-border/70'>
                <TableHead className='py-3 px-4 font-bold text-foreground text-xs'>Project</TableHead>
                <TableHead className='py-3 px-4 font-bold text-foreground text-xs w-44'>
                  Berlaku Mulai
                </TableHead>
                <TableHead className='py-3 px-4 font-bold text-foreground text-xs w-36'>
                  Tarif JKK
                </TableHead>
                <TableHead className='py-3 px-4 font-bold text-foreground text-xs w-32 text-center'>
                  JHT
                </TableHead>
                <TableHead className='py-3 px-4 font-bold text-foreground text-xs w-32 text-center'>
                  JP
                </TableHead>
                <TableHead className='py-3 px-4 font-bold text-foreground text-xs w-16 text-end'>
                  Aksi
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
                    Belum ada project yang dikonfigurasi. Klik tombol "Tambah Project" untuk
                    menambahkan.
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
                            {JKK_RATES.map((rate) => (
                              <SelectItem key={rate} value={String(rate)} className='text-xs'>
                                {rate}%
                              </SelectItem>
                            ))}
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
                            {row.jhtActive ? 'Aktif' : 'Off'}
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
                            {row.jpActive ? 'Aktif' : 'Off'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className='py-3 px-4 text-end'>
                        <TableActionButton
                          tooltip='Hapus setting project'
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
            Total <b>{rows.length}</b> konfigurasi project BPJS Ketenagakerjaan.
          </p>

          <div className='flex flex-wrap items-center gap-3'>
            {isDirty ? (
              <div className='inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs font-semibold animate-in fade-in duration-200'>
                <span className='relative flex h-2 w-2'>
                  <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75'></span>
                  <span className='relative inline-flex rounded-full h-2 w-2 bg-amber-500'></span>
                </span>
                <IconAlertTriangle size={15} className='text-amber-600 dark:text-amber-400 shrink-0' />
                <span>Perubahan belum disimpan</span>
              </div>
            ) : lastSavedAt ? (
              <div className='inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-700 dark:text-emerald-300 text-xs font-semibold animate-in fade-in duration-200'>
                <IconCheck size={15} className='text-emerald-600 dark:text-emerald-400 shrink-0' />
                <span>Data berhasil disimpan pada {lastSavedAt}</span>
              </div>
            ) : null}

            <Button
              type='button'
              className={`h-9 px-5 text-xs font-semibold rounded-xl shadow-xs transition-all cursor-pointer ${
                isDirty
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-md ring-2 ring-primary/20'
                  : 'bg-primary/85 hover:bg-primary text-primary-foreground'
              }`}
              onClick={handleSave}
            >
              Simpan setting project
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
