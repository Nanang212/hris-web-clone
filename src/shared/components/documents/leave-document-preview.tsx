import dayjs from 'dayjs'
import { IconFileCertificate, IconHeartbeat } from '@tabler/icons-react'
import { Badge } from '@/shared/components/ui/badge'
import { cn } from '@/shared/lib/utils'

export interface LeaveDocumentPreviewProps {
  documentNumber?: string
  employeeName: string
  nip?: string
  position?: string
  department?: string
  location?: string
  project?: string
  leaveType?: string // 'annual' | 'sick' | 'special' | 'maternity' | 'unpaid'
  startDate?: string
  endDate?: string
  durationDays?: number | string
  halfDay?: string // 'no' | 'morning' | 'afternoon'
  reason?: string
  diagnosis?: string
  clinicOrHospital?: string
  doctorName?: string
  attachmentFileName?: string
  approverName?: string
  approverTitle?: string
  divHeadName?: string
  divHeadTitle?: string
  status?: 'pending' | 'approved' | 'rejected'
  className?: string
  compact?: boolean
}

export function LeaveDocumentPreview({
  documentNumber = 'FORM/BFP-HRD/2026/VIII/042',
  employeeName,
  nip = '20261600475',
  position = 'Security Officer',
  department = 'Operations & Logistics',
  location = 'AFT Tambolaka',
  project = 'AFT Tambolaka',
  leaveType = 'annual',
  startDate = '2026-08-10',
  endDate = '2026-08-11',
  durationDays = 2,
  halfDay = 'no',
  reason = 'Istirahat Pemulihan Sakit dengan Surat Keterangan Dokter',
  diagnosis = 'Dyspepsia Syndrome & Febris Akut (Kelelahan Fisik)',
  clinicOrHospital = 'Klinik Pratama Pertamina Bina Medika',
  doctorName = 'dr. H. Hendra Wicaksono, Sp.Ok',
  attachmentFileName = 'SKD_Pertamina_Bina_Medika_2026.pdf',
  approverName = 'Oktavianus Taufan Juwa',
  approverTitle = 'HO AFT Tambolaka',
  divHeadName = 'Joko Priyambodo',
  divHeadTitle = 'Direktur Pemasaran & Operasi',
  status = 'pending',
  className,
  compact = false,
}: LeaveDocumentPreviewProps) {
  const isSick = leaveType === 'sick' || leaveType.toLowerCase().includes('sakit')
  const isApproved = status === 'approved'
  const isRejected = status === 'rejected'

  const effectiveLocation = location === project ? location : `${location} (${project})`

  const getLeaveTypeLabel = (type: string) => {
    switch (type.toLowerCase()) {
      case 'sick':
      case 'sakit':
        return 'Izin Sakit (Sick Leave)'
      case 'annual':
      case 'tahunan':
        return 'Cuti Tahunan (Annual Leave)'
      case 'special':
      case 'khusus':
        return 'Izin Pribadi / Khusus'
      case 'maternity':
      case 'melahirkan':
        return 'Cuti Melahirkan (Maternity)'
      default:
        return type.toUpperCase()
    }
  }

  return (
    <div
      className={cn(
        'bg-white text-slate-900 dark:bg-zinc-950 dark:text-zinc-100 rounded-xl border-2 border-slate-300 dark:border-zinc-700 shadow-sm overflow-hidden text-xs',
        compact ? 'p-3.5 space-y-3' : 'p-5 sm:p-6 space-y-4',
        className,
      )}
    >
      {/* ── KOP PT BINTANG FAJAR PERSADA ── */}
      <div className='flex items-center justify-between pb-2.5 border-b-2 border-slate-900 dark:border-zinc-200 gap-4'>
        <div className='flex items-center gap-2.5'>
          <div className='relative size-8 flex items-center justify-center shrink-0'>
            <svg viewBox='0 0 100 100' className='size-8'>
              <polygon
                points='50,5 64,35 98,38 72,62 80,95 50,78 20,95 28,62 2,38 36,35'
                className='fill-amber-500 stroke-blue-900'
                strokeWidth='4'
              />
              <path
                d='M10 50 Q 50 20 90 50 Q 50 80 10 50'
                fill='none'
                className='stroke-blue-800'
                strokeWidth='5'
              />
            </svg>
          </div>
          <div>
            <h2 className='text-sm sm:text-base font-black tracking-wider text-blue-950 dark:text-blue-400 leading-none'>
              PT. BINTANG FAJAR PERSADA
            </h2>
            <p className='text-[8px] tracking-widest text-slate-500 dark:text-slate-400 mt-0.5 font-semibold uppercase'>
              Manpower Supply & Facility Support Services
            </p>
          </div>
        </div>

        <div className='text-right'>
          <span className='inline-block px-2 py-0.5 bg-slate-100 dark:bg-zinc-800 rounded font-mono text-[9.5px] font-bold border border-slate-300 dark:border-zinc-700'>
            {documentNumber}
          </span>
        </div>
      </div>

      {/* Document Title Header Banner */}
      <div className='text-center space-y-0.5'>
        <h3 className='text-xs sm:text-sm font-black uppercase tracking-wide underline underline-offset-4 text-blue-950 dark:text-blue-400'>
          {isSick
            ? 'FORMULIR VERIFIKASI SICK LEAVE (IZIN SAKIT)'
            : 'FORMULIR PERMOHONAN CUTI KARYAWAN'}
        </h3>
        <p className='text-[9px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold'>
          {isSick
            ? 'Rekap Kesehatan Kerja & Dispensasi Medis Karyawan'
            : 'Divisi Sumber Daya Manusia & Operasional'}
        </p>
      </div>

      {/* ── SECTION INFORMASI PEGAWAI ── */}
      <div className='rounded-lg border border-slate-300 dark:border-zinc-700 p-3.5 bg-slate-50/60 dark:bg-zinc-900/40 text-xs space-y-2.5'>
        <div className='flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-2'>
          <span className='font-bold text-[10.5px] uppercase tracking-wider text-slate-700 dark:text-zinc-300'>
            Data Pemohon & Penempatan
          </span>
          <span className='inline-flex items-center gap-1.5 font-bold text-[10px]'>
            {isApproved ? (
              <span className='text-emerald-700 dark:text-emerald-400 font-bold'>✓ Disetujui</span>
            ) : isRejected ? (
              <span className='text-red-700 dark:text-red-400 font-bold'>✗ Ditolak</span>
            ) : (
              <span className='text-amber-700 dark:text-amber-400 font-bold flex items-center gap-1'>
                <span className='size-1.5 rounded-full bg-amber-500 animate-pulse' />
                Menunggu Persetujuan
              </span>
            )}
          </span>
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-[11px] leading-tight'>
          <div className='space-y-1.5'>
            <div className='flex items-baseline gap-2'>
              <span className='w-28 shrink-0 font-semibold text-slate-600 dark:text-zinc-400'>Nama Pemohon</span>
              <span className='text-slate-400 shrink-0'>:</span>
              <span className='font-bold text-slate-900 dark:text-zinc-100'>{employeeName}</span>
            </div>
            <div className='flex items-baseline gap-2'>
              <span className='w-28 shrink-0 font-semibold text-slate-600 dark:text-zinc-400'>NIP Pegawai</span>
              <span className='text-slate-400 shrink-0'>:</span>
              <span className='font-mono text-slate-800 dark:text-zinc-200'>{nip}</span>
            </div>
            <div className='flex items-baseline gap-2'>
              <span className='w-28 shrink-0 font-semibold text-slate-600 dark:text-zinc-400'>Jabatan</span>
              <span className='text-slate-400 shrink-0'>:</span>
              <span className='text-slate-800 dark:text-zinc-200'>{position}</span>
            </div>
          </div>

          <div className='space-y-1.5'>
            <div className='flex items-baseline gap-2'>
              <span className='w-28 shrink-0 font-semibold text-slate-600 dark:text-zinc-400'>Departemen</span>
              <span className='text-slate-400 shrink-0'>:</span>
              <span className='text-slate-800 dark:text-zinc-200'>{department}</span>
            </div>
            <div className='flex items-baseline gap-2'>
              <span className='w-28 shrink-0 font-semibold text-slate-600 dark:text-zinc-400'>Lokasi / Proyek</span>
              <span className='text-slate-400 shrink-0'>:</span>
              <span className='text-slate-800 dark:text-zinc-200'>{effectiveLocation}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── SECTION DETAIL PERMOHONAN CUTI / DISPENSASI ── */}
      <div className='rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 p-3.5 space-y-2.5 text-xs'>
        <div className='flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-2'>
          <span className='font-bold text-[10.5px] uppercase tracking-wider text-slate-700 dark:text-zinc-300'>
            Rincian Pengajuan Cuti / Dispensasi
          </span>
          <Badge variant='outline' className='bg-primary/10 text-primary border-primary/30 text-[10px] font-bold px-2.5 py-0.5'>
            {getLeaveTypeLabel(leaveType)}
          </Badge>
        </div>

        <div className='flex flex-wrap items-center justify-between gap-2 text-xs'>
          <div className='flex items-baseline gap-2'>
            <span className='w-28 shrink-0 font-semibold text-slate-600 dark:text-zinc-400'>Periode Tanggal</span>
            <span className='text-slate-400 shrink-0'>:</span>
            <span className='font-bold text-slate-900 dark:text-zinc-100'>
              {startDate} <span className='font-normal text-muted-foreground'>s.d.</span> {endDate}
            </span>
          </div>
          <div className='flex items-center gap-1.5'>
            <span className='font-semibold text-slate-600 dark:text-zinc-400 text-[11px]'>Total Durasi:</span>
            <span className='font-black text-rose-600 dark:text-rose-400 px-2.5 py-0.5 rounded bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900'>
              {durationDays} Hari {halfDay !== 'no' && <span className='text-[10px] font-normal text-muted-foreground'>({halfDay === 'morning' ? 'Pagi' : 'Siang'})</span>}
            </span>
          </div>
        </div>

        <div className='flex items-start gap-2 text-xs pt-2 border-t border-slate-200/80 dark:border-zinc-800/80'>
          <span className='w-28 shrink-0 font-semibold text-slate-600 dark:text-zinc-400'>Keperluan / Alasan</span>
          <span className='text-slate-400 shrink-0'>:</span>
          <span className='text-slate-800 dark:text-zinc-200 leading-relaxed font-medium'>
            {reason || '-'}
          </span>
        </div>
      </div>

      {/* ── SECTION KHUSUS IZIN SAKIT (SKD) ── */}
      {isSick && (
        <div className='rounded-lg border border-rose-300 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 p-3.5 space-y-2.5 text-xs'>
          <div className='flex items-center justify-between border-b border-rose-200/80 dark:border-rose-900/40 pb-2'>
            <span className='font-bold text-rose-950 dark:text-rose-300 flex items-center gap-1.5 text-xs'>
              <IconHeartbeat size={15} className='text-rose-600 shrink-0' />
              Verifikasi Medis & Surat Keterangan Dokter (SKD)
            </span>
            <Badge variant='outline' className='bg-emerald-100 text-emerald-800 border-emerald-300 text-[9px] font-bold font-mono'>
              VALIDATED BY HRIS
            </Badge>
          </div>

          <div className='space-y-2 text-xs'>
            <div className='flex items-start gap-2'>
              <span className='w-32 shrink-0 font-semibold text-slate-600 dark:text-zinc-400'>Diagnosa Dokter</span>
              <span className='text-slate-400 shrink-0'>:</span>
              <span className='font-bold italic text-slate-900 dark:text-zinc-100 leading-snug'>
                {diagnosis}
              </span>
            </div>

            <div className='flex items-start gap-2'>
              <span className='w-32 shrink-0 font-semibold text-slate-600 dark:text-zinc-400'>Fasilitas Kesehatan</span>
              <span className='text-slate-400 shrink-0'>:</span>
              <span className='text-slate-800 dark:text-zinc-200 font-medium'>{clinicOrHospital}</span>
            </div>

            <div className='flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-rose-200/60 dark:border-rose-900/40'>
              <div className='flex items-baseline gap-2'>
                <span className='w-32 shrink-0 font-semibold text-slate-600 dark:text-zinc-400'>Dokter Pemeriksa</span>
                <span className='text-slate-400 shrink-0'>:</span>
                <span className='text-slate-800 dark:text-zinc-200 font-medium'>{doctorName}</span>
              </div>
              <div className='flex items-center gap-1.5 text-primary font-mono text-[10.5px] font-semibold bg-white dark:bg-zinc-900 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-900/60 shadow-xs max-w-full overflow-hidden'>
                <IconFileCertificate className='size-3.5 text-rose-600 shrink-0' />
                <span className='truncate max-w-[200px]' title={attachmentFileName}>{attachmentFileName}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── SECTION PENGESAHAN & TANDA TANGAN DIGITAL 3 KOLOM ── */}
      <div className='pt-2 border-t-2 border-slate-900 dark:border-zinc-300 space-y-2.5'>
        <div className='text-left'>
          <p className='text-[9.5px] font-semibold text-slate-700 dark:text-zinc-300'>
            {location}, {dayjs().format('DD MMMM YYYY')}
          </p>
        </div>

        <div className='grid grid-cols-3 gap-2.5 text-center text-xs'>
          {/* Kolom 1: Pemohon */}
          <div className='flex flex-col items-center justify-between min-h-[95px] p-2 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/40 dark:bg-zinc-900/20'>
            <p className='text-[9.5px] font-semibold text-muted-foreground'>Yang mengajukan,</p>
            <div className='my-1 py-0.5 px-1.5 rounded border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-center'>
              <span className='text-[8px] font-bold text-primary block'>✓ DIAJUKAN VIA HRIS</span>
              <span className='text-[7.5px] font-mono text-muted-foreground'>Akun Terverifikasi</span>
            </div>
            <div>
              <p className='font-bold underline text-[10.5px]'>{employeeName}</p>
              <p className='text-muted-foreground text-[8.5px]'>{position}</p>
            </div>
          </div>

          {/* Kolom 2: Mengetahui (Head Departemen) */}
          <div className='flex flex-col items-center justify-between min-h-[95px] p-2 rounded-lg border border-dashed border-amber-300 bg-amber-50/40 dark:bg-amber-950/20'>
            <p className='text-[9.5px] font-semibold text-muted-foreground'>Mengetahui (Tahap 1),</p>
            <div className='my-1 py-0.5 px-1.5 rounded border border-amber-300 bg-amber-100/60 dark:bg-amber-900/40 text-amber-900 dark:text-amber-200 text-center'>
              {isApproved ? (
                <span className='text-[8px] font-bold text-emerald-800 block uppercase'>✓ DISETUJUI</span>
              ) : isRejected ? (
                <span className='text-[8px] font-bold text-red-800 block uppercase'>✗ DITOLAK</span>
              ) : (
                <span className='text-[8px] font-bold block uppercase'>MENUNGGU ACC</span>
              )}
              <span className='text-[7.5px] font-mono'>Head Departemen</span>
            </div>
            <div>
              <p className='font-bold underline text-[10.5px]'>{approverName}</p>
              <p className='text-muted-foreground text-[8.5px]'>{approverTitle}</p>
            </div>
          </div>

          {/* Kolom 3: Menyetujui (Head Divisi & HRD) */}
          <div className='flex flex-col items-center justify-between min-h-[95px] p-2 rounded-lg border border-dashed border-slate-300 dark:border-zinc-800 bg-muted/20'>
            <p className='text-[9.5px] font-semibold text-muted-foreground'>Menyetujui (Tahap 2),</p>
            <div className='my-1 py-0.5 px-1.5 rounded border border-border bg-background text-muted-foreground text-center'>
              {isApproved ? (
                <span className='text-[8px] font-bold text-emerald-800 block uppercase'>✓ DISETUJUI</span>
              ) : isRejected ? (
                <span className='text-[8px] font-bold text-red-800 block uppercase'>✗ DITOLAK</span>
              ) : (
                <span className='text-[8px] font-bold block uppercase'>MENUNGGU ACC</span>
              )}
              <span className='text-[7.5px] font-mono'>Head Divisi / HRD</span>
            </div>
            <div>
              <p className='font-bold underline text-[10.5px]'>{divHeadName}</p>
              <p className='text-muted-foreground text-[8.5px]'>{divHeadTitle}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Dokumen Catatan Kaki */}
      <div className='p-2 bg-slate-50 dark:bg-zinc-900 text-[8px] text-slate-500 dark:text-zinc-400 space-y-0.5 rounded'>
        <p>* Dokumen resmi pengajuan cuti & dispensasi PT. Bintang Fajar Persada diterbitkan secara digital melalui HRIS.</p>
        <p>* Persetujuan dilakukan berjenjang sesuai alur Standar Operasional Prosedur (SOP) Divisi HRD & Operasional.</p>
      </div>
    </div>
  )
}
