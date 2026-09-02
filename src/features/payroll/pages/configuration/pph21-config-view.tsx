// src/features/payroll/pages/configuration/pph21-config-view.tsx — Screen 6: PPh 21 TER & PTKP Schemes
import { useState } from 'react'
import { initialPph21Config, formatIDR } from '../../data/mock-payroll-data'
import type { Pph21Config } from '../../types'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
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
import { snackbar } from '@/shared/lib/snackbar'

export function Pph21ConfigView() {
  const [config, setConfig] = useState<Pph21Config>(initialPph21Config)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    snackbar.success('PPh 21 tax configuration saved successfully!')
  }

  const terCategories = [
    {
      category: 'Kategori TER A',
      scope: 'TK/0 (Rp 54 jt), TK/1 (Rp 58.5 jt), K/0 (Rp 58.5 jt)',
      rateSample: '0% – 34% (Lapisan penghasilan bruto bulanan)',
      status: 'Active (PP 58/2023)',
    },
    {
      category: 'Kategori TER B',
      scope: 'TK/2, TK/3, K/1, K/2 (Rp 63 jt – Rp 67.5 jt)',
      rateSample: '0% – 34% (Lapisan penghasilan bruto bulanan)',
      status: 'Active (PP 58/2023)',
    },
    {
      category: 'Kategori TER C',
      scope: 'K/3 (Kawin + 3 Tanggungan: Rp 72 jt)',
      rateSample: '0% – 34% (Lapisan penghasilan bruto bulanan)',
      status: 'Active (PP 58/2023)',
    },
  ]

  const progressiveBrackets = [
    { layer: 'Lapisan I', range: 'Rp 0 – Rp 60.000.000', rate: '5%' },
    { layer: 'Lapisan II', range: '> Rp 60.000.000 – Rp 250.000.000', rate: '15%' },
    { layer: 'Lapisan III', range: '> Rp 250.000.000 – Rp 500.000.000', rate: '25%' },
    { layer: 'Lapisan IV', range: '> Rp 500.000.000 – Rp 5.000.000.000', rate: '30%' },
    { layer: 'Lapisan V', range: '> Rp 5.000.000.000', rate: '35%' },
  ]

  return (
    <form onSubmit={handleSave} className='space-y-6'>
      {/* ── 1. Tax Calculation Method ──────────────────────────────────────── */}
      <div className='rounded-2xl border border-border/80 bg-card p-6 shadow-xs space-y-6'>
        <div>
          <h3 className='text-sm font-bold text-foreground'>Metode Perhitungan Pajak PPh 21</h3>
          <p className='text-xs text-muted-foreground mt-0.5'>
            Pilih skema pemotongan pajak penghasilan karyawan
          </p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
          <div className='space-y-1.5'>
            <label className='text-xs font-semibold text-foreground'>PPh 21 Method</label>
            <Select
              value={config.taxMethod}
              onValueChange={(val) =>
                setConfig((prev) => ({ ...prev, taxMethod: val as Pph21Config['taxMethod'] }))
              }
            >
              <SelectTrigger className='h-10 text-xs bg-background border border-input rounded-xl shadow-xs'>
                <SelectValue placeholder='Select tax method' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='gross'>Gross (Pajak ditanggung sendiri oleh karyawan)</SelectItem>
                <SelectItem value='nett'>Nett (Pajak ditanggung penuh oleh perusahaan)</SelectItem>
                <SelectItem value='gross_up'>Gross-Up (Diberikan tunjangan pajak setara)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-1.5'>
            <label className='text-xs font-semibold text-foreground'>Skema Pemotongan Bulanan</label>
            <Select
              value={config.useTERScheme ? 'ter' : 'progressive'}
              onValueChange={(val) =>
                setConfig((prev) => ({ ...prev, useTERScheme: val === 'ter' }))
              }
            >
              <SelectTrigger className='h-10 text-xs bg-background border border-input rounded-xl shadow-xs'>
                <SelectValue placeholder='Select scheme' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='ter'>Tarif Efektif Rata-Rata (TER PP 58/2023 & PMK 168)</SelectItem>
                <SelectItem value='progressive'>Tarif Progresif Pasal 17 UU HPP</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* ── 2. TER Category Reference Table ────────────────────────────────── */}
      <div className='rounded-2xl border border-border/80 bg-card shadow-xs overflow-hidden'>
        <div className='p-6 pb-4 border-b border-border/60'>
          <h3 className='text-sm font-bold text-foreground'>Tarif Efektif Rata-Rata (TER) Categories</h3>
          <p className='text-xs text-muted-foreground mt-0.5'>
            Klasifikasi PTKP ke dalam kategori TER bulanan (Januari – November)
          </p>
        </div>

        <Table>
          <TableHeader>
            <TableRow className='bg-muted/30 text-xs border-b border-border/60'>
              <TableHead className='font-bold text-muted-foreground py-3.5 pl-6'>Kategori TER</TableHead>
              <TableHead className='font-bold text-muted-foreground py-3.5'>Status PTKP Masuk</TableHead>
              <TableHead className='font-bold text-muted-foreground py-3.5'>Rentang Tarif</TableHead>
              <TableHead className='font-bold text-muted-foreground py-3.5 pr-6 text-right'>Status Regulasi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {terCategories.map((item) => (
              <TableRow key={item.category} className='text-xs border-b border-border/40'>
                <TableCell className='py-3.5 pl-6 font-bold text-foreground'>{item.category}</TableCell>
                <TableCell className='py-3.5 text-muted-foreground font-mono text-[11px]'>{item.scope}</TableCell>
                <TableCell className='py-3.5 font-semibold text-foreground'>{item.rateSample}</TableCell>
                <TableCell className='py-3.5 pr-6 text-right'>
                  <Badge variant='blue' className='text-[10px]'>{item.status}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* ── 3. Progressive Tax Brackets ────────────────────────────────────── */}
      <div className='rounded-2xl border border-border/80 bg-card shadow-xs overflow-hidden'>
        <div className='p-6 pb-4 border-b border-border/60'>
          <h3 className='text-sm font-bold text-foreground'>Tarif Pajak Progresif Tahunan (Pasal 17 UU HPP)</h3>
          <p className='text-xs text-muted-foreground mt-0.5'>
            Digunakan untuk kalkulasi pajak masa Desember dan SPT Tahunan
          </p>
        </div>

        <Table>
          <TableHeader>
            <TableRow className='bg-muted/30 text-xs border-b border-border/60'>
              <TableHead className='font-bold text-muted-foreground py-3.5 pl-6'>Lapisan</TableHead>
              <TableHead className='font-bold text-muted-foreground py-3.5'>Penghasilan Kena Pajak (PKP) Tahunan</TableHead>
              <TableHead className='font-bold text-muted-foreground py-3.5 pr-6 text-right'>Tarif Pajak</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {progressiveBrackets.map((b) => (
              <TableRow key={b.layer} className='text-xs border-b border-border/40'>
                <TableCell className='py-3.5 pl-6 font-bold text-foreground'>{b.layer}</TableCell>
                <TableCell className='py-3.5 text-muted-foreground'>{b.range}</TableCell>
                <TableCell className='py-3.5 pr-6 text-right font-bold text-foreground'>{b.rate}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className='flex justify-end'>
        <Button type='submit' className='h-9.5 px-6 text-xs font-semibold rounded-xl shadow-xs'>
          Save PPh 21 Scheme
        </Button>
      </div>
    </form>
  )
}
