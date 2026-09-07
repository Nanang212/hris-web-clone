import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/shared/lib/utils'

const alertVariants = cva(
  'group/alert flex w-full items-center gap-3 rounded-2xl bg-card px-5 py-4 text-start text-sm text-card-foreground shadow-sm ring-1 ring-foreground/5 dark:ring-foreground/10',
  {
    variants: {
      variant: {
        default: 'bg-card text-card-foreground',
        info: 'bg-card text-card-foreground [&_[data-slot=alert-icon]]:bg-blue-500/10 [&_[data-slot=alert-icon]]:text-blue-700 dark:[&_[data-slot=alert-icon]]:bg-blue-400/20 dark:[&_[data-slot=alert-icon]]:text-blue-300',
        success:
          'bg-card text-card-foreground [&_[data-slot=alert-icon]]:bg-emerald-500/10 [&_[data-slot=alert-icon]]:text-emerald-700 dark:[&_[data-slot=alert-icon]]:bg-emerald-400/20 dark:[&_[data-slot=alert-icon]]:text-emerald-300',
        warning:
          'bg-card text-card-foreground [&_[data-slot=alert-icon]]:bg-amber-500/10 [&_[data-slot=alert-icon]]:text-amber-700 dark:[&_[data-slot=alert-icon]]:bg-amber-400/20 dark:[&_[data-slot=alert-icon]]:text-amber-300',
        destructive:
          'bg-card text-destructive *:data-[slot=alert-description]:text-destructive/90 [&_[data-slot=alert-icon]]:bg-destructive/10 [&_[data-slot=alert-icon]]:text-destructive *:[svg]:text-current',
        red: 'bg-card text-card-foreground [&_[data-slot=alert-icon]]:bg-red-500/10 [&_[data-slot=alert-icon]]:text-red-700 dark:[&_[data-slot=alert-icon]]:bg-red-400/20 dark:[&_[data-slot=alert-icon]]:text-red-300',
        orange:
          'bg-card text-card-foreground [&_[data-slot=alert-icon]]:bg-orange-500/10 [&_[data-slot=alert-icon]]:text-orange-700 dark:[&_[data-slot=alert-icon]]:bg-orange-400/20 dark:[&_[data-slot=alert-icon]]:text-orange-300',
        amber:
          'bg-card text-card-foreground [&_[data-slot=alert-icon]]:bg-amber-500/10 [&_[data-slot=alert-icon]]:text-amber-700 dark:[&_[data-slot=alert-icon]]:bg-amber-400/20 dark:[&_[data-slot=alert-icon]]:text-amber-300',
        yellow:
          'bg-card text-card-foreground [&_[data-slot=alert-icon]]:bg-yellow-500/10 [&_[data-slot=alert-icon]]:text-yellow-700 dark:[&_[data-slot=alert-icon]]:bg-yellow-400/20 dark:[&_[data-slot=alert-icon]]:text-yellow-300',
        lime: 'bg-card text-card-foreground [&_[data-slot=alert-icon]]:bg-lime-500/10 [&_[data-slot=alert-icon]]:text-lime-700 dark:[&_[data-slot=alert-icon]]:bg-lime-400/20 dark:[&_[data-slot=alert-icon]]:text-lime-300',
        green:
          'bg-card text-card-foreground [&_[data-slot=alert-icon]]:bg-green-500/10 [&_[data-slot=alert-icon]]:text-green-700 dark:[&_[data-slot=alert-icon]]:bg-green-400/20 dark:[&_[data-slot=alert-icon]]:text-green-300',
        emerald:
          'bg-card text-card-foreground [&_[data-slot=alert-icon]]:bg-emerald-500/10 [&_[data-slot=alert-icon]]:text-emerald-700 dark:[&_[data-slot=alert-icon]]:bg-emerald-400/20 dark:[&_[data-slot=alert-icon]]:text-emerald-300',
        teal: 'bg-card text-card-foreground [&_[data-slot=alert-icon]]:bg-teal-500/10 [&_[data-slot=alert-icon]]:text-teal-700 dark:[&_[data-slot=alert-icon]]:bg-teal-400/20 dark:[&_[data-slot=alert-icon]]:text-teal-300',
        cyan: 'bg-card text-card-foreground [&_[data-slot=alert-icon]]:bg-cyan-500/10 [&_[data-slot=alert-icon]]:text-cyan-700 dark:[&_[data-slot=alert-icon]]:bg-cyan-400/20 dark:[&_[data-slot=alert-icon]]:text-cyan-300',
        sky: 'bg-card text-card-foreground [&_[data-slot=alert-icon]]:bg-sky-500/10 [&_[data-slot=alert-icon]]:text-sky-700 dark:[&_[data-slot=alert-icon]]:bg-sky-400/20 dark:[&_[data-slot=alert-icon]]:text-sky-300',
        blue: 'bg-card text-card-foreground [&_[data-slot=alert-icon]]:bg-blue-500/10 [&_[data-slot=alert-icon]]:text-blue-700 dark:[&_[data-slot=alert-icon]]:bg-blue-400/20 dark:[&_[data-slot=alert-icon]]:text-blue-300',
        indigo:
          'bg-card text-card-foreground [&_[data-slot=alert-icon]]:bg-indigo-500/10 [&_[data-slot=alert-icon]]:text-indigo-700 dark:[&_[data-slot=alert-icon]]:bg-indigo-400/20 dark:[&_[data-slot=alert-icon]]:text-indigo-300',
        violet:
          'bg-card text-card-foreground [&_[data-slot=alert-icon]]:bg-violet-500/10 [&_[data-slot=alert-icon]]:text-violet-700 dark:[&_[data-slot=alert-icon]]:bg-violet-400/20 dark:[&_[data-slot=alert-icon]]:text-violet-300',
        purple:
          'bg-card text-card-foreground [&_[data-slot=alert-icon]]:bg-purple-500/10 [&_[data-slot=alert-icon]]:text-purple-700 dark:[&_[data-slot=alert-icon]]:bg-purple-400/20 dark:[&_[data-slot=alert-icon]]:text-purple-300',
        fuchsia:
          'bg-card text-card-foreground [&_[data-slot=alert-icon]]:bg-fuchsia-500/10 [&_[data-slot=alert-icon]]:text-fuchsia-700 dark:[&_[data-slot=alert-icon]]:bg-fuchsia-400/20 dark:[&_[data-slot=alert-icon]]:text-fuchsia-300',
        pink: 'bg-card text-card-foreground [&_[data-slot=alert-icon]]:bg-pink-500/10 [&_[data-slot=alert-icon]]:text-pink-700 dark:[&_[data-slot=alert-icon]]:bg-pink-400/20 dark:[&_[data-slot=alert-icon]]:text-pink-300',
        rose: 'bg-card text-card-foreground [&_[data-slot=alert-icon]]:bg-rose-500/10 [&_[data-slot=alert-icon]]:text-rose-700 dark:[&_[data-slot=alert-icon]]:bg-rose-400/20 dark:[&_[data-slot=alert-icon]]:text-rose-300',
        slate:
          'bg-card text-card-foreground [&_[data-slot=alert-icon]]:bg-slate-500/10 [&_[data-slot=alert-icon]]:text-slate-700 dark:[&_[data-slot=alert-icon]]:bg-slate-400/20 dark:[&_[data-slot=alert-icon]]:text-slate-300',
        gray: 'bg-card text-card-foreground [&_[data-slot=alert-icon]]:bg-gray-500/10 [&_[data-slot=alert-icon]]:text-gray-700 dark:[&_[data-slot=alert-icon]]:bg-gray-400/20 dark:[&_[data-slot=alert-icon]]:text-gray-300',
        zinc: 'bg-card text-card-foreground [&_[data-slot=alert-icon]]:bg-zinc-500/10 [&_[data-slot=alert-icon]]:text-zinc-700 dark:[&_[data-slot=alert-icon]]:bg-zinc-400/20 dark:[&_[data-slot=alert-icon]]:text-zinc-300',
        neutral:
          'bg-card text-card-foreground [&_[data-slot=alert-icon]]:bg-neutral-500/10 [&_[data-slot=alert-icon]]:text-neutral-700 dark:[&_[data-slot=alert-icon]]:bg-neutral-400/20 dark:[&_[data-slot=alert-icon]]:text-neutral-300',
        stone:
          'bg-card text-card-foreground [&_[data-slot=alert-icon]]:bg-stone-500/10 [&_[data-slot=alert-icon]]:text-stone-700 dark:[&_[data-slot=alert-icon]]:bg-stone-400/20 dark:[&_[data-slot=alert-icon]]:text-stone-300',
        taupe:
          'bg-card text-card-foreground [&_[data-slot=alert-icon]]:bg-[#8b7d6b]/10 [&_[data-slot=alert-icon]]:text-[#665a4b] dark:[&_[data-slot=alert-icon]]:bg-[#b7a898]/20 dark:[&_[data-slot=alert-icon]]:text-[#dfd3c8]',
        mauve:
          'bg-card text-card-foreground [&_[data-slot=alert-icon]]:bg-[#a8709d]/10 [&_[data-slot=alert-icon]]:text-[#7d4f75] dark:[&_[data-slot=alert-icon]]:bg-[#c995bd]/20 dark:[&_[data-slot=alert-icon]]:text-[#ecc8e7]',
        mist: 'bg-card text-card-foreground [&_[data-slot=alert-icon]]:bg-[#78909c]/10 [&_[data-slot=alert-icon]]:text-[#546e7a] dark:[&_[data-slot=alert-icon]]:bg-[#9eafb7]/20 dark:[&_[data-slot=alert-icon]]:text-[#d6e0e4]',
        olive:
          'bg-card text-card-foreground [&_[data-slot=alert-icon]]:bg-[#7a8144]/10 [&_[data-slot=alert-icon]]:text-[#5d6331] dark:[&_[data-slot=alert-icon]]:bg-[#a6ad68]/20 dark:[&_[data-slot=alert-icon]]:text-[#d9dda8]',
        'info-overlay':
          'bg-blue-500/10 text-blue-800 ring-blue-500/20 *:data-[slot=alert-description]:text-current/80 [&_[data-slot=alert-icon]]:bg-blue-500/15 [&_[data-slot=alert-icon]]:text-blue-700 dark:bg-blue-400/15 dark:text-blue-200 dark:ring-blue-400/25 dark:[&_[data-slot=alert-icon]]:bg-blue-400/20 dark:[&_[data-slot=alert-icon]]:text-blue-300',
        'success-overlay':
          'bg-emerald-500/10 text-emerald-800 ring-emerald-500/20 *:data-[slot=alert-description]:text-current/80 [&_[data-slot=alert-icon]]:bg-emerald-500/15 [&_[data-slot=alert-icon]]:text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-200 dark:ring-emerald-400/25 dark:[&_[data-slot=alert-icon]]:bg-emerald-400/20 dark:[&_[data-slot=alert-icon]]:text-emerald-300',
        'warning-overlay':
          'bg-amber-500/10 text-amber-800 ring-amber-500/20 *:data-[slot=alert-description]:text-current/80 [&_[data-slot=alert-icon]]:bg-amber-500/15 [&_[data-slot=alert-icon]]:text-amber-700 dark:bg-amber-400/15 dark:text-amber-200 dark:ring-amber-400/25 dark:[&_[data-slot=alert-icon]]:bg-amber-400/20 dark:[&_[data-slot=alert-icon]]:text-amber-300',
        'destructive-overlay':
          'bg-destructive/10 text-destructive ring-destructive/20 *:data-[slot=alert-description]:text-current/80 [&_[data-slot=alert-icon]]:bg-destructive/15 [&_[data-slot=alert-icon]]:text-destructive dark:bg-destructive/15 dark:ring-destructive/25 dark:[&_[data-slot=alert-icon]]:bg-destructive/20',
        'red-overlay':
          'bg-red-500/10 text-red-800 ring-red-500/20 *:data-[slot=alert-description]:text-current/80 [&_[data-slot=alert-icon]]:bg-red-500/15 [&_[data-slot=alert-icon]]:text-red-700 dark:bg-red-400/15 dark:text-red-200 dark:ring-red-400/25 dark:[&_[data-slot=alert-icon]]:bg-red-400/20 dark:[&_[data-slot=alert-icon]]:text-red-300',
        'orange-overlay':
          'bg-orange-500/10 text-orange-800 ring-orange-500/20 *:data-[slot=alert-description]:text-current/80 [&_[data-slot=alert-icon]]:bg-orange-500/15 [&_[data-slot=alert-icon]]:text-orange-700 dark:bg-orange-400/15 dark:text-orange-200 dark:ring-orange-400/25 dark:[&_[data-slot=alert-icon]]:bg-orange-400/20 dark:[&_[data-slot=alert-icon]]:text-orange-300',
        'amber-overlay':
          'bg-amber-500/10 text-amber-800 ring-amber-500/20 *:data-[slot=alert-description]:text-current/80 [&_[data-slot=alert-icon]]:bg-amber-500/15 [&_[data-slot=alert-icon]]:text-amber-700 dark:bg-amber-400/15 dark:text-amber-200 dark:ring-amber-400/25 dark:[&_[data-slot=alert-icon]]:bg-amber-400/20 dark:[&_[data-slot=alert-icon]]:text-amber-300',
        'yellow-overlay':
          'bg-yellow-500/10 text-yellow-800 ring-yellow-500/20 *:data-[slot=alert-description]:text-current/80 [&_[data-slot=alert-icon]]:bg-yellow-500/15 [&_[data-slot=alert-icon]]:text-yellow-700 dark:bg-yellow-400/15 dark:text-yellow-200 dark:ring-yellow-400/25 dark:[&_[data-slot=alert-icon]]:bg-yellow-400/20 dark:[&_[data-slot=alert-icon]]:text-yellow-300',
        'lime-overlay':
          'bg-lime-500/10 text-lime-800 ring-lime-500/20 *:data-[slot=alert-description]:text-current/80 [&_[data-slot=alert-icon]]:bg-lime-500/15 [&_[data-slot=alert-icon]]:text-lime-700 dark:bg-lime-400/15 dark:text-lime-200 dark:ring-lime-400/25 dark:[&_[data-slot=alert-icon]]:bg-lime-400/20 dark:[&_[data-slot=alert-icon]]:text-lime-300',
        'green-overlay':
          'bg-green-500/10 text-green-800 ring-green-500/20 *:data-[slot=alert-description]:text-current/80 [&_[data-slot=alert-icon]]:bg-green-500/15 [&_[data-slot=alert-icon]]:text-green-700 dark:bg-green-400/15 dark:text-green-200 dark:ring-green-400/25 dark:[&_[data-slot=alert-icon]]:bg-green-400/20 dark:[&_[data-slot=alert-icon]]:text-green-300',
        'emerald-overlay':
          'bg-emerald-500/10 text-emerald-800 ring-emerald-500/20 *:data-[slot=alert-description]:text-current/80 [&_[data-slot=alert-icon]]:bg-emerald-500/15 [&_[data-slot=alert-icon]]:text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-200 dark:ring-emerald-400/25 dark:[&_[data-slot=alert-icon]]:bg-emerald-400/20 dark:[&_[data-slot=alert-icon]]:text-emerald-300',
        'teal-overlay':
          'bg-teal-500/10 text-teal-800 ring-teal-500/20 *:data-[slot=alert-description]:text-current/80 [&_[data-slot=alert-icon]]:bg-teal-500/15 [&_[data-slot=alert-icon]]:text-teal-700 dark:bg-teal-400/15 dark:text-teal-200 dark:ring-teal-400/25 dark:[&_[data-slot=alert-icon]]:bg-teal-400/20 dark:[&_[data-slot=alert-icon]]:text-teal-300',
        'cyan-overlay':
          'bg-cyan-500/10 text-cyan-800 ring-cyan-500/20 *:data-[slot=alert-description]:text-current/80 [&_[data-slot=alert-icon]]:bg-cyan-500/15 [&_[data-slot=alert-icon]]:text-cyan-700 dark:bg-cyan-400/15 dark:text-cyan-200 dark:ring-cyan-400/25 dark:[&_[data-slot=alert-icon]]:bg-cyan-400/20 dark:[&_[data-slot=alert-icon]]:text-cyan-300',
        'sky-overlay':
          'bg-sky-500/10 text-sky-800 ring-sky-500/20 *:data-[slot=alert-description]:text-current/80 [&_[data-slot=alert-icon]]:bg-sky-500/15 [&_[data-slot=alert-icon]]:text-sky-700 dark:bg-sky-400/15 dark:text-sky-200 dark:ring-sky-400/25 dark:[&_[data-slot=alert-icon]]:bg-sky-400/20 dark:[&_[data-slot=alert-icon]]:text-sky-300',
        'blue-overlay':
          'bg-blue-500/10 text-blue-800 ring-blue-500/20 *:data-[slot=alert-description]:text-current/80 [&_[data-slot=alert-icon]]:bg-blue-500/15 [&_[data-slot=alert-icon]]:text-blue-700 dark:bg-blue-400/15 dark:text-blue-200 dark:ring-blue-400/25 dark:[&_[data-slot=alert-icon]]:bg-blue-400/20 dark:[&_[data-slot=alert-icon]]:text-blue-300',
        'indigo-overlay':
          'bg-indigo-500/10 text-indigo-800 ring-indigo-500/20 *:data-[slot=alert-description]:text-current/80 [&_[data-slot=alert-icon]]:bg-indigo-500/15 [&_[data-slot=alert-icon]]:text-indigo-700 dark:bg-indigo-400/15 dark:text-indigo-200 dark:ring-indigo-400/25 dark:[&_[data-slot=alert-icon]]:bg-indigo-400/20 dark:[&_[data-slot=alert-icon]]:text-indigo-300',
        'violet-overlay':
          'bg-violet-500/10 text-violet-800 ring-violet-500/20 *:data-[slot=alert-description]:text-current/80 [&_[data-slot=alert-icon]]:bg-violet-500/15 [&_[data-slot=alert-icon]]:text-violet-700 dark:bg-violet-400/15 dark:text-violet-200 dark:ring-violet-400/25 dark:[&_[data-slot=alert-icon]]:bg-violet-400/20 dark:[&_[data-slot=alert-icon]]:text-violet-300',
        'purple-overlay':
          'bg-purple-500/10 text-purple-800 ring-purple-500/20 *:data-[slot=alert-description]:text-current/80 [&_[data-slot=alert-icon]]:bg-purple-500/15 [&_[data-slot=alert-icon]]:text-purple-700 dark:bg-purple-400/15 dark:text-purple-200 dark:ring-purple-400/25 dark:[&_[data-slot=alert-icon]]:bg-purple-400/20 dark:[&_[data-slot=alert-icon]]:text-purple-300',
        'fuchsia-overlay':
          'bg-fuchsia-500/10 text-fuchsia-800 ring-fuchsia-500/20 *:data-[slot=alert-description]:text-current/80 [&_[data-slot=alert-icon]]:bg-fuchsia-500/15 [&_[data-slot=alert-icon]]:text-fuchsia-700 dark:bg-fuchsia-400/15 dark:text-fuchsia-200 dark:ring-fuchsia-400/25 dark:[&_[data-slot=alert-icon]]:bg-fuchsia-400/20 dark:[&_[data-slot=alert-icon]]:text-fuchsia-300',
        'pink-overlay':
          'bg-pink-500/10 text-pink-800 ring-pink-500/20 *:data-[slot=alert-description]:text-current/80 [&_[data-slot=alert-icon]]:bg-pink-500/15 [&_[data-slot=alert-icon]]:text-pink-700 dark:bg-pink-400/15 dark:text-pink-200 dark:ring-pink-400/25 dark:[&_[data-slot=alert-icon]]:bg-pink-400/20 dark:[&_[data-slot=alert-icon]]:text-pink-300',
        'rose-overlay':
          'bg-rose-500/10 text-rose-800 ring-rose-500/20 *:data-[slot=alert-description]:text-current/80 [&_[data-slot=alert-icon]]:bg-rose-500/15 [&_[data-slot=alert-icon]]:text-rose-700 dark:bg-rose-400/15 dark:text-rose-200 dark:ring-rose-400/25 dark:[&_[data-slot=alert-icon]]:bg-rose-400/20 dark:[&_[data-slot=alert-icon]]:text-rose-300',
        'slate-overlay':
          'bg-slate-500/10 text-slate-800 ring-slate-500/20 *:data-[slot=alert-description]:text-current/80 [&_[data-slot=alert-icon]]:bg-slate-500/15 [&_[data-slot=alert-icon]]:text-slate-700 dark:bg-slate-400/15 dark:text-slate-200 dark:ring-slate-400/25 dark:[&_[data-slot=alert-icon]]:bg-slate-400/20 dark:[&_[data-slot=alert-icon]]:text-slate-300',
        'gray-overlay':
          'bg-gray-500/10 text-gray-800 ring-gray-500/20 *:data-[slot=alert-description]:text-current/80 [&_[data-slot=alert-icon]]:bg-gray-500/15 [&_[data-slot=alert-icon]]:text-gray-700 dark:bg-gray-400/15 dark:text-gray-200 dark:ring-gray-400/25 dark:[&_[data-slot=alert-icon]]:bg-gray-400/20 dark:[&_[data-slot=alert-icon]]:text-gray-300',
        'zinc-overlay':
          'bg-zinc-500/10 text-zinc-800 ring-zinc-500/20 *:data-[slot=alert-description]:text-current/80 [&_[data-slot=alert-icon]]:bg-zinc-500/15 [&_[data-slot=alert-icon]]:text-zinc-700 dark:bg-zinc-400/15 dark:text-zinc-200 dark:ring-zinc-400/25 dark:[&_[data-slot=alert-icon]]:bg-zinc-400/20 dark:[&_[data-slot=alert-icon]]:text-zinc-300',
        'neutral-overlay':
          'bg-neutral-500/10 text-neutral-800 ring-neutral-500/20 *:data-[slot=alert-description]:text-current/80 [&_[data-slot=alert-icon]]:bg-neutral-500/15 [&_[data-slot=alert-icon]]:text-neutral-700 dark:bg-neutral-400/15 dark:text-neutral-200 dark:ring-neutral-400/25 dark:[&_[data-slot=alert-icon]]:bg-neutral-400/20 dark:[&_[data-slot=alert-icon]]:text-neutral-300',
        'stone-overlay':
          'bg-stone-500/10 text-stone-800 ring-stone-500/20 *:data-[slot=alert-description]:text-current/80 [&_[data-slot=alert-icon]]:bg-stone-500/15 [&_[data-slot=alert-icon]]:text-stone-700 dark:bg-stone-400/15 dark:text-stone-200 dark:ring-stone-400/25 dark:[&_[data-slot=alert-icon]]:bg-stone-400/20 dark:[&_[data-slot=alert-icon]]:text-stone-300',
        'taupe-overlay':
          'bg-[#8b7d6b]/10 text-[#665a4b] ring-[#8b7d6b]/20 *:data-[slot=alert-description]:text-current/80 [&_[data-slot=alert-icon]]:bg-[#8b7d6b]/15 [&_[data-slot=alert-icon]]:text-[#665a4b] dark:bg-[#b7a898]/15 dark:text-[#dfd3c8] dark:ring-[#b7a898]/25 dark:[&_[data-slot=alert-icon]]:bg-[#b7a898]/20 dark:[&_[data-slot=alert-icon]]:text-[#dfd3c8]',
        'mauve-overlay':
          'bg-[#a8709d]/10 text-[#7d4f75] ring-[#a8709d]/20 *:data-[slot=alert-description]:text-current/80 [&_[data-slot=alert-icon]]:bg-[#a8709d]/15 [&_[data-slot=alert-icon]]:text-[#7d4f75] dark:bg-[#c995bd]/15 dark:text-[#ecc8e7] dark:ring-[#c995bd]/25 dark:[&_[data-slot=alert-icon]]:bg-[#c995bd]/20 dark:[&_[data-slot=alert-icon]]:text-[#ecc8e7]',
        'mist-overlay':
          'bg-[#78909c]/10 text-[#546e7a] ring-[#78909c]/20 *:data-[slot=alert-description]:text-current/80 [&_[data-slot=alert-icon]]:bg-[#78909c]/15 [&_[data-slot=alert-icon]]:text-[#546e7a] dark:bg-[#9eafb7]/15 dark:text-[#d6e0e4] dark:ring-[#9eafb7]/25 dark:[&_[data-slot=alert-icon]]:bg-[#9eafb7]/20 dark:[&_[data-slot=alert-icon]]:text-[#d6e0e4]',
        'olive-overlay':
          'bg-[#7a8144]/10 text-[#5d6331] ring-[#7a8144]/20 *:data-[slot=alert-description]:text-current/80 [&_[data-slot=alert-icon]]:bg-[#7a8144]/15 [&_[data-slot=alert-icon]]:text-[#5d6331] dark:bg-[#a6ad68]/15 dark:text-[#d9dda8] dark:ring-[#a6ad68]/25 dark:[&_[data-slot=alert-icon]]:bg-[#a6ad68]/20 dark:[&_[data-slot=alert-icon]]:text-[#d9dda8]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

function Alert({
  className,
  variant = 'default',
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot='alert'
      data-variant={variant}
      role='alert'
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='alert-title'
      className={cn(
        'font-semibold [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground',
        className,
      )}
      {...props}
    />
  )
}

function AlertDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='alert-description'
      className={cn(
        'text-xs text-balance text-muted-foreground md:text-pretty [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-4',
        className,
      )}
      {...props}
    />
  )
}

function AlertAction({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot='alert-action' className={cn('ms-auto shrink-0', className)} {...props} />
}

function AlertIcon({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='alert-icon'
      className={cn(
        'flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground [&_svg]:size-4.5',
        className,
      )}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription, AlertAction, AlertIcon, alertVariants }
