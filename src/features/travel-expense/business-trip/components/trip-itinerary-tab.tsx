// src/features/travel-expense/business-trip/components/trip-itinerary-tab.tsx
import {
  IconCalendar,
  IconCheck,
  IconClock,
  IconMapPin,
  IconPhone,
  IconPlus,
  IconRoute,
  IconTrash,
  IconUser,
} from '@tabler/icons-react'
import { useState } from 'react'
import type { BusinessTripRecord, TripActivity, TripItineraryDay } from '../../types'
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
import { Input } from '@/shared/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { Textarea } from '@/shared/components/ui/textarea'
import { snackbar } from '@/shared/lib/snackbar'

interface TripItineraryTabProps {
  trips: BusinessTripRecord[]
  selectedTripId?: string
  onUpdateItinerary?: (tripId: string, updatedDays: TripItineraryDay[]) => void
}

export function TripItineraryTab({
  trips,
  selectedTripId,
  onUpdateItinerary,
}: TripItineraryTabProps) {
  const [currentTripId, setCurrentTripId] = useState<string>(
    selectedTripId || trips[0]?.id || '',
  )

  const currentTrip = trips.find((t) => t.id === currentTripId) || trips[0]

  // Add Activity modal state
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(1)
  const [activityTime, setActivityTime] = useState('09:00 - 11:30')
  const [activityTitle, setActivityTitle] = useState('')
  const [activityLocation, setActivityLocation] = useState('')
  const [activityContact, setActivityContact] = useState('')
  const [activityNotes, setActivityNotes] = useState('')

  const handleOpenAddModal = (dayNumber: number) => {
    setSelectedDayNumber(dayNumber)
    setActivityTime('09:00 - 11:30')
    setActivityTitle('')
    setActivityLocation('')
    setActivityContact('')
    setActivityNotes('')
    setAddModalOpen(true)
  }

  const handleSaveActivity = () => {
    if (!activityTitle.trim()) {
      snackbar.error('Judul agenda kegiatan wajib diisi.')
      return
    }

    if (!currentTrip) return

    const newActivity: TripActivity = {
      id: `act-${Date.now()}`,
      time: activityTime,
      title: activityTitle,
      location: activityLocation || currentTrip.destinationCity,
      contactPerson: activityContact || undefined,
      notes: activityNotes || undefined,
      completed: false,
    }

    const updatedItinerary = currentTrip.itinerary.map((day) =>
      day.dayNumber === selectedDayNumber
        ? { ...day, activities: [...day.activities, newActivity] }
        : day,
    )

    if (onUpdateItinerary) {
      onUpdateItinerary(currentTrip.id, updatedItinerary)
    }

    snackbar.success('Agenda kegiatan baru berhasil ditambahkan!')
    setAddModalOpen(false)
  }

  const handleToggleComplete = (dayNumber: number, activityId: string) => {
    if (!currentTrip || !onUpdateItinerary) return
    const updatedItinerary = currentTrip.itinerary.map((day) =>
      day.dayNumber === dayNumber
        ? {
            ...day,
            activities: day.activities.map((act) =>
              act.id === activityId ? { ...act, completed: !act.completed } : act,
            ),
          }
        : day,
    )
    onUpdateItinerary(currentTrip.id, updatedItinerary)
  }

  if (!currentTrip) {
    return (
      <div className='p-12 text-center text-muted-foreground'>
        Tidak ada data perjalanan dinas yang dipilih.
      </div>
    );
  }

  return (
    <div className='space-y-6 w-full max-w-full min-w-0'>
      {/* ── Add Activity Modal ─────────────────────────────────────────────── */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className='sm:max-w-[500px] p-0 overflow-hidden rounded-2xl'>
          <DialogHeader className='p-6 pb-4 border-b border-border/80 bg-muted/20'>
            <DialogTitle className='text-base font-bold text-foreground'>
              Tambah Agenda Kegiatan (Hari ke-{selectedDayNumber})
            </DialogTitle>
            <DialogDescription className='text-xs text-muted-foreground mt-0.5'>
              {currentTrip.title} • {currentTrip.destinationCity}
            </DialogDescription>
          </DialogHeader>

          <div className='p-6 space-y-4 text-xs'>
            <div className='grid grid-cols-2 gap-3'>
              <div className='space-y-1.5'>
                <label className='font-bold text-foreground'>Waktu / Jam Pelaksanaan</label>
                <Input
                  value={activityTime}
                  onChange={(e) => setActivityTime(e.target.value)}
                  placeholder='09:00 - 11:30'
                  className='h-9 text-xs rounded-xl bg-background'
                />
              </div>

              <div className='space-y-1.5'>
                <label className='font-bold text-foreground'>Lokasi Kegiatan</label>
                <Input
                  value={activityLocation}
                  onChange={(e) => setActivityLocation(e.target.value)}
                  placeholder='Ruang Rapat / Kantor Klien'
                  className='h-9 text-xs rounded-xl bg-background'
                />
              </div>
            </div>

            <div className='space-y-1.5'>
              <label className='font-bold text-foreground'>
                Nama Agenda / Kegiatan <span className='text-rose-500'>*</span>
              </label>
              <Input
                value={activityTitle}
                onChange={(e) => setActivityTitle(e.target.value)}
                placeholder='Contoh: Demo Sistem & Penandatanganan BA UAT'
                className='h-9 text-xs rounded-xl bg-background'
              />
            </div>

            <div className='space-y-1.5'>
              <label className='font-bold text-foreground'>Kontak PIC Klien / Pendamping</label>
              <Input
                value={activityContact}
                onChange={(e) => setActivityContact(e.target.value)}
                placeholder='Contoh: Bpk. Bambang Sugiarto (0812-3456-789)'
                className='h-9 text-xs rounded-xl bg-background'
              />
            </div>

            <div className='space-y-1.5'>
              <label className='font-bold text-foreground'>Catatan Tambahan</label>
              <Textarea
                value={activityNotes}
                onChange={(e) => setActivityNotes(e.target.value)}
                placeholder='Kebutuhan proyektor, materi presentasi...'
                className='text-xs min-h-[70px] rounded-xl'
              />
            </div>
          </div>

          <DialogFooter className='p-4 px-6 border-t border-border/80 bg-muted/10 flex items-center justify-end gap-2'>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={() => setAddModalOpen(false)}
              className='rounded-xl h-9 text-xs'
            >
              Batal
            </Button>
            <Button
              type='button'
              size='sm'
              onClick={handleSaveActivity}
              className='rounded-xl h-9 text-xs font-bold gap-1.5 shadow-xs'
            >
              <IconCheck size={14} />
              Simpan Agenda
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Top Trip Selector Banner ───────────────────────────────────────── */}
      <div className='p-5 rounded-2xl border border-border/80 bg-card shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4'>
        <div className='flex items-center gap-3.5'>
          <div className='size-11 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0 shadow-xs'>
            <IconRoute size={24} />
          </div>
          <div>
            <div className='flex items-center gap-2'>
              <h3 className='text-sm font-bold text-foreground'>{currentTrip.title}</h3>
              <Badge variant='outline' className='text-[10px] font-bold text-primary border-primary/30'>
                {currentTrip.tripNumber}
              </Badge>
            </div>
            <p className='text-xs text-muted-foreground mt-0.5 flex items-center gap-2'>
              <span className='flex items-center gap-1'>
                <IconUser size={12} />
                {currentTrip.employeeName}
              </span>
              •
              <span className='flex items-center gap-1 text-foreground font-semibold'>
                <IconMapPin size={12} className='text-rose-500' />
                {currentTrip.destinationCity}
              </span>
              •
              <span>{currentTrip.startDate} s/d {currentTrip.endDate} ({currentTrip.totalDays} Hari)</span>
            </p>
          </div>
        </div>

        {/* Trip Switcher Dropdown */}
        <div className='w-full sm:w-72 shrink-0'>
          <Select value={currentTripId} onValueChange={setCurrentTripId}>
            <SelectTrigger className='h-9 text-xs rounded-xl bg-background'>
              <SelectValue placeholder='Pilih Perjalanan Dinas' />
            </SelectTrigger>
            <SelectContent>
              {trips.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.tripNumber} - {t.destinationCity} ({t.employeeName})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* ── Day by Day Timeline View ───────────────────────────────────────── */}
      <div className='space-y-6'>
        {currentTrip.itinerary.length === 0 ? (
          <div className='p-12 rounded-2xl border border-dashed border-border bg-card text-center space-y-2'>
            <IconCalendar size={32} className='mx-auto text-muted-foreground opacity-50' />
            <p className='font-bold text-xs text-foreground'>Belum Ada Jadwal Agenda Itinerary</p>
            <p className='text-[11px] text-muted-foreground'>
              Silakan buat agenda kegiatan harian untuk perjalanan dinas ini.
            </p>
            <Button
              size='sm'
              onClick={() => handleOpenAddModal(1)}
              className='rounded-xl h-8 text-xs font-bold gap-1.5 mt-2'
            >
              <IconPlus size={14} />
              Tambah Hari Pertama
            </Button>
          </div>
        ) : (
          currentTrip.itinerary.map((day) => (
            <div
              key={day.dayNumber}
              className='p-5 rounded-2xl border border-border/80 bg-card shadow-xs space-y-4'
            >
              {/* Day Header */}
              <div className='flex items-center justify-between border-b border-border/70 pb-3'>
                <div className='flex items-center gap-2.5'>
                  <div className='size-7 rounded-lg bg-primary text-primary-foreground font-bold text-xs flex items-center justify-center shadow-xs'>
                    H{day.dayNumber}
                  </div>
                  <div>
                    <h4 className='text-xs font-bold text-foreground'>
                      Hari ke-{day.dayNumber}: {day.title}
                    </h4>
                    <p className='text-[10px] text-muted-foreground font-mono'>{day.date}</p>
                  </div>
                </div>

                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => handleOpenAddModal(day.dayNumber)}
                  className='rounded-xl h-7 px-2.5 text-[11px] font-bold gap-1 border-primary/30 text-primary hover:bg-primary/10'
                >
                  <IconPlus size={12} />
                  Tambah Kegiatan
                </Button>
              </div>

              {/* Day Activities Timeline */}
              <div className='space-y-2.5 pl-2'>
                {day.activities.length === 0 ? (
                  <p className='text-xs text-muted-foreground italic py-2'>
                    Belum ada rincian agenda di hari ini.
                  </p>
                ) : (
                  day.activities.map((act) => (
                    <div
                      key={act.id}
                      className={`p-3 rounded-xl border text-xs transition-colors flex items-start justify-between gap-3 ${
                        act.completed
                          ? 'border-emerald-500/30 bg-emerald-50/20 dark:bg-emerald-950/10 opacity-75'
                          : 'border-border/80 bg-muted/20 hover:bg-muted/30'
                      }`}
                    >
                      <div className='flex items-start gap-3 min-w-0'>
                        <input
                          type='checkbox'
                          checked={act.completed || false}
                          onChange={() => handleToggleComplete(day.dayNumber, act.id)}
                          className='mt-0.5 rounded border-border size-4 accent-primary'
                        />
                        <div className='space-y-0.5 min-w-0'>
                          <div className='flex items-center gap-2'>
                            <span className='font-mono font-bold text-[11px] text-primary flex items-center gap-1'>
                              <IconClock size={12} />
                              {act.time}
                            </span>
                            <span className='font-bold text-foreground text-xs'>
                              {act.title}
                            </span>
                          </div>

                          <p className='text-[11px] text-muted-foreground flex items-center gap-1'>
                            <IconMapPin size={11} className='text-rose-500 shrink-0' />
                            {act.location}
                          </p>

                          {act.contactPerson && (
                            <p className='text-[10px] text-foreground/80 flex items-center gap-1'>
                              <IconPhone size={10} className='text-emerald-600 shrink-0' />
                              {act.contactPerson}
                            </p>
                          )}
                        </div>
                      </div>

                      {act.completed && (
                        <Badge
                          variant='outline'
                          className='text-[8px] font-bold border-emerald-500/30 text-emerald-600 shrink-0'
                        >
                          Selesai
                        </Badge>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
