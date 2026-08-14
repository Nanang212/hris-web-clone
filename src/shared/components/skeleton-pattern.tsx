import * as React from 'react'

import { Skeleton } from '@/shared/components/ui/skeleton'
import { cn } from '@/shared/lib/utils'

type SegmentType = '=' | '+'

interface Segment {
  type: SegmentType
  size: number
}

export interface SkeletonPatternProps {
  pattern: string
  height?: number | number[]
  gap?: number
  rowGap?: number
  padding?: number | string
  rowPadding?: Record<number, number | string>
  className?: string
  rowClassName?: string
}

function parsePattern(pattern: string): Segment[][] {
  return pattern
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => {
      const chars = line
        .split('')
        .filter((ch) => ch === '=' || ch === '+' || ch === '-')
        .map((ch): SegmentType => (ch === '=' ? '=' : '+')) // '-' dianggap sama dengan '+'

      if (chars.length === 0) return []

      const segments: Segment[] = []
      let current = chars[0]
      let count = 0

      for (const ch of chars) {
        if (ch === current) {
          count++
        } else {
          segments.push({ type: current, size: count })
          current = ch
          count = 1
        }
      }
      segments.push({ type: current, size: count })
      return segments
    })
}

function toCssPadding(value: number | string): string {
  return typeof value === 'number' ? `${value}px` : value
}

export function SkeletonPattern({
  pattern,
  height = 16,
  gap = 8,
  rowGap = 8,
  padding = 0,
  rowPadding = {},
  className,
  rowClassName,
}: Readonly<SkeletonPatternProps>) {
  const rows = React.useMemo(() => parsePattern(pattern), [pattern])

  return (
    <div className={cn('flex w-full flex-col', className)} style={{ gap: rowGap }}>
      {rows.map((segments, rowIndex) => {
        const rowHeight = Array.isArray(height) ? (height[rowIndex] ?? 16) : height
        const rowPad = rowPadding[rowIndex] ?? padding

        return (
          <div
            key={rowIndex}
            className={cn('flex w-full items-center', rowClassName)}
            style={{ padding: toCssPadding(rowPad) }}
          >
            {segments.map((segment, segmentIndex) =>
              segment.type === '=' ? (
                <Skeleton
                  key={segmentIndex}
                  style={{
                    flexGrow: segment.size,
                    flexShrink: 1,
                    flexBasis: 0,
                    height: rowHeight,
                  }}
                />
              ) : (
                <div
                  key={segmentIndex}
                  aria-hidden
                  style={{
                    flexGrow: 0,
                    flexShrink: 0,
                    width: segment.size * gap,
                    height: rowHeight,
                  }}
                />
              ),
            )}
          </div>
        )
      })}
    </div>
  )
}
