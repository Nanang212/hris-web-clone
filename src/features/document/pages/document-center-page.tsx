// document-center-page.tsx — Main Document Center page orchestrator
import {
  IconChevronLeft,
  IconDownload,
  IconPlus,
} from '@tabler/icons-react'
import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import type { LinkProps } from '@tanstack/react-router'
import { useAppLayoutStore } from '@/shared/components/app-layout/app-layout-store'

import type { EmployeeDocumentCompleteness } from '@/features/document/types'
import { AppMain } from '@/shared/components/app-layout/app-main'
import { DocumentOverviewTab } from './document-overview-tab'
import { DocumentCertificatesTab } from './document-certificates-tab'
import { DocumentAttachmentsTab } from './document-attachments-tab'
import { DocumentUploadView } from './document-upload-view'
import { DocumentUploadSuccessView } from './document-upload-success-view'
import { Button } from '@/shared/components/ui/button'
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/shared/components/ui/tabs'
import { downloadExcelExport } from '@/features/document/lib/download-helper'
import { snackbar } from '@/shared/lib/snackbar'

type DocumentCenterTab = 'overview' | 'certificates' | 'attachments'
type DocumentPageView = 'tabs' | 'upload' | 'upload-success'

interface DocumentCenterPageProps {
  initialTab?: DocumentCenterTab
  preselectedEmployeeId?: string
}

export function DocumentCenterPage({
  initialTab = 'overview',
  preselectedEmployeeId,
}: DocumentCenterPageProps = {}) {
  // ─── Active Tab & View ─────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<DocumentCenterTab>(initialTab)
  const [activeView, setActiveView] = useState<DocumentPageView>(
    preselectedEmployeeId ? 'upload' : 'tabs',
  )
  const [targetEmployee, setTargetEmployee] = useState<EmployeeDocumentCompleteness | null>(null)
  const [savedEmployee, setSavedEmployee] = useState<EmployeeDocumentCompleteness | null>(null)

  // ─── Back Button Portal ────────────────────────────────────────────────────
  const setHasBackButton = useAppLayoutStore((state) => state.setHasBackButton)
  const backBtnNode = useAppLayoutStore((state) => state.backBtnNode)

  useEffect(() => {
    if (activeView !== 'tabs') {
      setHasBackButton(true)
      return () => setHasBackButton(false)
    }
  }, [activeView, setHasBackButton])

  const goBackToTabs = () => {
    setActiveView('tabs')
    setTargetEmployee(null)
  }

  // ─── Trigger Multi-Upload ──────────────────────────────────────────────────
  const handleOpenUpload = (emp?: EmployeeDocumentCompleteness | null) => {
    setTargetEmployee(emp || null)
    setActiveView('upload')
  }

  const handleUploadSuccess = (saved: EmployeeDocumentCompleteness) => {
    setSavedEmployee(saved)
    setActiveView('upload-success')
  }

  const handleExportList = () => {
    downloadExcelExport(
      'Document_Completeness_Export.xlsx',
      'Completeness Overview',
      ['Employee Name', 'NIP', 'Department', 'Position', 'Completeness', 'Missing Docs', 'Expiring Docs', 'Last Updated'],
      [
        ['Rian Wijaya', 'EMP001', 'IT & Engineering', 'Senior Frontend Engineer', '6/6 (100%)', '0', '0', 'Today'],
        ['Siti Aminah', 'EMP002', 'Human Resource', 'HR Specialist', '5/6 (83%)', '1', '0', 'Yesterday'],
        ['Budi Santoso', 'EMP003', 'IT & Engineering', 'Engineering Manager', '4/6 (67%)', '2', '1', '2 days ago'],
        ['Dewi Lestari', 'EMP004', 'Human Resource', 'HR Manager', '6/6 (100%)', '0', '0', '3 days ago'],
        ['Andi Pratama', 'EMP005', 'IT & Engineering', 'Backend Developer', '2/6 (33%)', '4', '0', '5 days ago'],
        ['Nita Putri', 'EMP006', 'Marketing & Design', 'UI/UX Designer', '0/6 (0%)', '6', '0', '1 week ago'],
      ],
    )
    snackbar.success('Downloaded Document_Completeness_Export.xlsx successfully!')
  }

  // ─── Header titles, subtitles, & actions ───────────────────────────────────
  let title = 'Document Center'
  let subtitle = 'Monitor employee document completeness, expiry, verification, and retention in one place.'
  let breadcrumbs: Array<{ label: string; to?: LinkProps['to'] }> = [
    { to: '/', label: 'Company' },
    { to: '.', label: 'Document' },
  ]

  let actions: React.ReactNode = null

  if (activeView === 'tabs') {
    if (activeTab === 'overview') {
      title = 'Document Center'
      subtitle = 'Monitor employee document completeness, expiry, verification, and retention in one place.'
      actions = (
        <div className='flex items-center gap-2'>
          <Button variant='outline' size='sm' onClick={handleExportList} className='gap-1.5 text-xs font-semibold'>
            <IconDownload size={14} />
            Export List
          </Button>
          <Button size='sm' onClick={() => handleOpenUpload(null)} className='gap-1.5 text-xs font-semibold'>
            <IconPlus size={14} />
            Upload Documents
          </Button>
        </div>
      )
    } else if (activeTab === 'certificates') {
      title = 'Certificates'
      subtitle = 'Manage employee certificates, validity periods, issuers, and expiry reminders.'
      breadcrumbs = [...breadcrumbs, { to: '.', label: 'Certificates' }]
      actions = null
    } else if (activeTab === 'attachments') {
      title = 'Attachments'
      subtitle = 'Manage supporting employee files that do not belong to mandatory document or certificate categories.'
      breadcrumbs = [...breadcrumbs, { to: '.', label: 'Attachments' }]
      actions = null
    }
  } else if (activeView === 'upload') {
    title = 'Upload Employee Documents'
    subtitle = 'Upload or update multiple document types for one employee in a single page.'
    breadcrumbs = [...breadcrumbs, { label: 'Upload' }]
    actions = null
  } else if (activeView === 'upload-success') {
    title = 'Document Upload Complete'
    subtitle = 'Required employee documents were saved and the document profile is now up to date.'
    breadcrumbs = [...breadcrumbs, { label: 'Upload' }, { to: '.', label: 'Success' }]
    actions = (
      <Button size='sm' onClick={goBackToTabs}>
        Back to Document Center
      </Button>
    )
  }

  return (
    <AppMain
      breadcrumbs={breadcrumbs as React.ComponentProps<typeof AppMain>['breadcrumbs']}
      title={title}
      subtitle={subtitle}
      actions={actions}
    >
      {/* ── Back button portal ─────────────────────────────────────────────── */}
      {activeView !== 'tabs' &&
        backBtnNode &&
        createPortal(
          <Button variant='outline' size='icon' onClick={goBackToTabs}>
            <IconChevronLeft size={24} />
          </Button>,
          backBtnNode,
        )}

      {/* ── VIEW 1: TABS (Overview, Certificates, Attachments) ─────────────── */}
      {activeView === 'tabs' && (
        <Tabs
          value={activeTab}
          onValueChange={(val) => setActiveTab(val as DocumentCenterTab)}
          className='flex flex-col gap-6'
        >
          {/* Top Line-style Tabs Navigation */}
          <div className='border-b border-border/60 pb-1'>
            <TabsList variant='line' className='gap-6'>
              <TabsTrigger value='overview' className='text-xs font-semibold pb-3 px-1'>
                Overview
              </TabsTrigger>
              <TabsTrigger value='certificates' className='text-xs font-semibold pb-3 px-1'>
                Certificates
              </TabsTrigger>
              <TabsTrigger value='attachments' className='text-xs font-semibold pb-3 px-1'>
                Attachments
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tab 1: Overview */}
          <TabsContent value='overview'>
            <DocumentOverviewTab
              onManageEmployee={(emp) => handleOpenUpload(emp)}
            />
          </TabsContent>

          {/* Tab 2: Certificates */}
          <TabsContent value='certificates'>
            <DocumentCertificatesTab />
          </TabsContent>

          {/* Tab 3: Attachments */}
          <TabsContent value='attachments'>
            <DocumentAttachmentsTab />
          </TabsContent>
        </Tabs>
      )}

      {/* ── VIEW 2: UPLOAD MULTI-DOCUMENTS ─────────────────────────────────── */}
      {activeView === 'upload' && (
        <DocumentUploadView
          initialEmployee={targetEmployee}
          onCancel={goBackToTabs}
          onSuccess={handleUploadSuccess}
        />
      )}

      {/* ── VIEW 3: UPLOAD SUCCESS CONFIRMATION ────────────────────────────── */}
      {activeView === 'upload-success' && savedEmployee && (
        <DocumentUploadSuccessView
          employee={savedEmployee}
          onBackToCenter={goBackToTabs}
          onViewDocuments={() => handleOpenUpload(savedEmployee)}
        />
      )}
    </AppMain>
  )
}
