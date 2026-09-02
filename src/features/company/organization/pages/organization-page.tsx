// src/features/company/organization/pages/organization-page.tsx
import {
  IconBriefcase,
  IconBuilding,
  IconBuildingSkyscraper,
  IconHierarchy,
} from '@tabler/icons-react'
import { useState } from 'react'
import { DepartmentManagementTab } from './department/department-management-tab'
import { DivisionManagementTab } from './division/division-management-tab'
import { PositionManagementTab } from './position/position-management-tab'
import { OrganizationStructureTab } from './structure/organization-structure-tab'
import { AppMain } from '@/shared/components/app-layout/app-main'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'

export function OrganizationPage() {
  const [activeTab, setActiveTab] = useState('structure')

  return (
    <AppMain
      title='Organization Management'
      subtitle='Kelola bagan struktur hierarki organisasi, divisi bisnis, departemen, dan katalog jabatan posisi'
      className='gap-6 w-full max-w-full min-w-0'
    >
      {/* ── 4 Main Tabs Navigation ─────────────────────────────────────────── */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full max-w-full min-w-0 space-y-6'>
        <div className='border-b border-border/80 overflow-x-auto no-scrollbar'>
          <TabsList className='bg-transparent h-10 p-0 gap-6 w-max'>
            <TabsTrigger
              value='structure'
              className='data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none border-b-2 border-transparent rounded-none px-2 py-2 text-xs font-semibold gap-2 transition-all'
            >
              <IconHierarchy size={15} />
              Structure Tree
            </TabsTrigger>

            <TabsTrigger
              value='division'
              className='data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none border-b-2 border-transparent rounded-none px-2 py-2 text-xs font-semibold gap-2 transition-all'
            >
              <IconBuilding size={15} />
              Division Management
            </TabsTrigger>

            <TabsTrigger
              value='department'
              className='data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none border-b-2 border-transparent rounded-none px-2 py-2 text-xs font-semibold gap-2 transition-all'
            >
              <IconBuildingSkyscraper size={15} />
              Department Management
            </TabsTrigger>

            <TabsTrigger
              value='position'
              className='data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none border-b-2 border-transparent rounded-none px-2 py-2 text-xs font-semibold gap-2 transition-all'
            >
              <IconBriefcase size={15} />
              Position Management
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab 1: Structure */}
        <TabsContent value='structure' className='m-0 focus-visible:outline-none w-full max-w-full min-w-0'>
          <OrganizationStructureTab />
        </TabsContent>

        {/* Tab 2: Division */}
        <TabsContent value='division' className='m-0 focus-visible:outline-none w-full max-w-full min-w-0'>
          <DivisionManagementTab />
        </TabsContent>

        {/* Tab 3: Department */}
        <TabsContent value='department' className='m-0 focus-visible:outline-none w-full max-w-full min-w-0'>
          <DepartmentManagementTab />
        </TabsContent>

        {/* Tab 4: Position */}
        <TabsContent value='position' className='m-0 focus-visible:outline-none w-full max-w-full min-w-0'>
          <PositionManagementTab />
        </TabsContent>
      </Tabs>
    </AppMain>
  )
}
