
interface AttendanceDonutChartProps {
  presentDays: number
  leaveDays: number
  lateDays: number
  wfhDays: number
  attendanceRate: number
}

const COLORS = {
  present: '#10b981', // emerald-500
  leave: '#f59e0b',   // amber-500
  late: '#ef4444',    // red-500
  wfh: '#3b82f6',     // blue-500
}

export function AttendanceDonutChart({
  presentDays,
  leaveDays,
  lateDays,
  wfhDays,
  attendanceRate,
}: Readonly<AttendanceDonutChartProps>) {
  // Calculate percentages for each slice
  const total = presentDays + leaveDays + lateDays + wfhDays
  const segments = [
    { key: 'present', value: presentDays, color: COLORS.present },
    { key: 'leave', value: leaveDays, color: COLORS.leave },
    { key: 'late', value: lateDays, color: COLORS.late },
    { key: 'wfh', value: wfhDays, color: COLORS.wfh },
  ]

  // SVG donut chart
  const size = 160
  const strokeWidth = 16
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius

  let accumulated = 0
  const slices = segments.map((seg) => {
    const pct = total > 0 ? seg.value / total : 0
    const dashArray = `${pct * circumference} ${circumference}`
    const rotation = accumulated * 360 - 90
    accumulated += pct
    return { ...seg, dashArray, rotation }
  })

  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-card p-5 shadow-sm ring-1 ring-foreground/5">
      <div>
        <h3 className="text-sm font-semibold">My Attendance</h3>
        <p className="text-xs text-muted-foreground">
          Attendance composition · May 2025
        </p>
      </div>

      <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
        {/* Donut */}
        <div className="relative flex flex-shrink-0 items-center justify-center self-center">
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {/* Background circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth={strokeWidth}
              className="text-muted/30"
            />
            {slices.map((slice) => (
              <circle
                key={slice.key}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={slice.color}
                strokeWidth={strokeWidth}
                strokeDasharray={slice.dashArray}
                strokeLinecap="round"
                transform={`rotate(${slice.rotation} ${size / 2} ${size / 2})`}
              />
            ))}
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-2xl font-bold">{presentDays}</span>
            <span className="text-[10px] text-muted-foreground">
              present days
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-1 flex-col gap-2">
          <LegendItem color={COLORS.present} label="Present" value={`${presentDays} days`} />
          <LegendItem color={COLORS.leave} label="Leave" value={`${leaveDays} days`} />
          <LegendItem color={COLORS.late} label="Late" value={`${lateDays} day`} />
          <LegendItem color={COLORS.wfh} label="WFH" value={`${wfhDays} days`} />
        </div>

        {/* Rate */}
        <div className="flex flex-col items-center gap-1 self-center">
          <p className="text-xs font-medium text-muted-foreground">
            Attendance rate
          </p>
          <p className="text-3xl font-bold tracking-tight">{attendanceRate}%</p>
          <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
            On-time performance remains healthy
          </p>
        </div>
      </div>
    </div>
  )
}

function LegendItem({
  color,
  label,
  value,
}: {
  color: string
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
        style={{ backgroundColor: color }}
      />
      <span className="flex-1 text-xs font-medium text-foreground">{label}</span>
      <span className="text-xs text-muted-foreground">{value}</span>
    </div>
  )
}
