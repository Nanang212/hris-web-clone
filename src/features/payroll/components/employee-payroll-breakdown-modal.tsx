// src/features/payroll/components/employee-payroll-breakdown-modal.tsx
// Modal rincian payroll per karyawan dengan layout 2-kolom bersih & modern:
// Kiri: Pendapatan Kotor (Gaji Pokok, Tunjangan Tetap & Variabel, Lembur)
// Kanan: Seluruh Potongan Gaji (BPJS Kes 1% + Keluarga, BPJS TK JHT & JP, PPh 21, Presensi, THR)
// Bawah: Tanggungan Perusahaan Non-THP (BPJS Kes 4%, JKK, JKM, JHT 3.7%, JP 2%)

import {
  IconAlertTriangle,
  IconBuildingBank,
  IconCalculator,
  IconCash,
  IconReceipt,
  IconShieldCheck,
} from '@tabler/icons-react'
import type { EmployeePayrollDetail } from '../types'
import { formatIDR } from '../data/mock-payroll-data'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { ScrollArea } from '@/shared/components/ui/scroll-area'

interface EmployeePayrollBreakdownModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  detail: EmployeePayrollDetail | null
}

export function EmployeePayrollBreakdownModal({
  open,
  onOpenChange,
  detail,
}: EmployeePayrollBreakdownModalProps) {
  if (!detail) return null

  const bpjsKes1Percent = Math.max(0, detail.bpjsKesEmployee - (detail.bpjsKesFamilyExtra ?? 0))
  const fixedLines = detail.lines?.filter((l) => l.source === 'fixed') ?? []
  const variableLines =
    detail.lines?.filter((l) => l.source === 'variable' || l.source === 'attendance') ?? []

  // Inisial nama untuk avatar
  const initials = detail.employeeName
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

  const companyTkTotal =
    (detail.bpjsTkJkk ?? 0) +
    (detail.bpjsTkJkm ?? 0) +
    (detail.bpjsTkJhtEmployer ?? 0) +
    (detail.bpjsTkJpEmployer ?? 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='w-[95vw] sm:max-w-4xl lg:max-w-5xl max-h-[90vh] p-0 overflow-hidden flex flex-col rounded-3xl shadow-2xl'>
        {/* ── 1. Header Informasi Karyawan & Take Home Pay ────────────────── */}
        <DialogHeader className='shrink-0 p-6 pr-14 pb-5 border-b border-border/70 bg-muted/20'>
          <div className='flex flex-wrap items-start justify-between gap-4'>
            <div className='flex items-start gap-3.5'>
              <div className='size-12 rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-bold text-base flex items-center justify-center shrink-0 shadow-xs'>
                {initials}
              </div>
              <div className='space-y-1'>
                <div className='flex items-center gap-2 flex-wrap'>
                  <DialogTitle className='text-lg font-bold text-foreground'>
                    {detail.employeeName}
                  </DialogTitle>
                  <Badge variant='outline' className='text-[10px] font-mono font-semibold'>
                    {detail.employeeCode}
                  </Badge>
                  <Badge variant='blue' className='text-[10px] font-semibold'>
                    PTKP: {detail.ptkpStatus}
                  </Badge>
                  <Badge
                    variant={detail.status === 'paid' ? 'emerald' : 'secondary'}
                    className='text-[10px] uppercase font-bold tracking-wider'
                  >
                    {detail.status}
                  </Badge>
                </div>
                <DialogDescription className='text-xs text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-0.5'>
                  <span>
                    <b>Jabatan:</b> {detail.position}
                  </span>
                  <span>·</span>
                  <span>
                    <b>Dept:</b> {detail.department}
                  </span>
                  <span>·</span>
                  <span>
                    <b>Project:</b> {detail.project || 'Headquarter'}
                  </span>
                </DialogDescription>
              </div>
            </div>

            {/* Highlighted Take Home Pay Hero Card */}
            <div className='p-3.5 px-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 dark:bg-emerald-950/40 text-right min-w-[220px] shadow-xs'>
              <span className='text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider block'>
                Take Home Pay (Gaji Bersih)
              </span>
              <p className='text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5 tracking-tight font-mono'>
                {formatIDR(detail.netTakeHomePay)}
              </p>
              <div className='flex items-center justify-end gap-1.5 text-[10px] text-muted-foreground mt-0.5'>
                <IconBuildingBank size={12} />
                <span>
                  {detail.bankName} · {detail.bankAccountNumber}
                </span>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* ── 2. Scrollable Body: 2 Kolom (Pendapatan vs Potongan) ──────────── */}
        <ScrollArea className='flex-1 min-h-0 overflow-y-auto'>
          <div className='p-6 flex flex-col gap-5'>
            {/* Warning / Catatan Khusus */}
            {detail.warnings && detail.warnings.length > 0 && (
              <div className='p-3.5 rounded-xl border border-amber-300/80 bg-amber-50/90 dark:bg-amber-950/30 text-xs text-amber-900 dark:text-amber-200 space-y-1.5 shadow-2xs'>
                <div className='flex items-center gap-1.5 font-bold'>
                  <IconAlertTriangle size={16} className='text-amber-600 dark:text-amber-400 shrink-0' />
                  <span>Catatan & Warning Terdeteksi Pada Karyawan Ini:</span>
                </div>
                <ul className='list-disc pl-5 space-y-0.5 text-[11px]'>
                  {detail.warnings.map((w, idx) => (
                    <li key={idx}>{w}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Grid 2 Kolom: Kiri Pendapatan (Gross) | Kanan Seluruh Potongan */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-5 items-start'>
            {/* ══ KOLOM KIRI: PENDAPATAN (EARNINGS) ══ */}
            <div className='rounded-2xl border border-border/80 bg-card shadow-2xs overflow-hidden'>
              <div className='p-3.5 px-4 bg-muted/40 border-b border-border/60 flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <span className='p-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'>
                    <IconCash size={16} />
                  </span>
                  <span className='text-xs font-bold text-foreground'>1. Pendapatan (Gross)</span>
                </div>
                <b className='text-xs font-bold text-foreground font-mono'>
                  {formatIDR(detail.totalGross)}
                </b>
              </div>

              <div className='p-4 space-y-2.5 text-xs divide-y divide-border/40'>
                {/* Gaji Pokok */}
                <div className='flex justify-between items-center pt-1'>
                  <div>
                    <p className='font-semibold text-foreground'>Gaji Pokok</p>
                    <span className='text-[10px] text-muted-foreground'>Master upah bulanan</span>
                  </div>
                  <span className='font-bold text-foreground font-mono'>
                    {formatIDR(detail.baseSalary)}
                  </span>
                </div>

                {/* Tunjangan Tetap */}
                {fixedLines.map((line, idx) => (
                  <div key={`fixed-${idx}`} className='flex justify-between items-center pt-2'>
                    <div>
                      <p className='font-medium text-foreground'>{line.name}</p>
                      <Badge variant='outline' className='text-[9px] px-1 py-0 mt-0.5'>
                        Tunjangan Tetap
                      </Badge>
                    </div>
                    <span className='font-semibold text-foreground font-mono'>
                      {formatIDR(line.amount)}
                    </span>
                  </div>
                ))}

                {/* Tunjangan Variabel & Presensi */}
                {variableLines.map((line, idx) => (
                  <div key={`var-${idx}`} className='flex justify-between items-center pt-2'>
                    <div>
                      <p className='font-medium text-foreground'>{line.name}</p>
                      <Badge variant='blue' className='text-[9px] px-1 py-0 mt-0.5'>
                        Variabel
                      </Badge>
                    </div>
                    <span className='font-semibold text-foreground font-mono'>
                      {formatIDR(line.amount)}
                    </span>
                  </div>
                ))}

                {/* Upah Lembur jika ada dan belum masuk lines */}
                {detail.overtimePay > 0 && !variableLines.some((l) => l.code === 'OVERTIME') && (
                  <div className='flex justify-between items-center pt-2'>
                    <div>
                      <p className='font-medium text-foreground'>
                        Upah Lembur ({detail.overtimeHours} Jam)
                      </p>
                      <span className='text-[10px] text-muted-foreground'>Otomatis dari presensi</span>
                    </div>
                    <span className='font-semibold text-foreground font-mono'>
                      {formatIDR(detail.overtimePay)}
                    </span>
                  </div>
                )}
              </div>

              <div className='p-3 bg-muted/20 border-t border-border/60 flex justify-between items-center text-xs'>
                <span className='font-semibold text-muted-foreground'>Total Pendapatan Kotor</span>
                <span className='font-bold text-foreground font-mono'>
                  {formatIDR(detail.totalGross)}
                </span>
              </div>
            </div>

            {/* ══ KOLOM KANAN: POTONGAN DARI GAJI (DEDUCTIONS) ══ */}
            <div className='rounded-2xl border border-border/80 bg-card shadow-2xs overflow-hidden'>
              <div className='p-3.5 px-4 bg-muted/40 border-b border-border/60 flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <span className='p-1 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400'>
                    <IconReceipt size={16} />
                  </span>
                  <span className='text-xs font-bold text-foreground'>2. Potongan dari Gaji</span>
                </div>
                <b className='text-xs font-bold text-rose-600 dark:text-rose-400 font-mono'>
                  -{formatIDR(detail.totalDeductions)}
                </b>
              </div>

              <div className='p-4 space-y-3 text-xs divide-y divide-border/40'>
                {/* 2.1 BPJS Kesehatan Karyawan */}
                <div className='space-y-1.5 pt-1'>
                  <div className='flex items-center justify-between'>
                    <span className='font-bold text-foreground'>BPJS Kesehatan Karyawan</span>
                    <Badge
                      variant={detail.bpjsKesSource === 'billing' ? 'emerald' : 'amber'}
                      className='text-[9px] px-1.5 py-0'
                    >
                      {detail.bpjsKesSource === 'billing' ? 'Tagihan Upload' : 'Belum Ada Tagihan'}
                    </Badge>
                  </div>
                  <div className='flex justify-between items-center text-muted-foreground pl-2'>
                    <span>• Iuran Karyawan (1% Upah BPJS)</span>
                    <span className='font-semibold text-rose-600 dark:text-rose-400 font-mono'>
                      -{formatIDR(bpjsKes1Percent)}
                    </span>
                  </div>
                  {detail.bpjsKesFamilyExtra ? (
                    <div className='flex justify-between items-center text-muted-foreground pl-2'>
                      <span>• Potongan Anggota Keluarga Tambahan</span>
                      <span className='font-semibold text-rose-600 dark:text-rose-400 font-mono'>
                        -{formatIDR(detail.bpjsKesFamilyExtra)}
                      </span>
                    </div>
                  ) : null}
                </div>

                {/* 2.2 BPJS Ketenagakerjaan Karyawan */}
                <div className='space-y-1.5 pt-2.5'>
                  <span className='font-bold text-foreground block'>BPJS Ketenagakerjaan Karyawan</span>
                  <div className='flex justify-between items-center text-muted-foreground pl-2'>
                    <span>• JHT Karyawan (2%)</span>
                    <span className='font-semibold text-rose-600 dark:text-rose-400 font-mono'>
                      -{formatIDR(detail.bpjsTkJhtEmployee ?? 0)}
                    </span>
                  </div>
                  <div className='flex justify-between items-center text-muted-foreground pl-2'>
                    <span>• JP Karyawan (1%, dasar plafon cap)</span>
                    <span className='font-semibold text-rose-600 dark:text-rose-400 font-mono'>
                      -{formatIDR(detail.bpjsTkJpEmployee ?? 0)}
                    </span>
                  </div>
                </div>

                {/* 2.3 Pajak PPh 21 */}
                <div className='space-y-1.5 pt-2.5'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <span className='font-bold text-foreground'>PPh 21 Bulanan</span>
                      <span className='text-[10px] text-muted-foreground block'>
                        TER PMK 168/2023 · Bruto Pajak {formatIDR(detail.taxableIncome ?? 0)}
                      </span>
                    </div>
                    <span className='font-bold text-rose-600 dark:text-rose-400 font-mono'>
                      -{formatIDR(detail.pph21Tax)}
                    </span>
                  </div>

                  {detail.thrTaxInstallment && detail.thrTaxInstallment > 0 ? (
                    <div className='flex justify-between items-center text-muted-foreground pl-2'>
                      <span>
                        • Cicilan PPh 21 THR (Bln {detail.thrTaxInstallmentInfo?.currentInstallmentMonth || 1}/{detail.thrTaxInstallmentInfo?.tenorMonths || 3})
                      </span>
                      <span className='font-semibold text-rose-600 dark:text-rose-400 font-mono'>
                        -{formatIDR(detail.thrTaxInstallment)}
                      </span>
                    </div>
                  ) : null}
                </div>

                {/* 2.4 Potongan Presensi & Lainnya */}
                {(detail.unpaidLeaveDeduction > 0 ||
                  detail.lateDeduction > 0 ||
                  detail.loanDeduction > 0) && (
                  <div className='space-y-1.5 pt-2.5'>
                    <span className='font-bold text-foreground block'>Presensi & Pinjaman</span>
                    {detail.unpaidLeaveDeduction > 0 && (
                      <div className='flex justify-between items-center text-muted-foreground pl-2'>
                        <span>• Potongan Unpaid Leave ({detail.absentCount} hari)</span>
                        <span className='font-semibold text-rose-600 dark:text-rose-400 font-mono'>
                          -{formatIDR(detail.unpaidLeaveDeduction)}
                        </span>
                      </div>
                    )}
                    {detail.lateDeduction > 0 && (
                      <div className='flex justify-between items-center text-muted-foreground pl-2'>
                        <span>• Denda Keterlambatan ({detail.lateCount}x)</span>
                        <span className='font-semibold text-rose-600 dark:text-rose-400 font-mono'>
                          -{formatIDR(detail.lateDeduction)}
                        </span>
                      </div>
                    )}
                    {detail.loanDeduction > 0 && (
                      <div className='flex justify-between items-center text-muted-foreground pl-2'>
                        <span>• Cicilan Pinjaman / Potongan Lain</span>
                        <span className='font-semibold text-rose-600 dark:text-rose-400 font-mono'>
                          -{formatIDR(detail.loanDeduction)}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className='p-3 bg-muted/20 border-t border-border/60 flex justify-between items-center text-xs'>
                <span className='font-semibold text-muted-foreground'>Total Seluruh Potongan</span>
                <span className='font-bold text-rose-600 dark:text-rose-400 font-mono'>
                  -{formatIDR(detail.totalDeductions)}
                </span>
              </div>
            </div>
          </div>

          {/* ══ 3. TANGGUNGAN PERUSAHAAN (COMPANY BENEFIT - NON-THP) ══ */}
          <div className='rounded-2xl border border-indigo-200/80 dark:border-indigo-900/50 bg-indigo-50/30 dark:bg-indigo-950/20 p-4 space-y-3'>
            <div className='flex items-center justify-between flex-wrap gap-2'>
              <div className='flex items-center gap-2'>
                <span className='p-1 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'>
                  <IconShieldCheck size={16} />
                </span>
                <div>
                  <h4 className='text-xs font-bold text-foreground'>
                    3. Tanggungan Perusahaan (Benefit Non-THP)
                  </h4>
                  <p className='text-[10px] text-muted-foreground'>
                    Ditanggung sepenuhnya oleh perusahaan — <b>TIDAK memotong gaji bersih</b>, sebagian menjadi dasar penambah bruto pajak.
                  </p>
                </div>
              </div>
              <Badge variant='outline' className='text-[10px] font-mono bg-background'>
                Total Benefit: {formatIDR(detail.bpjsKesEmployer + companyTkTotal)}
              </Badge>
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1'>
              {/* BPJS Kesehatan Perusahaan */}
              <div className='p-3 rounded-xl bg-background/80 border border-border/60 space-y-1.5'>
                <div className='flex items-center justify-between'>
                  <span className='font-semibold text-foreground'>BPJS Kesehatan (4%)</span>
                  <span className='font-bold text-indigo-600 dark:text-indigo-400 font-mono'>
                    +{formatIDR(detail.bpjsKesEmployer)}
                  </span>
                </div>
                <p className='text-[10px] text-muted-foreground'>
                  Dasar iuran upah maks cap. Masuk ke penambah penghasilan bruto kena pajak PPh 21.
                </p>
              </div>

              {/* BPJS TK Perusahaan */}
              <div className='p-3 rounded-xl bg-background/80 border border-border/60 space-y-1.5'>
                <div className='flex items-center justify-between'>
                  <span className='font-semibold text-foreground'>BPJS TK Total Perusahaan</span>
                  <span className='font-bold text-indigo-600 dark:text-indigo-400 font-mono'>
                    +{formatIDR(companyTkTotal)}
                  </span>
                </div>
                <div className='grid grid-cols-2 gap-x-2 gap-y-0.5 text-[10px] text-muted-foreground pt-1'>
                  <div>• JKK: {formatIDR(detail.bpjsTkJkk ?? 0)}</div>
                  <div>• JKM (0.3%): {formatIDR(detail.bpjsTkJkm ?? 0)}</div>
                  <div>• JHT (3.7%): {formatIDR(detail.bpjsTkJhtEmployer ?? 0)}</div>
                  <div>• JP (2%): {formatIDR(detail.bpjsTkJpEmployer ?? 0)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* ══ 4. RINGKASAN PERHITUNGAN AKHIR (TAKE HOME PAY) ══ */}
          <div className='rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-background dark:from-emerald-950/30 dark:via-emerald-950/15 dark:to-background p-5 space-y-4 shadow-xs'>
            <div className='flex items-center justify-between flex-wrap gap-2'>
              <div className='flex items-center gap-2.5'>
                <span className='p-1.5 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'>
                  <IconCalculator size={18} />
                </span>
                <div>
                  <h4 className='text-xs font-bold text-foreground'>
                    4. Total Perhitungan Akhir (Take Home Pay)
                  </h4>
                  <p className='text-[10px] text-muted-foreground'>
                    Rumus: Total Pendapatan Kotor (Gross) dikurangi Total Seluruh Potongan Gaji.
                  </p>
                </div>
              </div>

              <Badge variant='emerald' className='text-[10px] font-semibold px-2 py-0.5'>
                Net Disbursed
              </Badge>
            </div>

            {/* Formula & Breakdown visual cards */}
            <div className='grid grid-cols-1 sm:grid-cols-3 gap-3 items-stretch text-xs pt-1'>
              {/* 1. Gross */}
              <div className='p-3.5 rounded-xl bg-background/90 border border-border/70 space-y-1 shadow-2xs'>
                <div className='flex items-center justify-between text-muted-foreground'>
                  <span className='text-[11px] font-medium'>1. Total Pendapatan</span>
                  <span className='text-[10px] font-semibold text-emerald-600 dark:text-emerald-400'>Gross</span>
                </div>
                <p className='text-base font-bold text-foreground font-mono'>
                  {formatIDR(detail.totalGross)}
                </p>
                <p className='text-[10px] text-muted-foreground'>
                  Gaji pokok + tunjangan + lembur
                </p>
              </div>

              {/* 2. Deductions */}
              <div className='p-3.5 rounded-xl bg-background/90 border border-border/70 space-y-1 shadow-2xs'>
                <div className='flex items-center justify-between text-muted-foreground'>
                  <span className='text-[11px] font-medium'>2. Total Potongan</span>
                  <span className='text-[10px] font-semibold text-rose-600 dark:text-rose-400'>Deductions</span>
                </div>
                <p className='text-base font-bold text-rose-600 dark:text-rose-400 font-mono'>
                  -{formatIDR(detail.totalDeductions)}
                </p>
                <p className='text-[10px] text-muted-foreground'>
                  BPJS 1% & TK + PPh 21 + presensi
                </p>
              </div>

              {/* 3. Take Home Pay Result */}
              <div className='p-3.5 rounded-xl bg-emerald-500/15 dark:bg-emerald-950/50 border border-emerald-500/40 space-y-1 ring-1 ring-emerald-500/20 shadow-2xs'>
                <div className='flex items-center justify-between text-emerald-900 dark:text-emerald-200'>
                  <span className='text-[11px] font-bold'>Gaji Bersih Diterima</span>
                  <span className='text-[10px] font-bold text-emerald-600 dark:text-emerald-400 font-mono'>
                    THP
                  </span>
                </div>
                <p className='text-lg font-extrabold text-emerald-600 dark:text-emerald-400 font-mono tracking-tight'>
                  {formatIDR(detail.netTakeHomePay)}
                </p>
                <div className='flex items-center gap-1 text-[10px] text-muted-foreground truncate'>
                  <IconBuildingBank size={12} className='shrink-0 text-emerald-600 dark:text-emerald-400' />
                  <span className='truncate'>{detail.bankName} · {detail.bankAccountNumber}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>

        {/* ── Footer Modal: Tombol Tutup di Pojok Kanan ────────────────────── */}
        <DialogFooter className='shrink-0 p-4 px-6 border-t border-border/70 bg-muted/20 flex items-center justify-between gap-3'>
          <div className='text-[11px] text-muted-foreground hidden sm:block'>
            Rincian kalkulasi payroll karyawan · Periode berjalan
          </div>

          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={() => onOpenChange(false)}
            className='h-9 px-6 text-xs font-semibold rounded-xl cursor-pointer hover:bg-muted ml-auto'
          >
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
