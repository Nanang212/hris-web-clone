export function TeamAttendanceChart() {
  return (
    <div className="flex flex-col rounded-2xl bg-card p-5 shadow-sm ring-1 ring-foreground/5">
      <div className="mb-6 flex flex-col justify-between sm:flex-row sm:items-center">
        <div>
          <h3 className="text-sm font-semibold">
            Team Attendance & Availability
          </h3>
          <p className="text-xs text-muted-foreground">
            Present rate and attendance exceptions · last 12 weeks
          </p>
        </div>
        <div className="mt-3 flex items-center gap-4 sm:mt-0">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            <span className="text-xs font-medium text-muted-foreground">
              Present rate
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            <span className="text-xs font-medium text-muted-foreground">
              Exceptions
            </span>
          </div>
        </div>
      </div>

      <div className="relative h-[200px] w-full">
        {/* Grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between pt-4 pb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-full border-t border-border/50" />
          ))}
        </div>

        {/* X-axis labels */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between px-4 text-[10px] font-medium text-muted-foreground">
          {['W1', 'W3', 'W5', 'W7', 'W9', 'W11'].map((w) => (
            <span key={w}>{w}</span>
          ))}
        </div>

        {/* SVG chart */}
        <svg
          viewBox="0 0 1000 200"
          className="absolute inset-0 h-[195px] w-full overflow-visible"
          preserveAspectRatio="none"
        >
          {/* Present rate line (blue, rising) */}
          <path
            d="M 0 160 Q 100 155 200 140 T 400 120 T 600 90 T 800 75 T 1000 55"
            fill="none"
            stroke="#3b82f6"
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* Exceptions dots (amber) */}
          <circle cx="270" cy="140" r="6" fill="#f59e0b" />
          <circle cx="560" cy="105" r="6" fill="#f59e0b" />
          <circle cx="820" cy="80" r="6" fill="#f59e0b" />
        </svg>
      </div>
    </div>
  )
}
