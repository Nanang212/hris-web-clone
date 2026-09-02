// src/features/payroll/pages/configuration/bpjs-tk-config-view.tsx — Screen 4: BPJS Ketenagakerjaan Config
import { useState } from 'react'
import { initialBpjsTkConfig, formatIDR } from '../../data/mock-payroll-data'
import type { BpjsTkConfig } from '../../types'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import { snackbar } from '@/shared/lib/snackbar'

export function BpjsTkConfigView() {
  const [config, setConfig] = useState<BpjsTkConfig>(initialBpjsTkConfig)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    snackbar.success('BPJS Ketenagakerjaan configuration saved!')
  }

  return (
    <form onSubmit={handleSave} className='space-y-6'>
      <div className='rounded-2xl border border-border/80 bg-card shadow-xs overflow-hidden'>
        <div className='p-6 pb-4 border-b border-border/60'>
          <h3 className='text-sm font-bold text-foreground'>BPJS Ketenagakerjaan Rate Scheme</h3>
          <p className='text-xs text-muted-foreground mt-0.5'>
            Tarif iuran resmi program JKK, JKM, JHT, dan Jaminan Pensiun sesuai PP No. 44 & 45
          </p>
        </div>

        <Table>
          <TableHeader>
            <TableRow className='bg-muted/30 text-xs border-b border-border/60'>
              <TableHead className='font-bold text-muted-foreground py-3.5 pl-6'>Program BPJS TK</TableHead>
              <TableHead className='font-bold text-muted-foreground py-3.5'>Tanggungan Perusahaan (%)</TableHead>
              <TableHead className='font-bold text-muted-foreground py-3.5'>Tanggungan Karyawan (%)</TableHead>
              <TableHead className='font-bold text-muted-foreground py-3.5'>Total Tarif (%)</TableHead>
              <TableHead className='font-bold text-muted-foreground py-3.5 pr-6'>Keterangan / Limit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow className='text-xs border-b border-border/40'>
              <TableCell className='py-3.5 pl-6 font-bold text-foreground'>
                Jaminan Kecelakaan Kerja (JKK)
              </TableCell>
              <TableCell className='py-3.5'>
                <Input
                  type='number'
                  step='0.01'
                  value={config.jkkRatePercent}
                  onChange={(e) => setConfig((prev) => ({ ...prev, jkkRatePercent: parseFloat(e.target.value) || 0 }))}
                  className='h-8 w-24 text-xs'
                />
              </TableCell>
              <TableCell className='py-3.5 text-muted-foreground'>0.00% (Ditanggung Perusahaan)</TableCell>
              <TableCell className='py-3.5 font-bold text-foreground'>{config.jkkRatePercent}%</TableCell>
              <TableCell className='py-3.5 pr-6 text-muted-foreground text-[11px]'>Tingkat risiko kerja standar</TableCell>
            </TableRow>

            <TableRow className='text-xs border-b border-border/40'>
              <TableCell className='py-3.5 pl-6 font-bold text-foreground'>
                Jaminan Kematian (JKM)
              </TableCell>
              <TableCell className='py-3.5'>
                <Input
                  type='number'
                  step='0.01'
                  value={config.jkmRatePercent}
                  onChange={(e) => setConfig((prev) => ({ ...prev, jkmRatePercent: parseFloat(e.target.value) || 0 }))}
                  className='h-8 w-24 text-xs'
                />
              </TableCell>
              <TableCell className='py-3.5 text-muted-foreground'>0.00% (Ditanggung Perusahaan)</TableCell>
              <TableCell className='py-3.5 font-bold text-foreground'>{config.jkmRatePercent}%</TableCell>
              <TableCell className='py-3.5 pr-6 text-muted-foreground text-[11px]'>Sesuai regulasi nasional</TableCell>
            </TableRow>

            <TableRow className='text-xs border-b border-border/40'>
              <TableCell className='py-3.5 pl-6 font-bold text-foreground'>
                Jaminan Hari Tua (JHT)
              </TableCell>
              <TableCell className='py-3.5'>
                <Input
                  type='number'
                  step='0.1'
                  value={config.jhtCompanyPercent}
                  onChange={(e) => setConfig((prev) => ({ ...prev, jhtCompanyPercent: parseFloat(e.target.value) || 0 }))}
                  className='h-8 w-24 text-xs'
                />
              </TableCell>
              <TableCell className='py-3.5'>
                <Input
                  type='number'
                  step='0.1'
                  value={config.jhtEmployeePercent}
                  onChange={(e) => setConfig((prev) => ({ ...prev, jhtEmployeePercent: parseFloat(e.target.value) || 0 }))}
                  className='h-8 w-24 text-xs'
                />
              </TableCell>
              <TableCell className='py-3.5 font-bold text-foreground'>
                {(config.jhtCompanyPercent + config.jhtEmployeePercent).toFixed(1)}%
              </TableCell>
              <TableCell className='py-3.5 pr-6 text-muted-foreground text-[11px]'>Tanpa batas upah maksimal</TableCell>
            </TableRow>

            <TableRow className='text-xs border-b border-border/40'>
              <TableCell className='py-3.5 pl-6 font-bold text-foreground'>
                Jaminan Pensiun (JP)
              </TableCell>
              <TableCell className='py-3.5'>
                <Input
                  type='number'
                  step='0.1'
                  value={config.jpCompanyPercent}
                  onChange={(e) => setConfig((prev) => ({ ...prev, jpCompanyPercent: parseFloat(e.target.value) || 0 }))}
                  className='h-8 w-24 text-xs'
                />
              </TableCell>
              <TableCell className='py-3.5'>
                <Input
                  type='number'
                  step='0.1'
                  value={config.jpEmployeePercent}
                  onChange={(e) => setConfig((prev) => ({ ...prev, jpEmployeePercent: parseFloat(e.target.value) || 0 }))}
                  className='h-8 w-24 text-xs'
                />
              </TableCell>
              <TableCell className='py-3.5 font-bold text-foreground'>
                {(config.jpCompanyPercent + config.jpEmployeePercent).toFixed(1)}%
              </TableCell>
              <TableCell className='py-3.5 pr-6 text-foreground font-semibold text-[11px]'>
                Maks. Upah: {formatIDR(config.jpMaxWageCap)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>

        <div className='p-6 bg-muted/10 border-t border-border/60 flex flex-wrap items-center justify-between gap-4'>
          <div className='space-y-1'>
            <label className='text-xs font-semibold text-foreground'>Batas Upah Maksimal Jaminan Pensiun (JP Cap)</label>
            <Input
              type='number'
              value={config.jpMaxWageCap}
              onChange={(e) => setConfig((prev) => ({ ...prev, jpMaxWageCap: parseFloat(e.target.value) || 0 }))}
              className='h-9.5 text-xs w-64 bg-background'
            />
          </div>
          <Button type='submit' className='h-9.5 px-6 text-xs font-semibold rounded-xl shadow-xs'>
            Save BPJS TK Rates
          </Button>
        </div>
      </div>
    </form>
  )
}
