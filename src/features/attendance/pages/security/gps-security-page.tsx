// gps-security-page.tsx — GPS Security main hub with Overview, Geofences, and Detection Logs tabs
import { IconChevronLeft, IconPlus } from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

import { useAppLayoutStore } from '@/shared/components/app-layout/app-layout-store'
import { AppMain } from '@/shared/components/app-layout/app-main'
import { getAttendanceBreadcrumbs } from '@/features/attendance/components/attendance-breadcrumbs'
import { Button } from '@/shared/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'

import { DetectionLogsTab } from './detection-logs-tab'
import { GeofenceFormView } from './geofence-form-view'
import { GeofenceManagementTab } from './geofence-management-tab'
import { GpsSecurityOverviewTab } from './gps-security-overview-tab'
import type { GeofenceItem, GeofenceViewMode, GpsSecurityTab } from './types'

const initialGeofences: GeofenceItem[] = [
  {
    id: 'geo-1',
    locationName: 'Jakarta HQ',
    type: 'Office',
    address: 'Jl. Jend. Sudirman Kav. 52-53, Jakarta',
    latitude: -6.2255,
    longitude: 106.8095,
    radiusMeters: 150,
    accuracyRequirement: '≤ 50 meters',
    employeeScope: 'Jakarta HQ employees',
    employeesCount: 842,
    status: 'Active',
    policyNote:
      'Employee hanya dapat Clock In/Out bila GPS berada di area ini dan lolos device-integrity check.',
  },
  {
    id: 'geo-2',
    locationName: 'Bandung Office',
    type: 'Office',
    address: 'Jl. Asia Afrika No. 65, Bandung',
    latitude: -6.9217,
    longitude: 107.6071,
    radiusMeters: 120,
    accuracyRequirement: '≤ 50 meters',
    employeeScope: 'Bandung Branch employees',
    employeesCount: 180,
    status: 'Active',
    policyNote:
      'Employee hanya dapat Clock In/Out bila GPS berada di area ini dan lolos device-integrity check.',
  },
  {
    id: 'geo-3',
    locationName: 'Surabaya Office',
    type: 'Office',
    address: 'Jl. Basuki Rahmat No. 122, Surabaya',
    latitude: -7.2655,
    longitude: 112.7431,
    radiusMeters: 150,
    accuracyRequirement: '≤ 50 meters',
    employeeScope: 'Surabaya Branch employees',
    employeesCount: 126,
    status: 'Active',
    policyNote:
      'Employee hanya dapat Clock In/Out bila GPS berada di area ini dan lolos device-integrity check.',
  },
  {
    id: 'geo-4',
    locationName: 'Client Project Yogyakarta',
    type: 'Temporary',
    address: 'Jl. Malioboro No. 45, Yogyakarta',
    latitude: -7.7928,
    longitude: 110.3658,
    radiusMeters: 250,
    accuracyRequirement: '≤ 100 meters',
    employeeScope: 'Project Assigned Team Yogyakarta',
    employeesCount: 42,
    status: 'Active',
    policyNote: 'Temporary client location geofence for assigned consultants in Yogyakarta.',
  },
]

export function GpsSecurityPage() {
  const [activeTab, setActiveTab] = useState<GpsSecurityTab>('overview')
  const [geofenceViewMode, setGeofenceViewMode] = useState<GeofenceViewMode>('list')
  const [geofences, setGeofences] = useState<GeofenceItem[]>(initialGeofences)
  const [editingGeofence, setEditingGeofence] = useState<GeofenceItem | null>(null)

  // ─── Back button portal ───────────────────────────────────────────────────
  const setHasBackButton = useAppLayoutStore((state) => state.setHasBackButton)
  const backBtnNode = useAppLayoutStore((state) => state.backBtnNode)

  useEffect(() => {
    if (geofenceViewMode !== 'list') {
      setHasBackButton(true)
      return () => setHasBackButton(false)
    }
  }, [geofenceViewMode, setHasBackButton])

  const handleOpenAddGeofence = () => {
    setEditingGeofence(null)
    setGeofenceViewMode('create')
  }

  const handleOpenEditGeofence = (item: GeofenceItem) => {
    setEditingGeofence(item)
    setGeofenceViewMode('edit')
  }

  const handleSaveGeofence = (savedItem: GeofenceItem) => {
    setGeofences((prev) => {
      const idx = prev.findIndex((g) => g.id === savedItem.id)
      if (idx >= 0) {
        const updated = [...prev]
        updated[idx] = savedItem
        return updated
      }
      return [savedItem, ...prev]
    })
    setGeofenceViewMode('list')
    setEditingGeofence(null)
  }

  const handleCancelForm = () => {
    setGeofenceViewMode('list')
    setEditingGeofence(null)
  }

  // Dynamic Titles & Subtitles based on activeTab & geofenceViewMode
  let title = 'GPS Security Overview'
  let subtitle = 'Konfigurasi geofence, anti-spoofing, device integrity, dan accuracy.'
  let headerActions: React.ReactNode = null

  if (activeTab === 'geofences') {
    if (geofenceViewMode === 'list') {
      title = 'Geofence Management'
      subtitle = 'Kelola wilayah kantor dan area attendance yang diizinkan.'
      headerActions = (
        <Button
          onClick={handleOpenAddGeofence}
          className='gap-1.5 rounded-xl text-xs font-semibold shadow-xs'
        >
          <IconPlus size={15} />
          Add Geofence
        </Button>
      )
    } else if (geofenceViewMode === 'create') {
      title = 'Create Geofence'
      subtitle = 'Detail area, radius, policy, dan employee scope.'
      headerActions = null
    } else {
      title = 'Edit Geofence'
      subtitle = 'Detail area, radius, policy, dan employee scope.'
      headerActions = null
    }
  } else if (activeTab === 'overview') {
    title = 'GPS Security Overview'
    subtitle = 'Konfigurasi geofence, anti-spoofing, device integrity, dan accuracy.'
  } else if (activeTab === 'logs') {
    title = 'GPS Detection Logs'
    subtitle = 'Audit log pelanggaran lokasi, fake GPS, mock provider, dan status perangkat.'
  }

  return (
    <AppMain
      title={title}
      subtitle={subtitle}
      breadcrumbs={getAttendanceBreadcrumbs(title)}
      backTo={geofenceViewMode === 'list' ? '/attendance' : undefined}
      actions={headerActions}
      className='gap-6'
    >
      {/* ── Back button portal ─────────────────────────────────────────────── */}
      {geofenceViewMode !== 'list' &&
        backBtnNode &&
        createPortal(
          <Button
            variant='outline'
            size='icon'
            onClick={handleCancelForm}
            className='size-9 rounded-xl'
          >
            <IconChevronLeft size={20} />
          </Button>,
          backBtnNode,
        )}

      {/* ── Tab Navigation Pills ───────────────────────────────────────────── */}
      <Tabs
        value={activeTab}
        onValueChange={(value) => {
          setActiveTab(value as GpsSecurityTab)
          setGeofenceViewMode('list')
          setEditingGeofence(null)
        }}
      >
        <TabsList variant='segmented'>
          <TabsTrigger value='overview'>Overview</TabsTrigger>
          <TabsTrigger value='geofences'>Geofences</TabsTrigger>
          <TabsTrigger value='logs'>Detection Logs</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* ── TAB CONTENT ────────────────────────────────────────────────────── */}
      {activeTab === 'geofences' && geofenceViewMode === 'list' && (
        <GeofenceManagementTab geofences={geofences} onEdit={handleOpenEditGeofence} />
      )}

      {activeTab === 'geofences' && geofenceViewMode !== 'list' && (
        <GeofenceFormView
          mode={geofenceViewMode === 'edit' ? 'edit' : 'create'}
          initialData={editingGeofence}
          onCancel={handleCancelForm}
          onSave={handleSaveGeofence}
        />
      )}

      {activeTab === 'overview' && <GpsSecurityOverviewTab />}

      {activeTab === 'logs' && <DetectionLogsTab />}
    </AppMain>
  )
}
