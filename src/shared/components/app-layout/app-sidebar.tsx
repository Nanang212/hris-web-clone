import { IconChevronRight } from '@tabler/icons-react'
import { Link, useRouterState } from '@tanstack/react-router'

import { dashboardMenu, mainMenu } from '@/shared/components/app-layout/menu'
import IconHris from '@/shared/components/icon-hris'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/shared/components/ui/collapsible'
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
import { m } from '@/i18n/paraglide/messages'
import { cn } from '@/shared/lib/utils'

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  const isPathActive = (itemTo: string) => {
    if (!itemTo) return false
    const cleanPath = (p: string) => p.replace(/\/$/, '')
    const target = cleanPath(itemTo)
    const current = cleanPath(pathname)
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

      <SidebarContent className='px-3'>
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
                  ? item.items?.some((subItem) => subItem.to && isPathActive(subItem.to))
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
                              ? isPathActive(subItem.to) || subItem.items?.some((ss) => isPathActive(ss.to))
                              : isPathActive(subItem.to)

                            if (!hasSubSubItems) {
                              return (
                                <SidebarMenuSubItem key={subItem.to}>
                                  <SidebarMenuSubButton asChild isActive={isSubActive}>
                                    <Link to={subItem.to}>
                                      {subItem.icon && <subItem.icon size={16} stroke={1.75} />}
                                      <span>{subItem.title()}</span>
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
                                <SidebarMenuSubItem className='flex flex-col items-start w-full relative h-auto'>
                                  <div className='relative flex items-center w-full'>
                                    <SidebarMenuSubButton asChild isActive={isSubActive} className='w-full pr-8'>
                                      <Link to={subItem.to}>
                                        <div className='flex items-center gap-2'>
                                          <span className='size-1.5 rounded-full bg-current' />
                                          <span>{subItem.title()}</span>
                                        </div>
                                      </Link>
                                    </SidebarMenuSubButton>
                                    <CollapsibleTrigger asChild>
                                      <button
                                        type='button'
                                        className='absolute right-1 top-1/2 -translate-y-1/2 size-6 flex items-center justify-center rounded hover:bg-sidebar-accent text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors z-10'
                                      >
                                        <IconChevronRight
                                          size={14}
                                          className='transition-transform duration-200 group-data-[state=open]/sub-collapsible:rotate-90'
                                        />
                                      </button>
                                    </CollapsibleTrigger>
                                  </div>
                                  <CollapsibleContent className='w-full'>
                                    <div className='pl-4 mt-1 flex flex-col gap-1 border-l border-muted-foreground/20 ml-2'>
                                      {subItem.items?.map((subSubItem) => {
                                        const isSubSubActive = isPathActive(subSubItem.to)
                                        return (
                                          <Link
                                            key={subSubItem.key}
                                            to={subSubItem.to}
                                            className={cn(
                                              'text-xs py-1.5 px-2 rounded-md font-medium transition-colors',
                                              isSubSubActive
                                                ? 'bg-primary/10 text-primary'
                                                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
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
      </SidebarContent>
    </Sidebar>
  )
}
