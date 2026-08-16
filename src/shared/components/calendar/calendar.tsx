import { CalendarBody } from '@/shared/components/calendar/calendar-body'
import { CalendarProvider } from '@/shared/components/calendar/calendar-context'
import { CalendarHeader } from '@/shared/components/calendar/calendar-header'
import { DndProvider } from '@/shared/components/calendar/dnd-context'
import { CALENDAR_ITEMS_MOCK, USERS_MOCK } from '@/shared/components/calendar/mocks'

export function Calendar() {
  return (
    <CalendarProvider events={CALENDAR_ITEMS_MOCK} users={USERS_MOCK} view='month'>
      <DndProvider>
        <div className='w-full overflow-hidden rounded-xl border bg-card'>
          <CalendarHeader />
          <CalendarBody />
        </div>
      </DndProvider>
    </CalendarProvider>
  )
}
