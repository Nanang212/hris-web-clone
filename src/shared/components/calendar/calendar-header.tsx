"use client";

import { motion } from "framer-motion";
import {
  CalendarRange,
  Columns,
  Grid2X2,
  Grid3X3,
  LayoutList,
  List,
  Plus,
} from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { ButtonGroup } from "@/shared/components/ui/button-group";
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
import { Settings } from "@/shared/components/calendar/settings";
import Views from "./view-tabs";

export function CalendarHeader() {
  const { view, events } = useCalendar();

  return (
    <div className="flex flex-col gap-4 border-b p-4 lg:flex-row lg:items-center lg:justify-between">
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
        className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-1.5"
        variants={slideFromRight}
        initial="initial"
        animate="animate"
        transition={transition}
      >
        <div className="options flex-wrap flex items-center gap-4 md:gap-2">
          <FilterEvents />
          <Views />
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-1.5">
          <UserSelect />

          <AddEditEventDialog>
            <Button>
              <Plus className="h-4 w-4" />
              Add Event
            </Button>
          </AddEditEventDialog>
        </div>
        <Settings />
      </motion.div>
    </div>
  );
}
