import { useSidebar } from '@/shared/components/ui/sidebar'
import { cn } from '@/shared/lib/utils'

export function AppMain({
  className,
  children,
  ...props
}: React.ComponentProps<'main'>) {
  const { open } = useSidebar()
  return (
    <main
      className={cn(
        'min-h-[calc(100vh-64px)] w-full bg-background p-4',
        open && 'rounded-s-3xl transition-all duration-300',
        className
      )}
      {...props}
    >
      {children}
    </main>
  )
}
