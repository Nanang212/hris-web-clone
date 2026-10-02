"use client";

import { motion } from "framer-motion";
import {
  Plus,
} from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import {
  slideFromLeft,
  slideFromRight,
  transition,
} from "@/shared/components/calendar/animations";
import { useCalendar } from "@/shared/components/calendar/calendar-context";
import { AddEditEventDialog } from "@/shared/components/calendar/add-edit-event-dialog";
import { DateNavigator } from "@/shared/components/calendar/date-navigator";
import FilterEvents from "@/shared/components/calendar/filter";
import { TodayButton } from "@/shared/components/calendar/today-button";
import { UserSelect } from "@/shared/components/calendar/user-select";
import Views from "./view-tabs";

export function CalendarHeader() {
  const { view, events } = useCalendar();

  return (
    <div className="flex flex-col gap-3 border-b p-4">
      {/* Row 1: Today button + Month/Year + navigation + Add button */}
      <div className="flex items-center justify-between">
        <motion.div
          className="flex items-center gap-3"
          variants={slideFromLeft}
          initial="initial"
          animate="animate"
          transition={transition}
        >
          <TodayButton />
          <DateNavigator view={view} events={events} />
        </motion.div>

        <motion.div
          className="flex items-center gap-2"
          variants={slideFromRight}
          initial="initial"
          animate="animate"
          transition={transition}
        >
          <AddEditEventDialog>
            <Button size="sm">
              <Plus className="h-4 w-4" />
              Add Entry
            </Button>
          </AddEditEventDialog>
        </motion.div>
      </div>

      {/* Row 2: Filter + View Tabs */}
      <motion.div
        className="flex items-center justify-between gap-2"
        variants={slideFromRight}
        initial="initial"
        animate="animate"
        transition={transition}
      >
        <div className="flex items-center gap-2">
          <FilterEvents />
          <UserSelect />
        </div>
        <Views />
      </motion.div>
    </div>
  );
}
