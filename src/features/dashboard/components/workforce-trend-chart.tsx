export function WorkforceTrendChart() {
  // A simple CSS-based or SVG-based line chart placeholder
  // that mimics the visual in the design without needing recharts.
  return (
    <div className="flex flex-col rounded-2xl bg-card p-5 shadow-sm ring-1 ring-foreground/5">
      <div className="mb-6 flex flex-col justify-between sm:flex-row sm:items-center">
        <div>
          <h3 className="text-sm font-semibold">Workforce & Attendance Trend</h3>
          <p className="text-xs text-muted-foreground">
            Headcount growth vs attendance rate · last 12 months
          </p>
        </div>
        <div className="mt-3 flex items-center gap-4 sm:mt-0">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            <span className="text-xs font-medium text-muted-foreground">
              Headcount
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-medium text-muted-foreground">
              Attendance
            </span>
          </div>
        </div>
      </div>

      <div className="relative h-[220px] w-full">
        {/* Y-axis grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between pt-4 pb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-full border-t border-border/50" />
          ))}
        </div>

        {/* X-axis labels */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between px-4 text-[10px] font-medium text-muted-foreground">
          <span>Jan</span>
          <span>Mar</span>
          <span>May</span>
          <span>Jul</span>
          <span>Sep</span>
          <span>Nov</span>
        </div>

        {/* Chart Lines (SVG placeholder for visual representation) */}
        <svg
          viewBox="0 0 1000 200"
          className="absolute inset-0 h-[200px] w-full overflow-visible"
          preserveAspectRatio="none"
        >
          {/* Attendance Line (Green) */}
          <path
            d="M 0 150 Q 150 145 250 130 T 450 110 T 650 95 T 850 105 T 1000 85"
            fill="none"
            stroke="var(--color-emerald-500, #10b981)"
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* Headcount Line (Blue) */}
          <path
            d="M 0 160 Q 150 150 300 135 T 500 100 T 700 80 T 1000 60"
            fill="none"
            stroke="var(--color-blue-500, #3b82f6)"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  )
}
