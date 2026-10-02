import { motion } from "framer-motion";
import { useMemo } from "react";
import {
	staggerContainer,
	transition,
} from "@/shared/components/calendar/animations";
import { useCalendar } from "@/shared/components/calendar/calendar-context";

import {
	calculateMonthEventPositions,
	getCalendarCells,
} from "@/shared/components/calendar/helpers";

import type { IEvent } from "@/shared/components/calendar/interfaces";
import { DayCell } from "@/shared/components/calendar/day-cell";
import { cn } from "@/shared/lib/utils";

interface IProps {
	singleDayEvents: IEvent[];
	multiDayEvents: IEvent[];
}

const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function CalendarMonthView({ singleDayEvents, multiDayEvents }: IProps) {
	const { selectedDate } = useCalendar();

	const allEvents = [...multiDayEvents, ...singleDayEvents];

	const cells = useMemo(() => getCalendarCells(selectedDate), [selectedDate]);

	const eventPositions = useMemo(
		() =>
			calculateMonthEventPositions(
				multiDayEvents,
				singleDayEvents,
				selectedDate,
			),
		[multiDayEvents, singleDayEvents, selectedDate],
	);

	return (
		<motion.div initial="initial" animate="animate" variants={staggerContainer} className="select-none">
			<div className="grid grid-cols-7 border-b border-border bg-muted/40">
				{WEEK_DAYS.map((day, index) => {
					const isWeekend = day === 'Sat' || day === 'Sun'
					return (
					<motion.div
						key={day}
						className={cn(
							"flex items-center justify-center py-2.5 text-xs font-semibold uppercase tracking-wider",
							index < 6 && "border-r border-border",
							isWeekend ? "text-muted-foreground/70 bg-muted/30" : "text-muted-foreground",
						)}
						initial={{ opacity: 0, y: -10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: index * 0.05, ...transition }}
					>
						<span>{day}</span>
					</motion.div>
				)
				})}
			</div>

			<div className="grid grid-cols-7 overflow-hidden">
				{cells.map((cell) => (
					<DayCell
						key={cell.date.toISOString()}
						cell={cell}
						events={allEvents}
						eventPositions={eventPositions}
					/>
				))}
			</div>
		</motion.div>
	);
}
