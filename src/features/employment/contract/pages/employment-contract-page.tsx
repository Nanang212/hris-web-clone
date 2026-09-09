// employment-contract-page.tsx — Page to display and manage employee contracts
import {
  IconChevronLeft,
  IconLoader2,
  IconPlus,
  IconRefresh,
  IconSearch,
} from '@tabler/icons-react'
import { Link, type LinkProps } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

import { useAppLayoutStore } from '@/shared/components/app-layout/app-layout-store'
import { AppMain } from '@/shared/components/app-layout/app-main'
import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { Input } from '@/shared/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { snackbar } from '@/shared/lib/snackbar'
import { ContractTable } from '@/features/employment/contract/components/contract-table'
import { useGetContracts, useRenewContract } from '@/features/employment/contract/hooks'
import type { EmployeeContract } from '@/features/employment/contract/types'

import { ContractAmendmentView } from './contract-amendment-view'
import { ContractDetailView } from './contract-detail-view'
import { ContractPreviewDialog } from './contract-preview-dialog'
import { ContractRenewalView } from './contract-renewal-view'
import { ContractReviewView } from './contract-review-view'
import { ContractSignatureView } from './contract-signature-view'

interface EmploymentContractPageProps {
  preselectedEmployeeId?: string
  preselectedName?: string
}

export function EmploymentContractPage({
  preselectedEmployeeId,
  preselectedName,
}: EmploymentContractPageProps = {}) {
  const [searchInput, setSearchInput] = useState(preselectedName || '')
  const [searchValue, setSearchValue] = useState(preselectedName || '')
  const [statusFilter, setStatusFilter] = useState('all')
  const [renewingContract, setRenewingContract] = useState<EmployeeContract | null>(null)

  const handleSearch = () => {
    setSearchValue(searchInput)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setSearchValue(searchInput)
    }
  }

  const handleReset = () => {
    setSearchInput('')
    setSearchValue('')
    setStatusFilter('all')
  }

  // Sub-pages Active View State
  const [activeView, setActiveView] = useState<
    'list' | 'detail' | 'review' | 'signature' | 'renewal' | 'amendment'
  >('list')
  const [activeContract, setActiveContract] = useState<EmployeeContract | null>(null)
  const [backToView, setBackToView] = useState<'list' | 'detail'>('list')

  const {
    data: contracts = [],
    isPending,
    isFetching,
    error,
    refetch,
  } = useGetContracts(searchValue || undefined, statusFilter || undefined)

  const setHasBackButton = useAppLayoutStore((state) => state.setHasBackButton)
  const backBtnNode = useAppLayoutStore((state) => state.backBtnNode)

  useEffect(() => {
    if (activeView !== 'list') {
      setHasBackButton(true)
      return () => setHasBackButton(false)
    }
  }, [activeView, setHasBackButton])

  // Pre-open contract detail if employeeId was passed in route search parameters
  useEffect(() => {
    if (preselectedEmployeeId && contracts.length > 0) {
      const match = contracts.find((c) => c.employeeId === preselectedEmployeeId)
      if (match) {
        setTimeout(() => {
          setActiveContract(match)
          setActiveView('detail')
        }, 0)
      }
    }
  }, [preselectedEmployeeId, contracts])

  const [newStartDate, setNewStartDate] = useState('2026-09-01')
  const [newEndDate, setNewEndDate] = useState('2027-08-31')

  // Renewal/Extension fields
  const [renewalType, setRenewalType] = useState('Extension')
  const [newContractType, setNewContractType] = useState('PKWT')
  const [effectivePosition, setEffectivePosition] = useState('Finance Analyst')
  const [workLocation, setWorkLocation] = useState('Jakarta HQ')
  const [renewalReason, setRenewalReason] = useState('Annual contract renewal')

  // PDF Preview states
  const [previewPdfOpen, setPreviewPdfOpen] = useState(false)
  const [previewPdfTitle, setPreviewPdfTitle] = useState('')

  const { mutate: doRenew, isPending: isRenewing } = useRenewContract()

  const handleRenew = () => {
    if (!renewingContract) return
    doRenew(
      { id: renewingContract.id, startDate: newStartDate, endDate: newEndDate },
      {
        onSuccess: (res) => {
          snackbar.success(
            `Contract ${res.data.contractNumber} for ${res.data.fullName} renewed successfully!`,
          )
          setRenewingContract(null)
          setActiveView('list')
        },
        onError: (err) => snackbar.exception(err),
      },
    )
  }

  const handleActionClick = (
    ctr: EmployeeContract,
    view: 'detail' | 'review' | 'signature' | 'renewal' | 'amendment',
    source: 'list' | 'detail' = 'list',
  ) => {
    setBackToView(source)
    setActiveContract(ctr)
    setActiveView(view)
    if (view === 'renewal') {
      setNewStartDate(ctr.endDate)
      setEffectivePosition(ctr.positionName)
      setWorkLocation(ctr.workLocation)
    }
  }

  const statsCards = [
    {
      title: 'Active Contracts',
      value: '1,172',
      desc: '93.9% active',
      bg: 'bg-emerald-50/50 dark:bg-emerald-950/20',
      color: 'text-emerald-600',
    },
    {
      title: 'Expiring in 30 Days',
      value: '28',
      desc: 'Renewal reminder active',
      bg: 'bg-amber-50/50 dark:bg-amber-950/20',
      color: 'text-amber-600',
    },
    {
      title: 'Draft Contracts',
      value: '12',
      desc: 'Awaiting completion',
      bg: 'bg-blue-50/50 dark:bg-blue-950/20',
      color: 'text-blue-600',
    },
    {
      title: 'Unsigned',
      value: '8',
      desc: 'Pending signature',
      bg: 'bg-rose-50/50 dark:bg-rose-950/20',
      color: 'text-rose-600',
    },
  ]

  // ─── AppMain Header Props Mapping ───────────────────────────────────────────
  let title = 'Employment Contract'
  let subtitle = 'Create, renew, amend, sign, and archive employee contracts.'
  let breadcrumbs: Array<{ label: string; to?: LinkProps['to'] }> = [
    { to: '/', label: 'Company' },
    { to: '/employment', label: 'Employment' },
    { to: '.', label: 'Contract' },
  ]
  let actions: React.ReactNode = (
    <Link to='/employment/contract/new'>
      <Button size='sm'>
        <IconPlus data-icon='inline-start' />
        Create New Contract
      </Button>
    </Link>
  )

  if (activeView === 'detail') {
    title = 'Contract Details'
    subtitle = 'View employee contract terms, duration parameters, and document details.'
    breadcrumbs = [...breadcrumbs, { to: '.', label: 'Detail' }]
    actions = null
  } else if (activeView === 'review') {
    title = 'Review Employment Contract'
    subtitle = 'Verify employee, dates, terms, document, and approval route before submission.'
    breadcrumbs =
      backToView === 'detail'
        ? [...breadcrumbs, { label: 'Detail' }, { to: '.', label: 'Review' }]
        : [...breadcrumbs, { to: '.', label: 'Review' }]
    actions = null
  } else if (activeView === 'signature') {
    title = 'Contract Signature & Completion'
    subtitle = 'Track required signatures and activate the approved contract after completion.'
    breadcrumbs =
      backToView === 'detail'
        ? [...breadcrumbs, { label: 'Detail' }, { to: '.', label: 'Signature' }]
        : [...breadcrumbs, { to: '.', label: 'Signature' }]
    actions = null
  } else if (activeView === 'renewal') {
    title = 'Contract Renewal / Extension'
    subtitle =
      'Extend an expiring contract while preserving the previous contract version and history.'
    breadcrumbs =
      backToView === 'detail'
        ? [...breadcrumbs, { label: 'Detail' }, { to: '.', label: 'Renewal' }]
        : [...breadcrumbs, { to: '.', label: 'Renewal' }]
    actions = null
  } else if (activeView === 'amendment') {
    title = 'Contract Amendment & Signature'
    subtitle =
      'Track approved amendments, employee/company signatories, and the final signed contract document.'
    breadcrumbs =
      backToView === 'detail'
        ? [...breadcrumbs, { label: 'Detail' }, { to: '.', label: 'Amendment' }]
        : [...breadcrumbs, { to: '.', label: 'Amendment' }]
    actions = null
  }

  return (
    <AppMain
      pending={isPending && contracts.length === 0}
      error={error}
      retry={refetch}
      breadcrumbs={breadcrumbs as React.ComponentProps<typeof AppMain>['breadcrumbs']}
      title={title}
      subtitle={subtitle}
      actions={actions}
      backTo={undefined}
    >
      {activeView !== 'list' &&
        backBtnNode &&
        createPortal(
          <Button
            variant='outline'
            size='icon'
            onClick={() => {
              if (activeView === 'detail') {
                setActiveView('list')
              } else {
                setActiveView(backToView)
              }
            }}
          >
            <IconChevronLeft size={24} />
          </Button>,
          backBtnNode,
        )}
      {/* ────────────────────────────────────────────────────────────────────────
          VIEW: 0. DETAIL VIEW
          ──────────────────────────────────────────────────────────────────────── */}
      {activeView === 'detail' && activeContract && (
        <ContractDetailView
          activeContract={activeContract}
          onBack={() => setActiveView('list')}
          onPreview={() => {
            setPreviewPdfTitle(`Preview Contract - ${activeContract.fullName}`)
            setPreviewPdfOpen(true)
          }}
          onAction={(action) => handleActionClick(activeContract, action, 'detail')}
        />
      )}

      {/* ────────────────────────────────────────────────────────────────────────
          VIEW: 0. LIST CONTRACTS (DEFAULT)
          ──────────────────────────────────────────────────────────────────────── */}
      {activeView === 'list' && (
        <>
          {/* Stats row */}
          <div className='mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
            {statsCards.map((card, idx) => (
              <div
                key={idx}
                className={`flex flex-col gap-1 rounded-2xl border border-border/50 p-5 shadow-sm ${card.bg}`}
              >
                <span className='text-xs font-semibold text-muted-foreground'>{card.title}</span>
                <span className={`mt-2 text-2xl font-extrabold ${card.color}`}>{card.value}</span>
                <span className='text-[11px] text-muted-foreground'>{card.desc}</span>
              </div>
            ))}
          </div>

          {/* Filter and search */}
          <div className='mb-4 flex flex-wrap items-center gap-3'>
            <div className='flex min-w-[320px] flex-1 gap-2'>
              <div className='relative flex-1'>
                <IconSearch
                  size={16}
                  className='pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground'
                />
                <Input
                  placeholder='Search employee or contract number...'
                  className='pl-9'
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>
              <Button onClick={handleSearch}>Search</Button>
              <Button variant='outline' onClick={handleReset}>
                Reset
              </Button>
            </div>

            <Select
              onValueChange={(val) => {
                setStatusFilter(val)
              }}
              value={statusFilter}
            >
              <SelectTrigger className='w-40'>
                <SelectValue placeholder='Status' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Status</SelectItem>
                <SelectItem value='active'>Active</SelectItem>
                <SelectItem value='expiring'>Expiring</SelectItem>
                <SelectItem value='draft'>Draft</SelectItem>
                <SelectItem value='unsigned'>Unsigned</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table list */}
          <ContractTable
            contracts={contracts}
            isPending={isPending && contracts.length === 0}
            isFetching={isFetching}
            onAction={(ctr, action) => handleActionClick(ctr, action)}
          />
        </>
      )}

      {/* ────────────────────────────────────────────────────────────────────────
          VIEW: 1. REVIEW & CONFIRM
          ──────────────────────────────────────────────────────────────────────── */}
      {activeView === 'review' && activeContract && (
        <ContractReviewView
          activeContract={activeContract}
          onBack={() => setActiveView(backToView)}
          onSubmit={() => {
            snackbar.success('Contract submitted for approval successfully!')
            setActiveView(backToView)
          }}
          onPreview={() => {
            setPreviewPdfTitle(`Preview Contract - ${activeContract.fullName}`)
            setPreviewPdfOpen(true)
          }}
        />
      )}

      {/* ────────────────────────────────────────────────────────────────────────
          VIEW: 2. SIGNATURE & COMPLETION
          ──────────────────────────────────────────────────────────────────────── */}
      {activeView === 'signature' && activeContract && (
        <ContractSignatureView
          activeContract={activeContract}
          onBack={() => setActiveView(backToView)}
          onComplete={() => {
            snackbar.success('Contract completed and activated successfully!')
            setActiveView(backToView)
          }}
          onPreview={() => {
            setPreviewPdfTitle(`Preview Contract Final - ${activeContract.fullName}`)
            setPreviewPdfOpen(true)
          }}
        />
      )}

      {/* ────────────────────────────────────────────────────────────────────────
          VIEW: 3. RENEWAL & EXTENSION
          ──────────────────────────────────────────────────────────────────────── */}
      {activeView === 'renewal' && activeContract && (
        <ContractRenewalView
          activeContract={activeContract}
          onBack={() => setActiveView(backToView)}
          onSaveDraft={() => {
            snackbar.success('Draft contract saved successfully!')
            setActiveView(backToView)
          }}
          onCreateRenewal={() => {
            snackbar.success('Renewal contract created successfully!')
            setActiveView(backToView)
          }}
          newStartDate={newStartDate}
          setNewStartDate={setNewStartDate}
          newEndDate={newEndDate}
          setNewEndDate={setNewEndDate}
          renewalType={renewalType}
          setRenewalType={setRenewalType}
          newContractType={newContractType}
          setNewContractType={setNewContractType}
          effectivePosition={effectivePosition}
          setEffectivePosition={setEffectivePosition}
          workLocation={workLocation}
          setWorkLocation={setWorkLocation}
          renewalReason={renewalReason}
          setRenewalReason={setRenewalReason}
        />
      )}

      {/* ────────────────────────────────────────────────────────────────────────
          VIEW: 4. AMENDMENT & SIGNATURE
          ──────────────────────────────────────────────────────────────────────── */}
      {activeView === 'amendment' && activeContract && (
        <ContractAmendmentView
          activeContract={activeContract}
          onBack={() => setActiveView(backToView)}
          onComplete={() => {
            snackbar.success('Amendment completed and activated successfully!')
            setActiveView(backToView)
          }}
          onPreview={() => {
            setPreviewPdfTitle(`Preview Amendment Contract - ${activeContract.fullName}`)
            setPreviewPdfOpen(true)
          }}
        />
      )}

      {/* ────────────────────────────────────────────────────────────────────────
          GLOBAL MODALS (DETAIL, RENEW, PDF PREVIEW)
          ──────────────────────────────────────────────────────────────────────── */}

      {/* Renew Contract Dialog Modal */}
      <Dialog open={!!renewingContract} onOpenChange={(open) => !open && setRenewingContract(null)}>
        {renewingContract && (
          <DialogContent className='sm:max-w-[500px]'>
            <DialogHeader className='border-b pb-4'>
              <DialogTitle className='text-base font-bold text-foreground'>
                Renew Contract — {renewingContract.fullName}
              </DialogTitle>
              <DialogDescription className='mt-0.5 text-xs'>
                Set the new duration for contract {renewingContract.contractNumber}.
              </DialogDescription>
            </DialogHeader>

            <div className='flex flex-col gap-4 py-4 text-xs'>
              {/* Previous contract info */}
              <div className='flex flex-col gap-2 rounded-xl border border-border/50 bg-muted/30 p-3'>
                <p className='font-semibold text-muted-foreground'>Current Contract Period</p>
                <div className='grid grid-cols-2 gap-2 text-xs'>
                  <div>
                    <span className='text-muted-foreground'>Start Date:</span>{' '}
                    <span className='font-semibold text-foreground'>
                      {renewingContract.startDate}
                    </span>
                  </div>
                  <div>
                    <span className='text-muted-foreground'>End Date:</span>{' '}
                    <span className='font-semibold text-foreground'>
                      {renewingContract.endDate}
                    </span>
                  </div>
                </div>
              </div>

              {/* Form fields */}
              <div className='grid grid-cols-2 gap-4'>
                <div className='flex flex-col gap-1.5'>
                  <label htmlFor='newStartDate' className='font-semibold text-muted-foreground'>
                    New Start Date
                  </label>
                  <Input
                    id='newStartDate'
                    type='date'
                    value={newStartDate}
                    onChange={(e) => setNewStartDate(e.target.value)}
                    disabled={isRenewing}
                  />
                </div>
                <div className='flex flex-col gap-1.5'>
                  <label htmlFor='newEndDate' className='font-semibold text-muted-foreground'>
                    New End Date
                  </label>
                  <Input
                    id='newEndDate'
                    type='date'
                    value={newEndDate}
                    onChange={(e) => setNewEndDate(e.target.value)}
                    disabled={isRenewing}
                  />
                </div>
              </div>

              {/* Renewal reminder box from design image */}
              <div className='mt-2 flex items-center justify-between rounded-xl border border-blue-400 bg-amber-50/40 p-4 shadow-sm'>
                <div className='flex items-center gap-1.5 text-xs font-semibold text-amber-800'>
                  <span>Renewal reminder active · next send T-14 · Email + Push + WhatsApp</span>
                </div>
                <button
                  type='button'
                  className='inline-flex items-center gap-0.5 text-xs font-bold text-blue-600 transition-colors hover:text-blue-800'
                  onClick={() => snackbar.success('Pengaturan reminder akan segera dapat diubah!')}
                >
                  Manage <span className='text-[10px]'>→</span>
                </button>
              </div>
            </div>

            {/* Modal Actions */}
            <div className='mt-6 flex items-center justify-end gap-3 border-t pt-4'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setRenewingContract(null)}
                disabled={isRenewing}
              >
                Cancel
              </Button>
              <Button
                size='sm'
                onClick={handleRenew}
                disabled={isRenewing}
                className='bg-blue-600 font-semibold text-white hover:bg-blue-700'
              >
                {isRenewing ? (
                  <IconLoader2 size={14} className='animate-spin' data-icon='inline-start' />
                ) : (
                  <IconRefresh size={14} data-icon='inline-start' />
                )}
                Renew / Extend
              </Button>
            </div>
          </DialogContent>
        )}
      </Dialog>

      <ContractPreviewDialog
        open={previewPdfOpen}
        onOpenChange={setPreviewPdfOpen}
        title={previewPdfTitle}
        activeContract={activeContract}
      />
    </AppMain>
  )
}
