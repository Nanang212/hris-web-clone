// src/features/travel-expense/business-trip/components/trip-create-tab.tsx
import {
  IconBed,
  IconBuilding,
  IconCalendar,
  IconCash,
  IconCheck,
  IconClock,
  IconCreditCard,
  IconMapPin,
  IconPlane,
  IconPlaneDeparture,
  IconSparkles,
  IconTrain,
} from '@tabler/icons-react'
import { useState, useMemo } from 'react'
import type { BusinessTripRecord, TransportationType, AccommodationType } from '../../types'
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
import { Textarea } from '@/shared/components/ui/textarea'

interface TripCreateTabProps {
  onSuccess: (newTrip: BusinessTripRecord) => void
  onCancel: () => void
}

export function TripCreateTab({ onSuccess, onCancel }: TripCreateTabProps) {
  const [title, setTitle] = useState('Kickoff Meeting & UAT Onsite Implementation')
  const [purpose, setPurpose] = useState(
    'Koordinasi teknis implementasi konektor webhook Payroll di kantor cabang dan penandatanganan Berita Acara UAT.',
  )
  const [originCity, setOriginCity] = useState('Jakarta (CGK)')
  const [destinationCity, setDestinationCity] = useState('Surabaya (SUB)')
  const [startDate, setStartDate] = useState('2024-05-15')
  const [endDate, setEndDate] = useState('2024-05-18')
  const [transportType, setTransportType] = useState<TransportationType>('flight')
  const [accommodationType, setAccommodationType] = useState<AccommodationType>('hotel_4star')
  const [cashAdvanceRequested, setCashAdvanceRequested] = useState(true)
  const [cashAdvanceAmount, setCashAdvanceAmount] = useState<number | ''>(7500000)
  const [costCenter, setCostCenter] = useState('CC-TECH-101')
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Calculate duration
  const totalDays = useMemo(() => {
    if (!startDate || !endDate) return 1
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = end.getTime() - start.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
    return diffDays > 0 ? diffDays : 1
  }, [startDate, endDate])

  // Live estimated budget calculation
  const estimatedBudget = useMemo(() => {
    const transportCost = transportType === 'flight' ? 2800000 : 1500000
    const hotelCostPerNight = accommodationType === 'hotel_4star' ? 900000 : 600000
    const nights = Math.max(1, totalDays - 1)
    const accommodationCost = accommodationType === 'none' ? 0 : hotelCostPerNight * nights
    const perDiemCost = 400000 * totalDays
    const localExpenses = 500000
    const total = transportCost + accommodationCost + perDiemCost + localExpenses

    return {
      transport: transportCost,
      accommodation: accommodationCost,
      perDiem: perDiemCost,
      localExpenses,
      total,
    }
  }, [transportType, accommodationType, totalDays])

  const formatIdr = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const err: Record<string, string> = {}
    if (!title.trim()) err.title = 'Judul kegiatan dinas wajib diisi.'
    if (!purpose.trim()) err.purpose = 'Maksud dan tujuan dinas wajib diisi.'
    if (!startDate || !endDate) err.dates = 'Tanggal berangkat dan kepulangan wajib diisi.'

    if (Object.keys(err).length > 0) {
      setErrors(err)
      return
    }

    const newTrip: BusinessTripRecord = {
      id: `trip-${Date.now()}`,
      tripNumber: `BT-2024-${String(Math.floor(Math.random() * 900) + 100)}`,
      employeeId: 'emp-003',
      employeeName: 'Denny Adrian, S.Kom.',
      employeeNik: 'EMP-ENG-001',
      employeeAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      departmentName: 'Software Engineering',
      jobTitle: 'Lead Frontend Engineer',
      title,
      purpose,
      originCity,
      destinationCity,
      destinationCountry: destinationCity.includes('Singapore') ? 'Singapore' : 'Indonesia',
      startDate,
      endDate,
      totalDays,
      transportType,
      flightAirline: transportType === 'flight' ? 'Garuda Indonesia (Terjadwal)' : 'Kereta Api Indonesia (KAI)',
      accommodationType,
      hotelName: accommodationType !== 'none' ? 'Hotel Berbintang Korporat (Terkonfirmasi)' : undefined,
      cashAdvanceRequested,
      cashAdvanceAmount: cashAdvanceRequested ? Number(cashAdvanceAmount) || 0 : 0,
      cashAdvanceDisbursed: false,
      costCenter,
      estimatedBudget,
      status: 'pending',
      approvalFlow: [
        { role: 'Line Manager', approverName: 'Rizky Pratama', status: 'pending' },
        { role: 'Travel & HR Admin', approverName: 'Amanda Putri', status: 'pending' },
        { role: 'Finance Director', approverName: 'Hendra Setiawan', status: 'pending' },
      ],
      itinerary: [
        {
          dayNumber: 1,
          date: startDate,
          title: 'Arrival & Kickoff Session',
          activities: [
            { id: 'act-1', time: '08:00 - 10:30', title: 'Perjalanan Keberangkatan Menuju Kota Tujuan', location: `${originCity} ➔ ${destinationCity}` },
            { id: 'act-2', time: '13:00 - 17:00', title: 'Pertemuan Kickoff Teknis dengan Klien / Tim Cabang', location: 'Kantor Mitra / Cabang' },
          ],
        },
      ],
      expenses: [],
      createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
    }

    onSuccess(newTrip)
  }

  return (
    <div className='space-y-6 w-full max-w-full min-w-0'>
      <div className='grid grid-cols-1 lg:grid-cols-12 gap-6 items-start'>
        {/* Left Column: Form (7 cols) */}
        <div className='lg:col-span-7 space-y-6'>
          <form onSubmit={handleSubmit} className='p-6 rounded-2xl border border-border/80 bg-card shadow-xs space-y-5'>
            <div className='border-b border-border/70 pb-4'>
              <h3 className='text-sm font-bold text-foreground'>Formulir Permohonan Perjalanan Dinas</h3>
              <p className='text-xs text-muted-foreground mt-0.5'>
                Rencanakan tujuan dinas, tanggal pelaksanaan, transportasi, dan kebutuhan uang muka.
              </p>
            </div>

            {/* Title & Purpose */}
            <div className='space-y-3'>
              <div className='space-y-1.5'>
                <label className='text-xs font-bold text-foreground'>
                  Judul Kegiatan Dinas <span className='text-rose-500'>*</span>
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder='Contoh: Onsite Core Banking & HRIS Integration Kickoff'
                  className='h-9 text-xs rounded-xl bg-background'
                />
                {errors.title && <p className='text-[11px] text-rose-500 font-semibold'>{errors.title}</p>}
              </div>

              <div className='space-y-1.5'>
                <label className='text-xs font-bold text-foreground'>
                  Maksud & Tujuan Perjalanan Dinas <span className='text-rose-500'>*</span>
                </label>
                <Textarea
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder='Jelaskan tujuan spesifik, pihak mitra/cabang yang dikunjungi, serta hasil yang diharapkan...'
                  className='text-xs min-h-[80px] rounded-xl'
                />
                {errors.purpose && <p className='text-[11px] text-rose-500 font-semibold'>{errors.purpose}</p>}
              </div>
            </div>

            {/* Origin & Destination */}
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 border-t border-border/60'>
              <div className='space-y-1.5'>
                <label className='text-xs font-bold text-foreground'>Kota Asal (Origin)</label>
                <Select value={originCity} onValueChange={setOriginCity}>
                  <SelectTrigger className='h-9 text-xs rounded-xl bg-background'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='Jakarta (CGK)'>Jakarta (CGK)</SelectItem>
                    <SelectItem value='Surabaya (SUB)'>Surabaya (SUB)</SelectItem>
                    <SelectItem value='Bandung (BDO)'>Bandung (BDO)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-1.5'>
                <label className='text-xs font-bold text-foreground'>Kota Tujuan (Destination)</label>
                <Select value={destinationCity} onValueChange={setDestinationCity}>
                  <SelectTrigger className='h-9 text-xs rounded-xl bg-background'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='Surabaya (SUB)'>Surabaya (SUB)</SelectItem>
                    <SelectItem value='Denpasar / Nusa Dua (DPS)'>Denpasar / Nusa Dua (DPS)</SelectItem>
                    <SelectItem value='Semarang (SMT)'>Semarang (SMT)</SelectItem>
                    <SelectItem value='Medan (KNO)'>Medan (KNO)</SelectItem>
                    <SelectItem value='Singapore (SIN)'>Singapore (SIN)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Dates */}
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <div className='space-y-1.5'>
                <label className='text-xs font-bold text-foreground'>Tanggal Berangkat</label>
                <Input
                  type='date'
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className='h-9 text-xs rounded-xl bg-background'
                />
              </div>

              <div className='space-y-1.5'>
                <label className='text-xs font-bold text-foreground'>Tanggal Kembali</label>
                <Input
                  type='date'
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className='h-9 text-xs rounded-xl bg-background'
                />
              </div>
            </div>

            {/* Logistics: Transport & Hotel */}
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 border-t border-border/60'>
              <div className='space-y-1.5'>
                <label className='text-xs font-bold text-foreground'>Preferensi Transportasi</label>
                <Select
                  value={transportType}
                  onValueChange={(val) => setTransportType(val as TransportationType)}
                >
                  <SelectTrigger className='h-9 text-xs rounded-xl bg-background'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='flight'>Pesawat Komersial (Garuda / Citilink)</SelectItem>
                    <SelectItem value='train'>Kereta Api (KAI Eksekutif)</SelectItem>
                    <SelectItem value='company_car'>Mobil Operasional Kantor</SelectItem>
                    <SelectItem value='car_rental'>Rental Mobil Lokal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-1.5'>
                <label className='text-xs font-bold text-foreground'>Akomodasi Hotel</label>
                <Select
                  value={accommodationType}
                  onValueChange={(val) => setAccommodationType(val as AccommodationType)}
                >
                  <SelectTrigger className='h-9 text-xs rounded-xl bg-background'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='hotel_4star'>Hotel Bintang 4 (Corporate Rate)</SelectItem>
                    <SelectItem value='hotel_3star'>Hotel Bintang 3 Standard</SelectItem>
                    <SelectItem value='guest_house'>Mess Perusahaan / Guest House</SelectItem>
                    <SelectItem value='none'>Tanpa Penginapan (Pulang Hari)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Cash Advance & Cost Center */}
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 border-t border-border/60'>
              <div className='space-y-1.5'>
                <div className='flex items-center justify-between'>
                  <label className='text-xs font-bold text-foreground'>Permohonan Uang Muka (Advance)</label>
                  <input
                    type='checkbox'
                    checked={cashAdvanceRequested}
                    onChange={(e) => setCashAdvanceRequested(e.target.checked)}
                    className='rounded border-border'
                  />
                </div>
                {cashAdvanceRequested ? (
                  <div className='relative'>
                    <span className='absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground'>
                      Rp
                    </span>
                    <Input
                      type='number'
                      value={cashAdvanceAmount}
                      onChange={(e) =>
                        setCashAdvanceAmount(
                          e.target.value === '' ? '' : Number(e.target.value),
                        )
                      }
                      className='h-9 pl-9 text-xs font-mono font-bold rounded-xl bg-background'
                    />
                  </div>
                ) : (
                  <div className='h-9 rounded-xl border border-dashed border-border flex items-center px-3 text-xs text-muted-foreground italic'>
                    Tidak meminta uang muka tunai
                  </div>
                )}
              </div>

              <div className='space-y-1.5'>
                <label className='text-xs font-bold text-foreground'>Cost Center Anggaran</label>
                <Select value={costCenter} onValueChange={setCostCenter}>
                  <SelectTrigger className='h-9 text-xs rounded-xl bg-background font-mono'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='CC-TECH-101'>CC-TECH-101 (Software Engineering)</SelectItem>
                    <SelectItem value='CC-SLS-401'>CC-SLS-401 (Enterprise Sales)</SelectItem>
                    <SelectItem value='CC-HR-200'>CC-HR-200 (People & Culture)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Submit Actions */}
            <div className='flex items-center justify-end gap-2.5 pt-4 border-t border-border/80'>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={onCancel}
                className='rounded-xl h-9 text-xs'
              >
                Batal
              </Button>
              <Button
                type='submit'
                size='sm'
                className='rounded-xl h-9 text-xs font-bold gap-1.5 shadow-xs'
              >
                <IconCheck size={14} />
                Kirim Permohonan Dinas
              </Button>
            </div>
          </form>
        </div>

        {/* Right Column: Live Budget Estimator & Routing (5 cols) */}
        <div className='lg:col-span-5 space-y-4'>
          {/* Estimated Budget Summary Card */}
          <div className='p-5 rounded-2xl border border-border/80 bg-card shadow-xs space-y-4'>
            <div className='flex items-center justify-between border-b border-border/70 pb-3'>
              <div>
                <h4 className='text-xs font-bold text-foreground uppercase tracking-wider'>
                  Kalkulator Estimasi Anggaran
                </h4>
                <p className='text-[11px] text-muted-foreground mt-0.5'>
                  Durasi: <strong>{totalDays} Hari Kalender</strong>
                </p>
              </div>
              <Badge variant='outline' className='text-[10px] font-bold text-primary border-primary/30'>
                Auto-Calculated
              </Badge>
            </div>

            <div className='space-y-2 text-xs'>
              <div className='p-3 rounded-xl border border-border/70 bg-muted/20 space-y-2'>
                <div className='flex justify-between text-muted-foreground text-[11px]'>
                  <span>Transport PP ({transportType}):</span>
                  <span className='font-bold text-foreground font-mono'>
                    {formatIdr(estimatedBudget.transport)}
                  </span>
                </div>
                <div className='flex justify-between text-muted-foreground text-[11px]'>
                  <span>Hotel ({Math.max(1, totalDays - 1)} Malam):</span>
                  <span className='font-bold text-foreground font-mono'>
                    {formatIdr(estimatedBudget.accommodation)}
                  </span>
                </div>
                <div className='flex justify-between text-muted-foreground text-[11px]'>
                  <span>Per Diem ({totalDays} Hari @ 400k):</span>
                  <span className='font-bold text-foreground font-mono'>
                    {formatIdr(estimatedBudget.perDiem)}
                  </span>
                </div>
                <div className='flex justify-between text-muted-foreground text-[11px]'>
                  <span>Biaya Operasional Lokal:</span>
                  <span className='font-bold text-foreground font-mono'>
                    {formatIdr(estimatedBudget.localExpenses)}
                  </span>
                </div>
                <div className='border-t border-border/70 pt-2 flex justify-between font-bold text-foreground text-sm'>
                  <span>Total Estimasi Biaya:</span>
                  <span className='text-primary font-mono'>
                    {formatIdr(estimatedBudget.total)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Approval Routing Card */}
          <div className='p-5 rounded-2xl border border-border/80 bg-card shadow-xs space-y-3'>
            <h4 className='text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5'>
              <IconClock size={14} className='text-primary' />
              Alur Verifikasi Persetujuan Dinas
            </h4>

            <div className='space-y-2.5 text-xs'>
              <div className='p-3 rounded-xl border border-border/70 bg-muted/20 flex items-center gap-3'>
                <div className='size-6 rounded-full bg-primary/10 text-primary font-bold text-[11px] flex items-center justify-center shrink-0'>
                  1
                </div>
                <div>
                  <p className='font-bold text-foreground'>Atasan Langsung (Direct Manager)</p>
                  <p className='text-[11px] text-muted-foreground'>Rizky Pratama (Head of SE)</p>
                </div>
              </div>

              <div className='p-3 rounded-xl border border-border/70 bg-muted/20 flex items-center gap-3'>
                <div className='size-6 rounded-full bg-primary/10 text-primary font-bold text-[11px] flex items-center justify-center shrink-0'>
                  2
                </div>
                <div>
                  <p className='font-bold text-foreground'>Travel & HR Operations</p>
                  <p className='text-[11px] text-muted-foreground'>Amanda Putri (People Ops)</p>
                </div>
              </div>

              <div className='p-3 rounded-xl border border-border/70 bg-muted/20 flex items-center gap-3'>
                <div className='size-6 rounded-full bg-primary/10 text-primary font-bold text-[11px] flex items-center justify-center shrink-0'>
                  3
                </div>
                <div>
                  <p className='font-bold text-foreground'>Direktur Keuangan & Kas</p>
                  <p className='text-[11px] text-muted-foreground'>Hendra Setiawan (CFO)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
