import { IconChevronRight } from '@tabler/icons-react'
import { Link, useRouterState } from '@tanstack/react-router'

import { dashboardMenu, mainMenu } from '@/shared/components/app-layout/menu'
import IconHris from '@/shared/components/icon-hris'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/shared/components/ui/collapsible'
import { ScrollArea } from '@/shared/components/ui/scroll-area'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/shared/components/ui/sidebar'
import { cn } from '@/shared/lib/utils'
import { m } from '@/i18n/paraglide/messages'

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  const isPathActive = (itemTo: string, exact = false) => {
    if (!itemTo || itemTo === '.') return false
    const cleanPath = (p: string) => p.replace(/\/$/, '')
    const target = cleanPath(itemTo)
    const current = cleanPath(pathname)
    if (exact || target === '' || target === '/') {
      return current === target
    }
    return current === target || current.startsWith(target + '/')
  }

  return (
    <Sidebar className='border-none'>
      <SidebarHeader className='px-4 py-5'>
        <div className='flex items-center gap-2.5'>
          <IconHris />
          <span className='text-lg font-semibold tracking-tight text-sidebar-foreground'>
            {m.app_layout_brand_name()}
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent className='overflow-hidden p-0'>
        <ScrollArea className='min-h-0 w-full flex-1'>
          <div className='px-3 pb-3'>
            {/* Dashboard section with collapsible sub-items */}
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {dashboardMenu.map((item) => {
                    const hasSubItems = 'items' in item && item.items?.length
                    const isActive = hasSubItems
                      ? item.items?.some((subItem) => isPathActive(subItem.to))
                      : isPathActive(item.to)

                    if (!hasSubItems) {
                      return (
                        <SidebarMenuItem key={item.key}>
                          <SidebarMenuButton asChild isActive={isActive}>
                            <Link to={item.to}>
                              {item.icon && <item.icon size={24} stroke={1.75} />}
                              <span>{item.title()}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      )
                    }

                    return (
                      <Collapsible
                        key={item.key}
                        asChild
                        defaultOpen={isActive}
                        className='group/collapsible'
                      >
                        <SidebarMenuItem>
                          <CollapsibleTrigger asChild>
                            <SidebarMenuButton isActive={isActive}>
                              {item.icon && <item.icon size={24} stroke={1.75} />}
                              <span>{item.title()}</span>
                              <IconChevronRight
                                size={16}
                                className='ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90'
                              />
                            </SidebarMenuButton>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <SidebarMenuSub>
                              {item.items?.map((subItem) => {
                                const isSubActive = isPathActive(subItem.to)
                                return (
                                  <SidebarMenuSubItem key={subItem.key}>
                                    <SidebarMenuSubButton asChild isActive={isSubActive}>
                                      <Link to={subItem.to}>
                                        {subItem.icon && <subItem.icon size={16} stroke={1.75} />}
                                        <span>{subItem.title()}</span>
                                      </Link>
                                    </SidebarMenuSubButton>
                                  </SidebarMenuSubItem>
                                )
                              })}
                            </SidebarMenuSub>
                          </CollapsibleContent>
                        </SidebarMenuItem>
                      </Collapsible>
                    )
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* Main modules section */}
            <SidebarGroup>
              <SidebarGroupLabel>{m.app_layout_nav_main_module_label()}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className='gap-1.5'>
                  {mainMenu.map((item) => {
                    const hasSubItems = 'items' in item && item.items?.length

                    const isActive = hasSubItems
                      ? item.items?.some((subItem) => {
                          const hasSubSubItems = 'items' in subItem && subItem.items?.length
                          if (hasSubSubItems) {
                            return (
                              isPathActive(subItem.to) ||
                              subItem.items?.some((ss) => isPathActive(ss.to))
                            )
                          }
                          return isPathActive(subItem.to)
                        })
                      : isPathActive(item.to)

                    if (!hasSubItems) {
                      return (
                        <SidebarMenuItem key={item.key}>
                          <SidebarMenuButton asChild isActive={isActive}>
                            <Link to={item.to}>
                              {item.icon && <item.icon size={24} stroke={1.75} />}
                              <span>{item.title()}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      )
                    }

                    return (
                      <Collapsible
                        key={item.key}
                        asChild
                        defaultOpen={isActive}
                        className='group/collapsible'
                      >
                        <SidebarMenuItem>
                          <CollapsibleTrigger asChild>
                            <SidebarMenuButton isActive={isActive}>
                              {item.icon && <item.icon size={24} stroke={1.75} />}
                              <span>{item.title()}</span>
                              <IconChevronRight
                                size={16}
                                className='ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90'
                              />
                            </SidebarMenuButton>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <SidebarMenuSub>
                              {item.items?.map((subItem) => {
                                const hasSubSubItems = 'items' in subItem && subItem.items?.length
                                const isSubActive = hasSubSubItems
                                  ? isPathActive(subItem.to) ||
                                    subItem.items?.some((ss) => isPathActive(ss.to))
                                  : isPathActive(subItem.to)

                                if (!hasSubSubItems) {
                                  return (
                                    <SidebarMenuSubItem key={subItem.to}>
                                      <SidebarMenuSubButton asChild isActive={isSubActive}>
                                        <Link
                                          to={subItem.to}
                                          className='min-w-0 flex-1 whitespace-nowrap'
                                        >
                                          <span className='truncate'>{subItem.title()}</span>
                                        </Link>
                                      </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>
                                  )
                                }

                                return (
                                  <Collapsible
                                    key={subItem.key}
                                    asChild
                                    defaultOpen={isSubActive}
                                    className='group/sub-collapsible'
                                  >
                                    <SidebarMenuSubItem className='flex w-full flex-col items-start'>
                                      <CollapsibleTrigger asChild>
                                        <SidebarMenuSubButton
                                          isActive={isSubActive}
                                          className='-mx-4.5 grid w-[calc(100%+2.25rem)] cursor-pointer grid-cols-[minmax(0,1fr)_16px] items-center gap-2 ps-7 pe-3 text-xs font-medium'
                                        >
                                          <span className='truncate'>{subItem.title()}</span>
                                          <IconChevronRight
                                            size={16}
                                            className='justify-self-end text-current transition-transform duration-200 group-data-[state=open]/sub-collapsible:rotate-90'
                                          />
                                        </SidebarMenuSubButton>
                                      </CollapsibleTrigger>
                                      <CollapsibleContent className='w-full'>
                                        <div className='my-1 ml-2 flex flex-col gap-0.5 border-l border-sidebar-border pl-2.5'>
                                          {subItem.items?.map((subSubItem) => {
                                            const isSubSubActive = isPathActive(subSubItem.to, true)
                                            return (
                                              <Link
                                                key={subSubItem.key}
                                                to={subSubItem.to}
                                                className={cn(
                                                  'block rounded-lg px-2.5 py-1.5 text-xs font-medium whitespace-nowrap transition-colors',
                                                  isSubSubActive
                                                    ? 'bg-primary/10 font-semibold text-primary'
                                                    : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                                                )}
                                              >
                                                {subSubItem.title()}
                                              </Link>
                                            )
                                          })}
                                        </div>
                                      </CollapsibleContent>
                                    </SidebarMenuSubItem>
                                  </Collapsible>
                                )
                              })}
                            </SidebarMenuSub>
                          </CollapsibleContent>
                        </SidebarMenuItem>
                      </Collapsible>
                    )
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </div>
        </ScrollArea>
      </SidebarContent>
    </Sidebar>
  )
}
