import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'
import * as React from 'react'

import { cn } from '@/shared/lib/utils'

const badgeVariants = cva(
  'group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-3xl border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pe-1.5 has-data-[icon=inline-start]:ps-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3!',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground [a]:hover:bg-primary/80',
        secondary: 'bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80',
        destructive:
          'bg-destructive/10 text-destructive focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:focus-visible:ring-destructive/40 [a]:hover:bg-destructive/20',
        red: 'bg-red-500/10 text-red-700 focus-visible:ring-red-500/20 dark:bg-red-400/20 dark:text-red-300 dark:focus-visible:ring-red-400/40 [a]:hover:bg-red-500/20',
        orange:
          'bg-orange-500/10 text-orange-700 focus-visible:ring-orange-500/20 dark:bg-orange-400/20 dark:text-orange-300 dark:focus-visible:ring-orange-400/40 [a]:hover:bg-orange-500/20',
        amber:
          'bg-amber-500/10 text-amber-700 focus-visible:ring-amber-500/20 dark:bg-amber-400/20 dark:text-amber-300 dark:focus-visible:ring-amber-400/40 [a]:hover:bg-amber-500/20',
        yellow:
          'bg-yellow-500/10 text-yellow-700 focus-visible:ring-yellow-500/20 dark:bg-yellow-400/20 dark:text-yellow-300 dark:focus-visible:ring-yellow-400/40 [a]:hover:bg-yellow-500/20',
        lime: 'bg-lime-500/10 text-lime-700 focus-visible:ring-lime-500/20 dark:bg-lime-400/20 dark:text-lime-300 dark:focus-visible:ring-lime-400/40 [a]:hover:bg-lime-500/20',
        green:
          'bg-green-500/10 text-green-700 focus-visible:ring-green-500/20 dark:bg-green-400/20 dark:text-green-300 dark:focus-visible:ring-green-400/40 [a]:hover:bg-green-500/20',
        emerald:
          'bg-emerald-500/10 text-emerald-700 focus-visible:ring-emerald-500/20 dark:bg-emerald-400/20 dark:text-emerald-300 dark:focus-visible:ring-emerald-400/40 [a]:hover:bg-emerald-500/20',
        teal: 'bg-teal-500/10 text-teal-700 focus-visible:ring-teal-500/20 dark:bg-teal-400/20 dark:text-teal-300 dark:focus-visible:ring-teal-400/40 [a]:hover:bg-teal-500/20',
        cyan: 'bg-cyan-500/10 text-cyan-700 focus-visible:ring-cyan-500/20 dark:bg-cyan-400/20 dark:text-cyan-300 dark:focus-visible:ring-cyan-400/40 [a]:hover:bg-cyan-500/20',
        sky: 'bg-sky-500/10 text-sky-700 focus-visible:ring-sky-500/20 dark:bg-sky-400/20 dark:text-sky-300 dark:focus-visible:ring-sky-400/40 [a]:hover:bg-sky-500/20',
        blue: 'bg-blue-500/10 text-blue-700 focus-visible:ring-blue-500/20 dark:bg-blue-400/20 dark:text-blue-300 dark:focus-visible:ring-blue-400/40 [a]:hover:bg-blue-500/20',
        indigo:
          'bg-indigo-500/10 text-indigo-700 focus-visible:ring-indigo-500/20 dark:bg-indigo-400/20 dark:text-indigo-300 dark:focus-visible:ring-indigo-400/40 [a]:hover:bg-indigo-500/20',
        violet:
          'bg-violet-500/10 text-violet-700 focus-visible:ring-violet-500/20 dark:bg-violet-400/20 dark:text-violet-300 dark:focus-visible:ring-violet-400/40 [a]:hover:bg-violet-500/20',
        purple:
          'bg-purple-500/10 text-purple-700 focus-visible:ring-purple-500/20 dark:bg-purple-400/20 dark:text-purple-300 dark:focus-visible:ring-purple-400/40 [a]:hover:bg-purple-500/20',
        fuchsia:
          'bg-fuchsia-500/10 text-fuchsia-700 focus-visible:ring-fuchsia-500/20 dark:bg-fuchsia-400/20 dark:text-fuchsia-300 dark:focus-visible:ring-fuchsia-400/40 [a]:hover:bg-fuchsia-500/20',
        pink: 'bg-pink-500/10 text-pink-700 focus-visible:ring-pink-500/20 dark:bg-pink-400/20 dark:text-pink-300 dark:focus-visible:ring-pink-400/40 [a]:hover:bg-pink-500/20',
        rose: 'bg-rose-500/10 text-rose-700 focus-visible:ring-rose-500/20 dark:bg-rose-400/20 dark:text-rose-300 dark:focus-visible:ring-rose-400/40 [a]:hover:bg-rose-500/20',
        slate:
          'bg-slate-500/10 text-slate-700 focus-visible:ring-slate-500/20 dark:bg-slate-400/20 dark:text-slate-300 dark:focus-visible:ring-slate-400/40 [a]:hover:bg-slate-500/20',
        gray: 'bg-gray-500/10 text-gray-700 focus-visible:ring-gray-500/20 dark:bg-gray-400/20 dark:text-gray-300 dark:focus-visible:ring-gray-400/40 [a]:hover:bg-gray-500/20',
        zinc: 'bg-zinc-500/10 text-zinc-700 focus-visible:ring-zinc-500/20 dark:bg-zinc-400/20 dark:text-zinc-300 dark:focus-visible:ring-zinc-400/40 [a]:hover:bg-zinc-500/20',
        neutral:
          'bg-neutral-500/10 text-neutral-700 focus-visible:ring-neutral-500/20 dark:bg-neutral-400/20 dark:text-neutral-300 dark:focus-visible:ring-neutral-400/40 [a]:hover:bg-neutral-500/20',
        stone:
          'bg-stone-500/10 text-stone-700 focus-visible:ring-stone-500/20 dark:bg-stone-400/20 dark:text-stone-300 dark:focus-visible:ring-stone-400/40 [a]:hover:bg-stone-500/20',
        taupe:
          'bg-[#8b7d6b]/10 text-[#665a4b] focus-visible:ring-[#8b7d6b]/20 dark:bg-[#b7a898]/20 dark:text-[#dfd3c8] dark:focus-visible:ring-[#b7a898]/40 [a]:hover:bg-[#8b7d6b]/20',
        mauve:
          'bg-[#a8709d]/10 text-[#7d4f75] focus-visible:ring-[#a8709d]/20 dark:bg-[#c995bd]/20 dark:text-[#ecc8e7] dark:focus-visible:ring-[#c995bd]/40 [a]:hover:bg-[#a8709d]/20',
        mist: 'bg-[#78909c]/10 text-[#546e7a] focus-visible:ring-[#78909c]/20 dark:bg-[#9eafb7]/20 dark:text-[#d6e0e4] dark:focus-visible:ring-[#9eafb7]/40 [a]:hover:bg-[#78909c]/20',
        olive:
          'bg-[#7a8144]/10 text-[#5d6331] focus-visible:ring-[#7a8144]/20 dark:bg-[#a6ad68]/20 dark:text-[#d9dda8] dark:focus-visible:ring-[#a6ad68]/40 [a]:hover:bg-[#7a8144]/20',
        outline: 'border-border text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground',
        ghost: 'hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50',
        link: 'text-primary underline-offset-4 hover:underline',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

function Badge({
  className,
  variant = 'default',
  asChild = false,
  ...props
}: React.ComponentProps<'span'> & VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : 'span'

  return (
    <Comp
      data-slot='badge'
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
