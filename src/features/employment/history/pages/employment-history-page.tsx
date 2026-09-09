// employment-history-page.tsx — Employment history list and detail orchestration
import {
  IconChevronLeft,
  IconClock,
  IconFileText,
  IconSearch,
  IconUsers,
} from '@tabler/icons-react'
import type { LinkProps } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

import { useAppLayoutStore } from '@/shared/components/app-layout/app-layout-store'
import { AppMain } from '@/shared/components/app-layout/app-main'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { snackbar } from '@/shared/lib/snackbar'
import { useGetEmploymentHistories } from '@/features/employment/history/hooks'
import type { EmployeeEmploymentHistory } from '@/features/employment/history/types'
import { HistoryTable } from '@/features/employment/history/components/history-table'

import { HistoryDetailView } from './history-detail-view'

type ActiveView = 'list' | 'detail'

interface EmploymentHistoryPageProps {
  preselectedEmployeeId?: string
  preselectedName?: string
}

export function EmploymentHistoryPage({
  preselectedEmployeeId,
  preselectedName,
}: EmploymentHistoryPageProps = {}) {
  // ─── Filter/Search State ───────────────────────────────────────────────────
  const [searchInput, setSearchInput] = useState(preselectedName || '')
  const [searchValue, setSearchValue] = useState(preselectedName || '')

  const handleSearch = () => setSearchValue(searchInput)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') setSearchValue(searchInput)
  }
  const handleReset = () => {
    setSearchInput('')
    setSearchValue('')
  }

  // ─── Sub-page View State ───────────────────────────────────────────────────
  const [activeView, setActiveView] = useState<ActiveView>('list')
  const [activeHistory, setActiveHistory] = useState<EmployeeEmploymentHistory | null>(null)

  // ─── Data ──────────────────────────────────────────────────────────────────
  const {
    data: histories = [],
    isPending,
    isFetching,
    error,
    refetch,
  } = useGetEmploymentHistories(searchValue || undefined, preselectedEmployeeId)

  // ─── Back button portal ────────────────────────────────────────────────────
  const setHasBackButton = useAppLayoutStore((state) => state.setHasBackButton)
  const backBtnNode = useAppLayoutStore((state) => state.backBtnNode)

  useEffect(() => {
    if (activeView !== 'list') {
      setHasBackButton(true)
      return () => setHasBackButton(false)
    }
  }, [activeView, setHasBackButton])

  // ─── Auto-open detail for preselected employee ─────────────────────────────
  useEffect(() => {
    if (preselectedEmployeeId && histories.length > 0) {
      const match = histories.find((h) => h.employeeId === preselectedEmployeeId)
      if (match) {
        setTimeout(() => {
          setActiveHistory(match)
          setActiveView('detail')
        }, 0)
      }
    }
  }, [preselectedEmployeeId, histories])

  // ─── Action handlers ───────────────────────────────────────────────────────
  const goBackToList = () => {
    setActiveView('list')
    setActiveHistory(null)
  }

  const handleSelectHistory = (history: EmployeeEmploymentHistory) => {
    setActiveHistory(history)
    setActiveView('detail')
  }

  const handleExport = (history: EmployeeEmploymentHistory, format: 'pdf' | 'excel' | 'csv') => {
    snackbar.success(`Exporting ${history.fullName} history as ${format.toUpperCase()}...`)
  }

  // ─── Title & breadcrumbs ───────────────────────────────────────────────────
  let title = 'Employment History'
  let subtitle = 'View all employment events, documents, approvals, and effective dates.'
  let breadcrumbs: Array<{ label: string; to?: LinkProps['to'] }> = [
    { to: '/', label: 'Company' },
    { to: '/employment', label: 'Employment' },
    { to: '.', label: 'History' },
  ]

  if (activeView === 'detail') {
    title = 'Employment History'
    subtitle = 'View all employment events, documents, approvals, and effective dates.'
    breadcrumbs = [...breadcrumbs, { to: '.', label: 'Detail' }]
  }

  // Stats
  const totalEmployees = histories.length
  const totalEvents = histories.reduce((acc, h) => acc + h.timeline.length, 0)
  const totalDocs = histories.reduce((acc, h) => acc + h.documents.length, 0)

  return (
    <AppMain
      pending={isPending && histories.length === 0}
      error={error}
      retry={refetch}
      breadcrumbs={breadcrumbs as React.ComponentProps<typeof AppMain>['breadcrumbs']}
      title={title}
      subtitle={subtitle}
    >
      {/* ── Back button portal ─────────────────────────────────────────────── */}
      {activeView !== 'list' &&
        backBtnNode &&
        createPortal(
          <Button variant='outline' size='icon' onClick={goBackToList}>
            <IconChevronLeft size={24} />
          </Button>,
          backBtnNode,
        )}

      {/* ── LIST VIEW ───────────────────────────────────────────────────── */}
      {activeView === 'list' && (
        <div className='flex flex-col gap-6'>
          {/* Stats Cards */}
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
            {[
              {
                label: 'Total Employees',
                value: totalEmployees,
                icon: <IconUsers size={18} />,
                color: 'bg-purple-600',
              },
              {
                label: 'Total Timeline Events',
                value: totalEvents,
                icon: <IconClock size={18} />,
                color: 'bg-blue-600',
              },
              {
                label: 'Attached Documents',
                value: totalDocs,
                icon: <IconFileText size={18} />,
                color: 'bg-emerald-600',
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className='flex items-center gap-4 rounded-2xl border border-border/60 bg-card p-5 shadow-sm'
              >
                <div
                  className={`flex size-10 items-center justify-center rounded-xl ${stat.color} text-white`}
                >
                  {stat.icon}
                </div>
                <div>
                  <p className='text-2xl font-bold text-foreground'>{stat.value}</p>
                  <p className='text-xs text-muted-foreground'>{stat.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Search & Reset Bar */}
          <div className='flex flex-col gap-3 sm:flex-row sm:items-center'>
            <div className='relative flex-1'>
              <IconSearch
                size={15}
                className='absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground'
              />
              <Input
                className='h-9 pr-4 pl-9 text-sm'
                placeholder='Search employee name, code, or position...'
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
            <Button variant='outline' size='sm' onClick={handleSearch}>
              Search
            </Button>
            <Button variant='outline' size='sm' onClick={handleReset}>
              Reset
            </Button>
          </div>

          <HistoryTable
            histories={histories}
            isPending={isPending}
            isFetching={isFetching}
            onSelect={handleSelectHistory}
            onExport={handleExport}
          />
        </div>
      )}

      {/* ── DETAIL VIEW ─────────────────────────────────────────────────── */}
      {activeView === 'detail' && activeHistory && (
        <HistoryDetailView
          history={activeHistory}
          onExport={(format) => handleExport(activeHistory, format)}
        />
      )}
    </AppMain>
  )
}
