import { IconSearch, IconX } from '@tabler/icons-react'
import { useNavigate } from '@tanstack/react-router'
import { Dialog as DialogPrimitive } from 'radix-ui'
import { useEffect, useState } from 'react'

import { m } from '@/i18n/paraglide/messages'
import { dashboardMenu, mainMenu } from '@/shared/components/app-layout/menu'
import { Button } from '@/shared/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/shared/components/ui/command'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { cn } from '@/shared/lib/utils'

type FlatMenuItem = {
  key: string
  url: string
  title: () => string
  icon?: (typeof dashboardMenu)[number]['icon']
}

type MenuGroup = {
  key: string
  title: () => string
  items: FlatMenuItem[]
}

const topLevelItems: FlatMenuItem[] = [
  ...dashboardMenu,
  ...mainMenu.filter((item) => !('items' in item)),
]

const nestedGroups: MenuGroup[] = mainMenu
  .filter((item): item is Extract<(typeof mainMenu)[number], { items: unknown }> => 'items' in item)
  .map((item) => ({
    key: item.key,
    title: item.title,
    items: item.items.map((subItem) => ({
      key: subItem.url,
      url: subItem.url,
      title: subItem.title,
    })),
  }))

export function AppCommandMenu() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setOpen((prev) => !prev)
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  function handleSelect(url: string) {
    setOpen(false)
    navigate({ to: url })
  }

  return (
    <>
      <button
        type='button'
        onClick={() => setOpen(true)}
        className='hidden w-56 items-center gap-2 rounded-xl bg-muted/40 px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-muted/60 sm:flex lg:w-72'
      >
        <IconSearch size={16} className='shrink-0' />
        <span className='flex-1 truncate'>{m.app_layout_search_placeholder()}</span>
        <kbd className='pointer-events-none hidden shrink-0 items-center gap-0.5 rounded border bg-background px-1.5 py-0.5 font-mono text-[0.65rem] font-medium text-muted-foreground sm:flex'>
          <span>⌘</span>K
        </kbd>
      </button>

      <Button variant='outline' size='icon' className='sm:hidden' onClick={() => setOpen(true)}>
        <IconSearch size={20} />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          showCloseButton={false}
          className={cn(
            'top-0 left-0 h-full max-h-full w-full max-w-full translate-x-0 translate-y-0 gap-0 overflow-hidden rounded-none p-0',
            'sm:top-[50%] sm:left-[50%] sm:h-auto sm:max-h-[70vh] sm:w-full sm:max-w-xl sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-xl',
          )}
        >
          <DialogTitle className='sr-only'>{m.app_layout_search_placeholder()}</DialogTitle>
          <DialogDescription className='sr-only'>
            {m.app_layout_search_placeholder()}
          </DialogDescription>

          <Command
            className={cn(
              'flex h-full flex-col',
              '**:[[cmdk-group-heading]]:px-2 **:[[cmdk-group-heading]]:py-1.5 **:[[cmdk-group-heading]]:text-xs **:[[cmdk-group-heading]]:font-medium **:[[cmdk-group-heading]]:text-muted-foreground',
              '**:[[cmdk-input-wrapper]]:border-0 **:[[cmdk-input-wrapper]]:px-0',
            )}
          >
            <div className='flex w-full items-center gap-2 border-b px-3 py-1'>
              <div className='min-w-0 flex-1'>
                <CommandInput placeholder={m.app_layout_search_placeholder()} />
              </div>
              <DialogPrimitive.Close data-slot='dialog-close' asChild>
                <Button variant='ghost' size='icon-sm' className='shrink-0 bg-secondary'>
                  <IconX />
                  <span className='sr-only'>Close</span>
                </Button>
              </DialogPrimitive.Close>
            </div>
            <CommandList className='max-h-none flex-1 overflow-y-auto sm:max-h-100'>
              <CommandEmpty>{m.app_layout_search_empty()}</CommandEmpty>

              <CommandGroup heading={m.app_layout_search_group_menu()}>
                {topLevelItems.map((item) => (
                  <CommandItem
                    key={item.key}
                    value={item.title()}
                    onSelect={() => handleSelect(item.url)}
                  >
                    {item.icon && <item.icon size={16} className='text-muted-foreground' />}
                    <span>{item.title()}</span>
                  </CommandItem>
                ))}
              </CommandGroup>

              {nestedGroups.map((group) => (
                <CommandGroup key={group.key} heading={group.title()}>
                  {group.items.map((subItem) => (
                    <CommandItem
                      key={subItem.key}
                      value={subItem.title()}
                      onSelect={() => handleSelect(subItem.url)}
                    >
                      <span>{subItem.title()}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  )
}
