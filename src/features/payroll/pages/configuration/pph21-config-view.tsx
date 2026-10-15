// src/features/payroll/pages/configuration/pph21-config-view.tsx — Screen 6: PPh 21 TER & PTKP Schemes
import { useState } from 'react'
import { initialPph21Config } from '../../data/mock-payroll-data'
import type { Pph21Config } from '../../types'
import { m } from '@/i18n/paraglide/messages'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { FieldLabel } from '@/shared/components/ui/field'
import {
  Select,
  SelectContent,
  SelectGroup,
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
    snackbar.success(m.payroll_pph21_saved())
  }

  const terCategories = [
    {
      category: m.payroll_pph21_category_a(),
      scope: m.payroll_pph21_scope_a(),
      rateSample: m.payroll_pph21_rate_sample(),
      status: m.payroll_pph21_active_regulation(),
    },
    {
      category: m.payroll_pph21_category_b(),
      scope: m.payroll_pph21_scope_b(),
      rateSample: m.payroll_pph21_rate_sample(),
      status: m.payroll_pph21_active_regulation(),
    },
    {
      category: m.payroll_pph21_category_c(),
      scope: m.payroll_pph21_scope_c(),
      rateSample: m.payroll_pph21_rate_sample(),
      status: m.payroll_pph21_active_regulation(),
    },
  ]

  const progressiveBrackets = [
    { layer: m.payroll_pph21_bracket_1(), range: 'Rp 0 – Rp 60.000.000', rate: '5%' },
    { layer: m.payroll_pph21_bracket_2(), range: '> Rp 60.000.000 – Rp 250.000.000', rate: '15%' },
    { layer: m.payroll_pph21_bracket_3(), range: '> Rp 250.000.000 – Rp 500.000.000', rate: '25%' },
    { layer: m.payroll_pph21_bracket_4(), range: '> Rp 500.000.000 – Rp 5.000.000.000', rate: '30%' },
    { layer: m.payroll_pph21_bracket_5(), range: '> Rp 5.000.000.000', rate: '35%' },
  ]

  return (
    <form onSubmit={handleSave} className='space-y-6'>
      {/* ── 1. Tax Calculation Method ──────────────────────────────────────── */}
      <div className='rounded-2xl border border-border/80 bg-card p-6 shadow-xs space-y-6'>
        <div>
          <h3 className='text-sm font-bold text-foreground'>{m.payroll_pph21_method_title()}</h3>
          <p className='text-xs text-muted-foreground mt-0.5'>
            {m.payroll_pph21_method_description()}
          </p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
          <div className='space-y-1.5'>
            <FieldLabel className='text-xs font-semibold text-foreground'>{m.payroll_pph21_method_label()}</FieldLabel>
            <Select
              value={config.taxMethod}
              onValueChange={(val) =>
                setConfig((prev) => ({ ...prev, taxMethod: val as Pph21Config['taxMethod'] }))
              }
            >
              <SelectTrigger className='h-10 text-xs bg-background border border-input rounded-xl shadow-xs'>
                <SelectValue placeholder={m.payroll_pph21_method_placeholder()} />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value='gross'>{m.payroll_pph21_method_gross()}</SelectItem>
                  <SelectItem value='nett'>{m.payroll_pph21_method_nett()}</SelectItem>
                  <SelectItem value='gross_up'>{m.payroll_pph21_method_gross_up()}</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-1.5'>
            <FieldLabel className='text-xs font-semibold text-foreground'>{m.payroll_pph21_scheme_label()}</FieldLabel>
            <Select
              value={config.useTERScheme ? 'ter' : 'progressive'}
              onValueChange={(val) =>
                setConfig((prev) => ({ ...prev, useTERScheme: val === 'ter' }))
              }
            >
              <SelectTrigger className='h-10 text-xs bg-background border border-input rounded-xl shadow-xs'>
                <SelectValue placeholder={m.payroll_pph21_scheme_placeholder()} />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value='ter'>{m.payroll_pph21_scheme_ter()}</SelectItem>
                  <SelectItem value='progressive'>{m.payroll_pph21_scheme_progressive()}</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* ── 2. TER Category Reference Table ────────────────────────────────── */}
      <div className='rounded-2xl border border-border/80 bg-card shadow-xs overflow-hidden'>
        <div className='p-6 pb-4 border-b border-border/60'>
          <h3 className='text-sm font-bold text-foreground'>{m.payroll_pph21_ter_title()}</h3>
          <p className='text-xs text-muted-foreground mt-0.5'>
            Klasifikasi PTKP ke dalam kategori TER bulanan (Januari – November)
          </p>
        </div>

        <Table>
          <TableHeader>
            <TableRow className='bg-muted/30 text-xs border-b border-border/60'>
              <TableHead className='font-bold text-muted-foreground py-3.5 pl-6'>{m.payroll_pph21_col_ter_category()}</TableHead>
              <TableHead className='font-bold text-muted-foreground py-3.5'>{m.payroll_pph21_col_ptkp()}</TableHead>
              <TableHead className='font-bold text-muted-foreground py-3.5'>{m.payroll_pph21_col_rate_range()}</TableHead>
              <TableHead className='font-bold text-muted-foreground py-3.5 pr-6 text-right'>{m.payroll_pph21_col_regulation()}</TableHead>
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
          <h3 className='text-sm font-bold text-foreground'>{m.payroll_pph21_progressive_title()}</h3>
          <p className='text-xs text-muted-foreground mt-0.5'>
            {m.payroll_pph21_progressive_description()}
          </p>
        </div>

        <Table>
          <TableHeader>
            <TableRow className='bg-muted/30 text-xs border-b border-border/60'>
              <TableHead className='font-bold text-muted-foreground py-3.5 pl-6'>{m.payroll_pph21_col_layer()}</TableHead>
              <TableHead className='font-bold text-muted-foreground py-3.5'>{m.payroll_pph21_col_annual_pkp()}</TableHead>
              <TableHead className='font-bold text-muted-foreground py-3.5 pr-6 text-right'>{m.payroll_pph21_col_tax_rate()}</TableHead>
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
          {m.payroll_pph21_save_button()}
        </Button>
      </div>
    </form>
  )
}
