import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import type { EmployeeContract } from '@/features/employment/contract/types'

interface ContractPreviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  activeContract: EmployeeContract | null
}

export function ContractPreviewDialog({
  open,
  onOpenChange,
  title,
  activeContract,
}: ContractPreviewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='!block !max-h-[85vh] !overflow-y-auto !p-0 sm:max-w-[750px]'>
        <DialogHeader className='flex flex-row items-center justify-between border-b p-6 pb-2'>
          <div>
            <DialogTitle className='text-base font-bold text-foreground'>{title}</DialogTitle>
            <DialogDescription className='mt-0.5 text-xs'>
              Document Preview Mode (Simulated Contract)
            </DialogDescription>
          </div>
        </DialogHeader>
        <div className='flex justify-center bg-muted/40 p-6'>
          {activeContract ? (
            <div className='relative w-full rounded-lg border border-border bg-background p-8 font-serif text-xs leading-relaxed text-foreground shadow-md select-none'>
              {/* Header */}
              <div className='mb-6 flex flex-col gap-1 border-b pb-4 text-center'>
                <h2 className='font-sans text-sm font-bold tracking-wider uppercase'>
                  PT BINTANG FAJAR
                </h2>
                <p className='font-sans text-[10px] text-muted-foreground'>
                  Jl. Jenderal Sudirman No. 12, Jakarta, Indonesia
                </p>
                <div className='mt-2 h-0.5 w-full bg-foreground' />
              </div>

              {/* Title */}
              <div className='mb-6 flex flex-col gap-1 text-center'>
                <h3 className='text-xs font-bold uppercase underline decoration-double'>
                  SURAT PERJANJIAN KERJA
                </h3>
                <p className='text-[10px] text-muted-foreground'>
                  Nomor: {activeContract.contractNumber}
                </p>
              </div>

              {/* Body */}
              <p className='mb-4'>Yang bertanda tangan di bawah ini:</p>

              <div className='mb-4 grid grid-cols-[80px_1fr] gap-x-2 gap-y-1 pl-4 font-sans'>
                <span className='font-semibold text-muted-foreground'>Nama:</span>
                <span>HR Director</span>
                <span className='font-semibold text-muted-foreground'>Jabatan:</span>
                <span>Direktur Sumber Daya Manusia (HR Director)</span>
                <span className='font-semibold text-muted-foreground'>Instansi:</span>
                <span>PT Bintang Fajar</span>
              </div>

              <p className='mb-4'>
                Bertindak untuk dan atas nama PT Bintang Fajar, selanjutnya disebut sebagai{' '}
                <strong>PIHAK PERTAMA</strong>.
              </p>

              <div className='mb-4 grid grid-cols-[80px_1fr] gap-x-2 gap-y-1 pl-4 font-sans'>
                <span className='font-semibold text-muted-foreground'>Nama:</span>
                <span>{activeContract.fullName}</span>
                <span className='font-semibold text-muted-foreground'>Jabatan:</span>
                <span>{activeContract.positionName}</span>
                <span className='font-semibold text-muted-foreground'>Lokasi:</span>
                <span>{activeContract.workLocation}</span>
              </div>

              <p className='mb-4'>
                Bertindak untuk dan atas nama diri sendiri, selanjutnya disebut sebagai{' '}
                <strong>PIHAK KEDUA</strong>.
              </p>

              <p className='mb-4'>
                Kedua belah pihak sepakat untuk mengikatkan diri dalam Perjanjian Kerja dengan
                ketentuan sebagai berikut:
              </p>

              {/* Pasal-pasal */}
              <div className='mb-6 flex flex-col gap-4'>
                <div>
                  <h4 className='mb-1 text-center font-sans text-[11px] font-bold uppercase'>
                    PASAL 1: HUBUNGAN KERJA
                  </h4>
                  <p>
                    PIHAK PERTAMA menerima PIHAK KEDUA sebagai karyawan dengan jabatan{' '}
                    <strong>{activeContract.positionName}</strong> di lokasi{' '}
                    <strong>{activeContract.workLocation}</strong>.
                  </p>
                </div>
                <div>
                  <h4 className='mb-1 text-center font-sans text-[11px] font-bold uppercase'>
                    PASAL 2: MASA BERLAKU PERJANJIAN
                  </h4>
                  <p>
                    Perjanjian ini berlaku terhitung sejak tanggal{' '}
                    <strong>{activeContract.startDate}</strong> sampai dengan{' '}
                    <strong>{activeContract.endDate}</strong> dengan masa percobaan selama{' '}
                    <strong>{activeContract.probation}</strong>.
                  </p>
                </div>
                <div>
                  <h4 className='mb-1 text-center font-sans text-[11px] font-bold uppercase'>
                    PASAL 3: HAK & FASILITAS
                  </h4>
                  <p>
                    PIHAK KEDUA berhak menerima kompensasi upah/gaji sesuai dengan standar golongan
                    jabatan <strong>{activeContract.salaryGrade}</strong> PT Bintang Fajar, serta
                    tunjangan dan hak cuti tahunan sesuai dengan kebijakan perusahaan yang berlaku.
                  </p>
                </div>
              </div>

              {/* Signatures */}
              <div className='mt-8 grid grid-cols-2 gap-4 border-t pt-6 text-center font-sans'>
                <div className='flex flex-col items-center gap-6'>
                  <div>
                    <p className='font-semibold'>PIHAK PERTAMA</p>
                    <p className='text-[10px] text-muted-foreground'>PT Bintang Fajar</p>
                  </div>
                  <div className='flex h-12 items-center justify-center'>
                    <span className='inline-block rotate-[-6deg] rounded-md border border-green-600/30 bg-green-500/10 px-3 py-1 text-[9px] font-bold tracking-wider text-green-600 uppercase'>
                      SIGNED ELECTRONICALLY
                    </span>
                  </div>
                  <p className='font-bold underline'>HR Director</p>
                </div>

                <div className='flex flex-col items-center gap-6'>
                  <div>
                    <p className='font-semibold'>PIHAK KEDUA</p>
                    <p className='text-[10px] text-muted-foreground'>Karyawan</p>
                  </div>
                  <div className='flex h-12 items-center justify-center'>
                    {activeContract.status === 'active' ? (
                      <span className='inline-block rotate-[-6deg] rounded-md border border-green-600/30 bg-green-500/10 px-3 py-1 text-[9px] font-bold tracking-wider text-green-600 uppercase'>
                        SIGNED ELECTRONICALLY
                      </span>
                    ) : (
                      <span className='inline-block rotate-[-6deg] rounded-md border border-amber-600/30 bg-amber-500/10 px-3 py-1 text-[9px] font-bold tracking-wider text-amber-600 uppercase'>
                        PENDING SIGNATURE
                      </span>
                    )}
                  </div>
                  <p className='font-bold underline'>{activeContract.fullName}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className='flex h-full items-center justify-center text-xs text-muted-foreground'>
              Loading contract preview data...
            </div>
          )}
        </div>
        <div className='flex justify-end gap-3 border-t p-4'>
          <Button variant='outline' size='sm' onClick={() => onOpenChange(false)}>
            Tutup Preview
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
