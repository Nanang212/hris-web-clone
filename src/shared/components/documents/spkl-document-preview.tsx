import dayjs from 'dayjs'
import { cn } from '@/shared/lib/utils'

export interface SpklDocumentPreviewProps {
  orderNumber?: string
  employeeName: string
  nip?: string
  position?: string
  department?: string
  location?: string
  periodLabel?: string
  isHoliday?: boolean
  date?: string
  eventDescription?: string
  taskDescription?: string
  startTime?: string
  endTime?: string
  actualStartTime?: string
  actualEndTime?: string
  totalHours?: number
  approverName?: string
  approverTitle?: string
  status?: 'pending' | 'approved' | 'rejected'
  className?: string
  compact?: boolean
}

export function SpklDocumentPreview({
  orderNumber = 'SPKL/BFP/2026/VIII/01',
  employeeName,
  nip = '20261600475',
  position = 'Security Officer',
  department = 'Operations & Logistics',
  location = 'AFT Tambolaka',
  periodLabel = 'Agustus 2026',
  isHoliday = true,
  date = '17/08/2026',
  eventDescription = 'HUT Republik Indonesia',
  taskDescription = 'Patroli Area Kantor AFT Tambolaka',
  startTime = '07:00',
  endTime = '19:00',
  actualStartTime = '07:00',
  actualEndTime = '19:00',
  totalHours = 12,
  approverName = 'Oktavianus Taufan Juwa',
  approverTitle = 'HO AFT Tambolaka',
  status = 'pending',
  className,
  compact = false,
}: SpklDocumentPreviewProps) {
  const isApproved = status === 'approved'
  const isRejected = status === 'rejected'

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
            {orderNumber}
          </span>
        </div>
      </div>

      {/* ── DOCUMENT FORM CONTAINER ── */}
      <div className='border-2 border-slate-900 dark:border-zinc-300 rounded overflow-hidden'>
        {/* Banner Title */}
        <div className='bg-slate-200 dark:bg-zinc-800 p-1.5 text-center font-black uppercase tracking-wider border-b border-slate-900 dark:border-zinc-300 text-xs sm:text-sm text-slate-900 dark:text-zinc-100'>
          SURAT PERINTAH KERJA LEMBUR
        </div>

        {/* Header Metadata Section */}
        <div className='bg-slate-100/60 dark:bg-zinc-900/60 p-2 font-semibold text-[10.5px] border-b border-slate-900 dark:border-zinc-300'>
          Memberikan perintah lembur kepada:
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-900 dark:divide-zinc-300 text-[11px] leading-tight'>
          {/* Kolom Kiri: Identitas Karyawan */}
          <div className='p-2.5 space-y-1.5'>
            <div className='flex items-baseline gap-1'>
              <span className='w-28 font-medium shrink-0 text-slate-600 dark:text-zinc-400'>Nama karyawan</span>
              <span className='text-slate-400 shrink-0'>:</span>
              <span className='font-bold text-slate-900 dark:text-zinc-100 truncate'>{employeeName}</span>
            </div>
            <div className='flex items-baseline gap-1'>
              <span className='w-28 font-medium shrink-0 text-slate-600 dark:text-zinc-400'>NIP</span>
              <span className='text-slate-400 shrink-0'>:</span>
              <span className='font-mono font-medium'>{nip}</span>
            </div>
            <div className='flex items-baseline gap-1'>
              <span className='w-28 font-medium shrink-0 text-slate-600 dark:text-zinc-400'>Jabatan</span>
              <span className='text-slate-400 shrink-0'>:</span>
              <span className='truncate'>{position}</span>
            </div>
            <div className='flex items-baseline gap-1'>
              <span className='w-28 font-medium shrink-0 text-slate-600 dark:text-zinc-400'>Lokasi lembur</span>
              <span className='text-slate-400 shrink-0'>:</span>
              <span className='truncate font-medium'>{location}</span>
            </div>
          </div>

          {/* Kolom Kanan: Jenis Hari & Periode Lembur */}
          <div className='p-2.5 space-y-2'>
            <div className='flex items-center gap-2'>
              <span className='w-24 font-medium shrink-0 text-slate-600 dark:text-zinc-400'>Lembur pada</span>
              <div className='flex items-center gap-3 text-[10.5px]'>
                <label className='flex items-center gap-1.5'>
                  <input
                    type='checkbox'
                    readOnly
                    checked={!isHoliday}
                    className='size-3 rounded accent-primary pointer-events-none'
                  />
                  <span className={cn(!isHoliday && 'font-bold text-slate-900 dark:text-zinc-100')}>
                    Hari kerja
                  </span>
                </label>
                <label className='flex items-center gap-1.5'>
                  <input
                    type='checkbox'
                    readOnly
                    checked={isHoliday}
                    className='size-3 rounded accent-blue-600 pointer-events-none'
                  />
                  <span className={cn(isHoliday && 'font-bold text-blue-700 dark:text-blue-400')}>
                    Hari libur
                  </span>
                </label>
              </div>
            </div>

            <div className='flex items-baseline gap-1 pt-1 border-t border-slate-200 dark:border-zinc-800'>
              <span className='w-24 font-medium shrink-0 text-slate-600 dark:text-zinc-400'>Periode lembur</span>
              <span className='text-slate-400 shrink-0'>:</span>
              <span className='font-bold text-slate-900 dark:text-zinc-100 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200'>
                {periodLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Keterangan Lembur - Sesuai form fisik BFP */}
        <div className='p-2 px-3 bg-slate-100/70 dark:bg-zinc-800/60 border-t border-slate-900 dark:border-zinc-300 text-[11px] flex items-baseline gap-2'>
          <span className='font-bold text-slate-700 dark:text-zinc-300 shrink-0'>Keterangan:</span>
          <span className='font-semibold text-slate-900 dark:text-zinc-100'>{eventDescription || '-'}</span>
        </div>

        {/* Uraian Tugas Kerja Lembur */}
        <div className='p-2 px-3 bg-slate-50 dark:bg-zinc-900 border-t border-slate-900 dark:border-zinc-300 text-[11px] font-medium text-center'>
          <strong>Uraian Tugas Kerja Lembur :</strong>{' '}
          <span className='uppercase font-bold text-slate-900 dark:text-zinc-100'>
            {taskDescription || 'TUGAS OPERASIONAL LAPANGAN'}
          </span>
        </div>

        {/* Tabel Jam Lembur 4 Sub-Kolom */}
        <table className='w-full text-center text-[10.5px] border-collapse border-t border-slate-900 dark:border-zinc-300'>
          <thead>
            <tr className='bg-slate-200 dark:bg-zinc-800 font-bold'>
              <th rowSpan={2} className='border-r border-b border-slate-900 dark:border-zinc-300 p-1 w-8'>
                No
              </th>
              <th rowSpan={2} className='border-r border-b border-slate-900 dark:border-zinc-300 p-1 w-24'>
                Tanggal lembur
              </th>
              <th colSpan={4} className='border-r border-b border-slate-900 dark:border-zinc-300 p-1'>
                Jam lembur
              </th>
              <th rowSpan={2} className='border-r border-b border-slate-900 dark:border-zinc-300 p-1 w-20'>
                Total Jam Lembur
              </th>
              <th colSpan={2} className='border-b border-slate-900 dark:border-zinc-300 p-1 w-28'>
                Paraf
              </th>
            </tr>
            <tr className='bg-slate-100 dark:bg-zinc-800/70 font-semibold text-[9.5px]'>
              <th className='border-r border-b border-slate-900 dark:border-zinc-300 p-1'>Mulai</th>
              <th className='border-r border-b border-slate-900 dark:border-zinc-300 p-1'>Selesai</th>
              <th className='border-r border-b border-slate-900 dark:border-zinc-300 p-1'>Mulai</th>
              <th className='border-r border-b border-slate-900 dark:border-zinc-300 p-1'>Selesai</th>
              <th className='border-r border-b border-slate-900 dark:border-zinc-300 p-1'>Karyawan</th>
              <th className='border-b border-slate-900 dark:border-zinc-300 p-1'>Atasan</th>
            </tr>
          </thead>
          <tbody>
            <tr className='divide-x divide-slate-900 dark:divide-zinc-300 bg-white dark:bg-zinc-950 font-medium'>
              <td className='border-r border-b border-slate-900 dark:border-zinc-300 p-1.5'>1</td>
              <td className='border-r border-b border-slate-900 dark:border-zinc-300 p-1.5 font-bold whitespace-nowrap'>
                {date}
              </td>
              <td className='border-r border-b border-slate-900 dark:border-zinc-300 p-1.5 font-mono'>{startTime}</td>
              <td className='border-r border-b border-slate-900 dark:border-zinc-300 p-1.5 font-mono'>{endTime}</td>
              <td className='border-r border-b border-slate-900 dark:border-zinc-300 p-1.5 font-mono font-bold text-primary'>
                {actualStartTime}
              </td>
              <td className='border-r border-b border-slate-900 dark:border-zinc-300 p-1.5 font-mono font-bold text-primary'>
                {actualEndTime}
              </td>
              <td className='border-r border-b border-slate-900 dark:border-zinc-300 p-1.5 font-mono font-black text-rose-600 dark:text-rose-400'>
                {totalHours} Jam
              </td>
              <td className='border-r border-b border-slate-900 dark:border-zinc-300 p-1.5 text-[9px]'>
                <span className='font-script italic text-slate-600 text-xs'>✓ Paraf</span>
              </td>
              <td className='border-b border-slate-900 dark:border-zinc-300 p-1.5 text-[9px]'>
                {isApproved ? (
                  <span className='text-emerald-700 font-bold'>✓ ACC</span>
                ) : (
                  <span className='text-amber-600 font-mono text-[9px]'>Review</span>
                )}
              </td>
            </tr>

            {/* Baris Total Jam Lembur */}
            <tr className='font-bold bg-slate-100 dark:bg-zinc-900'>
              <td
                colSpan={6}
                className='border-r border-b border-slate-900 dark:border-zinc-300 p-1.5 text-center uppercase tracking-wider text-[10px]'
              >
                TOTAL JAM LEMBUR
              </td>
              <td className='border-r border-b border-slate-900 dark:border-zinc-300 p-1.5 font-black text-slate-900 dark:text-zinc-100 text-[11px]'>
                {totalHours} Jam
              </td>
              <td colSpan={2} className='border-b border-slate-900 dark:border-zinc-300 p-1.5'></td>
            </tr>
          </tbody>
        </table>

        {/* Pengesahan Tanda Tangan SPKL 2 Kolom */}
        <div className='grid grid-cols-2 divide-x divide-slate-900 dark:divide-zinc-300 border-b border-slate-900 dark:border-zinc-300 text-center'>
          <div className='p-2.5 flex flex-col justify-between min-h-[95px]'>
            <p className='text-[10px] font-semibold text-muted-foreground'>Dibuat oleh:</p>
            <div className='my-1'>
              <span className='font-script text-base text-slate-800 italic underline decoration-slate-400'>
                {employeeName}
              </span>
            </div>
            <div>
              <p className='font-bold underline text-[11px]'>{employeeName}</p>
              <p className='text-muted-foreground text-[10px]'>{position}</p>
            </div>
          </div>

          <div className='p-2.5 flex flex-col justify-between min-h-[95px]'>
            <p className='text-[10px] font-semibold text-muted-foreground'>Diterima oleh:</p>
            <div className='my-1'>
              {isApproved ? (
                <span className='font-bold text-[9px] text-emerald-700 border border-emerald-400 bg-emerald-50 px-2 py-0.5 rounded'>
                  ✓ ACC DIGITAL: {approverName.split(',')[0]}
                </span>
              ) : isRejected ? (
                <span className='font-bold text-[9px] text-red-700 border border-red-400 bg-red-50 px-2 py-0.5 rounded'>
                  ✗ DITOLAK
                </span>
              ) : (
                <span className='font-bold text-[9px] text-amber-700 border border-amber-400 bg-amber-50 px-2 py-0.5 rounded animate-pulse'>
                  ⏳ MENUNGGU PERSETUJUAN
                </span>
              )}
            </div>
            <div>
              <p className='font-bold underline text-[11px]'>{approverName}</p>
              <p className='text-muted-foreground text-[10px]'>{approverTitle}</p>
            </div>
          </div>
        </div>

        {/* Catatan Kaki SPKL */}
        <div className='p-2 bg-slate-50 dark:bg-zinc-900 text-[8.5px] text-slate-600 dark:text-zinc-400 space-y-0.5 leading-snug'>
          <p>* Surat Perintah Kerja Lembur (SPKL) harus di paraf dan di tanda tangan oleh karyawan dan user</p>
          <p>* Surat Perintah Kerja Lembur (SPKL) harus diserahkan paling lambat tanggal 10 setiap bulannya</p>
        </div>
      </div>
    </div>
  )
}
